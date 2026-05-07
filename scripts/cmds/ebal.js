const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");
const path = require("path");
const utils = require("../../utils");
const { getAvatarUrl } = require("../../rakib/customApi/getAvatarUrl");

/* ========= BACKGROUND ========= */
function giftBG(ctx, w, h) {
  const g = ctx.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, "#0f2027");
  g.addColorStop(0.5, "#203a43");
  g.addColorStop(1, "#2c5364");
  return g;
}

/* ========= NAME SHORT ========= */
function shortName(name = "", max = 14) {
  return name.length > max ? name.slice(0, max) + "..." : name;
}

module.exports = {
  config: {
    name: "ebal",
    aliases: ["sbal"],
    version: "1.0",
    author: "Rakib",
    category: "economy"
  },

  onStart: async function ({ message, usersData, api }) {

    const all = await usersData.getAll();

    const sorted = all.map(u => {
      let w = 0n, b = 0n;
      try { w = BigInt(u.money ?? 0); } catch {}
      try { b = BigInt(u.data?.bank ?? 0); } catch {}
      return { ...u, total: w + b };
    })
    .sort((a,b)=> Number(b.total - a.total))
    .slice(0,10);

    if (!sorted.length)
      return message.reply("❌ No data");

    /* ========= BIGGER CANVAS ========= */
    const canvas = createCanvas(1400, 1600); // height increased
    const ctx = canvas.getContext("2d");

    /* ========= BACKGROUND ========= */
    ctx.fillStyle = giftBG(ctx, canvas.width, canvas.height);
    ctx.fillRect(0,0,canvas.width,canvas.height);

    ctx.fillStyle = "rgba(0,0,0,0.45)";
    ctx.fillRect(0,0,canvas.width,canvas.height);

    /* ========= HEADER ========= */
    ctx.textAlign = "center";
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 75px Arial";
    ctx.fillText("❀TURNAMENT LEADERBOARD❀", 700, 100);

    /* ========= TOP 3 ========= */
    const pos = [
      { x: 700, y: 350, size: 130 },
      { x: 350, y: 380, size: 100 },
      { x: 1050, y: 380, size: 100 }
    ];

    for (let i = 0; i < 3; i++) {
      const u = sorted[i];
      if (!u) continue;

      let avatar;
      try {
        avatar = await loadImage(await getAvatarUrl(u.userID));
      } catch {
        avatar = await loadImage("https://i.imgur.com/3ZUrjUP.png");
      }

      const { x, y, size } = pos[i];

      /* glow ring */
      ctx.beginPath();
      ctx.arc(x, y, size + 8, 0, Math.PI * 2);
      ctx.strokeStyle = "#00ffe0";
      ctx.lineWidth = 6;
      ctx.shadowBlur = 20;
      ctx.shadowColor = "#00ffe0";
      ctx.stroke();
      ctx.shadowBlur = 0;

      /* avatar */
      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(avatar, x - size, y - size, size*2, size*2);
      ctx.restore();

      /* rank number */
      ctx.fillStyle = "#00ffe0";
      ctx.font = "bold 45px Arial";
      ctx.fillText(`${i+1}`, x, y - size - 25);

      /* name */
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 40px Arial";
      ctx.fillText(shortName(u.name), x, y + size + 55);

      /* money */
      ctx.fillStyle = "#00ffcc";
      ctx.font = "34px Arial";
      ctx.fillText(utils.formatMoney(u.total), x, y + size + 100);
    }

    /* ========= LIST ========= */
    let y = 750;
    ctx.textAlign = "left";

    for (let i = 3; i < sorted.length; i++) {
      const u = sorted[i];

      /* card */
      ctx.fillStyle = "rgba(255,255,255,0.06)";
      ctx.fillRect(80, y - 45, 1240, 70);

      /* glow line */
      ctx.fillStyle = "#00ffe0";
      ctx.fillRect(80, y - 45, 6, 70);

      /* rank */
      ctx.fillStyle = "#00ffe0";
      ctx.font = "bold 36px Arial";
      ctx.fillText(`${i+1}`, 120, y);

      /* name */
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 36px Arial";
      ctx.fillText(shortName(u.name, 20), 220, y);

      /* money */
      ctx.textAlign = "right";
      ctx.fillStyle = "#00ffcc";
      ctx.fillText(utils.formatMoney(u.total), 1250, y);

      ctx.textAlign = "left";
      y += 95;
    }

    /* ========= FOOTER ========= */
    let botAvatar;
    try {
      const botID = api.getCurrentUserID();
      botAvatar = await loadImage(await getAvatarUrl(botID));
    } catch {
      botAvatar = await loadImage("https://i.imgur.com/3ZUrjUP.png");
    }

    ctx.save();
    ctx.beginPath();
    ctx.arc(500, 1500, 45, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(botAvatar, 455, 1455, 90, 90);
    ctx.restore();

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 32px Arial";
    ctx.fillText("Powered by Tessa Bot", 570, 1510);

    /* ========= SAVE ========= */
    const tmp = path.join(__dirname, "tmp");
    if (!fs.existsSync(tmp)) fs.mkdirSync(tmp);

    const file = path.join(tmp, "gift_lb.png");
    fs.writeFileSync(file, canvas.toBuffer());

    message.reply({
      body: "❀Event of Season Board❀",
      attachment: fs.createReadStream(file)
    }, () => fs.unlinkSync(file));
  }
};
