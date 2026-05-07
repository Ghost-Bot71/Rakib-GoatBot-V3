const axios = require("axios");

let cachedFunc = null;

async function loadFromGitHub() {
  if (cachedFunc) return cachedFunc;

  try {
    const res = await axios.get(
      "https://raw.githubusercontent.com/bdrakib123/bot-api-base/main/api/prayer.js"
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

    if (!module.exports.getPrayerTime) {
      throw new Error("getPrayerTime not found");
    }

    cachedFunc = module.exports.getPrayerTime;
    return cachedFunc;

  } catch (err) {
    console.error("Prayer API load error:", err.message);
    return null;
  }
}

// 👉 command এ use করার জন্য
async function getPrayerTime(location) {
  const fn = await loadFromGitHub();
  if (!fn) return { status: false, error: "API load failed" };

  return await fn(location);
}

module.exports = { getPrayerTime };
