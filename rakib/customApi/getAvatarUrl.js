const axios = require("axios");

let cachedFunc = null;

async function loadFromGitHub() {
  if (cachedFunc) return cachedFunc;

  try {
    const res = await axios.get(
      "https://raw.githubusercontent.com/bdrakib123/bot-api-base/main/api/fbAvatar.js"
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

    if (!module.exports.getAvatarUrl) {
      throw new Error("Function not found");
    }

    cachedFunc = module.exports.getAvatarUrl;
    return cachedFunc;

  } catch (err) {
    console.error("GitHub API load error:", err.message);
    return null;
  }
}

// 👇 এটা pp.js use করবে
async function getAvatarUrl(uid) {
  const fn = await loadFromGitHub();
  if (!fn) return null;

  return await fn(uid);
}

module.exports = { getAvatarUrl };
