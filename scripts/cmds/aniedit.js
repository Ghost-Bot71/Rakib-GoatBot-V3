const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "aniedit",
    version: "1.0",
    author: "Rakib",
    role: 0,
    shortDescription: "Get Advanced Anime Edit Video",
    category: "media",
    guide: {
      en: "{pn} <anime edit keywords>"
    }
  },

  onStart: async function ({ api, event, args }) {

    const query = args.join(" ");

    if (!query) {
      return api.sendMessage(
        "❌ Please provide anime edit keywords.\nExample:\naniedit naruto baryon mode",
        event.threadID
      );
    }

    const searchQuery = `${query} anime edit 4k`;

    const loadingMsg = await api.sendMessage(
      `🔍 Searching...\n🎌 ${query}`,
      event.threadID
    );

    try {

      // 🔗 RAW JSON
      const rawJson =
        "https://raw.githubusercontent.com/bdrakib6t9/HOON/main/apiUrl.json";

      // 📥 Fetch API URLs
      const apiData = await axios.get(rawJson);

      const tikBase = apiData.data.tik;

      if (!tikBase) {
        return api.editMessage(
          "❌ API URL not found!",
          loadingMsg.messageID
        );
      }

      // 🔎 search from your API
      const search = await axios.get(
        `${tikBase}/api/tiktok/search?q=${encodeURIComponent(searchQuery)}&apikey=rakib69`
      );

      const list = search.data.data || [];

      if (!list.length) {
        return api.editMessage(
          "❌ No anime edits found!",
          loadingMsg.messageID
        );
      }

      // 🎲 random video
      const randomVideo =
        list[Math.floor(Math.random() * list.length)];

      if (!randomVideo.no_watermark) {
        return api.editMessage(
          "❌ Failed to extract video!",
          loadingMsg.messageID
        );
      }

      // ⚙️ processing
      await api.editMessage(
        "⚙️ Processing video...",
        loadingMsg.messageID
      );

      // 📁 cache
      const cacheDir = path.join(__dirname, "cache");

      if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir, { recursive: true });
      }

      const filePath = path.join(
        cacheDir,
        `${Date.now()}.mp4`
      );

      // 📥 download
      const stream = await axios({
        url: randomVideo.no_watermark,
        method: "GET",
        responseType: "stream",
        headers: {
          "User-Agent": "Mozilla/5.0"
        },
        timeout: 300000
      });

      const writer = fs.createWriteStream(filePath);

      stream.data.pipe(writer);

      writer.on("finish", () => {

        api.sendMessage(
          {
            body:
`🎬 Anime Edit Ready!

🎌 Query: ${query}
👤 Author: ${randomVideo.author}`,
            attachment: fs.createReadStream(filePath)
          },
          event.threadID,
          () => {
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
            }
          }
        );

        api.unsendMessage(loadingMsg.messageID);
      });

      writer.on("error", (err) => {
        console.error("Download error:", err);

        api.editMessage(
          "❌ Video download failed!",
          loadingMsg.messageID
        );
      });

    } catch (error) {
      console.error(error);

      api.editMessage(
        "❌ Error while fetching anime edit!",
        loadingMsg.messageID
      );
    }
  }
};
