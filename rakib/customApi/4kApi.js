const axios = require("axios");

let cachedFunc = null;

async function loadFromGitHub() {
  if (cachedFunc) return cachedFunc;

  try {
    const res = await axios.get(
      "https://raw.githubusercontent.com/bdrakib123/bot-api-base/main/api/upscale.js"
    );

    const module = { exports: {} };

    const func = new Function(
      "module",
      "exports",
      "require",
      "__dirname",
      res.data
    );

    func(module, module.exports, require, __dirname);

    if (!module.exports.upscaleImage) {
      throw new Error("upscaleImage not found");
    }

    cachedFunc = module.exports.upscaleImage;
    return cachedFunc;

  } catch (err) {
    console.error("4K API load error:", err.message);
    return null;
  }
}

// 👉 command এ use করার জন্য
async function upscaleImage(inputPath, outputPath) {
  const fn = await loadFromGitHub();
  if (!fn) return null;

  return await fn(inputPath, outputPath);
}

module.exports = { upscaleImage };
