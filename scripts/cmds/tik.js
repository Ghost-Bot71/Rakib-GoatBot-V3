const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { tikApi } = require("../../rakib/customApi/tikApi");

module.exports = {
  config: {
    name: "tik",
    version: "1.0",
    author: "Rakib",
    role: 0,
    shortDescription: "Random video by search",
    category: "media",
    guide: {
      en: "{pn} <search keyword>"
    }
  },

  onStart: async function ({ api, event, args }) {

    const query = args.join(" ");

    if (!query) {
      return api.sendMessage(
        "❌ Please provide a search keyword.\nExample:\noffs sad video",
        event.threadID
      );
    }

    const loadingMsg = await api.sendMessage(
      `🔍 Searching video...\n🔎 Keyword: ${query}`,
      event.threadID
    );

    try {

      // 🔎 Step 1: TikWM search
      const search = await axios.get(
        `https://tikwm.com/api/feed/search?keywords=${encodeURIComponent(query)}`
      );

      const list = search.data.data?.videos || [];

      if (!list.length) {
        return api.editMessage(
          "❌ No videos found!",
          loadingMsg.messageID
        );
      }

      // 🎲 random pick
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
            body: `🎬 Random Video\n🔎 Keyword: ${query}`,
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
