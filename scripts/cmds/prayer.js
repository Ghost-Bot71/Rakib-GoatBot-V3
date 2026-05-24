const axios = require("axios");

let cachedApi = null;
let lastFetch = 0;

const CACHE_TIME = 5 * 60 * 1000;

async function getApiUrls() {
  const now = Date.now();

  if (cachedApi && now - lastFetch < CACHE_TIME) {
    return cachedApi;
  }

  try {
    const res = await axios.get(
      "https://raw.githubusercontent.com/bdrakib6t9/HOON/main/apiUrl.json"
    );

    cachedApi = res.data;
    lastFetch = now;

    return cachedApi;
  } catch (err) {
    console.error("Failed to fetch apiUrl.json:", err.message);
    return null;
  }
}

module.exports = {
  config: {
    name: "prayer",
    aliases: ["namaz"],
    version: "2.0",
    author: "Rakib Hasan",
    countDown: 5,
    role: 0,

    shortDescription: {
      en: "Get Ramadan prayer time"
    },

    longDescription: {
      en: "Get Sehri, Iftar and all prayer times"
    },

    category: "utility",

    guide: {
      en: "{pn} <location>\nExample: {pn} dhaka"
    }
  },

  onStart: async function ({ message, args }) {
    try {
      const location = args.join(" ") || "dhaka";

      // 🔗 load api urls
      const apiUrls = await getApiUrls();

      if (!apiUrls || !apiUrls.prayer) {
        return message.reply("❌ Prayer API not found!");
      }

      // ✅ correct endpoint
      const apiUrl =
        `${apiUrls.prayer}/api/ramadan?location=${encodeURIComponent(location)}&apikey=rakib69`;

      const res = await axios.get(apiUrl);

      const data = res.data;

      if (!data || data.status === false) {
        return message.reply("❌ Location not found!");
      }

      const msg = `
╔═══ 🕌 𝐏𝐑𝐀𝐘𝐄𝐑 𝐓𝐈𝐌𝐄 🕌 ═══╗

📍 𝐋𝐨𝐜𝐚𝐭𝐢𝐨𝐧: ${data.location || location}
📅 𝐃𝐚𝐭𝐞: ${data.date || "N/A"}

━━━━━━━━━━━━━━━━━━

🌙 𝐒𝐞𝐡𝐫𝐢     : ${data.sehri || "N/A"}
🌅 𝐒𝐮𝐧𝐫𝐢𝐬𝐞   : ${data.sunrise || "N/A"}

🕋 𝐅𝐚𝐣𝐫      : ${data.fajr || "N/A"}
☀️ 𝐃𝐡𝐮𝐡𝐫     : ${data.dhuhr || "N/A"}
🌤 𝐀𝐬𝐫       : ${data.asr || "N/A"}
🌇 𝐌𝐚𝐠𝐡𝐫𝐢𝐛   : ${data.maghrib || "N/A"}
🌙 𝐈𝐬𝐡𝐚      : ${data.isha || "N/A"}

━━━━━━━━━━━━━━━━━━
𝐛𝐚𝐧𝐠𝐥𝐚𝐝𝐞𝐬𝐡 𝐩𝐫𝐚𝐲𝐞𝐫 𝐭𝐢𝐦𝐞
`;

      return message.reply(msg);

    } catch (err) {
      console.error(err);

      return message.reply(
        "⚠️ Prayer server is busy or temporarily down!"
      );
    }
  }
};
