const SOURCE = "https://dde-ext-gallery.vercel.app/";
const METADATA_URL = `${SOURCE}extensions/extensions.json`;

const creator = {
  name: "ddededodediamante",
  description: "Extensions by ddededodediamante for TurboWarp, PenguinMod, and NitroBolt.",
  upstream: SOURCE,
};

const convertGallery = (extensions) => ({
  information: {
    name: "ddededodediamante's Extensions",
    tag: "ddededodediamante",
    source: SOURCE,
  },
  extensions: extensions
    .filter(
      (extension) =>
        !extension.hidden &&
        (extension.canBeUsedOn?.tw === true || extension.canBeUsedOn?.nb === true)
    )
    .map((extension) => ({
      slug: `extensions/code/${extension.id}.js`,
      id: extension.id,
      name: extension.name,
      description: extension.description || "",
      image: `extensions/thumbnail/${extension.id}.${extension.imgFormat || "svg"}`,
      by: [{ name: "ddededodediamante" }],
    })),
});

const build = async ({ existingPack }) => {
  try {
    const response = await fetch(METADATA_URL);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const extensions = await response.json();
    if (!Array.isArray(extensions)) {
      throw new Error("Expected an array in extensions/extensions.json");
    }
    return convertGallery(extensions);
  } catch (error) {
    if (existingPack?.information && Array.isArray(existingPack.extensions)) {
      console.warn(
        `Could not refresh ddededodediamante pack; using generated copy: ${error}`
      );
      return existingPack;
    }
    throw error;
  }
};

module.exports = { creator, build, convertGallery };
