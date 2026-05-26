const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "pinterest",
    aliases: ["pin"],
    version: "2.1",
    author: "Rakib",
    countDown: 5,
    role: 0,
    shortDescription: "Search images from Pinterest",
    category: "media",
    guide: "{pn} <query> - <amount (max 20)>",
  },

  onStart: async function ({ api, event, args }) {
    try {
      const input = args.join(" ");
      if (!input) {
        return api.sendMessage(
          "Usage:\npinterest cat - 5",
          event.threadID,
          event.messageID
        );
      }

      // 🔍 query + limit
      const [queryRaw, limitRaw] = input.split("-");
      const query = queryRaw.trim();
      let limit = parseInt(limitRaw) || 5;
      if (limit > 20) limit = 20;

      // ⏳ processing message
      const loading = await api.sendMessage(
        `⏳ Processing "${query}"...`,
        event.threadID
      );

      // 🌐 API load
      const apiList = await axios.get(
        "https://raw.githubusercontent.com/bdrakib6t9/HOON/main/apiUrl.json"
      );
      const baseURL = apiList.data.pin;

      // 📡 request
      const res = await axios.get(
        `${baseURL}/pinterest?q=${encodeURIComponent(query)}&limit=${limit}`
      );

      if (!res.data.status || !res.data.data.length) {
        return api.editMessage(
          "❌ No images found!",
          loading.messageID
        );
      }

      const images = res.data.data;

      // 📥 download
      let attachments = [];

      for (let i = 0; i < images.length; i++) {
        const filePath = path.join(
          __dirname,
          "cache",
          `pin_${Date.now()}_${i}.jpg`
        );

        const img = await axios.get(images[i], {
          responseType: "arraybuffer",
        });

        fs.writeFileSync(filePath, Buffer.from(img.data));
        attachments.push(fs.createReadStream(filePath));
      }

      // ✏️ edit loading → done
      api.editMessage(
        `✅ Done | ${images.length} images`,
        loading.messageID
      );

      // 📤 send images
      api.sendMessage(
        {
          attachment: attachments,
        },
        event.threadID,
        () => {
          attachments.forEach((file) => {
            try {
              fs.unlinkSync(file.path);
            } catch {}
          });
        }
      );

    } catch (err) {
      console.log(err);
      api.sendMessage("❌ Error fetching images!", event.threadID);
    }
  },
};
