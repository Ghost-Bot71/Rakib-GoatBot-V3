const fs = require("fs");
const path = require("path");
const axios = require("axios");
const { createCanvas, loadImage } = require("canvas");
const GIFEncoder = require("gifencoder");

const getAvatarUrl = require("../../rakib/customApi/getAvatarUrl");

module.exports = {
  config: {
    name: "eid",
    version: "10.0",
    author: "Rakib",
    role: 0,
    category: "fun"
  },

  onStart: async function ({ api, event, usersData }) {
    try {
      const uid =
        Object.keys(event.mentions)[0] ||
        event.messageReply?.senderID ||
        event.senderID;

      const user = await usersData.get(uid);
      const name = user.name || "Friend";

      const cache = path.join(__dirname, "cache");
      if (!fs.existsSync(cache)) fs.mkdirSync(cache);

      const avatarPath = await getAvatarUrl(uid);

      // 🔽 Calligraphy PNG Download
      const calligraphyURL =
        "https://drive.google.com/uc?export=download&id=14BLnmu9KB_tKNRYJKjYRxHs4qKXhzDtY";

      const calligraphyPath = path.join(cache, "calligraphy.png");

      const res = await axios({
        url: calligraphyURL,
        responseType: "stream"
      });

      const writer = fs.createWriteStream(calligraphyPath);
      res.data.pipe(writer);
      await new Promise(r => writer.on("finish", r));

      const width = 900;
      const height = 550;

      const encoder = new GIFEncoder(width, height);
      const gifPath = path.join(cache, `eid_v2_${uid}.gif`);

      encoder.createReadStream().pipe(fs.createWriteStream(gifPath));
      encoder.start();
      encoder.setRepeat(0);
      encoder.setDelay(120);

      const avatar = await loadImage(avatarPath);
      const calligraphy = await loadImage(calligraphyPath);

      // 🎬 frames
      for (let frame = 0; frame < 18; frame++) {
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext("2d");

        // 🌌 Smooth gradient (NO black cutoff)
        const bg = ctx.createLinearGradient(0, 0, width, height);
        bg.addColorStop(0, "#0f2027");
        bg.addColorStop(0.5, "#203a43");
        bg.addColorStop(1, "#2c5364");
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, width, height);

        // 🌫️ soft fog layer
        ctx.fillStyle = "rgba(255,255,255,0.03)";
        ctx.fillRect(0, height - 150, width, 150);

        // 🕌 mosque (softer)
        ctx.fillStyle = "#111111cc";
        for (let i = 0; i < 4; i++) {
          ctx.beginPath();
          ctx.arc(150 + i * 180, 380, 90, Math.PI, 0);
          ctx.fill();
        }

        // 🌙 Moon
        ctx.beginPath();
        ctx.arc(720, 120, 60, 0, Math.PI * 2);
        ctx.fillStyle = "#FFD700";
        ctx.shadowBlur = 25;
        ctx.shadowColor = "#FFD700";
        ctx.fill();
        ctx.shadowBlur = 0;

        // ⭐ Star beside moon
        ctx.beginPath();
        ctx.arc(780, 80, 6, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.fill();

        // ✨ moving particles
        for (let i = 0; i < 40; i++) {
          ctx.beginPath();
          ctx.arc(
            (Math.random() * width + frame * 3) % width,
            Math.random() * height,
            2,
            0,
            Math.PI * 2
          );
          ctx.fillStyle = "#FFD700";
          ctx.fill();
        }

        // 🕌 Calligraphy overlay (center top)
        ctx.globalAlpha = 0.9;
        ctx.drawImage(calligraphy, 300, 20, 300, 120);
        ctx.globalAlpha = 1;

        // 👤 Avatar + motion blur
        ctx.save();
        ctx.beginPath();
        ctx.arc(140, 260, 80, 0, Math.PI * 2);
        ctx.clip();

        ctx.globalAlpha = 0.3;
        ctx.drawImage(avatar, 60 + frame, 180, 160, 160);
        ctx.globalAlpha = 1;
        ctx.drawImage(avatar, 60, 180, 160, 160);
        ctx.restore();

        // ✨ Text glow
        ctx.font = "bold 55px serif";
        ctx.fillStyle = "#FFD700";
        ctx.shadowBlur = 15 + frame;
        ctx.shadowColor = "#FFD700";
        ctx.fillText("Eid Mubarak", 300, 220);
        ctx.shadowBlur = 0;

        ctx.font = "bold 30px sans-serif";
        ctx.fillStyle = "#fff";
        ctx.fillText(name, 300, 270);

        encoder.addFrame(ctx);
      }

      encoder.finish();

      // 📤 send
      api.sendMessage(
        {
          body: `🌙✨ Eid Mubarak ${name} ✨🌙`,
          attachment: fs.createReadStream(gifPath)
        },
        event.threadID,
        () => {
          fs.unlinkSync(gifPath);
          fs.unlinkSync(calligraphyPath);
        },
        event.messageID
      );

    } catch (e) {
      console.error(e);
      api.sendMessage("❌ Eid v2 failed!", event.threadID);
    }
  }
};
