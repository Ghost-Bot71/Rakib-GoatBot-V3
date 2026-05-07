const fs = require("fs-extra");
const Canvas = require("canvas");
const path = require("path");
const { getAvatarUrl } = require("../../rakib/customApi/getAvatarUrl");
const { getStreamFromURL } = global.utils;

module.exports = {
  config: {
    name: "murgi",
    aliases: ["chicken"],
    version: "1.0",
    author: "Rakib",
    countDown: 5,
    role: 0,
    shortDescription: "Turn someone into murgi 🐔",
    category: "fun",
    guide: "{pn} @mention | reply"
  },

  onStart: async function ({ message, event, usersData }) {

    // -------------------------
    // TARGET (reply > mention)
    // -------------------------
    let targetID = null;

    if (event.type === "message_reply" && event.messageReply?.senderID) {
      targetID = event.messageReply.senderID;
    } 
    else if (event.mentions && Object.keys(event.mentions).length > 0) {
      targetID = Object.keys(event.mentions)[0];
    }

    if (!targetID)
      return message.reply("🐔 কাউকে reply বা mention করো মুরগি বানানোর জন্য!");

    try {

      const name = await usersData.getName(targetID).catch(() => "User");
      const avatarPath = await getAvatarUrl(targetID);

      if (!avatarPath)
        return message.reply("❌ Avatar পাওয়া যায়নি।");

      // 🔥 Background (default size, untouched)
      const bgURL =
        "https://drive.google.com/uc?export=download&id=10099ZYSVcBV7k2G3XDanj3dkRxB049l2";

      const bgStream = await getStreamFromURL(bgURL);
      const bgBuffer = await streamToBuffer(bgStream);
      const bg = await Canvas.loadImage(bgBuffer);

      // Canvas = background original size
      const canvas = Canvas.createCanvas(bg.width, bg.height);
      const ctx = canvas.getContext("2d");

      ctx.drawImage(bg, 0, 0);

      const avatarSize = 180;
      const leftX = 830;
      const leftY = 200;

      const avatar = await Canvas.loadImage(avatarPath);

      // Circle crop avatar
      ctx.save();
      ctx.beginPath();
      ctx.arc(
        leftX + avatarSize / 2,
        leftY + avatarSize / 2,
        avatarSize / 2,
        0,
        Math.PI * 2
      );
      ctx.clip();
      ctx.drawImage(avatar, leftX, leftY, avatarSize, avatarSize);
      ctx.restore();

      // Save temp
      const tmpDir = path.join(__dirname, "tmp");
      await fs.ensureDir(tmpDir);

      const imgPath = path.join(
        tmpDir,
        `murgi_${targetID}_${Date.now()}.png`
      );

      await fs.writeFile(imgPath, canvas.toBuffer("image/png"));

      // 🐔 Random funny captions (ONLY target name)
      const captions = [
        `🐔 আজকের ফ্রেশ মুরগি হলো ${name}!`,
        `🍗 ${name} এখন অফিসিয়ালি মুরগি ঘোষিত!`,
        `😂 কুক্কুড়ু কু! ${name} ডিম পাড়ার প্রস্তুতিতে!`,
        `🔥 ${name} কে দেখে মনে হচ্ছে আজ বিরিয়ানি হবে!`,
        `🐥 ${name} এখন খামারের ভিআইপি মুরগি!`,
        `🥚 ${name} সাবধান! ডিম পড়ে যেতে পারে!`
      ];

      const bodyText =
        captions[Math.floor(Math.random() * captions.length)];

      await message.reply(
        {
          body: bodyText,
          attachment: fs.createReadStream(imgPath)
        },
        () => fs.unlink(imgPath).catch(() => {})
      );

      canvas.width = canvas.height = 0;
      global.gc && global.gc();

    } catch (err) {
      console.error("Murgi error:", err);
      message.reply("⚠️ মুরগি বানাতে সমস্যা হয়েছে!");
    }
  }
};

function streamToBuffer(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", c => chunks.push(c));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", reject);
  });
        }
