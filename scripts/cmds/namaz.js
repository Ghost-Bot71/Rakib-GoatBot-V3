const axios = require("axios");
const baseApiUrl = async () => {
  const base = await axios.get(
    `https://noobs-api-team-url.vercel.app/N1SA9/baseApiUrl.json`
  );
  return base.data.api;
};
module.exports.config = {
  name: "namaz",
  aliases: ["prayer"],
  version: "1.0",
  author: "Rakib Islam'e",
  countDown: 5,
  role: 0,
  description: {
    en: "View Prayer time",
  },
  category: "𝗜𝗦𝗟𝗔𝗠",
  guide: {
    en: "{pn} <city name>",
  },
};

module.exports.onStart = async function ({ api, args, event }) {
  try {
    const cityName = args.join(" ");
    const apiUrl = `${await baseApiUrl()}/namaj?cityName=${encodeURIComponent(cityName)}`;
    const response = await axios.get(apiUrl);
    const {
      fajr,
      sunrise,
      dhuhr,
      asr,
      maghrib,
      isha
    } = response.data.prayerTimes;

    const prayerTimes =
      "🕋🌙 𝙿𝚛𝚊𝚢𝚎𝚛 𝚝𝚒𝚖𝚎𝚜 🕋🌙\n" +
      "🏙️ 𝙲𝚒𝚝𝚢 𝙽𝚊𝚖𝚎: " + cityName + "\n\n" +
      "🕌 𝙵𝚊𝚓𝚛: " + fajr + "\n" +
      "🕌 𝚂𝚞𝚗𝚛𝚒𝚜𝚎: " + sunrise + "\n" +
      "🕌 𝙳𝚑𝚞𝚛: " + dhuhr + "\n\n" +
      "🕌 𝙰𝚜𝚛: " + asr + "\n" +
      "🕌 𝙼𝚊𝚐𝚑𝚛𝚒𝚋: " + maghrib + "\n" +
      "🕌 𝙸𝚜𝚑𝚊: " + isha + "\n";

    api.sendMessage(prayerTimes, event.threadID);
  } catch (e) {
    console.error(e);
    api.sendMessage(`Error: ${e.message}`, event.threadID);
  }
};
