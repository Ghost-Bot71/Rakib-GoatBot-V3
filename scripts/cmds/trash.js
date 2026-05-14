const Canvas = require("canvas");
const fs = require("fs-extra");
const path = require("path");
const Jimp = require("jimp");
const { getAvatarUrl } = require("../../rakib/customApi/getAvatarUrl");

module.exports = {
  config: {
    name: "trash",
    aliases: ["dustbin", "trush"],
    version: "1.0.0",
    author: "Rakib",
    countDown: 5,
    role: 0,
    shortDescription: "কাউকে ডাস্টবিনে ফেলা",
    longDescription: "Put someone's avatar into trash bin (auto blur)",
    category: "fun",
    guide: {
      en: "{pn} [reply / @mention]"
    }
  },

  onStart: async function ({ api, event }) {

    const {
      threadID,
      messageID,
      mentions,
      type,
      messageReply
    } = event;

    let targetID;

    // ❌ must reply or mention
    if (type === "message_reply") {
      targetID = messageReply.senderID;
    }
    else if (Object.keys(mentions).length > 0) {
      targetID = Object.keys(mentions)[0];
    }
    else {
      return api.sendMessage(
        "❌ | কাউকে reply বা mention কর",
        threadID,
        messageID
      );
    }

    try {

      api.sendMessage(
        "🗑️ ডাস্টবিন প্রস্তুত করা হচ্ছে...",
        threadID,
        messageID
      );

      // avatar URL
      const avatarURL = await getAvatarUrl(targetID);

      // =========================
      // 🔥 BLUR WITH JIMP (REAL)
      // =========================

      const avatarJimp = await Jimp.read(avatarURL);

      avatarJimp.resize(310, 310);

      // 50% blur
      avatarJimp.blur(6);

      const avatarBuffer = await avatarJimp.getBufferAsync(Jimp.MIME_PNG);

      const avatar = await Canvas.loadImage(avatarBuffer);

      // =========================

      // background load
      const background = await Canvas.loadImage(
        "https://drive.google.com/uc?export=download&id=1FzLP234EqkaKv7QyxlTbqTObUmyES-lN"
      );

      // canvas create
      const canvas = Canvas.createCanvas(
        background.width,
        background.height
      );

      const ctx = canvas.getContext("2d");

      // draw background (NO BLUR)
      ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

      // draw blurred avatar
      ctx.drawImage(
        avatar,
        309,
        0,
        310,
        310
      );

      // =========================

      // cache folder
      const cacheDir = path.join(__dirname, "cache");

      if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir, { recursive: true });
      }

      const pathSave = path.join(
        cacheDir,
        `trash_${targetID}.png`
      );

      fs.writeFileSync(pathSave, canvas.toBuffer());

      // user info
      const userInfo = await api.getUserInfo(targetID);
      const name = userInfo[targetID]?.name || "Unknown";

      // send result
      return api.sendMessage({
        body: `🗑️ ${name} কে সফলভাবে ডাস্টবিনে ফেলে দেওয়া হয়েছে।`,
        attachment: fs.createReadStream(pathSave)
      },
      threadID,
      () => {
        if (fs.existsSync(pathSave)) {
          fs.unlinkSync(pathSave);
        }
      },
      messageID);

    }
    catch (error) {
      console.error(error);
      return api.sendMessage(
        "❌ command error",
        threadID,
        messageID
      );
    }
  }
};
