const axios = require("axios");
const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");
const path = require("path");
const { getAvatarUrl } = require("../../rakib/customApi/getAvatarUrl");

async function loadDriveImage(url) {
  const res = await axios.get(url, {
    responseType: "arraybuffer",
    headers: { "User-Agent": "Mozilla/5.0" }
  });
  return Buffer.from(res.data);
}

module.exports = {
  config: {
    name: "prh",
    aliases: ["prl"],
    author: "Rakib",
    category: "love",
  },

  onStart: async function ({ api, event, usersData }) {
    try {
      const senderID = event.senderID;

      const senderData = await usersData.get(senderID);
      const senderName = senderData.name;

      const threadData = await api.getThreadInfo(event.threadID);
      const users = threadData.userInfo;

      const myData = users.find(u => u.id === senderID);
      if (!myData || !myData.gender)
        return api.sendMessage("⚠️ Could not determine your gender.", event.threadID);

      const myGender = myData.gender;

      let matchCandidates = users.filter(
        u =>
          u.id !== senderID &&
          ((myGender === "MALE" && u.gender === "FEMALE") ||
           (myGender === "FEMALE" && u.gender === "MALE"))
      );

      if (!matchCandidates.length)
        return api.sendMessage("❌ No suitable match found.", event.threadID);

      const selectedMatch =
        matchCandidates[Math.floor(Math.random() * matchCandidates.length)];

      const matchName = selectedMatch.name;

      /* ================= BACKGROUND ================= */

      const backgrounds = [
        {
          id: 1,
          url: "https://drive.google.com/uc?export=download&id=14tE4z8bZDv_Xco8V1WUgE4g0uZ-5CVYi",
          type: "normal",
          pos: [{ x: 385, y: 40, w: 180, h: 180 }, { x: 585, y: 180, w: 180, h: 180 }]
        },
        {
          id: 2,
          url: "https://drive.google.com/uc?export=download&id=1fMiWIjFjJk9q89JPyAYU4LHHfoM_3N4w",
          type: "normal",
          pos: [{ x: 385, y: 40, w: 180, h: 180 }, { x: 585, y: 180, w: 180, h: 180 }]
        },
        {
          id: 3,
          url: "https://drive.google.com/uc?export=download&id=1BJQy4sj7lStDL1flpuZROuav2Ez2Wy21",
          type: "normal",
          pos: [{ x: 385, y: 40, w: 180, h: 180 }, { x: 585, y: 180, w: 180, h: 180 }]
        },
        {
          id: 4,
          url: "https://drive.google.com/uc?export=download&id=1v3ix13pgp9Lkbl7MaF968SNPTOlkf_Y_",
          type: "circle",
          pos: [
            { x: 955, y: 185, size: 200 },
            { x: 115, y: 185, size: 200 }
          ]
        },
        {
          id: 5,
          url: "https://drive.google.com/uc?export=download&id=19QEwghmb2jOmmqeFG-9ouAWYtQyHd0NF",
          type: "normal",
          pos: [{ x: 111, y: 175, w: 330, h: 330 }, { x: 1018, y: 173, w: 330, h: 330 }]
        },
        {
          id: 6,
          url: "https://drive.google.com/uc?export=download&id=1O9iMotJXZxXHy8fdT-w7MG7es8-OE_VI",
          type: "circle",
          pos: [{ x: 380, y: 35, size: 180 }, { x: 583, y: 185, size: 180 }]
        },
        {
          id: 7,
          url: "https://drive.google.com/uc?export=download&id=1rAIJ0Z4pBCfd_1HrjRYEdKi22NvMzgvI",
          type: "normal",
          pos: [{ x: 120, y: 170, w: 300, h: 300 }, { x: 480, y: 170, w: 300, h: 300 }]
        },
        {
          id: 8,
          url: "https://drive.google.com/uc?export=download&id=1gOs0rosaWNZWq5OsoDaWoGE41hqn4DRd",
          type: "circle",
          pos: [{ x: 65, y: 104, size: 210 }, { x: 460, y: 104, size: 210 }]
        },

        { id: 9, type: "custom" },
        { id: 10, type: "custom" },
        { id: 11, type: "custom" }
      ];

      const args = event.body.trim().split(/\s+/);
      let selectedBg;

      if (args[1] && !isNaN(args[1])) {
        const num = parseInt(args[1]);
        selectedBg = backgrounds.find(bg => bg.id === num);
        if (!selectedBg)
          return api.sendMessage("❌ Use 1 - 11", event.threadID);
      } else {
        selectedBg = backgrounds[Math.floor(Math.random() * backgrounds.length)];
      }

      const avatar1 = await loadImage(await getAvatarUrl(senderID));
      const avatar2 = await loadImage(await getAvatarUrl(selectedMatch.id));

      const lovePercent = Math.floor(Math.random() * 31) + 70;

      let canvas, ctx;
      const W = 900, H = 500;

      /* ======================================== */
      /* ========== NORMAL + CIRCLE (NO UI) ====== */
      /* ======================================== */

      if (selectedBg.id >= 1 && selectedBg.id <= 8) {

  const W = 900, H = 500;
  canvas = createCanvas(W, H);
  ctx = canvas.getContext("2d");

  // 🔹 Load BG
  const bgBuffer = await loadDriveImage(selectedBg.url);
  const bg = await loadImage(bgBuffer);

  // 🔥 Always fit background properly
  ctx.drawImage(bg, 0, 0, W, H);

  // 🔹 Avatar draw loop
  selectedBg.pos.forEach((p, i) => {
    const img = i === 0 ? avatar1 : avatar2;

    // 👉 auto fallback if x is null (right side auto)
    const x = p.x !== null
      ? p.x
      : (selectedBg.type === "circle"
          ? W - p.size - 100
          : W - p.w - 100);

    if (selectedBg.type === "circle") {
      ctx.save();
      ctx.beginPath();
      ctx.arc(x + p.size / 2, p.y + p.size / 2, p.size / 2, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(img, x, p.y, p.size, p.size);
      ctx.restore();
    } else {
      ctx.drawImage(img, x, p.y, p.w, p.h);
    }
  });

      }
        
      /* ======================================== */
      /* ============== CUSTOM (WITH UI) ========= */
      /* ======================================== */

      if (selectedBg.id >= 9 && selectedBg.id <= 11) {

        canvas = createCanvas(W, H);
        ctx = canvas.getContext("2d");

      /* ======================================== */
      /* ================= ID 9 ================= */
      /* ======================================== */
        if (selectedBg.id === 9) {

  // 🌈 soft romantic gradient
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, "#ff758c");
  grad.addColorStop(0.4, "#ff7eb3");
  grad.addColorStop(0.7, "#a18cd1");
  grad.addColorStop(1, "#fbc2eb");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // ✨ glow overlay
  const glow = ctx.createRadialGradient(W/2, H/2, 50, W/2, H/2, W);
  glow.addColorStop(0, "rgba(255,255,255,0.25)");
  glow.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  // 💖 floating hearts
  for (let i = 0; i < 60; i++) {
    const size = Math.random() * 25 + 10;
    const x = Math.random() * W;
    const y = Math.random() * H;

    ctx.globalAlpha = Math.random() * 0.8;

    ctx.shadowColor = "rgba(255, 0, 100, 0.6)";
    ctx.shadowBlur = 15;

    ctx.font = `${size}px serif`;
    ctx.fillText("💖", x, y);
  }

  // reset
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;

  // ✨ sparkles
  for (let i = 0; i < 30; i++) {
    ctx.fillStyle = "rgba(255,255,255,0.8)";
    ctx.beginPath();
    ctx.arc(Math.random() * W, Math.random() * H, Math.random() * 2 + 1, 0, Math.PI * 2);
    ctx.fill();
  }

  drawUI(ctx, avatar1, avatar2, senderName, matchName, W, H, lovePercent);
         }
        
      /* ======================================== */
      /* ================ ID 10 ================= */
      /* ======================================== */
        if (selectedBg.id === 10) {

  // 🌌 dark blue gradient
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, "#050505");
  grad.addColorStop(0.5, "#0a1f44");
  grad.addColorStop(1, "#001f3f");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // 💙 blue glow center
  const glow = ctx.createRadialGradient(W/2, H/2, 50, W/2, H/2, W);
  glow.addColorStop(0, "rgba(0,150,255,0.25)");
  glow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  // 💙 floating hearts
  for (let i = 0; i < 50; i++) {
    const size = Math.random() * 25 + 10;
    const x = Math.random() * W;
    const y = Math.random() * H;

    ctx.globalAlpha = Math.random() * 0.7;

    ctx.shadowColor = "rgba(0,150,255,0.8)";
    ctx.shadowBlur = 20;

    ctx.font = `${size}px serif`;
    ctx.fillText("💙", x, y);
  }

  // reset
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;

  // ✨ stars
  for (let i = 0; i < 40; i++) {
    ctx.fillStyle = "rgba(255,255,255,0.8)";
    ctx.beginPath();
    ctx.arc(Math.random() * W, Math.random() * H, Math.random() * 1.5 + 0.5, 0, Math.PI * 2);
    ctx.fill();
  }

  drawUI(ctx, avatar1, avatar2, senderName, matchName, W, H, lovePercent);
      }
        
      /* ======================================== */
      /* ================= ID 11 ================ */
      /* ======================================== */
        if (selectedBg.id === 11) {

  // 🌑 black + neon gradient
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, "#000000");
  grad.addColorStop(0.5, "#14001f");
  grad.addColorStop(1, "#2b0033");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // 💗 neon glow
  const glow = ctx.createRadialGradient(W/2, H/2, 30, W/2, H/2, W);
  glow.addColorStop(0, "rgba(255,0,120,0.3)");
  glow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  // 💗 neon hearts
  for (let i = 0; i < 55; i++) {
    const size = Math.random() * 25 + 12;
    const x = Math.random() * W;
    const y = Math.random() * H;

    ctx.globalAlpha = Math.random() * 0.8;

    ctx.shadowColor = "rgba(255,0,120,0.9)";
    ctx.shadowBlur = 25;

    ctx.font = `${size}px serif`;
    ctx.fillText("💗", x, y);
  }

  // reset
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;

  // ✨ spark particles
  for (let i = 0; i < 35; i++) {
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.beginPath();
    ctx.arc(Math.random() * W, Math.random() * H, Math.random() * 2 + 0.5, 0, Math.PI * 2);
    ctx.fill();
  }
          
  drawUI(ctx, avatar1, avatar2, senderName, matchName, W, H, lovePercent);
        }
  }
        

      const outputPath = path.join(__dirname, "pair_output.png");

if (!canvas) {
  return api.sendMessage("❌ Canvas not created!", event.threadID);
}

const out = fs.createWriteStream(outputPath);
canvas.createPNGStream().pipe(out);
      out.on("finish", () => {
        api.sendMessage({
          body: `💖 ${senderName} ❤️ ${matchName}\n💯 Love: ${lovePercent}%`,
          attachment: fs.createReadStream(outputPath)
        }, event.threadID, () => fs.unlinkSync(outputPath));
      });

      /* ================= UI ================= */

      function drawUI(ctx, img1, img2, name1, name2, W, H, lovePercent) {

        const r = 110;

        function avatar(img, x) {
          ctx.save();
          ctx.beginPath();
          ctx.arc(x, 220, r, 0, Math.PI * 2);
          ctx.clip();
          ctx.drawImage(img, x - r, 220 - r, r * 2, r * 2);
          ctx.restore();
        }

        avatar(img1, 220);
        avatar(img2, 680);

        ctx.font = "70px sans-serif";
        ctx.fillStyle = "#ff4d6d";
        ctx.textAlign = "center";
        ctx.fillText("❤️", 450, 240);

        ctx.font = "bold 70px sans-serif";
        ctx.fillStyle = "#fff";
        ctx.fillText(lovePercent + "%", 450, 430);

        ctx.font = "bold 28px sans-serif";
        ctx.fillStyle = "#00f7ff";
        ctx.fillText(name1, 220, 380);

        ctx.fillStyle = "#ff00c8";
        ctx.fillText(name2, 680, 380);
      }

    } catch (err) {
      api.sendMessage("❌ Error:\n" + err.message, event.threadID);
    }
  }
};
