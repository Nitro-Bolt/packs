const path = require("path");
const fs = require("fs");
const { rspack } = require("@rspack/core");

module.exports = {
  mode: process.env.NODE_ENV || "development",
  entry: path.resolve(__dirname, "src/playground/site.jsx"),
  experiments: {
    css: true,
  },
  output: {
    path: path.resolve(__dirname, "build"),
    filename: "js/[name].[contenthash:8].js",
    clean: true,
  },
  resolve: {
    extensions: [".js", ".jsx"],
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: "builtin:swc-loader",
          options: {
            jsc: {
              parser: {
                syntax: "ecmascript",
                jsx: true,
              },
              transform: {
                react: {
                  runtime: "automatic",
                  importSource: "preact",
                },
              },
            },
          },
        },
      },
      {
        test: /\.css$/,
        type: "css",
      },
    ],
  },
  plugins: [
    new rspack.HtmlRspackPlugin({
      template: path.resolve(__dirname, "static/index.html"),
    }),
  ],
  devServer: {
    port: 2143,
    static: {
      directory: path.resolve(__dirname, "static"),
    },
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "no-store",
      Pragma: "no-cache",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "no-referrer",
    },
    hot: true,
    open: false,
    historyApiFallback: true,
    setupMiddlewares: (middlewares, devServer) => {
      devServer.app.get("/:creator/pack.json", (request, response, next) => {
        const creator = request.params.creator;
        if (!/^[a-z0-9-]+$/.test(creator)) return next();
        const packPath = path.resolve(__dirname, "packs", creator, "pack.json");
        if (!fs.existsSync(packPath)) return next();
        response.set({
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "no-store",
          Pragma: "no-cache",
          "X-Content-Type-Options": "nosniff",
          "Referrer-Policy": "no-referrer",
        });
        response.sendFile(packPath);
      });
      return middlewares;
    },
  },
};
