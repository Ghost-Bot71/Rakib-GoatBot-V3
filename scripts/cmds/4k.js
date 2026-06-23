const axios = require("axios");
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

module.exports = {
  config: {
    name: "4k",
    version: "1.1",
    author: "Rakib",
    countDown: 10,
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
      await message.reply("⏳ বটের লোকাল সার্ভারে 4K আপস্কেল হচ্ছে, কিছুটা সময় লাগতে পারে...");

      const cacheFolder = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheFolder)) fs.mkdirSync(cacheFolder, { recursive: true });

      const inputPath = path.join(cacheFolder, `input_${Date.now()}.jpg`);
      const outputPath = path.join(cacheFolder, `output_${Date.now()}.jpg`);

      // ১. আসল ইমেজটি ডাউনলোড করা
      const response = await axios({
        method: "GET",
        url: attachment.url,
        responseType: "arraybuffer"
      });
      const inputBuffer = Buffer.from(response.data, "binary");

      // ২. সরাসরি বটের সার্ভারেই শার্প দিয়ে আপস্কেল করা
      const metadata = await sharp(inputBuffer).metadata();
      const newWidth = 3840;
      const newHeight = Math.round((metadata.height / metadata.width) * newWidth);

      await sharp(inputBuffer)
        .resize(newWidth, newHeight, { kernel: sharp.kernel.lanczos3 })
        .sharpen()
        .modulate({ brightness: 1.02, saturation: 1.02 })
        .toFormat("jpeg", { quality: 95 })
        .toFile(outputPath);

      // ৩. ইউজারকে পাঠানো
      await message.reply({
        body: "✨ Here is your 4K image!",
        attachment: fs.createReadStream(outputPath)
      });

      // ক্যাশ ফাইল ডিলিট
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);

    } catch (err) {
      console.error("Local Upscale Error:", err.message);
      return message.reply("❌ আপস্কেল করতে ব্যর্থ হয়েছে। মনে হয় api ডাওন।");
    }
  }
};
