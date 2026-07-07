const axios = require("axios");
const fs = require("fs");
const path = require("path");
const os = require("os");

module.exports = {
  config: {
    name: "autopin",
    version: "1.0.0",
    author: "Rakib",
    countDown: 5,
    role: 0,
    shortDescription: "Auto download Pinterest videos",
    longDescription: "Automatically detects Pinterest links and downloads videos.",
    category: "media",
    guide: "Just send a Pinterest link"
  },

  onStart: async function ({ message }) {
    return message.reply(
      "এই কমান্ডটি অটোমেটিক কাজ করে। চ্যাটে যেকোনো Pinterest ভিডিও লিংক দিলে বট নিজেই ভিডিও ডাউনলোড করে দেবে।"
    );
  },

  onChat: async function ({ message, event }) {
    const body = event.body || "";

    const pinRegex =
      /https?:\/\/(?:www\.)?pinterest\.[^\s/]+\/pin\/[A-Za-z0-9_-]+\/?/gi;

    const links = body.match(pinRegex);
    if (!links) return;

    try {
      const { data: apiUrl } = await axios.get(
        "https://raw.githubusercontent.com/bdrakib6t9/HOON/main/apiUrl.json"
      );

      for (const link of links) {
        const { data } = await axios.get(
          `${apiUrl.pinvid}/api/download?url=${encodeURIComponent(link)}`
        );

        if (!data.success || !data.download_url) continue;

        const tempPath = path.join(
          os.tmpdir(),
          `pin_${Date.now()}.mp4`
        );

        const video = await axios({
          url: data.download_url,
          method: "GET",
          responseType: "stream",
          headers: {
            "User-Agent":
              "Mozilla/5.0"
          }
        });

        const writer = fs.createWriteStream(tempPath);
        video.data.pipe(writer);

        await new Promise((resolve, reject) => {
          writer.on("finish", resolve);
          writer.on("error", reject);
        });

        await message.reply({
          body: `📌 ${data.title}`,
          attachment: fs.createReadStream(tempPath)
        });

        setTimeout(() => {
          if (fs.existsSync(tempPath))
            fs.unlinkSync(tempPath);
        }, 10000);
      }
    } catch (err) {
      console.error("[Auto Pinterest Error]", err.message);
    }
  }
};
