const axios = require("axios");

module.exports = {
  config: {
    name: "quran",
    version: "1.0",
    author: "Rakib",
    countDown: 5,
    role: 0,
    shortDescription: "Random Quran quote",
    longDescription: "Get random Quran verses with reference",
    category: "quotes"
  },

  onStart: async function ({ message }) {
    try {
      const url = "https://raw.githubusercontent.com/bdrakib123/bot-api-base/main/json/quran.json";

      const res = await axios.get(url);
      const data = res.data;

      if (!Array.isArray(data) || data.length === 0) {
        return message.reply("❌ Quran data not found!");
      }

      const random = data[Math.floor(Math.random() * data.length)];

      return message.reply(`📖 | ক্বুরআনের বাণী\n\n${random}`);
    } catch (err) {
      console.log(err);
      return message.reply("❌ | কিছু একটা সমস্যা হয়েছে!");
    }
  }
};
