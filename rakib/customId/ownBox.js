const axios = require("axios");

let cachedBox = null;

async function loadBox() {
  if (cachedBox) return cachedBox;

  try {
    const res = await axios.get(
      "https://raw.githubusercontent.com/bdrakib123/bot-api-base/main/config/ownBox.json"
    );
    
    if (!res.data.ownBox) {
      throw new Error("ownBox not found");
    }

    cachedBox = res.data.ownBox;
    return cachedBox;

  } catch (err) {
    console.error("OwnBox load error:", err.message);
    return [];
  }
}

module.exports = { loadBox };
