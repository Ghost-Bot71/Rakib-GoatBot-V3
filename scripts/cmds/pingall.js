const axios = require("axios");

// 👉 তোর Vercel API URL
const API_URL = "https://api-url-ping.vercel.app/api/ping";

module.exports = {
  config: {
    name: "pingall",
    version: "1.0",
    author: "Rakib",
    countDown: 5,
    role: 0,
    shortDescription: "Ping all servers",
    longDescription: "Manually ping all URLs via Vercel API",
    category: "system"
  },

  onStart: async function ({ message }) {
    try {
      // ⏳ Loading message
      const loading = await message.reply("⏳ Pinging all servers...");

      // 🔥 API call
      const res = await axios.get(API_URL);

      const data = res.data;

      if (!data.success) {
        return message.reply("❌ Ping failed!");
      }

      // 📊 Result build
      let success = 0;
      let failed = 0;

      let msg = "📡 Ping Results:\n\n";

      data.results.forEach((r) => {
        if (r.status === "fulfilled") {
          success++;
          msg += `✅ ${r.value.url}\n`;
        } else {
          failed++;
          msg += `❌ ${r.reason?.url || "Unknown"}\n`;
        }
      });

      msg += `\n✨ Success: ${success}\n❌ Failed: ${failed}`;

      // 🧹 delete loading msg (optional)
      try {
        await message.unsend(loading.messageID);
      } catch {}

      // 📩 send result
      message.reply(msg);

    } catch (err) {
      message.reply("❌ Error: " + err.message);
    }
  }
};
