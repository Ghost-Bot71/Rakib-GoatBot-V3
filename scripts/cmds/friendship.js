const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");
const { PassThrough } = require("stream");

async function getAvatar(id) {
  const url = `https://graph.facebook.com/${id}/picture?width=200&height=200&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
  const res = await axios.get(url, { responseType: "arraybuffer", timeout: 10000 });
  return Buffer.from(res.data);
}

function drawRoundedImage(ctx, img, x, y, size) {
  const r = size / 2;
  ctx.save();
  ctx.beginPath();
  ctx.arc(x + r, y + r, r, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(img, x, y, size, size);
  ctx.restore();
}

const BG_GRADIENTS = [
  ["#1a1a2e", "#16213e", "#0f3460"],
  ["#2d1b69", "#11998e", "#38ef7d"],
  ["#360033", "#0b8793", "#ee0979"],
  ["#232526", "#414345", "#c0392b"],
  ["#0f0c29", "#302b63", "#24243e"],
];

module.exports = {
  config: {
    name: "friendship",
    aliases: ["friends", "friendcard", "bond"],
    version: "2.0",
    author: "Rakib Islam",
    countDown: 15,
    role: 0,
    shortDescription: "👥 Friendship Card",
    longDescription: "Create a beautiful friendship card with 2-10 friends! Mention them all.",
    category: "fun",
    guide: { en: "{pn} @friend1 @friend2 ... (2-10 friends)\nExample: .friendship @Rakib @Friend1 @Friend2" }
  },

  onStart: async function ({ message, event, usersData }) {
    const { senderID, mentions } = event;

    const mentionKeys = Object.keys(mentions || {});
    if (mentionKeys.length < 1) {
      return message.reply(
        "👥 Friendship Card!\n\n" +
        "কমপক্ষে 1 জনকে mention করুন!\n" +
        "Example: .friendship @name1 @name2\n\n" +
        "সর্বোচ্চ 10 জন mention করা যাবে।"
      );
    }

    const maxFriends = 9;
    const allIDs = [senderID, ...mentionKeys.slice(0, maxFriends)];
    const uniqueIDs = [...new Set(allIDs)].slice(0, 10);

    await message.react("⏳");

    try {
      const names = [];
      const avatarBufs = [];

      for (const uid of uniqueIDs) {
        try {
          const userData = await usersData.get(uid);
          names.push((userData?.name || "Unknown").slice(0, 14));
          const buf = await getAvatar(uid);
          avatarBufs.push(buf);
        } catch {
          names.push("Unknown");
          avatarBufs.push(null);
        }
      }

      const count = uniqueIDs.length;
      const avatarSize = 120;
      const padding = 30;
      const cols = Math.min(count, 5);
      const rows = Math.ceil(count / 5);
      const labelH = 30;
      const headerH = 80;
      const footerH = 60;

      const canvasW = cols * (avatarSize + padding) + padding;
      const canvasH = headerH + rows * (avatarSize + labelH + padding) + padding + footerH;

      const canvas = createCanvas(canvasW, canvasH);
      const ctx = canvas.getContext("2d");

      const grad = BG_GRADIENTS[Math.floor(Math.random() * BG_GRADIENTS.length)];
      const bg = ctx.createLinearGradient(0, 0, canvasW, canvasH);
      bg.addColorStop(0, grad[0]);
      bg.addColorStop(0.5, grad[1]);
      bg.addColorStop(1, grad[2]);
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, canvasW, canvasH);

      ctx.fillStyle = "rgba(255,255,255,0.08)";
      for (let i = 0; i < 5; i++) {
        const cx = Math.random() * canvasW;
        const cy = Math.random() * canvasH;
        const r = 80 + Math.random() * 120;
        const g2 = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        g2.addColorStop(0, "rgba(255,255,255,0.12)");
        g2.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = g2;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 28px Arial";
      ctx.textAlign = "center";
      ctx.fillText("💞 FRIENDSHIP CARD 💞", canvasW / 2, 45);
      ctx.font = "14px Arial";
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.fillText(`${count} friends • Ewr Hinata`, canvasW / 2, 70);

      for (let i = 0; i < count; i++) {
        const col = i % 5;
        const row = Math.floor(i / 5);
        const x = padding + col * (avatarSize + padding);
        const y = headerH + row * (avatarSize + labelH + padding);

        ctx.fillStyle = "rgba(255,255,255,0.15)";
        ctx.beginPath();
        ctx.arc(x + avatarSize / 2, y + avatarSize / 2, avatarSize / 2 + 4, 0, Math.PI * 2);
        ctx.fill();

        if (avatarBufs[i]) {
          try {
            const img = await loadImage(avatarBufs[i]);
            drawRoundedImage(ctx, img, x, y, avatarSize);
          } catch {
            ctx.fillStyle = "rgba(255,255,255,0.3)";
            ctx.beginPath();
            ctx.arc(x + avatarSize / 2, y + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#fff";
            ctx.font = "40px Arial";
            ctx.textAlign = "center";
            ctx.fillText("👤", x + avatarSize / 2, y + avatarSize / 2 + 14);
          }
        }

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 13px Arial";
        ctx.textAlign = "center";
        ctx.shadowColor = "rgba(0,0,0,0.8)";
        ctx.shadowBlur = 6;
        ctx.fillText(names[i], x + avatarSize / 2, y + avatarSize + 20);
        ctx.shadowBlur = 0;
      }

      const footerY = canvasH - footerH + 20;
      ctx.fillStyle = "rgba(255,255,255,0.6)";
      ctx.font = "12px Arial";
      ctx.textAlign = "center";
      ctx.fillText("👑 Ghost Net Edition — Owner: Rakib Islam, Saidpur", canvasW / 2, footerY);

      const outDir = path.join(__dirname, "cache");
      fs.ensureDirSync(outDir);
      const outPath = path.join(outDir, `friendship_${senderID}_${Date.now()}.png`);
      fs.writeFileSync(outPath, canvas.toBuffer("image/png"));

      await message.react("✅");
      await message.reply({
        body: `💞 Friendship Card!\n${uniqueIDs.length} friends: ${names.join(", ")}`,
        attachment: fs.createReadStream(outPath)
      });

      setTimeout(() => { try { fs.unlinkSync(outPath); } catch {} }, 30000);
    } catch (err) {
      await message.react("❌");
      return message.reply(`❌ Friendship card বানাতে সমস্যা: ${err.message}`);
    }
  }
};
