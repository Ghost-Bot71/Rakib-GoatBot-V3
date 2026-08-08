const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const CACHE_DIR = path.join(__dirname, "cache");

module.exports = {
  config: {
    name: "4k",
    aliases: ["hd", "upscale", "enhance", "remini"],
    version: "2.0",
    author: "Ghost Bot",
    countDown: 10,
    role: 0,
    shortDescription: "Upscale image to 4K using Tenzo API",
    longDescription: "Enhance and upscale any image to 4K quality. Reply to a photo or send image URL.",
    category: "image",
    guide: {
      en: "{pn} [reply to photo / image URL]"
    }
  },

  onStart: async function ({ message, event, args, api }) {
    let imageUrl = null;

    if (args.length > 0) {
      imageUrl = args.find(a => a.startsWith("http://") || a.startsWith("https://"));
    }
    if (!imageUrl && event.messageReply?.attachments?.length > 0) {
      const att = event.messageReply.attachments.find(a => a.type === "photo" || a.type === "image");
      if (att) imageUrl = att.url;
    }
    if (!imageUrl && event.attachments?.length > 0) {
      const att = event.attachments.find(a => a.type === "photo" || a.type === "image");
      if (att) imageUrl = att.url;
    }

    if (!imageUrl) {
      return message.reply("📸 𝗣𝗹𝗲𝗮𝘀𝗲 𝗿𝗲𝗽𝗹𝘆 𝘁𝗼 𝗮 𝗽𝗵𝗼𝘁𝗼 𝗼𝗿 𝗽𝗿𝗼𝘃𝗶𝗱𝗲 𝗮𝗻 𝗶𝗺𝗮𝗴𝗲 𝗨𝗥𝗟.\n\n𝗨𝘀𝗮𝗴𝗲: .4k [URL] or reply to a photo");
    }

    await message.reply("⏳ 𝗨𝗽𝘀𝗰𝗮𝗹𝗶𝗻𝗴 𝗶𝗺𝗮𝗴𝗲 𝘁𝗼 𝟰𝗞... 𝗣𝗹𝗲𝗮𝘀𝗲 𝘄𝗮𝗶𝘁 👾");

    try {
      const apiUrl = `https://tenzo.is-a.dev/api/tools/4k?url=${encodeURIComponent(imageUrl)}`;
      const res = await axios.get(apiUrl, { responseType: "arraybuffer", timeout: 30000 });

      if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });
      const filePath = path.join(CACHE_DIR, `4k_${Date.now()}.jpg`);
      fs.writeFileSync(filePath, Buffer.from(res.data));

      await message.reply({
        body: "✅ 𝟰𝗞 𝗘𝗻𝗵𝗮𝗻𝗰𝗲𝗱 𝗜𝗺𝗮𝗴𝗲 — 𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 𝗧𝗲𝗻𝘇𝗼 𝗔𝗣𝗜 👻",
        attachment: fs.createReadStream(filePath)
      });

      setTimeout(() => { try { fs.unlinkSync(filePath); } catch (_) {} }, 12000);
    } catch (err) {
      return message.reply(`❌ 𝗙𝗮𝗶𝗹𝗲𝗱 𝘁𝗼 𝘂𝗽𝘀𝗰𝗮𝗹𝗲 𝗶𝗺𝗮𝗴𝗲.\n𝗘𝗿𝗿𝗼𝗿: ${err.message}`);
    }
  }
};
