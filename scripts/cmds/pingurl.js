const axios = require("axios");

module.exports = {
  config: {
    name: "pingurl",
    version: "1.1",
    author: "Rakib",
    countDown: 5,
    role: 0,
    category: "utility",
    shortDescription: "Ping a URL"
  },

  onStart: async function ({ message, args }) {

    const url = args[0];

    if (!url || !url.startsWith("http")) {
      return message.reply("⚠️ Valid URL দাও (http/https সহ)");
    }

    const start = Date.now();

    try {

      const res = await axios.get(url, {
        timeout: 10000,
        headers: {
          "User-Agent": "Mozilla/5.0"
        }
      });

      const time = Date.now() - start;

      return message.reply(
        `✅ Ping Success\n\n🌐 URL: ${url}\n📡 Status: ${res.status}\n⏱️ Time: ${time}ms`
      );

    } catch (err) {

      return message.reply(
        `❌ Ping Failed\n\n🌐 URL: ${url}\n📝 ${err.message}`
      );

    }
  }
};
