const fs = require("fs-extra");
const path = require("path");
const os = require("os");
const { createCanvas, loadImage } = require("canvas");
const moment = require("moment-timezone");
const { getStreamFromURL } = global.utils;

const { getAvatarUrl } = require("../../rakib/customApi/getAvatarUrl");

module.exports = {
  config: {
    name: "upbot",
    aliases: ["sts", "upsts"],
    version: "2.0.0",
    author: "Rakib Hasan",
    countDown: 5,
    role: 4,
    category: "system",
    description: "Bot system status"
  },

  onStart: async function ({ api, event }) {
    return this.handleUptime({ api, event });
  },

  onChat: async function ({ api, event }) {
    const { body } = event;
    if (!body) return;

    const msg = body.toLowerCase();

    // 🔓 Removed Owner Check to allow access
    if (msg === "up" || msg === "uptime") {
      return this.handleUptime({ api, event });
    }
  },

  handleUptime: async function ({ api, event }) {

    const { threadID, messageID, senderID } = event;

    const checking = await api.sendMessage(
      "🔍 Checking system status...",
      threadID
    );

    const start = Date.now();

    // ⏱️ uptime
    const uptime = process.uptime();
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const uptimeText = `${hours}h ${minutes}m`;

    // 💾 RAM FIX (number safe)
    const usedMem = (os.totalmem() - os.freemem()) / (1024 ** 3);
    const totalMem = os.totalmem() / (1024 ** 3);
    const ramPercent = ((usedMem / totalMem) * 100).toFixed(0);

    const currentDate = moment.tz("Asia/Dhaka").format("DD/MM/YYYY");

    // 👤 name
    let name = "User";
    try {
      const info = await api.getUserInfo(senderID);
      name = info[senderID]?.name || "User";
    } catch {}

    const bgURL =
      "https://drive.google.com/uc?export=download&id=1UHvduHuRA6rf5XLTl5mt6Jad8-Lz0O3s";

    // 🔥 avatar fix (path)
    const avatarPath = await getAvatarUrl(senderID);

    const cacheDir = path.join(__dirname, "cache");
    const cachePath = path.join(cacheDir, `status_${Date.now()}.png`);

    try {

      if (!fs.existsSync(cacheDir))
        fs.ensureDirSync(cacheDir);

      const bgStream = await getStreamFromURL(bgURL);
      const bgBuffer = await streamToBuffer(bgStream);

      const bg = await loadImage(bgBuffer);
      const avatar = await loadImage(avatarPath);

      const canvas = createCanvas(bg.width, bg.height);
      const ctx = canvas.getContext("2d");

      ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // Avatar box
      const boxSize = 220;
      const boxX = centerX - (boxSize / 2);
      const boxY = centerY - (boxSize / 2) + 15;

      ctx.shadowColor = "#00ffff";
      ctx.shadowBlur = 25;

      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 5;
      ctx.strokeRect(boxX, boxY, boxSize, boxSize);

      ctx.shadowBlur = 0;

      ctx.drawImage(avatar, boxX, boxY, boxSize, boxSize);

      ctx.fillStyle = "rgba(0,0,0,0.6)";
      ctx.fillRect(boxX, boxY + boxSize - 35, boxSize, 35);

      ctx.textAlign = "center";
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 16px Arial";
      ctx.fillText(name.toUpperCase(), centerX, boxY + boxSize - 12);

      // 🎯 Circle function
      const drawCircle = (x, y, radius, percent, label, value, color) => {

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(255,255,255,0.1)";
        ctx.lineWidth = 10;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(
          x,
          y,
          radius,
          -Math.PI / 2,
          (-Math.PI / 2) + (Math.PI * 2 * (percent / 100))
        );
        ctx.strokeStyle = color;
        ctx.lineWidth = 10;
        ctx.lineCap = "round";
        ctx.stroke();

        ctx.textAlign = "center";
        ctx.fillStyle = "#ffffff";

        ctx.font = "bold 20px Arial";
        ctx.fillText(value, x, y + 8);

        ctx.font = "14px Arial";
        ctx.fillText(label, x, y + 35);
      };

      const uptimeX = boxX - 110;
      const ramX = boxX + boxSize + 110;

      drawCircle(uptimeX, centerY + 30, 60, 75, "UPTIME", uptimeText, "#00ffcc");
      drawCircle(ramX, centerY - 40, 60, ramPercent, "RAM", `${ramPercent}%`, "#ff3366");

      const ping = Date.now() - start;
      drawCircle(ramX, centerY + 90, 50, 80, "PING", `${ping}ms`, "#ffff00");

      // Bot name
      ctx.textAlign = "left";
      ctx.font = "bold 30px Arial";
      ctx.fillStyle = "#33ccff";
      ctx.fillText("[RAKIB-BOT]", 199, 128);

      // Footer
      ctx.textAlign = "center";
      ctx.font = "bold 24px Arial";
      ctx.fillStyle = "#00ff00";
      ctx.fillText("● SYSTEM STATUS: ACTIVE", centerX, canvas.height - 65);

      const buffer = canvas.toBuffer("image/png");
      fs.writeFileSync(cachePath, buffer);

      return api.sendMessage(
        { attachment: fs.createReadStream(cachePath) },
        threadID,
        async () => {
          api.unsendMessage(checking.messageID);
          if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
        },
        messageID
      );

    } catch (e) {

      console.error("UPBOT ERROR:", e);
      api.unsendMessage(checking.messageID);

      return api.sendMessage(
        "❌ Status generate error!",
        threadID,
        messageID
      );
    }
  }
};

// 🔧 helper
function streamToBuffer(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", c => chunks.push(c));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", reject);
  });
}
