const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { upscaleImage } = require("../../rakib/customApi/4kApi");

module.exports = {
  config: {
    name: "4k",
    version: "1.0",
    author: "Rakib Hasan",
    countDown: 5,
    role: 0,
    shortDescription: "Upscale image to 4K",
    longDescription: "Reply to an image to upscale it",
    category: "image",
    guide: "{pn} (reply to an image)"
  },

  onStart: async function ({ message, event }) {

    const reply = event.messageReply;

    if (!reply || !reply.attachments || reply.attachments.length === 0)
      return message.reply("📸 Reply to an image.");

    const attachment = reply.attachments[0];

    if (attachment.type !== "photo")
      return message.reply("❌ Please reply to a valid image.");

    try {

      await message.reply("⏳ Upscaling to 4K...");

      const cacheFolder = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheFolder)) fs.mkdirSync(cacheFolder, { recursive: true });

      const inputPath = path.join(cacheFolder, `input_${Date.now()}.jpg`);
      const outputPath = path.join(cacheFolder, `output_${Date.now()}.jpg`);

      // Download image first
      const img = await axios({
        method: "GET",
        url: attachment.url,
        responseType: "stream"
      });

      const writer = fs.createWriteStream(inputPath);
      img.data.pipe(writer);

      writer.on("finish", async () => {

        await upscaleImage(inputPath, outputPath);

        await message.reply({
          body: "✨ Here is your 4K image!",
          attachment: fs.createReadStream(outputPath)
        });

        fs.unlinkSync(inputPath);
        fs.unlinkSync(outputPath);
      });

    } catch (err) {
      console.error(err.message);
      return message.reply("❌ Upscale failed.");
    }
  }
};
