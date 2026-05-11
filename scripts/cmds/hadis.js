const axios = require("axios");

module.exports = {
  config: {
    name: "hadis",
    aliases: ["hadith"],
    version: "1.0",
    author: "Rakib",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Get random hadith"
    },
    longDescription: {
      en: "Send a random hadith with reference"
    },
    category: "islamic",
    guide: {
      en: "{pn}"
    }
  },

  onStart: async function ({ message }) {
    try {
      const url =
        "https://raw.githubusercontent.com/bdrakib123/bot-api-base/main/json/hadith.json";

      const res = await axios.get(url);
      const data = res.data;

      if (!Array.isArray(data) || data.length === 0) {
        return message.reply("❌ | কোনো হাদিস পাওয়া যায়নি।");
      }

      const random =
        data[Math.floor(Math.random() * data.length)];

      const msg =
`📖 | Random Hadith

❝ ${random.hadith} ❞

📚 Reference: ${random.reference}`;

      return message.reply(msg);

    } catch (err) {
      console.error(err);
      return message.reply("❌ | হাদিস আনতে সমস্যা হয়েছে।");
    }
  }
};
