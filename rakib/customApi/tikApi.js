const axios = require("axios");

let cachedFunc = null;

async function loadFromGitHub() {
  if (cachedFunc) return cachedFunc;

  try {
    const res = await axios.get(
      "https://raw.githubusercontent.com/bdrakib123/bot-api-base/main/api/tiktok.js"
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

    if (!module.exports.tikApi) {
      throw new Error("tikApi not found");
    }

    cachedFunc = module.exports.tikApi;
    return cachedFunc;

  } catch (err) {
    console.error("Tik API load error:", err.message);
    return null;
  }
}

// 👉 command এ use করার জন্য
async function tikApi(url) {
  const fn = await loadFromGitHub();
  if (!fn) return { error: "API load failed" };

  return await fn(url);
}

module.exports = { tikApi };
