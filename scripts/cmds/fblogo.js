const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");

const LOGO_STYLES = [
  { name: "🔵 Classic Blue",    bg: "#1877f2", text: "#ffffff", shadow: "#0d47a1", shape: "circle" },
  { name: "🌑 Dark Elite",      bg: "#0a0a0a", text: "#00e5ff", shadow: "#00bcd4", shape: "hexagon" },
  { name: "🔴 Flame Red",       bg: "#c0392b", text: "#ffd700", shadow: "#7f0000", shape: "shield" },
  { name: "🟣 Royal Purple",    bg: "#6c3483", text: "#f8e7ff", shadow: "#4a235a", shape: "diamond" },
  { name: "🟢 Nature Green",    bg: "#1abc9c", text: "#ffffff", shadow: "#0e6655", shape: "leaf" },
  { name: "⚫ Midnight Black",  bg: "#1a1a2e", text: "#e94560", shadow: "#16213e", shape: "star" },
  { name: "🟠 Sunset Orange",   bg: "#e67e22", text: "#ffffff", shadow: "#a04000", shape: "square" },
  { name: "🌸 Sakura Pink",     bg: "#e91e63", text: "#ffffff", shadow: "#880e4f", shape: "flower" },
];

function drawLogo(ctx, size, style, initial, name) {
  const cx = size / 2, cy = size / 2, r = size / 2 - 10;

  const g = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, r * 0.05, cx, cy, r);
  g.addColorStop(0, lighten(style.bg, 40));
  g.addColorStop(0.5, style.bg);
  g.addColorStop(1, darken(style.bg, 30));

  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = style.text + "99";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(cx, cy, r - 8, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = style.text + "44";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(cx, cy, r - 14, 0, Math.PI * 2);
  ctx.stroke();

  ctx.shadowColor = style.shadow;
  ctx.shadowBlur = 20;
  ctx.fillStyle = style.text;
  ctx.font = `bold ${Math.floor(size * 0.38)}px Arial`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(initial, cx, cy - size * 0.04);

  ctx.shadowBlur = 0;
  ctx.font = `${Math.floor(size * 0.10)}px Arial`;
  ctx.fillStyle = style.text + "cc";
  ctx.fillText("EWR HINATA", cx, cy + size * 0.28);
}

function lighten(hex, pct) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.min(255, (n >> 16) + pct);
  const g = Math.min(255, ((n >> 8) & 0xff) + pct);
  const b = Math.min(255, (n & 0xff) + pct);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

function darken(hex, pct) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.max(0, (n >> 16) - pct);
  const g = Math.max(0, ((n >> 8) & 0xff) - pct);
  const b = Math.max(0, (n & 0xff) - pct);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

module.exports = {
  config: {
    name: "fblogo",
    aliases: ["logo", "profilelogo", "avatarlogo"],
    version: "2.0",
    author: "Rakib Islam",
    countDown: 10,
    role: 0,
    shortDescription: "🎨 Ultra Design FB Logo/Avatar",
    longDescription: "Generate a beautiful logo/avatar with your name initial! 8 unique styles.",
    category: "image",
    guide: { en: "{pn} <name> [style 1-8] — Generate logo\nExample: .fblogo Rakib Islam 3\nNo style = random" }
  },

  onStart: async function ({ message, event, args }) {
    const { senderID } = event;

    if (args.length === 0) {
      const list = LOGO_STYLES.map((s, i) => `${i + 1}. ${s.name}`).join("\n");
      return message.reply(
        `🎨 FB Logo Generator!\n\nStyles:\n${list}\n\n` +
        `Usage: .fblogo <name> [1-8]\nExample: .fblogo Rakib Islam 5\nNo number = random style`
      );
    }

    let style = Math.floor(Math.random() * LOGO_STYLES.length);
    const lastArg = args[args.length - 1];
    if (!isNaN(lastArg) && parseInt(lastArg) >= 1 && parseInt(lastArg) <= LOGO_STYLES.length) {
      style = parseInt(lastArg) - 1;
      args.pop();
    }

    const name = args.join(" ").trim();
    if (!name) return message.reply("❌ নাম দিন!\nExample: .fblogo Rakib Islam");

    const initial = name.trim().split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
    const s = LOGO_STYLES[style];

    await message.react("⏳");

    try {
      const SIZE = 400;
      const CANVAS_W = SIZE + 40;
      const CANVAS_H = SIZE + 80;

      const canvas = createCanvas(CANVAS_W, CANVAS_H);
      const ctx = canvas.getContext("2d");

      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

      drawLogo(ctx, SIZE, s, initial, name);

      ctx.fillStyle = s.text + "bb";
      ctx.font = "bold 18px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "alphabetic";
      ctx.fillText(name, CANVAS_W / 2, SIZE + 30);

      ctx.font = "13px Arial";
      ctx.fillStyle = s.text + "77";
      ctx.fillText("Ghost Net — Ewr Hinata", CANVAS_W / 2, SIZE + 55);
      ctx.fillText("Owner: Rakib Islam", CANVAS_W / 2, SIZE + 72);

      const cacheDir = path.join(__dirname, "cache");
      fs.ensureDirSync(cacheDir);
      const outPath = path.join(cacheDir, `logo_${senderID}_${Date.now()}.png`);
      fs.writeFileSync(outPath, canvas.toBuffer("image/png"));

      await message.react("✅");
      await message.reply({
        body: `🎨 Logo — ${s.name}\n👤 Name: ${name}\nInitial: ${initial}\n\n🤖 Ghost Net — Ewr Hinata`,
        attachment: fs.createReadStream(outPath)
      });

      setTimeout(() => { try { fs.unlinkSync(outPath); } catch {} }, 30000);
    } catch (err) {
      await message.react("❌");
      return message.reply(`❌ Logo তৈরি করতে সমস্যা: ${err.message}`);
    }
  }
};
