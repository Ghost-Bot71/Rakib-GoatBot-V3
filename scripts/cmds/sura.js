const axios = require("axios");

const DATA_URL = "https://raw.githubusercontent.com/bdrakib123/bot-api-base/main/json/sura.json";

module.exports = {
  config: {
    name: "sura",
    version: "1.1",
    author: "Rakib",
    countDown: 5,
    role: 0,
    shortDescription: "Show Surah list & get surah",
    longDescription: "List all surah and fetch by reply number/name",
    category: "Islam",
  },

  onStart: async function ({ message, event }) {
    try {
      const res = await axios.get(DATA_URL);
      const data = res.data;

      let list = "📖 𝙎𝙪𝙧𝙖𝙝 𝙇𝙞𝙨𝙩:\n\n";

      data.forEach((item, index) => {
        list += `${index + 1}. ${item.name}\n`;
      });

      list += "\n👉 Reply দিয়ে নাম্বার বা নাম লিখো";

      const sent = await message.reply(list);

      // 🔥 গুরুত্বপূর্ণ: messageID save
      global.GoatBot.onReply.set(sent.messageID, {
        commandName: this.config.name,
        author: event.senderID,
        data,
        listMessageID: sent.messageID
      });

    } catch (err) {
      console.error(err);
      message.reply("❌ Failed to load surah list!");
    }
  },

  onReply: async function ({ message, event, Reply, api }) {
    try {
      if (event.senderID !== Reply.author) return;

      const input = event.body.trim().toLowerCase();
      const data = Reply.data;

      let surah;

      // 🔢 number দিয়ে select
      if (!isNaN(input)) {
        const index = parseInt(input) - 1;
        surah = data[index];
      } else {
        // 🔎 name দিয়ে select
        surah = data.find(item =>
          item.name.toLowerCase().includes(input)
        );
      }

      if (!surah) {
        return message.reply("❌ সূরা পাওয়া যায়নি!");
      }

      // 🔥 list message unsend (FIXED)
      try {
        await message.unsend(Reply.listMessageID);
      } catch (e) {
        console.log("Unsend error:", e);
      }

      const text =
`📖 ${surah.name}

🕌 আরবি:
${surah.arabic}

🔊 উচ্চারণ:
${surah.pronunciation_bn}

📖 অর্থ:
${surah.meaning_bn}`;

      message.reply(text);

    } catch (err) {
      console.error(err);
      message.reply("❌ Error fetching surah!");
    }
  }
};
