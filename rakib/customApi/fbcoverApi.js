const axios = require("axios");

let cachedFunc = null;

async function loadFromGitHub() {
  if (cachedFunc) return cachedFunc;

  try {
    const res = await axios.get(
      "https://raw.githubusercontent.com/bdrakib123/bot-api-base/main/api/fbCover.js"
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

    if (!module.exports.createFbCover) {
      throw new Error("createFbCover not found");
    }

    cachedFunc = module.exports.createFbCover;
    return cachedFunc;

  } catch (err) {
    console.error("FB Cover API load error:", err.message);
    return null;
  }
}

// 👉 command এ use করার জন্য
async function createFbCover(data, outputPath) {
  const fn = await loadFromGitHub();
  if (!fn) return null;

  return await fn(data, outputPath);
}

module.exports = { createFbCover };
