const axios = require("axios");

let cache = {
  dares: null,
  truths: null,
  lastFetch: 0
};

async function loadData() {
  // 🔥 5 min cache
  if (cache.lastFetch && Date.now() - cache.lastFetch < 5 * 60 * 1000) {
    return cache;
  }

  try {
    const [daresRes, truthsRes] = await Promise.all([
      axios.get("https://raw.githubusercontent.com/bdrakib123/bot-api-base/main/games/dares.json"),
      axios.get("https://raw.githubusercontent.com/bdrakib123/bot-api-base/main/games/truths.json")
    ]);

    cache.dares = daresRes.data.dares || [];
    cache.truths = truthsRes.data.truths || [];
    cache.lastFetch = Date.now();

    return cache;

  } catch (err) {
    console.error("TD API load error:", err.message);
    return cache; // fallback old cache
  }
}

// 🎯 random dare
async function getDare() {
  const data = await loadData();
  if (!data.dares.length) return "❌ Dare পাওয়া যায়নি";

  return data.dares[Math.floor(Math.random() * data.dares.length)];
}

// 🎯 random truth
async function getTruth() {
  const data = await loadData();
  if (!data.truths.length) return "❌ Truth পাওয়া যায়নি";

  return data.truths[Math.floor(Math.random() * data.truths.length)];
}

module.exports = { getDare, getTruth };
