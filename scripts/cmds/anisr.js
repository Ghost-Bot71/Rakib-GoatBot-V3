const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "anisr",
    version: "1.0",
    author: "Rakib",
    role: 0,
    shortDescription: "Get Anime Character TikTok Video",
    category: "media",
    guide: {
      en: "{pn} <anime character name>"
    }
  },

  onStart: async function ({ api, event, args }) {

    const query = args.join(" ");

    if (!query) {
      return api.sendMessage(
        "❌ Please provide an anime character name.\nExample:\nanisr naruto",
        event.threadID
      );
    }

    const loadingMsg = await api.sendMessage(
      `🔍 Searching...\n🎌 Character: ${query}`,
      event.threadID
    );

    try {

      // 🔗 RAW JSON URL
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

      // 🔎 Search
      const search = await axios.get(
        `${tikBase}/api/tiktok/search?q=${encodeURIComponent(query + " anime edit")}&apikey=rakib69`
      );

      const list = search.data.data || [];

      if (!list.length) {
        return api.editMessage(
          "❌ No anime videos found!",
          loadingMsg.messageID
        );
      }

      // 🎲 Random video
      const randomVideo =
        list[Math.floor(Math.random() * list.length)];

      if (!randomVideo.no_watermark) {
        return api.editMessage(
          "❌ Failed to extract video!",
          loadingMsg.messageID
        );
      }

      // ⚙️ Processing
      await api.editMessage(
        "⚙️ Processing video...",
        loadingMsg.messageID
      );

      // 📁 Cache folder
      const cacheDir = path.join(__dirname, "cache");

      if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir, { recursive: true });
      }

      const filePath = path.join(
        cacheDir,
        `${Date.now()}.mp4`
      );

      // 📥 Download
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
`🎬 Anime Video Ready!

🎌 Character: ${query}
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
        console.error(err);

        api.editMessage(
          "❌ Download failed!",
          loadingMsg.messageID
        );
      });

    } catch (err) {
      console.error(err);

      api.editMessage(
        "❌ Error while fetching video!",
        loadingMsg.messageID
      );
    }
  }
};
