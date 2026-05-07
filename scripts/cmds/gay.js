const fs = require("fs");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");
const { getAvatarUrl } = require("../../rakib/customApi/getAvatarUrl");
const { getStreamFromURL } = global.utils;

module.exports = {
  config: {
    name: "gay",
    version: "1.0",
    author: "Rakib",
    countDown: 5,
    role: 0,
    category: "fun",
    guide: "{p}gay @mention | reply | UID"
  },

  onStart: async function ({ message, event }) {
    try {
      // 🎯 Target detect
      let targetID =
        event.messageReply?.senderID ||
        Object.keys(event.mentions || {})[0] ||
        event.args?.[0];

      if (!targetID) {
        return message.reply("❌ Please mention, reply or give UID.");
      }

      // 📛 Name detect
      const name =
        event.mentions?.[targetID] ||
        event.messageReply?.senderID === targetID
          ? event.messageReply?.body?.split(" ")[0]
          : "User";

      // 🖼️ Avatar
      const avatarPath = await getAvatarUrl(targetID).catch(() => null);
      if (!avatarPath) {
        return message.reply("❌ Avatar not found.");
      }

      // 🌈 Overlay (your drive image)
      const overlayURL =
        "https://drive.google.com/uc?export=download&id=1elbKpfdT1xOiOMNFiEvxiG6p7kkwIZjm";

      const overlayStream = await getStreamFromURL(overlayURL);
      const overlayBuffer = await streamToBuffer(overlayStream);

      // 📥 Load images
      const avatar = await loadImage(avatarPath);
      const overlay = await loadImage(overlayBuffer);

      // 🎨 Canvas 720x720
      const canvas = createCanvas(720, 720);
      const ctx = canvas.getContext("2d");

      // 🔵 Draw avatar
      ctx.drawImage(avatar, 0, 0, 720, 720);

      // 🌈 Overlay with 50% opacity
      ctx.globalAlpha = 0.5;
      ctx.drawImage(overlay, 0, 0, 720, 720);
      ctx.globalAlpha = 1;

      // 💬 Random message
      const messages = [
        `🌈 ${name} is officially 100% rainbow certified 😆`,
        `💅 ${name} just unlocked gay mode!`,
        `🏳️‍🌈 ${name} is shining with pride!`,
        `✨ ${name} looking fabulous today!`,
        `🔥 ${name} activated rainbow energy!`
      ];

      const randomMsg = messages[Math.floor(Math.random() * messages.length)];

      // 📁 Save
      const tmpDir = path.join(__dirname, "tmp");
      if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

      const outputPath = path.join(tmpDir, `gay_${Date.now()}.png`);
      fs.writeFileSync(outputPath, canvas.toBuffer("image/png"));

      // 📤 Send
      return message.reply(
        {
          body: randomMsg,
          attachment: fs.createReadStream(outputPath)
        },
        () => fs.unlinkSync(outputPath)
      );

    } catch (err) {
      console.error("gay cmd error:", err);
      return message.reply("❌ Gay command failed.");
    }
  }
};

// 🔧 helper
function streamToBuffer(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", c => chunks.push(c));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", reject);
  });
        }
