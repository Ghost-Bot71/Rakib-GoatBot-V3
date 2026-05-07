const fs = require("fs-extra");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");
const { getStreamFromURL } = global.utils;

const { getAvatarUrl } = require("../../rakib/customApi/getAvatarUrl");

module.exports = {
  config: {
    name: "rajakar",
    version: "1.0.0",
    author: "Rakib",
    countDown: 1,
    role: 0,
    category: "fun",
    description: "Create rajakar meme image",
    guide: "{pn} @mention | reply"
  },

  onStart: async function ({ api, event }) {

    const { threadID, messageID, senderID, mentions, messageReply } = event;

    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.ensureDirSync(cacheDir);

    let targetID = senderID;

    if (Object.keys(mentions).length > 0) {
      targetID = Object.keys(mentions)[0];
    } 
    else if (messageReply) {
      targetID = messageReply.senderID;
    }

    const imgPath = path.join(cacheDir, `rk_${targetID}.png`);

    try {

      const userInfo = await api.getUserInfo(targetID);
      const userName = userInfo[targetID]?.name || "User";

      // 🔥 NEW GOOGLE DRIVE BACKGROUND
      const backgroundURL =
        "https://drive.google.com/uc?export=download&id=1-aXXY6_odmrSIHcv25qwV8bOO8aE2xm4";

      // 🔥 AVATAR FROM CUSTOM API
      const avatarURL = await getAvatarUrl(targetID);

      const bgStream = await getStreamFromURL(backgroundURL);
      const bgBuffer = await streamToBuffer(bgStream);

      const [bgImg, avatarImg] = await Promise.all([
        loadImage(bgBuffer),
        loadImage(avatarURL)
      ]);

      const canvas = createCanvas(bgImg.width, bgImg.height);
      const ctx = canvas.getContext("2d");

      ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

      const userImageSize = 120;

      const x = canvas.width - userImageSize - 75;
      const y = (canvas.height / 2) - (userImageSize / 2) - 15;

      ctx.save();
      ctx.beginPath();
      ctx.arc(
        x + userImageSize / 2,
        y + userImageSize / 2,
        userImageSize / 2,
        0,
        Math.PI * 2
      );
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(avatarImg, x, y, userImageSize, userImageSize);
      ctx.restore();

      const buffer = canvas.toBuffer("image/png");
      fs.writeFileSync(imgPath, buffer);

      return api.sendMessage(
        {
          body: `‎এই যে দেখেন আমাদের নতুন রাজাকার: ${userName}`,
          mentions: [{ tag: userName, id: targetID }],
          attachment: fs.createReadStream(imgPath)
        },
        threadID,
        () => {
          if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
        },
        messageID
      );

    } catch (error) {

      console.log("RAJAKAR ERROR:", error);

      return api.sendMessage(
        "Something went wrong, please try again later.",
        threadID,
        messageID
      );

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
