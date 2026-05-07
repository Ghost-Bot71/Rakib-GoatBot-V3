const axios = require("axios");

let cache = {
  en: [],
  funny: [],
  sad: [],
  romantic: [],
  lastFetch: 0
};

async function loadCaptions() {
  // 🔥 5 min cache
  if (cache.lastFetch && Date.now() - cache.lastFetch < 5 * 60 * 1000) {
    return cache;
  }

  try {
    const [en, funny, sad, romantic] = await Promise.all([
      axios.get("https://raw.githubusercontent.com/bdrakib123/bot-api-base/main/caption/en.json"),
      axios.get("https://raw.githubusercontent.com/bdrakib123/bot-api-base/main/caption/funny.json"),
      axios.get("https://raw.githubusercontent.com/bdrakib123/bot-api-base/main/caption/sad.json"),
      axios.get("https://raw.githubusercontent.com/bdrakib123/bot-api-base/main/caption/romantic.json")
    ]);

    cache.en = en.data.captions || [];
    cache.funny = funny.data.captions || [];
    cache.sad = sad.data.captions || [];
    cache.romantic = romantic.data.captions || [];
    cache.lastFetch = Date.now();

    return cache;

  } catch (err) {
    console.error("Caption API error:", err.message);
    return cache;
  }
}

// 🎯 random caption
async function getCaption(type = "en") {
  const data = await loadCaptions();

  const list = data[type] || data.en;

  if (!list.length) return "❌ Caption পাওয়া যায়নি";

  return list[Math.floor(Math.random() * list.length)];
}

module.exports = { getCaption };
