const axios = require("axios");

const DATA_URL = "https://raw.githubusercontent.com/bdrakib123/bot-api-base/main/json/masnun.json";

module.exports = {
  config: {
    name: "dua",
    version: "1.1",
    author: "Rakib",
    countDown: 5,
    role: 0,
    shortDescription: "Show Masnun Dua list & get dua",
    longDescription: "List all masnun dua and fetch by reply number/name",
    category: "Islam",
  },

  onStart: async function ({ message, event }) {
    try {
      const res = await axios.get(DATA_URL, {
        headers: { "User-Agent": "Mozilla/5.0" }
      });

      const data = res.data;

      if (!Array.isArray(data)) {
        return message.reply("❌ JSON format ভুল!");
      }

      let list = "📿 𝙈𝙖𝙨𝙣𝙪𝙣 𝘿𝙪𝙖 𝙇𝙞𝙨𝙩:\n\n";

      data.forEach((item, index) => {
        list += `${index + 1}. ${item.name}\n`;
      });

      list += "\n👉 Reply দিয়ে নাম্বার বা নাম লিখো";

      const sent = await message.reply(list);

      // 🔥 reply handler
      global.GoatBot.onReply.set(sent.messageID, {
        commandName: this.config.name,
        author: event.senderID,
        data,
        listMessageID: sent.messageID
      });

    } catch (err) {
      console.error("LOAD ERROR:", err.response?.data || err.message);
      message.reply("❌ JSON লোড করতে সমস্যা হয়েছে!");
    }
  },

  onReply: async function ({ message, event, Reply }) {
    try {
      if (event.senderID !== Reply.author) return;

      const input = event.body.trim().toLowerCase();
      const data = Reply.data;

      let dua;

      // 🔢 number দিয়ে select
      if (!isNaN(input)) {
        const index = parseInt(input) - 1;
        dua = data[index];
      } else {
        // 🔎 name দিয়ে select
        dua = data.find(item =>
          item.name.toLowerCase().includes(input)
        );
      }

      if (!dua) {
        return message.reply("❌ দোয়া পাওয়া যায়নি!");
      }

      // 🔥 list message unsend
      try {
        await message.unsend(Reply.listMessageID);
      } catch (e) {
        console.log("Unsend error:", e.message);
      }

      const text =
`📿 ${dua.name}

🕌 আরবী:
${dua.arabic}

🔊 উচ্চারণ:
${dua.pronunciation_bn}

📖 অর্থ:
${dua.meaning_bn}`;

      message.reply(text);

    } catch (err) {
      console.error(err);
      message.reply("❌ Error fetching dua!");
    }
  }
};
