const axios = require("axios");

module.exports = {
  config: {
    name: "joke",
    aliases: ["funny", "jokes"],
    version: "1.0",
    author: "Rakib",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Get a random Bengali joke"
    },
    longDescription: {
      en: "Sends a random Bengali joke from JSON"
    },
    category: "fun",
    guide: {
      en: "{pn}"
    }
  },

  onStart: async function ({ message }) {
    try {
      const url = "https://raw.githubusercontent.com/bdrakib123/bot-api-base/main/json/joke.json";

      const res = await axios.get(url);
      const jokes = res.data;

      if (!Array.isArray(jokes) || jokes.length === 0) {
        return message.reply("❌ | কোনো joke পাওয়া যায়নি।");
      }

      const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];

      return message.reply(
        `😂 | বাংলা জোক\n\n❝${randomJoke.joke}❞`
      );

    } catch (err) {
      console.error(err);
      return message.reply("❌ | Joke আনতে সমস্যা হয়েছে।");
    }
  }
};
