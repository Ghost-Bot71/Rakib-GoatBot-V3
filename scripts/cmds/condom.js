const jimp = require("jimp");
const fs = require("fs-extra");
const path = require("path");

const { getAvatarUrl } = require("../../rakib/customApi/getAvatarUrl");

module.exports = {
  config: {
    name: "condom",
    aliases: ["cdm"],
    version: "2.0",
    author: "Rakib",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Condom meme effect"
    },
    longDescription: {
      en: "Make funny condom meme using tagged user's avatar"
    },
    category: "fun",
    guide: {
      en: "{pn} @mention"
    }
  },

  onStart: async function ({ event, message }) {
    try {
      const mentions = Object.keys(event.mentions);

      if (!mentions.length) {
        return message.reply("⚠️ | Please mention someone.");
      }

      const uid = mentions[0];

      // avatar url
      const avatarUrl = await getAvatarUrl(uid);

      // images load
      const avatar = await jimp.read(avatarUrl);

      // YOUR DRIVE IMAGE DIRECT LINK
      const bg = await jimp.read(
        "https://drive.google.com/uc?id=1BAbIp73QuoF4Z9hVp5ZtHfFI1qXDyR1C"
      );

      // avatar resize
      avatar.resize(263, 263);

      // background resize
      bg.resize(512, 512);

      // paste avatar
      bg.composite(avatar, 256, 258);

      // output path
      const output = path.join(__dirname, "cache", `condom_${uid}.png`);

      // ensure cache folder
      fs.ensureDirSync(path.join(__dirname, "cache"));

      // save image
      await bg.writeAsync(output);

      // send
      await message.reply({
        body: "🤣 Ops Crazy Condom Fails",
        attachment: fs.createReadStream(output)
      });

      // delete file
      fs.unlinkSync(output);

    } catch (err) {
      console.error(err);
      return message.reply("❌ | Error while generating image.");
    }
  }
};
