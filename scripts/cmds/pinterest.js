const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "pinterest",
    aliases: ["pin", "pic"],
    version: "5.0",
    author: "Chitron Bhattacharjee + Rakib",
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
      en: "{pn} <query> -<amount>\nExample:\n{pn} cute cats -5"
    }
  },

  langs: {
    en: {
      missingQuery: "🌄 | Please enter search keywords.",
      invalidAmount: "❌ | Image amount must be between 1-10.",
      noResults: "❌ | No images found.",
      apiError: "❌ | Failed to fetch images from Google.",
      downloadError: "⚠️ | Failed to download images.",
      success: "📸 Results for: \"%1\"\n🖼️ Amount: %2"
    }
  },

  onStart: async function ({
    api,
    event,
    args,
    message,
    getLang
  }) {

    // ================= PARSE QUERY =================

    const fullText = args.join(" ").trim();

    if (!fullText) {
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      return message.reply(getLang("missingQuery"));
    }

    // Default amount
    let amount = 3;

    // Match -5 / -10 etc
    const amountMatch = fullText.match(/-(\d+)$/);

    if (amountMatch) {
      amount = parseInt(amountMatch[1]);

      if (isNaN(amount) || amount < 1 || amount > 10) {
        api.setMessageReaction("❌", event.messageID, () => {}, true);
        return message.reply(getLang("invalidAmount"));
      }
    }

    // Remove -5 from query
    const query = fullText.replace(/-\d+$/, "").trim();

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
      `&num=${amount}`;

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

      // ================= DOWNLOAD =================

      const attachments = [];
      const lensLinks = [];
      const downloadedFiles = [];

      for (let i = 0; i < items.length; i++) {

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
              "User-Agent": "Mozilla/5.0"
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
          `${getLang("success", query, attachments.length)}\n\n` +
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

      console.log("IMGSRCH ERROR:", err.message);

      api.setMessageReaction("❌", event.messageID, () => {}, true);

      return message.reply(getLang("apiError"));
    }
  }
};
