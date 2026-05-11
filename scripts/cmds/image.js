const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "image",
    aliases: ["imgsearch", "imgsrc"],
    version: "4.0",
    author: "Rakib",
    role: 0,
    countDown: 15,
    category: "media",

    shortDescription: {
      en: "Search images from Google"
    },

    description: {
      en: "Search and send images with Google Lens links"
    },

    guide: {
      en: "{pn} <query>\nExample: {pn} cute cats"
    }
  },

  langs: {
    en: {
      missingQuery: "🌄 | Please enter search keywords.",
      noResults: "❌ | No images found.",
      apiError: "❌ | Failed to fetch images from Google.",
      downloadError: "⚠️ | Failed to download images.",
      success: "📸 Results for: \"%1\""
    }
  },

  onStart: async function ({
    api,
    event,
    args,
    message,
    getLang
  }) {

    const query = args.join(" ").trim();

    if (!query) {
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      return message.reply(getLang("missingQuery"));
    }

    api.setMessageReaction("⏳", event.messageID, () => {}, true);

    // ================= TEMP FOLDER =================

    const tempDir = path.join(__dirname, "temp");

    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // ================= API =================

    const API_KEY =
      process.env.GOOGLE_API_KEY ||
      "AIzaSyApKVVy6L44Qz21LR2BJWRhf7yP4qmczvg";

    const CX =
      process.env.GOOGLE_CX ||
      "b4c33dfdc37784f23";

    const searchURL =
      `https://www.googleapis.com/customsearch/v1` +
      `?q=${encodeURIComponent(query)}` +
      `&cx=${CX}` +
      `&key=${API_KEY}` +
      `&searchType=image` +
      `&safe=active` +
      `&num=5`;

    try {

      api.setMessageReaction("🔎", event.messageID, () => {}, true);

      const res = await axios.get(searchURL, {
        timeout: 15000
      });

      const items = res.data.items || [];

      if (!items.length) {
        api.setMessageReaction("❌", event.messageID, () => {}, true);
        return message.reply(getLang("noResults"));
      }

      // ================= DOWNLOAD IMAGES =================

      const attachments = [];
      const lensLinks = [];
      const downloadedFiles = [];

      for (let i = 0; i < Math.min(items.length, 3); i++) {

        try {

          const imgUrl = items[i].link;

          const filePath = path.join(
            tempDir,
            `img_${event.senderID}_${Date.now()}_${i}.jpg`
          );

          const imgRes = await axios.get(imgUrl, {
            responseType: "arraybuffer",
            timeout: 15000,
            headers: {
              "User-Agent":
                "Mozilla/5.0"
            }
          });

          fs.writeFileSync(filePath, imgRes.data);

          downloadedFiles.push(filePath);

          attachments.push(
            fs.createReadStream(filePath)
          );

          lensLinks.push(
            `🔗 ${i + 1}. https://lens.google.com/uploadbyurl?url=${encodeURIComponent(imgUrl)}`
          );

        } catch (err) {
          console.log(`Download Failed ${i + 1}:`, err.message);
        }
      }

      // ================= CHECK =================

      if (!attachments.length) {
        api.setMessageReaction("❌", event.messageID, () => {}, true);
        return message.reply(getLang("downloadError"));
      }

      // ================= SEND =================

      api.setMessageReaction("📤", event.messageID, () => {}, true);

      await message.reply({
        body:
          `${getLang("success", query)}\n\n` +
          `${lensLinks.join("\n")}`,
        attachment: attachments
      });

      // ================= CLEANUP =================

      for (const file of downloadedFiles) {
        try {
          if (fs.existsSync(file)) {
            fs.unlinkSync(file);
          }
        } catch (e) {
          console.log("Cleanup Error:", e.message);
        }
      }

      api.setMessageReaction("✅", event.messageID, () => {}, true);

    } catch (err) {

      console.log("IMGSRCH ERROR:", err);

      api.setMessageReaction("❌", event.messageID, () => {}, true);

      return message.reply(getLang("apiError"));
    }
  }
};
