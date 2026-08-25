const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const staticDir = path.resolve(rootDir, "static");
const packsDir = path.resolve(rootDir, "packs");
const buildDir = path.resolve(rootDir, "build");

const copyRecursive = (sourcePath, destinationPath) => {
  const stat = fs.statSync(sourcePath);
  if (stat.isDirectory()) {
    fs.mkdirSync(destinationPath, { recursive: true });
    for (const entry of fs.readdirSync(sourcePath)) {
      copyRecursive(
        path.resolve(sourcePath, entry),
        path.resolve(destinationPath, entry)
      );
    }
    return;
  }
  fs.mkdirSync(path.dirname(destinationPath), { recursive: true });
  fs.copyFileSync(sourcePath, destinationPath);
};

if (fs.existsSync(staticDir) && fs.existsSync(buildDir)) {
  for (const entry of fs.readdirSync(staticDir)) {
    if (entry !== "index.html") {
      copyRecursive(
        path.resolve(staticDir, entry),
        path.resolve(buildDir, entry)
      );
    }
  }
}

for (const entry of fs.readdirSync(packsDir, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const source = path.resolve(packsDir, entry.name, "pack.json");
  if (fs.existsSync(source)) {
    copyRecursive(source, path.resolve(buildDir, entry.name, "pack.json"));
  }
}
