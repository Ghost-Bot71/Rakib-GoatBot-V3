const axios = require("axios");
const fs = require("fs-extra");
const { loadImage, createCanvas } = require("canvas");
const { getAvatarUrl } = require("../../rakib/customApi/getAvatarUrl");

module.exports = {
  config: {
    name: "wish",
    version: "3.0",
    author: "Rakib",
    role: 0,
    shortDescription: "Premium birthday wish",
    longDescription: "Generate birthday card with drive bg + custom avatar",
    category: "birthday",
    guide: {
      en: "{pn} @tag"
    }
  },

  wrapText(ctx, text, maxWidth) {
    return new Promise(resolve => {
      if (ctx.measureText(text).width < maxWidth) return resolve([text]);

      const words = text.split(" ");
      const lines = [];
      let line = "";

      for (let word of words) {
        const testLine = line + word + " ";
        if (ctx.measureText(testLine).width > maxWidth) {
          lines.push(line.trim());
          line = word + " ";
        } else line = testLine;
      }

      lines.push(line.trim());
      resolve(lines);
    });
  },

  onStart: async function ({ api, event, usersData }) {
    try {
      const bgPath = __dirname + "/cache/bgc.png";
      const avtPath = __dirname + "/cache/avt.png";

      const mentionID = Object.keys(event.mentions)[0] || event.senderID;

      const targetName = await usersData.getName(mentionID);
      const senderName = await usersData.getName(event.senderID);

      // ✅ Google Drive direct download link
      const bgURL =
        "https://drive.google.com/uc?export=download&id=1BGc6DntwUrNBiHMgxmeDFfNjLtRxbwIG";

      // ✅ Custom Avatar URL
      const avatarURL = await getAvatarUrl(mentionID);

      // Download avatar
      const avtData = (
        await axios.get(avatarURL, { responseType: "arraybuffer" })
      ).data;
      fs.writeFileSync(avtPath, Buffer.from(avtData));

      // Download background
      const bgData = (
        await axios.get(bgURL, { responseType: "arraybuffer" })
      ).data;
      fs.writeFileSync(bgPath, Buffer.from(bgData));

      // Canvas setup
      const bg = await loadImage(bgPath);
      const avt = await loadImage(avtPath);

      const canvas = createCanvas(bg.width, bg.height);
      const ctx = canvas.getContext("2d");

      ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

      // 🔵 Avatar Circle
      ctx.save();
      ctx.beginPath();
      ctx.arc(270, 470, 200, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(avt, 70, 270, 400, 400);
      ctx.restore();

      // ✍️ Name text
      ctx.font = "bold 40px Arial";
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "left";

      const nameLines = await this.wrapText(ctx, targetName, 900);
      ctx.fillText(nameLines.join("\n"), 550, 420);

      const imageBuffer = canvas.toBuffer();
      fs.writeFileSync(bgPath, imageBuffer);

      // 🎉 Caption
      const caption =
        `🎉💐✨ Happy Birthday, ${targetName}! ✨💐🎉\n\n` +
        `🌟 আজকের দিনটা তোমার জন্য স্পেশাল!\n` +
        `🎂 Happiness + Success + Love\n\n` +
        `💖 Stay happy always\n` +
        `💖 Dreams come true\n\n` +
        `— From: ${senderName} 💙`;

      api.sendMessage(
        {
          body: caption,
          mentions: [
            {
              id: mentionID,
              tag: targetName
            }
          ],
          attachment: fs.createReadStream(bgPath)
        },
        event.threadID,
        () => {
          fs.unlinkSync(bgPath);
          fs.unlinkSync(avtPath);
        }
      );
    } catch (e) {
      console.error(e);
      api.sendMessage("❌ Error, Try again", event.threadID);
    }
  }
};
