const fs = require("fs-extra");
const Canvas = require("canvas");
const path = require("path");
const { getAvatarUrl } = require("../../rakib/customApi/getAvatarUrl");
const { getStreamFromURL } = global.utils;

module.exports = {
  config: {
    name: "takla",
    aliases: ["taklu"],
    version: "1.0",
    author: "Rakib",
    countDown: 5,
    role: 0,
    shortDescription: "Make someone takla 😆",
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
      return message.reply("😆 কাউকে reply বা mention করো, টাকলা বানাতে হবে!");

    try {

      const name = await usersData.getName(targetID).catch(() => "User");

      const avatarUrl = await getAvatarUrl(targetID);
      if (!avatarUrl)
        return message.reply("❌ Avatar পাওয়া যায়নি।");

      // Background
      const bgURL =
        "https://drive.google.com/uc?export=download&id=1MMenGOPurGIR1a-SsPX3skmVUPSs41ZD";

      const bgStream = await getStreamFromURL(bgURL);
      const bgBuffer = await streamToBuffer(bgStream);
      const bg = await Canvas.loadImage(bgBuffer);

      const canvas = Canvas.createCanvas(bg.width, bg.height);
      const ctx = canvas.getContext("2d");

      ctx.drawImage(bg, 0, 0);

      const avatarSize = 80;

      const leftX = 160;
      const leftY = 70;

      const avatar = await Canvas.loadImage(avatarUrl);

      // Draw ONLY target avatar
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
        `takla_${targetID}_${Date.now()}.png`
      );

      await fs.writeFile(imgPath, canvas.toBuffer("image/png"));

      // 😆 Random Takla Messages (ONLY target)
      const captions = [
        `😂 ${name} এখন পুরো টাকলা হয়ে গেছে!`,
        `💀 ${name} এর চুল গায়েব!`,
        `😆 ${name} officially টাকলু club-এ যোগ দিলো!`,
        `🧑‍🦲 ${name} new hairstyle: NO HAIR 😎`,
        `🤣 ${name} মাথায় বাতাস লাগতেছে এখন!`,
        `🔥 ${name} zero cut না… full takla!`
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
      console.error("Takla error:", err);
      message.reply("⚠️ Takla render failed!");
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
