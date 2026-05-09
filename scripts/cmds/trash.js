const Canvas = require("canvas");
const fs = require("fs-extra");
const path = require("path");
const { getAvatarUrl } = require("../../rakib/customApi/getAvatarUrl");

module.exports = {
  config: {
    name: "trash",
    aliases: ["dustbin", "trash"],
    version: "2.1.0",
    author: "Rakib",
    countDown: 5,
    role: 0,
    shortDescription: "কাউকে ডাস্টবিনে ফেলার ছবি",
    longDescription: "Create a Trash image with user avatar in a dustbin",
    category: "fun",
    guide: {
      en: "{pn} [@mention / reply / UID]"
    }
  },

  onStart: async function ({ api, event, args }) {

    const {
      threadID,
      messageID,
      mentions,
      type,
      messageReply,
      senderID
    } = event;

    let targetID;

    // target detect
    if (type === "message_reply") {
      targetID = messageReply.senderID;
    }
    else if (Object.keys(mentions).length > 0) {
      targetID = Object.keys(mentions)[0];
    }
    else if (args.length > 0 && !isNaN(args[0])) {
      targetID = args[0];
    }
    else {
      targetID = senderID;
    }

    try {

      api.sendMessage(
        "🗑️ ডাস্টবিন প্রস্তুত করা হচ্ছে...",
        threadID,
        messageID
      );

      // avatar url
      const avatarURL = await getAvatarUrl(targetID);

      // load images
      const background = await Canvas.loadImage(
        "https://drive.google.com/uc?export=download&id=1FzLP234EqkaKv7QyxlTbqTObUmyES-lN"
      );

      const avatar = await Canvas.loadImage(avatarURL);

      // original template size
      const canvas = Canvas.createCanvas(
        background.width,
        background.height
      );

      const ctx = canvas.getContext("2d");

      // draw background
      ctx.drawImage(
        background,
        0,
        0,
        background.width,
        background.height
      );

      // =========================
      // BLUR AVATAR (50%)
      // =========================

      ctx.save();

      // blur amount
      ctx.filter = "blur(5px)";

      // exact trash position
      ctx.translate(309, 0);

      // avatar size
      ctx.drawImage(
        avatar,
        0,
        0,
        310,
        310
      );

      ctx.restore();

      // =========================

      // cache folder
      const cacheDir = path.join(__dirname, "cache");

      if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir, { recursive: true });
      }

      // save path
      const pathSave = path.join(
        cacheDir,
        `trash_${targetID}.png`
      );

      // save image
      fs.writeFileSync(
        pathSave,
        canvas.toBuffer()
      );

      // user info
      const userInfo = await api.getUserInfo(targetID);
      const name = userInfo[targetID]?.name || "Unknown";

      // send
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
