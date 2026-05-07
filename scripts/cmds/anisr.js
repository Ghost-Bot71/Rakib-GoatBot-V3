const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { tikApi } = require("../../rakib/customApi/tikApi");

module.exports = {
  config: {
    name: "anisr",
    version: "2.0",
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

      // 🔎 search
      const search = await axios.get(
        `https://tikwm.com/api/feed/search?keywords=${encodeURIComponent(query + " anime edit")}`
      );

      const list = search.data.data?.videos || [];

      if (!list.length) {
        return api.editMessage(
          "❌ No anime videos found!",
          loadingMsg.messageID,
          event.threadID
        );
      }

      const randomVideo = list[Math.floor(Math.random() * list.length)];

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
        fs.mkdirSync(cacheDir, { recursive: true });
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
            body: `🎬 Anime Video Ready!\n🎌 Character: ${query}`,
            attachment: fs.createReadStream(filePath)
          },
          event.threadID,
          () => fs.unlinkSync(filePath)
        );

        api.unsendMessage(loadingMsg.messageID);
      });

      writer.on("error", (err) => {
        console.error(err);
        api.editMessage("❌ Download failed!", loadingMsg.messageID);
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
