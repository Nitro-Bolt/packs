const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const packsDir = path.resolve(rootDir, "packs");
const generatedDir = path.resolve(rootDir, "src/generated");
const externalPacksPath = path.resolve(packsDir, "external-packs.json");
const readJSON = (filePath) => JSON.parse(fs.readFileSync(filePath, "utf8"));

const validatePack = (pack, slug) => {
  if (!pack?.information?.name || !pack.information.tag) {
    throw new Error(`${slug}: pack information requires name and tag`);
  }
  if (!Array.isArray(pack.extensions)) {
    throw new Error(`${slug}: pack extensions must be an array`);
  }
  for (const [index, extension] of pack.extensions.entries()) {
    if (!extension.slug || !extension.id || !extension.name) {
      throw new Error(
        `${slug}: extension ${index + 1} requires slug, id, and name`
      );
    }
  }
};

const main = async () => {
  const externalPacks = readJSON(externalPacksPath);
  const index = await Promise.all(
    externalPacks.map(async (entry) => {
      const response = await fetch(entry.packURL);
      if (!response.ok) {
        throw new Error(`${entry.slug}: pack returned HTTP ${response.status}`);
      }
      const pack = await response.json();
      validatePack(pack, entry.slug);
      return {
        ...entry,
        extensionCount: pack.extensions.length,
      };
    })
  );
  const directories = fs
    .readdirSync(packsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .sort((a, b) => a.name.localeCompare(b.name));

  for (const directory of directories) {
    const slug = directory.name;
    const directoryPath = path.resolve(packsDir, slug);
    const builderPath = path.resolve(directoryPath, "builder.js");
    const outputPath = path.resolve(directoryPath, "pack.json");
    if (!fs.existsSync(builderPath))
      throw new Error(`${slug}: missing builder.js`);
    const existingPack = fs.existsSync(outputPath)
      ? readJSON(outputPath)
      : null;
    delete require.cache[require.resolve(builderPath)];
    const builder = require(builderPath);
    if (typeof builder.build !== "function" || !builder.creator) {
      throw new Error(`${slug}: builder.js must export creator and build`);
    }
    const pack = await builder.build({ existingPack });
    validatePack(pack, slug);
    fs.writeFileSync(outputPath, `${JSON.stringify(pack, null, 2)}\n`);
    index.push({
      slug,
      name: builder.creator.name,
      description: builder.creator.description || "",
      upstream: builder.creator.upstream || null,
      packURL: null,
      extensionCount: pack.extensions.length,
    });
    console.log(
      `Built ${slug}/pack.json (${pack.extensions.length} extensions)`
    );
  }

  fs.mkdirSync(generatedDir, { recursive: true });
  index.sort((a, b) => a.name.localeCompare(b.name));
  fs.writeFileSync(
    path.resolve(generatedDir, "packs.json"),
    `${JSON.stringify(index, null, 2)}\n`
  );
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
