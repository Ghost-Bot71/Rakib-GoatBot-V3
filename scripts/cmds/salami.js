const fs = require("fs-extra");
const Canvas = require("canvas");
const path = require("path");
const { getAvatarUrl } = require("../../rakib/customApi/getAvatarUrl");
const { getStreamFromURL } = global.utils;

module.exports = {
  config: {
    name: "salami",
    aliases: ["eidbonus"],
    version: "2.0",
    author: "Rakib",
    countDown: 5,
    role: 0,
    shortDescription: "Give salami money",
    category: "fun",
    guide: "{pn} @mention | reply"
  },

  onStart: async function ({ message, event, usersData }) {

    let targetID = null;

    if (event.type === "message_reply" && event.messageReply?.senderID)
      targetID = event.messageReply.senderID;
    else if (event.mentions && Object.keys(event.mentions).length > 0)
      targetID = Object.keys(event.mentions)[0];

    if (!targetID)
      return message.reply("🧧 কাউকে reply বা mention করো সালামি দেওয়ার জন্য!");

    const senderID = event.senderID;

    try {

      const name1 = await usersData.getName(senderID).catch(() => "User1");
      const name2 = await usersData.getName(targetID).catch(() => "User2");

      const avatar1Url = await getAvatarUrl(senderID);
      const avatar2Url = await getAvatarUrl(targetID);

      if (!avatar1Url || !avatar2Url)
        return message.reply("❌ Avatar পাওয়া যায়নি।");

      // 💰 Random salami amount
      const amount = Math.floor(Math.random() * (10000 - 50 + 1)) + 50;

      // 💳 Random payment system
      const paySystem = ["bKash", "Nagad", "Rocket"];
      const method = paySystem[Math.floor(Math.random() * paySystem.length)];

      // 🖼 Background
      const bgURL =
        "https://drive.google.com/uc?export=download&id=1Srr21hvBVuYlW32ESq8NlGsyS1lcWrvb";

      const bgStream = await getStreamFromURL(bgURL);
      const bgBuffer = await streamToBuffer(bgStream);
      const bg = await Canvas.loadImage(bgBuffer);

      const canvas = Canvas.createCanvas(bg.width, bg.height);
      const ctx = canvas.getContext("2d");

      ctx.drawImage(bg, 0, 0);

      const avatarSize = 100;

      const leftX = 450;
      const leftY = 115;

      const rightX = 80;
      const rightY = 180;

      const avatar1 = await Canvas.loadImage(avatar1Url);
      const avatar2 = await Canvas.loadImage(avatar2Url);

      // Left avatar
      ctx.save();
      ctx.beginPath();
      ctx.arc(leftX + avatarSize / 2, leftY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(avatar1, leftX, leftY, avatarSize, avatarSize);
      ctx.restore();

      // Right avatar
      ctx.save();
      ctx.beginPath();
      ctx.arc(rightX + avatarSize / 2, rightY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(avatar2, rightX, rightY, avatarSize, avatarSize);
      ctx.restore();

      // Temp save
      const tmpDir = path.join(__dirname, "tmp");
      await fs.ensureDir(tmpDir);

      const imgPath = path.join(tmpDir, `salami_${Date.now()}.png`);
      await fs.writeFile(imgPath, canvas.toBuffer("image/png"));

      // 🧧 Funny salami messages
      const captions = [
        `💰 ${name1} দিলো ${name2} কে ${amount}৳ সালামি!`,
        `🧧 ${name1} থেকে ${name2} এর জন্য ${amount}৳ ঈদের সালামি!`,
        `💳 ${method} ট্রান্সফার: ${name1} → ${name2}\nAmount: ${amount}৳`,
        `💸 ${name1} দিলো ${name2} কে ${amount}৳ — ভাংতি নাই, বাকি গুলো ফেরত দে 😆`,
        `🎁 ${name1} বললো — এই নাও ${amount}৳ সালামি ${name2}!`,
        `🪙 ${name2} আজ ${name1} এর কাছ থেকে ${amount}৳ সালামি পেল!`,
        `🤣 ${name1}: ${amount}৳ দিলাম... কিন্তু ভাংতি নাই!`
      ];

      const bodyText = captions[Math.floor(Math.random() * captions.length)];

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
      console.error("Salami error:", err);
      message.reply("⚠️ Salami render failed!");
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
