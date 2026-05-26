const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { API_KEY, CX } = require("../../rakib/customKey/google");

module.exports = {
  config: {
    name: "pic",
    aliases: ["gif"],
    version: "6.0",
    author: "Rakib",
    role: 0,
    countDown: 15,
    category: "media",

    shortDescription: {
      en: "Search random images from Google"
    },

    description: {
      en: "Search and send random images with Google Lens links"
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

    // ================= QUERY =================

    const fullText = args.join(" ").trim();

    if (!fullText) {
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      return message.reply(getLang("missingQuery"));
    }

    // ================= AMOUNT =================

    let amount = 3;

    const amountMatch = fullText.match(/-(\d+)$/);

    if (amountMatch) {
      amount = parseInt(amountMatch[1]);

      if (isNaN(amount) || amount < 1 || amount > 10) {
        api.setMessageReaction("❌", event.messageID, () => {}, true);
        return message.reply(getLang("invalidAmount"));
      }
    }

    const query = fullText.replace(/-\d+$/, "").trim();

    if (!query) {
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      return message.reply(getLang("missingQuery"));
    }

    api.setMessageReaction("⏳", event.messageID, () => {}, true);

    // ================= TEMP =================

    const tempDir = path.join(__dirname, "temp");

    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    
    const searchURL =
      `https://www.googleapis.com/customsearch/v1` +
      `?q=${encodeURIComponent(query)}` +
      `&cx=${CX}` +
      `&key=${API_KEY}` +
      `&searchType=image` +
      `&safe=active` +
      `&num=10`;

    // ================= SHUFFLE =================

    function shuffleArray(array) {
      for (let i = array.length - 1; i > 0; i--) {

        const j = Math.floor(Math.random() * (i + 1));

        [array[i], array[j]] = [array[j], array[i]];
      }

      return array;
    }

    try {

      api.setMessageReaction("🔎", event.messageID, () => {}, true);

      const res = await axios.get(searchURL, {
        timeout: 15000
      });

      let items = res.data.items || [];

      if (!items.length) {
        api.setMessageReaction("❌", event.messageID, () => {}, true);
        return message.reply(getLang("noResults"));
      }

      // ================= RANDOMIZE =================

      items = shuffleArray(items);

      // Take only requested amount
      items = items.slice(0, amount);

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
