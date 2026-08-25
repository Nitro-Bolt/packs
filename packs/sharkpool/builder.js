const SOURCE = "https://sharkpools-extensions.vercel.app/";
const SOURCE_URL = `${SOURCE}Gallery%20Files/Extension-Keys.json`;

const creator = {
  name: "SharkPool",
  description: "SharkPool's collection of TurboWarp and PenguinMod extensions.",
  upstream: SOURCE,
};

const findExtensionId = (script, fileName) => {
  const literal = script.match(
    /getInfo\s*\(\)\s*\{[\s\S]*?\bid\s*:\s*["']([^"']+)["']/
  );
  if (literal) return literal[1];
  const header = script.match(/^\s*\/\/\s*ID\s*:\s*([^\s]+)/m);
  if (header) return header[1];
  const reference = script.match(
    /getInfo\s*\(\)\s*\{[\s\S]*?\bid\s*:\s*([A-Za-z_$][\w$]*)/
  );
  if (reference) {
    const escaped = reference[1].replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const value = script.match(
      new RegExp(`(?:const|let|var)\\s+${escaped}\\s*=\\s*["']([^"']+)["']`)
    );
    if (value) return value[1];
  }
  throw new Error(`Could not determine extension ID for ${fileName}`);
};

const convertLegacy = async (data, loadScript) => {
  const extensions = [];
  for (const [galleryId, extension] of Object.entries(data.extensions)) {
    if (galleryId === "Example") continue;
    const script = await loadScript(extension.url);
    extensions.push({
      slug: `extension-code/${extension.url}`,
      id: findExtensionId(script, extension.url),
      name: galleryId.replaceAll("-", " "),
      description: extension.desc || "",
      image: `extension-thumbs/${extension.banner}`,
      by: extension.creator.split(",").map((name) => ({ name: name.trim() })),
    });
  }
  return {
    information: {
      name: "SharkPool's Extensions",
      tag: "sharkpool",
      source: SOURCE,
    },
    extensions,
  };
};

const build = async ({ existingPack }) => {
  try {
    const response = await fetch(SOURCE_URL);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (!data.extensions || Array.isArray(data.extensions)) {
      throw new Error("Expected SharkPool's legacy Extension-Keys.json format");
    }
    return convertLegacy(data, async (fileName) => {
      const scriptResponse = await fetch(`${SOURCE}extension-code/${fileName}`);
      if (!scriptResponse.ok) {
        throw new Error(`${fileName}: HTTP ${scriptResponse.status}`);
      }
      return scriptResponse.text();
    });
  } catch (error) {
    if (existingPack?.information && Array.isArray(existingPack.extensions)) {
      console.warn(
        `Could not refresh SharkPool pack; using generated copy: ${error}`
      );
      return existingPack;
    }
    throw error;
  }
};

module.exports = { creator, build, convertLegacy };
