const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { tikApi } = require("../../rakib/customApi/tikApi");

module.exports = {
  config: {
    name: "aniedit",
    version: "2.0",
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

      // 🔎 search
      const search = await axios.get(
        `https://tikwm.com/api/feed/search?keywords=${encodeURIComponent(searchQuery)}`
      );

      const list = search.data.data?.videos || [];

      if (!list.length) {
        return api.editMessage(
          "❌ No anime edits found!",
          loadingMsg.messageID
        );
      }

      const randomVideo = list[Math.floor(Math.random() * list.length)];

      if (!randomVideo.video_id || !randomVideo.author?.unique_id) {
        return api.editMessage(
          "❌ Failed to extract video info.",
          loadingMsg.messageID
        );
      }

      const realUrl = `https://www.tiktok.com/@${randomVideo.author.unique_id}/video/${randomVideo.video_id}`;

      // ⚙️ processing
      await api.editMessage("⚙️ Processing video...", loadingMsg.messageID);

      const data = await tikApi(realUrl);

      if (data.error) {
        return api.editMessage(
          `❌ ${data.error}`,
          loadingMsg.messageID
        );
      }

      // 📁 cache
      const cacheDir = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir, { recursive: true }); // ✅ fix
      }

      const filePath = path.join(cacheDir, `${Date.now()}.mp4`);

      // 📥 download
      const stream = await axios({
        url: data.video,
        method: "GET",
        responseType: "stream"
      });

      const writer = fs.createWriteStream(filePath);
      stream.data.pipe(writer);

      writer.on("finish", () => {
        api.sendMessage(
          {
            body: `🎬 Anime Edit Ready!\n🎌 ${query}`,
            attachment: fs.createReadStream(filePath)
          },
          event.threadID,
          () => fs.unlinkSync(filePath)
        );

        api.unsendMessage(loadingMsg.messageID);
      });

      writer.on("error", (err) => {
        console.error("Download error:", err);
        api.editMessage("❌ Video download failed!", loadingMsg.messageID);
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
