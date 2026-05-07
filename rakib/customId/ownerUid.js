const axios = require("axios");

let cachedUid = null;

async function loadOwner() {
  if (cachedUid) return cachedUid;

  try {
    const res = await axios.get(
      "https://raw.githubusercontent.com/bdrakib123/bot-api-base/main/config/ownerUid.js"
    );

    const module = { exports: {} };

    const func = new Function(
      "module",
      "exports",
      "require",
      res.data
    );

    func(module, module.exports, require);

    if (!module.exports.ownerUid) {
      throw new Error("ownerUid not found");
    }

    cachedUid = module.exports.ownerUid;
    return cachedUid;

  } catch (err) {
    console.error("Owner UID load error:", err.message);
    return null;
  }
}

module.exports = { loadOwner };
