const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");

module.exports = {
  config: {
    name: "fuck",
    aliases: ["fck", "sex"],
    version: "3.5",
    author: "Rakib Islam",
    countDown: 5,
    role: 0,
    description: "Overlay two users' avatars on a fun image template",
    category: "fun",
    guide: { en: "{pn} @mention — mention করুন\n{pn} reply — কারো message এ reply দিন" }
  },

  onStart: async function ({ message, event }) {
    try {
      const { senderID, mentions, messageReply } = event;

      let targetID;
      const mentionKeys = Object.keys(mentions || {});
      if (mentionKeys.length > 0) {
        targetID = mentionKeys[0];
      } else if (messageReply?.senderID) {
        targetID = messageReply.senderID;
      } else {
        return message.reply("⚠️ @mention করুন অথবা কারো message এ reply দিন!\nExample: .fuck @name");
      }

      if (targetID === senderID) {
        return message.reply("😅 নিজেকে ব্যবহার করা যাবে না!");
      }

      const one = senderID;
      const two = targetID;

      const dir = path.join(__dirname, "cache");
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

      const bgPath = path.join(dir, "fuck_template.png");

      if (!fs.existsSync(bgPath)) {
        const img = await axios.get(
          "https://i.ibb.co/VJHCjCb/images-2022-08-14-T183802-542.jpg",
          { responseType: "arraybuffer", timeout: 10000 }
        );
        fs.writeFileSync(bgPath, Buffer.from(img.data));
      }

      const avatar1 = path.join(dir, `fck_${one}.png`);
      const avatar2 = path.join(dir, `fck_${two}.png`);

      const getAvatar = async (id, savePath) => {
        const avatar = await axios.get(
          `https://graph.facebook.com/${id}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
          { responseType: "arraybuffer", timeout: 10000 }
        );
        fs.writeFileSync(savePath, Buffer.from(avatar.data));
      };

      await getAvatar(one, avatar1);
      await getAvatar(two, avatar2);

      const bg  = await loadImage(bgPath);
      const av1 = await loadImage(avatar1);
      const av2 = await loadImage(avatar2);

      const canvas = createCanvas(bg.width, bg.height);
      const ctx = canvas.getContext("2d");

      ctx.drawImage(bg, 0, 0, bg.width, bg.height);

      ctx.save();
      ctx.beginPath();
      ctx.arc(120, 450, 80, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(av1, 40, 370, 160, 160);
      ctx.restore();

      ctx.save();
      ctx.beginPath();
      ctx.arc(520, 200, 80, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(av2, 440, 120, 160, 160);
      ctx.restore();

      const outPath = path.join(dir, `fuck_result_${one}_${two}.png`);
      fs.writeFileSync(outPath, canvas.toBuffer("image/png"));

      await message.reply({
        body: "💥 Here you go! 😈",
        attachment: fs.createReadStream(outPath),
      });

      try { fs.unlinkSync(avatar1); fs.unlinkSync(avatar2); fs.unlinkSync(outPath); } catch {}
    } catch (err) {
      return message.reply(`❌ Error: ${err.message}`);
    }
  },
};
