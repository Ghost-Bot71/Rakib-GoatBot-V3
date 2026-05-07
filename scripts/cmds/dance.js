const fs = require("fs-extra");
const Canvas = require("canvas");
const path = require("path");
const { getAvatarUrl } = require("../../rakib/customApi/getAvatarUrl");
const { getStreamFromURL } = global.utils;

module.exports = {
  config: {
    name: "dance",
    aliases: ["dnc"],
    version: "1.0",
    author: "Rakib",
    countDown: 5,
    role: 0,
    shortDescription: "Dance together",
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
      return message.reply("💃 কাউকে reply বা mention করো একসাথে নাচার জন্য 🕺");

    const senderID = event.senderID;

    try {

      const name1 = await usersData.getName(senderID).catch(() => "User1");
      const name2 = await usersData.getName(targetID).catch(() => "User2");

      const avatarPath1 = await getAvatarUrl(senderID);
      const avatarPath2 = await getAvatarUrl(targetID);

      if (!avatarPath1 || !avatarPath2)
        return message.reply("❌ Avatar পাওয়া যায়নি।");

      // 🔥 Background (default size)
      const bgURL =
        "https://drive.google.com/uc?export=download&id=11vhqqITHqQVcf4wqxHiWbW9mJ3nb6yJG";

      const bgStream = await getStreamFromURL(bgURL);
      const bgBuffer = await streamToBuffer(bgStream);
      const bg = await Canvas.loadImage(bgBuffer);

      // ✅ Canvas = Background original size
      const canvas = Canvas.createCanvas(bg.width, bg.height);
      const ctx = canvas.getContext("2d");

      ctx.drawImage(bg, 0, 0);

      const avatarSize = 60;

      // Your fixed positions
      const leftX = 355;
      const leftY = 100;

      const rightX = 505;
      const rightY = 150;

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

      // Save temp file
      const tmpDir = path.join(__dirname, "tmp");
      await fs.ensureDir(tmpDir);

      const imgPath = path.join(
        tmpDir,
        `dance_${senderID}_${targetID}_${Date.now()}.png`
      );

      await fs.writeFile(imgPath, canvas.toBuffer("image/png"));

      // 💃 Random Dance Captions
      const captions = [
        `💃 ${name1} আর ${name2} আজ ডান্স ফ্লোর কাঁপাচ্ছে! 🕺`,
        `🔥 Beat drop হতেই ${name1} & ${name2} শুরু করলো dance battle!`,
        `🎶 Music on... ${name1} + ${name2} = Perfect dance vibe!`,
        `✨ Romantic slow dance চলছে ${name1} আর ${name2} এর 💞`,
        `💥 Dance mode activated! ${name1} 🆚 ${name2}`,
        `🕺 Step by step... heart by heart 💖 ${name1} & ${name2}`
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
      console.error("Dance error:", err);
      message.reply("⚠️ Dance render failed!");
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
