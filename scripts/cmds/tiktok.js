const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "tiktok",
    aliases: ["tik"],
    version: "1.0",
    author: "Rakib Hasan",
    countDown: 5,
    role: 0,
    shortDescription: "TikTok Search",
    longDescription: "Search TikTok videos with thumbnails and download by reply",
    category: "media",
    guide: "{pn} <query>"
  },

  onStart: async function ({ message, args, event, api, commandName }) {
    try {
      const query = args.join(" ");

      if (!query) {
        return message.reply("⚠️ | Please enter a search query.");
      }

      // RAW JSON API URL
      const rawApi = "https://raw.githubusercontent.com/bdrakib6t9/HOON/main/apiUrl.json";

      // Fetch API URLs
      const apiData = await axios.get(rawApi);
      const baseUrl = apiData.data.tik;

      if (!baseUrl) {
        return message.reply("❌ | TikTok API URL not found.");
      }

      const wait = await message.reply(
`🔍 Searching TikTok...
📝 Query: ${query}
⏳ Please wait...`
      );

      const apiUrl = `${baseUrl}/api/tiktok/search?q=${encodeURIComponent(query)}&apikey=rakib69`;

      const res = await axios.get(apiUrl);

      if (!res.data || !res.data.status || !res.data.data.length) {
        return message.reply("❌ | No results found.");
      }

      const results = res.data.data.slice(0, 10);

      const cacheFolder = path.join(__dirname, "cache");

      if (!fs.existsSync(cacheFolder)) {
        fs.mkdirSync(cacheFolder, { recursive: true });
      }

      let msg = `╭──『 TIKTOK SEARCH 』──╮\n`;
      msg += `🔎 Query: ${query}\n`;
      msg += `📦 Results: ${results.length}\n`;
      msg += `╰────────────────╯\n\n`;

      const attachments = [];

      for (let i = 0; i < results.length; i++) {
        const item = results[i];

        msg += `〔 ${i + 1} 〕 ${item.author}\n`;
        msg += `🎬 ${item.title.slice(0, 60)}...\n\n`;

        try {
          const thumbPath = path.join(
            cacheFolder,
            `thumb_${Date.now()}_${i}.jpg`
          );

          const thumbRes = await axios({
            url: item.thumbnail,
            method: "GET",
            responseType: "arraybuffer",
            headers: {
              "User-Agent": "Mozilla/5.0"
            }
          });

          fs.writeFileSync(thumbPath, Buffer.from(thumbRes.data));

          attachments.push(fs.createReadStream(thumbPath));

        } catch (e) {
          console.log(`Thumbnail ${i + 1} failed`);
        }
      }

      msg += `💬 Reply with a number (1-${results.length}) to download video.`;

      await api.unsendMessage(wait.messageID);

      const sent = await message.reply({
        body: msg,
        attachment: attachments
      });

      global.GoatBot.onReply.set(sent.messageID, {
        commandName,
        author: event.senderID,
        results,
        messageID: sent.messageID,
        rawApi
      });

    } catch (err) {
      console.error(err);

      return message.reply(
`❌ | Search failed.

${err.message}`
      );
    }
  },

  onReply: async function ({ message, Reply, event, api }) {
    try {
      if (event.senderID != Reply.author) {
        return;
      }

      const num = parseInt(event.body);

      if (isNaN(num) || num < 1 || num > Reply.results.length) {
        return message.reply("⚠️ | Invalid number.");
      }

      // Remove search message
      try {
        await api.unsendMessage(Reply.messageID);
      } catch {}

      const video = Reply.results[num - 1];

      if (!video.no_watermark) {
        return message.reply("❌ | Video link not found.");
      }

      const downloading = await message.reply(
`⏳ Downloading video ${num}...`
      );

      const cacheFolder = path.join(__dirname, "cache");

      if (!fs.existsSync(cacheFolder)) {
        fs.mkdirSync(cacheFolder, { recursive: true });
      }

      const filePath = path.join(
        cacheFolder,
        `tik_${Date.now()}.mp4`
      );

      const response = await axios({
        method: "GET",
        url: video.no_watermark,
        responseType: "stream",
        headers: {
          "User-Agent": "Mozilla/5.0"
        },
        timeout: 300000
      });

      const writer = fs.createWriteStream(filePath);

      response.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
      });

      await api.unsendMessage(downloading.messageID);

      return message.reply(
        {
          body:
`🚀 𝗧𝗘𝗦𝗦𝗔 𝗕𝗢𝗧 🤖
🎬 𝗧𝗶𝗸𝗧𝗼𝗸 𝗩𝗶𝗱𝗲𝗼 𝗗𝗲𝗹𝗶𝘃𝗲𝗿𝗲𝗱
💎 𝗤𝘂𝗮𝗹𝗶𝘁𝘆 𝗖𝗼𝗻𝘁𝗲𝗻𝘁
modified:hoon`,
          attachment: fs.createReadStream(filePath)
        },
        () => {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }
      );

    } catch (err) {
      console.error(err);

      return message.reply(
`❌ | Download failed.

${err.message}`
      );
    }
  }
};
