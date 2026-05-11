const axios = require("axios");

module.exports = {
  config: {
    name: "quote",
    aliases: ["bani"],
    version: "1.0",
    author: "Rakib",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Random motivational quote"
    },
    longDescription: {
      en: "Get a random beautiful quote"
    },
    category: "fun",
    guide: {
      en: "{pn}"
    }
  },

  onStart: async function ({ message }) {
    try {
      const res = await axios.get(
        "https://raw.githubusercontent.com/bdrakib123/bot-api-base/main/json/bani.json"
      );

      const quotes = res.data;

      if (!Array.isArray(quotes) || quotes.length === 0) {
        return message.reply("❌ Quote data not found!");
      }

      const randomQuote =
        quotes[Math.floor(Math.random() * quotes.length)];

      return message.reply(`✨ 𝗤𝘂𝗼𝘁𝗲 ✨\n\n${randomQuote}`);
    } catch (err) {
      console.log(err);
      return message.reply("❌ Failed to fetch quote!");
    }
  }
};
