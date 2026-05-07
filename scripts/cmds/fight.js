const fs = require("fs-extra");
const Canvas = require("canvas");
const path = require("path");
const { getAvatarUrl } = require("../../rakib/customApi/getAvatarUrl");
const { getStreamFromURL } = global.utils;

module.exports = {
  config: {
    name: "fight",
    aliases: ["fht"],
    version: "1.2",
    author: "Rakib",
    countDown: 5,
    role: 0,
    shortDescription: "Romantic fight scene",
    category: "fun",
    guide: "{pn} @mention | reply"
  },

  onStart: async function ({ message, event, usersData }) {

    let targetID = null;

    if (event.type === "message_reply" && event.messageReply?.senderID) {
      targetID = event.messageReply.senderID;
    } else if (event.mentions && Object.keys(event.mentions).length > 0) {
      targetID = Object.keys(event.mentions)[0];
    }

    if (!targetID)
      return message.reply("❗ কাউকে reply বা mention করো 😏");

    const senderID = event.senderID;

    try {

      const name1 = await usersData.getName(senderID).catch(() => "User1");
      const name2 = await usersData.getName(targetID).catch(() => "User2");

      const avatarPath1 = await getAvatarUrl(senderID);
      const avatarPath2 = await getAvatarUrl(targetID);

      if (!avatarPath1 || !avatarPath2)
        return message.reply("❌ Avatar পাওয়া যায়নি।");

      // 🔥 Background (original size)
      const bgURL =
        "https://drive.google.com/uc?export=download&id=1kOdSLha-u_FW9vjPfqApyMGVSSoJfLPN";

      const bgStream = await getStreamFromURL(bgURL);
      const bgBuffer = await streamToBuffer(bgStream);
      const bg = await Canvas.loadImage(bgBuffer);

      // ✅ Canvas = Background original size
      const canvas = Canvas.createCanvas(bg.width, bg.height);
      const ctx = canvas.getContext("2d");

      ctx.drawImage(bg, 0, 0);

      const avatarSize = 250;

      // Your fixed positions
      const leftX = 940;
      const leftY = 420;

      const rightX = 380;
      const rightY = 200;

      const avatar1 = await Canvas.loadImage(avatarPath1);
      const avatar2 = await Canvas.loadImage(avatarPath2);

      // Sender (Left)
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
      ctx.drawImage(avatar1, leftX, leftY, avatarSize, avatarSize);
      ctx.restore();

      // Target (Right)
      ctx.save();
      ctx.beginPath();
      ctx.arc(
        rightX + avatarSize / 2,
        rightY + avatarSize / 2,
        avatarSize / 2,
        0,
        Math.PI * 2
      );
      ctx.clip();
      ctx.drawImage(avatar2, rightX, rightY, avatarSize, avatarSize);
      ctx.restore();

      // Save
      const tmpDir = path.join(__dirname, "tmp");
      await fs.ensureDir(tmpDir);

      const imgPath = path.join(tmpDir, `fight_${Date.now()}.png`);
      await fs.writeFile(imgPath, canvas.toBuffer("image/png"));

      const messages = [
        `🥊 ${name1} আর ${name2} এর ঝগড়া চলছে… কিন্তু শেষে কে আগে সরি বলবে? 😏❤️`,
        `🔥 Love fight mode ON! ${name1} vs ${name2} 💘`,
        `😤 রাগ দেখাচ্ছে ${name1}, কিন্তু ভেতরে ভেতরে ভালোবাসা শুধু ${name2} এর জন্যই ❤️`,
        `💥 Romantic Fight Alert! ${name1} & ${name2} — ঝগড়া মানেই ভালোবাসা 😉`,
        `😡 কথার লড়াই, কিন্তু হৃদয় তো একটাই 💞 ${name1} + ${name2}`
      ];

      const bodyText = messages[Math.floor(Math.random() * messages.length)];

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
      console.error("Fight error:", err);
      message.reply("⚠️ Fight render failed!");
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
