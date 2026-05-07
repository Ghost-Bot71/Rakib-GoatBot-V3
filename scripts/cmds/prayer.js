const { getPrayerTime } = require("../../rakib/customApi/prayerApi");

module.exports = {
  config: {
    name: "prayer",
    aliases: ["namaz"],
    version: "1.0",
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
      en: "prayer/namaj <location>\nExample: namaj dhaka"
    }
  },

  onStart: async function ({ message, args }) {
    try {
      const location = args[0] ? args[0] : "dhaka";

      const data = await getPrayerTime(location);

      if (!data.status) {
        return message.reply("❌ Location not found or API error!");
      }

      const msg = `
🕌 Ramadan Prayer Time - ${data.location.toUpperCase()}
📅 Date: ${data.date}

🌙 Sehri: ${data.sehri}
🍽 sunrise: ${data.sunrise}

🕋 Fajr: ${data.fajr}
☀️ Dhuhr: ${data.dhuhr}
🌤 Asr: ${data.asr}
🌇 Maghrib: ${data.maghrib}
🌙 Isha: ${data.isha}
`;

      message.reply(msg);

    } catch (err) {
      console.error(err);
      message.reply("⚠️ Something went wrong!");
    }
  }
};
