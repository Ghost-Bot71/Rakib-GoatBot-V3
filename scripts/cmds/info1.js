const { createCanvas } = require("canvas");
const GIFEncoder = require("gifencoder");
const fs = require("fs-extra");
const path = require("path");

const OWNER_UID = "61575436812912";
const BIO = {
  name: "Rakib Islam",
  address: "Saidpur, Nilphamari",
  class: "Secret",
  age: "Secret",
  job: "Student",
  hobby: "Gaming & Travelling",
  fb: "facebook.com/profile.php?id=" + OWNER_UID
};

module.exports = {
  config: {
    name: "info1",
    aliases: ["botinfo1"],
    version: "1.0",
    author: "Rakib Islam",
    countDown: 5,
    role: 0,
    shortDescription: "Bot info card — Holographic style",
    category: "info",
    guide: { en: "{p}info1" }
  },

  onStart: async function ({ message, event }) {
    await message.reaction("⏳", event.messageID);
    const out = await buildHoloCard("info1", BIO, OWNER_UID, event.threadID);
    await message.reaction("✅", event.messageID);
    await message.reply({
      body: bioText("BOT INFO ▸ HOLO ID", BIO),
      attachment: fs.createReadStream(out)
    });
    setTimeout(() => fs.existsSync(out) && fs.unlinkSync(out), 8000);
  }
};

async function buildHoloCard(prefix, b, uid, tid) {
  const W = 760, H = 480;
  const cacheDir = path.join(__dirname, "cache");
  if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);
  const out = path.join(cacheDir, `${prefix}_${tid}.gif`);

  let avatar = null;

  const enc = new GIFEncoder(W, H);
  const ws = fs.createWriteStream(out);
  enc.createReadStream().pipe(ws);
  enc.start(); enc.setRepeat(0); enc.setDelay(120); enc.setQuality(10);

  const FRAMES = 16;
  for (let f = 0; f < FRAMES; f++) {
    const hue = (f / FRAMES) * 360;
    const c1 = `hsl(${hue},100%,55%)`;
    const c2 = `hsl(${(hue + 120) % 360},100%,55%)`;
    const c3 = `hsl(${(hue + 240) % 360},100%,55%)`;

    const cv = createCanvas(W, H);
    const ctx = cv.getContext("2d");
    ctx.fillStyle = "#000"; ctx.fillRect(0, 0, W, H);

    // Hex mesh
    ctx.strokeStyle = "rgba(0,255,255,0.08)"; ctx.lineWidth = 1;
    const r = 22;
    for (let y = 0; y < H + r; y += r * 1.5) {
      for (let x = 0; x < W + r; x += r * Math.sqrt(3)) {
        const ox = (Math.floor(y / (r * 1.5)) % 2) * (r * Math.sqrt(3) / 2);
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const a = Math.PI / 3 * i;
          const px = x + ox + r * Math.cos(a), py = y + r * Math.sin(a);
          i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
        ctx.closePath(); ctx.stroke();
      }
    }

    // Top header bar
    const hg = ctx.createLinearGradient(0, 0, W, 0);
    hg.addColorStop(0, c1); hg.addColorStop(0.5, c2); hg.addColorStop(1, c3);
    ctx.fillStyle = hg; ctx.fillRect(0, 0, W, 6);
    ctx.fillStyle = "rgba(0,0,0,0.75)"; ctx.fillRect(0, 6, W, 60);
    ctx.fillStyle = c1; ctx.shadowColor = c1; ctx.shadowBlur = 25;
    ctx.font = "bold 28px Arial"; ctx.textAlign = "center";
    ctx.fillText("👻 GHOST NET ▸ BOT HOLO-ID 👻", W / 2, 45);
    ctx.shadowBlur = 0;

    // Hex avatar (left)
    if (avatar) {
      const cx = 170, cy = 280, rad = 110;
      ["#ff00aa", c1, c2].forEach((cl, i) => {
        ctx.beginPath();
        for (let j = 0; j < 6; j++) {
          const a = Math.PI / 3 * j - Math.PI / 6;
          const x = cx + (rad + 6 + i * 6) * Math.cos(a);
          const y = cy + (rad + 6 + i * 6) * Math.sin(a);
          j === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.strokeStyle = cl; ctx.lineWidth = 3;
        ctx.shadowColor = cl; ctx.shadowBlur = 25;
        ctx.stroke();
      });
      ctx.shadowBlur = 0;
      ctx.save();
      ctx.beginPath();
      for (let j = 0; j < 6; j++) {
        const a = Math.PI / 3 * j - Math.PI / 6;
        const x = cx + rad * Math.cos(a), y = cy + rad * Math.sin(a);
        j === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.closePath(); ctx.clip();
      ctx.drawImage(avatar, cx - rad, cy - rad, rad * 2, rad * 2);
      ctx.restore();
    }

    // Right data card
    const px = 320, py = 90;
    ctx.fillStyle = "rgba(0,0,0,0.55)"; ctx.fillRect(px, py, 410, 320);
    ctx.strokeStyle = c2; ctx.lineWidth = 2;
    ctx.shadowColor = c2; ctx.shadowBlur = 18;
    ctx.strokeRect(px, py, 410, 320); ctx.shadowBlur = 0;

    ctx.font = "bold 22px Arial"; ctx.fillStyle = c3; ctx.textAlign = "left";
    ctx.shadowColor = c3; ctx.shadowBlur = 12;
    ctx.fillText("◤ AGENT FILE ◢", px + 15, py + 30);
    ctx.shadowBlur = 0;

    const rows = [
      ["NAME", b.name, c1],
      ["ADDRESS", b.address, c2],
      ["CLASS", b.class, c3],
      ["AGE", b.age, c1],
      ["JOB", b.job, c2],
      ["HOBBY", b.hobby, c3],
      ["FACEBOOK", b.fb, c1]
    ];
    let y = py + 60;
    for (const [k, v, cc] of rows) {
      ctx.font = "11px monospace"; ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.fillText(k, px + 15, y);
      ctx.font = "bold 16px monospace"; ctx.fillStyle = cc;
      ctx.shadowColor = cc; ctx.shadowBlur = 8;
      ctx.fillText(String(v).slice(0, 38), px + 15, y + 20);
      ctx.shadowBlur = 0;
      y += 36;
    }

    // Bottom barcode
    const by = H - 55;
    ctx.fillStyle = "#000"; ctx.fillRect(40, by - 4, W - 80, 35);
    for (let i = 0; i < 100; i++) {
      const w = 2 + Math.floor(Math.random() * 4);
      const x = 50 + i * 7;
      if (x > W - 50) break;
      ctx.fillStyle = "#fff"; ctx.fillRect(x, by, w, 25);
    }
    ctx.fillStyle = c1; ctx.font = "10px monospace"; ctx.textAlign = "center";
    ctx.shadowColor = c1; ctx.shadowBlur = 10;
    ctx.fillText(`GN-${OWNER_UID}-HOLO-AUTH`, W / 2, H - 12);

    enc.addFrame(ctx);
  }
  enc.finish();
  await new Promise(r => ws.on("finish", r));
  return out;
}

function bioText(title, b) {
  return `👻 𝗚𝗛𝗢𝗦𝗧 𝗡𝗘𝗧 ▸ ${title}
━━━━━━━━━━━━━━━━━━
👤 Name    : ${b.name}
📍 Address : ${b.address}
🎓 Class   : ${b.class}
🎂 Age     : ${b.age}
💼 Job     : ${b.job}
🎮 Hobby   : ${b.hobby}
🔗 FB      : ${b.fb}
━━━━━━━━━━━━━━━━━━
💀 Powered by Ghost Net Edition`;
}
