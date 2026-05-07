const fs = require("fs-extra");
const Canvas = require("canvas");
const path = require("path");
const { getAvatarUrl } = require("../../rakib/customApi/getAvatarUrl");
const { getStreamFromURL } = global.utils;

module.exports = {
  config: {
    name: "kiss",
    aliases: ["ks"],
    version: "1.0",
    author: "Rakib",
    countDown: 5,
    role: 0,
    shortDescription: "Kiss someone",
    category: "fun",
    guide: "{pn} @mention | reply"
  },

  onStart: async function ({ message, event, usersData }) {

    // -------- TARGET (reply > mention) --------
    let targetID = null;

    if (event.type === "message_reply" && event.messageReply?.senderID) {
      targetID = event.messageReply.senderID;
    }
    else if (event.mentions && Object.keys(event.mentions).length > 0) {
      targetID = Object.keys(event.mentions)[0];
    }

    if (!targetID)
      return message.reply("💋 কাউকে reply বা mention করো kiss দেওয়ার জন্য!");

    const senderID = event.senderID;

    try {

      const name1 = await usersData.getName(senderID).catch(() => "User1");
      const name2 = await usersData.getName(targetID).catch(() => "User2");

      const avatar1Url = await getAvatarUrl(senderID);
      const avatar2Url = await getAvatarUrl(targetID);

      if (!avatar1Url || !avatar2Url)
        return message.reply("❌ Avatar পাওয়া যায়নি।");

      // -------- Background --------
      const bgURL =
        "https://drive.google.com/uc?export=download&id=1JrCEO6ASjxehr3jdqxHhZ_X4TkPhbHhz";

      const bgStream = await getStreamFromURL(bgURL);
      const bgBuffer = await streamToBuffer(bgStream);
      const bg = await Canvas.loadImage(bgBuffer);

      const canvas = Canvas.createCanvas(bg.width, bg.height);
      const ctx = canvas.getContext("2d");

      ctx.drawImage(bg, 0, 0);

      const avatarSize = 200;

      const leftX = 420;
      const leftY = 40;

      const rightX = 110;
      const rightY = 170;

      const avatar1 = await Canvas.loadImage(avatar1Url);
      const avatar2 = await Canvas.loadImage(avatar2Url);

      // Left avatar
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

      // Right avatar
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

      // Save temp image
      const tmpDir = path.join(__dirname, "tmp");
      await fs.ensureDir(tmpDir);

      const imgPath = path.join(
        tmpDir,
        `kiss_${senderID}_${targetID}_${Date.now()}.png`
      );

      await fs.writeFile(imgPath, canvas.toBuffer("image/png"));

      // -------- Random kiss captions --------
      const captions = [
        `💋 ${name1} just kissed ${name2}!`,
        `😘 ${name1} gave ${name2} a sweet kiss!`,
        `💖 Love moment! ${name1} kissed ${name2}!`,
        `😍 ${name1} couldn't resist kissing ${name2}!`,
        `💕 ${name1} → ${name2} sending a cute kiss!`,
        `🥰 ${name1} shared a romantic kiss with ${name2}!`
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
      console.error("Kiss error:", err);
      message.reply("⚠️ Kiss render failed!");
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
