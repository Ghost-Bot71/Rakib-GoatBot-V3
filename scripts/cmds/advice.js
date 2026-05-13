const axios = require("axios");

module.exports = {
  config: {
    name: "advice",
    version: "1.0",
    author: "Rakib",
    countDown: 5,
    role: 0,
    shortDescription: "Get random advice",
    longDescription: "Fetch random advice from API",
    category: "fun"
  },

  onStart: async function ({ message }) {
    try {
      const res = await axios.get(
        "https://raw.githubusercontent.com/bdrakib123/bot-api-base/main/json/advice.json"
      );

      const data = res.data;

      if (!Array.isArray(data) || data.length === 0) {
        return message.reply("❌ No advice found!");
      }

      const random = data[Math.floor(Math.random() * data.length)];

      return message.reply(`💡 Advice:\n\n${random}`);
    } catch (err) {
      console.error(err);
      return message.reply("❌ Failed to fetch advice!");
    }
  }
};
