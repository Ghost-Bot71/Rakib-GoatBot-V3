const axios = require("axios");
const Jimp = require("jimp");
const fs = require("fs");
const path = require("path");

module.exports = {
config: {
name: "blur",
version: "2.0",
author: "Rakib",
countDown: 5,
role: 0,
category: "image",
guide: {
en: "{pn} [reply image / imageURL] [1-100]"
}
},

onStart: async function ({ api, args, message, event }) {

try {

  let imageUrl;
  let blurLevel = 50;

  // reply image
  if (event.type === "message_reply" && event.messageReply.attachments?.length > 0) {
    imageUrl = event.messageReply.attachments[0].url;

    if (args[0] && !isNaN(args[0])) {
      const level = parseInt(args[0]);
      if (level >= 1 && level <= 100) blurLevel = level;
      else return message.reply("❌ | Blur level must be 1–100.");
    }
  }

  // image URL
  else if (args[0]?.startsWith("http")) {
    imageUrl = args[0];

    if (args[1] && !isNaN(args[1])) {
      const level = parseInt(args[1]);
      if (level >= 1 && level <= 100) blurLevel = level;
      else return message.reply("❌ | Blur level must be 1–100.");
    }
  }

  else {
    return message.reply("❌ | Reply to an image or provide image URL.");
  }

  const wait = await message.reply("⏳ Blurring image...");

  const imgBuffer = (await axios.get(imageUrl, { responseType: "arraybuffer" })).data;

  const image = await Jimp.read(imgBuffer);

  const blurAmount = Math.floor(blurLevel / 5);

  image.blur(blurAmount);

  const filePath = path.join(__dirname, `blur_${Date.now()}.png`);

  await image.writeAsync(filePath);

  message.unsend(wait.messageID);

  message.reply({
    body: `🌫️ Here's your ${blurLevel}% blurred image`,
    attachment: fs.createReadStream(filePath)
  });

  setTimeout(() => {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }, 10000);

} catch (err) {
  console.error(err);
  message.reply("❌ Error while processing image.");
}

}
};
