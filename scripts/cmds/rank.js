const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");
const path = require("path");
const { getAvatarUrl } = require("../../rakib/customApi/getAvatarUrl");

/* ========= LEVEL SYSTEM ========= */
function expToLevel(exp, deltaNext = 5) {
  return Math.floor((1 + Math.sqrt(1 + 8 * exp / deltaNext)) / 2);
}

function format(num) {
  return num.toLocaleString();
}

/* ========= COMMAND ========= */
module.exports = {
  config: {
    name: "rank",
    version: "1.0",
    author: "Rakib",
    category: "info",
    countDown: 5
  },

  onStart: async function ({ event, message, usersData, api }) {

    /* ===== TARGET USER ===== */
    let uid;
    if (event.type === "message_reply") uid = event.messageReply.senderID;
    else if (Object.keys(event.mentions).length > 0)
      uid = Object.keys(event.mentions)[0];
    else uid = event.senderID;

    const user = await usersData.get(uid);
    if (!user) return message.reply("User not found");

    /* ===== NAME ===== */
    let name = user.name || "Unknown";
    try {
      const info = await api.getUserInfo(uid);
      if (info && info[uid]) name = info[uid].name || name;
    } catch {}

    /* ===== EXP ===== */
    const exp = Number(user.exp || 0);
    const level = expToLevel(exp);

    /* ===== RANK ===== */
    const allUsers = await usersData.getAll();
    allUsers.sort((a, b) => (b.exp || 0) - (a.exp || 0));

    const rank =
      allUsers.findIndex(u => String(u.userID) === String(uid)) + 1;

    const totalUsers = allUsers.length;

    /* ===== AVATAR ===== */
    let avatar;
    try {
      avatar = await loadImage(await getAvatarUrl(uid));
    } catch {
      avatar = await loadImage("https://i.imgur.com/7k12EPD.png");
    }

    /* ===== CANVAS ===== */
    const canvas = createCanvas(900, 320);
    const ctx = canvas.getContext("2d");

    /* ===== BACKGROUND ===== */
    const bg = ctx.createLinearGradient(0, 0, 900, 320);
    bg.addColorStop(0, "#000000");
    bg.addColorStop(0.5, "#0a0f2c");
    bg.addColorStop(1, "#1a0000");

    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    /* ===== AVATAR ===== */
    ctx.save();
    ctx.beginPath();
    ctx.arc(130, 160, 80, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(avatar, 50, 80, 160, 160);
    ctx.restore();

    ctx.strokeStyle = "#00c3ff";
    ctx.lineWidth = 6;
    ctx.shadowColor = "#00c3ff";
    ctx.shadowBlur = 30;
    ctx.beginPath();
    ctx.arc(130, 160, 82, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;

    /* ===== NAME ===== */
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 36px Arial";
    ctx.fillText(name, 250, 120);

    /* ===== LEVEL ===== */
    ctx.fillStyle = "#00c3ff";
    ctx.font = "bold 28px Arial";
    ctx.fillText(`Lv ${level}`, 750, 60);

    /* ===== TOTAL EXP ===== */
    ctx.fillStyle = "#00ffcc";
    ctx.font = "bold 24px Arial";
    ctx.fillText(`EXP ${format(exp)}`, 250, 170);

    /* ===== DECORATIVE GLOW BAR ===== */
    roundRect(ctx, 250, 210, 600, 18, 10);
    ctx.fillStyle = "#111";
    ctx.fill();

    const grad = ctx.createLinearGradient(250, 0, 850, 0);
    grad.addColorStop(0, "#00c3ff");
    grad.addColorStop(0.5, "#00ffcc");
    grad.addColorStop(1, "#ff003c");

    ctx.shadowColor = "#00c3ff";
    ctx.shadowBlur = 20;

    roundRect(ctx, 250, 210, 600, 18, 10);
    ctx.fillStyle = grad;
    ctx.globalAlpha = 0.6;
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;

    /* ===== RAINBOW RANK ===== */
    const rainbow = ctx.createLinearGradient(650, 0, 880, 0);
    rainbow.addColorStop(0, "red");
    rainbow.addColorStop(0.2, "orange");
    rainbow.addColorStop(0.4, "yellow");
    rainbow.addColorStop(0.6, "lime");
    rainbow.addColorStop(0.8, "cyan");
    rainbow.addColorStop(1, "magenta");

    ctx.fillStyle = rainbow;
    ctx.font = "bold 26px Arial";
    ctx.fillText(`#${rank} / ${format(totalUsers)}`, 600, 290);

    /* ===== SAVE ===== */
    const file = path.join(__dirname, "rank.png");
    fs.writeFileSync(file, canvas.toBuffer());

    message.reply(
      {
        attachment: fs.createReadStream(file)
      },
      () => fs.unlinkSync(file)
    );
  }
};

/* ========= ROUND RECT ========= */
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
	}
