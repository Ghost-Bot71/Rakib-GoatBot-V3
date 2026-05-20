const axios = require("axios");
const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");
const path = require("path");
const { getAvatarUrl } = require("../../rakib/customApi/getAvatarUrl");

module.exports = {
  config: {
    name: "prz",
    aliases: ["pra"],
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

      /* ================= BACKGROUNDS ================= */

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
          pos: [{ x: 120, y: 170, w: 300, h: 300 }, { x: null, y: 170, w: 300, h: 300 }]
        },
        {
          id: 8,
          url: "https://drive.google.com/uc?export=download&id=1gOs0rosaWNZWq5OsoDaWoGE41hqn4DRd",
          type: "circle",
          pos: [{ x: 65, y: 104, size: 210 }, { x: 460, y: 104, size: 210 }]
        },

        // 🔥 DYNAMIC
        { id: 9, type: "dynamic" },
        { id: 10, type: "dynamic" },
        { id: 11, type: "dynamic" }
      ];

      /* ================= SELECT BG ================= */

      const args = event.body.trim().split(/\s+/);
      let selectedBg;

      if (args[1] && !isNaN(args[1])) {
        selectedBg = backgrounds.find(bg => bg.id == args[1]);
        if (!selectedBg)
          return api.sendMessage("❌ Invalid number! Use 1-11", event.threadID);
      } else {
        selectedBg = backgrounds[Math.floor(Math.random() * backgrounds.length)];
      }

      /* ================= CANVAS ================= */

      let canvas, ctx;

      if (selectedBg.type === "dynamic") {
        canvas = createCanvas(900, 500);
        ctx = canvas.getContext("2d");
      } else {
        const res = await axios.get(selectedBg.url, { responseType: "arraybuffer" });
        const baseImage = await loadImage(Buffer.from(res.data));

        canvas = createCanvas(baseImage.width, baseImage.height);
        ctx = canvas.getContext("2d");

        ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);
      }

      const W = canvas.width;
      const H = canvas.height;

      const avatar1 = await loadImage(await getAvatarUrl(senderID));
      const avatar2 = await loadImage(await getAvatarUrl(selectedMatch.id));

      const lovePercent = Math.floor(Math.random() * 31) + 70;

      /* ================= COMMON FUNCTIONS ================= */

      function drawCircle(ctx, img, x, y, size) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(img, x, y, size, size);
        ctx.restore();
      }
      
      /* ================= UI FUNCTIONS ================= */
      
      function drawDynamicUI(ctx, W, H, name1, name2, lovePercent) {

  // 💖 center glow heart
  ctx.shadowColor = "#ff4d6d";
  ctx.shadowBlur = 25;

  ctx.font = "bold 80px sans-serif";
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";

  ctx.fillText("❤️", W / 2, H / 2 - 10);

  // 💯 percent
  ctx.font = "bold 55px sans-serif";
  ctx.fillStyle = "#00f7ff";
  ctx.fillText(lovePercent + "%", W / 2, H / 2 + 70);

  ctx.shadowBlur = 0;

  // ✨ divider line
  const grad = ctx.createLinearGradient(W/2 - 120, 0, W/2 + 120, 0);
  grad.addColorStop(0, "transparent");
  grad.addColorStop(0.5, "#ffffff");
  grad.addColorStop(1, "transparent");

  ctx.fillStyle = grad;
  ctx.fillRect(W/2 - 120, H/2 + 90, 240, 2);

  // 👤 names
  ctx.font = "bold 28px sans-serif";

  ctx.fillStyle = "#00f7ff";
  ctx.fillText(name1, 250, H / 2 + 150);

  ctx.fillStyle = "#ff00c8";
  ctx.fillText(name2, W - 250, H / 2 + 150);
      }
      

      function drawNeonAvatar(ctx, img, cx, cy, colorSet) {
        const r = 100;

        const ring = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
        ring.addColorStop(0, colorSet[0]);
        ring.addColorStop(0.5, colorSet[1]);
        ring.addColorStop(1, colorSet[2]);

        ctx.beginPath();
        ctx.arc(cx, cy, r + 8, 0, Math.PI * 2);
        ctx.strokeStyle = ring;
        ctx.lineWidth = 10;
        ctx.shadowColor = colorSet[0];
        ctx.shadowBlur = 25;
        ctx.stroke();

        ctx.shadowBlur = 0;

        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(img, cx - r, cy - r, r * 2, r * 2);
        ctx.restore();
      }

      /* ================= RENDER ================= */

      if (selectedBg.type === "dynamic") {

        // ========= ID 9 =========
        if (selectedBg.id === 9) {

  // 🌈 Premium gradient base
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, "#ff4d6d");
  grad.addColorStop(0.3, "#ff7eb3");
  grad.addColorStop(0.6, "#6a00f4");
  grad.addColorStop(1, "#00f5d4");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // ✨ soft light overlay
  const overlay = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, W);
  overlay.addColorStop(0, "rgba(255,255,255,0.25)");
  overlay.addColorStop(1, "rgba(0,0,0,0.2)");
  ctx.fillStyle = overlay;
  ctx.fillRect(0, 0, W, H);

  // 🌌 floating glow particles
  for (let i = 0; i < 80; i++) {
    const x = Math.random() * W;
    const y = Math.random() * H;
    const r = Math.random() * 3 + 1;

    const pGlow = ctx.createRadialGradient(x, y, 0, x, y, r * 10);
    pGlow.addColorStop(0, "rgba(255,255,255,0.8)");
    pGlow.addColorStop(1, "rgba(255,255,255,0)");

    ctx.fillStyle = pGlow;
    ctx.beginPath();
    ctx.arc(x, y, r * 10, 0, Math.PI * 2);
    ctx.fill();
  }

  // 💖 floating hearts (depth effect)
  for (let i = 0; i < 50; i++) {
    const size = Math.random() * 30 + 10;
    const x = Math.random() * W;
    const y = Math.random() * H;

    ctx.globalAlpha = Math.random() * 0.6 + 0.2;

    ctx.shadowColor = `hsl(${Math.random()*360},100%,70%)`;
    ctx.shadowBlur = 25;

    ctx.font = `${size}px serif`;
    ctx.fillText("💖", x, y);
  }

  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;

  // 🌊 light wave overlay (motion illusion)
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.strokeStyle = `rgba(255,255,255,${0.05 + i*0.03})`;
    ctx.lineWidth = 2;

    for (let x = 0; x < W; x += 20) {
      const y = H/2 + Math.sin((x * 0.01) + i * 2) * 20;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  // 🌟 center glow focus
  const centerGlow = ctx.createRadialGradient(W/2, H/2, 100, W/2, H/2, 400);
  centerGlow.addColorStop(0, "rgba(255,255,255,0.2)");
  centerGlow.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = centerGlow;
  ctx.fillRect(0, 0, W, H);

  // 👇 avatar (neon upgraded)
  drawNeonAvatar(ctx, avatar1, 250, H/2, ["#ff00cc","#00f7ff","#ff4d6d"]);
  drawNeonAvatar(ctx, avatar2, W-250, H/2, ["#ff00cc","#00f7ff","#ff4d6d"]);

  // 💘 connection line (LOVE LINK)
  ctx.beginPath();
  ctx.moveTo(320, H/2);
  ctx.lineTo(W-320, H/2);
  ctx.strokeStyle = "rgba(255,255,255,0.2)";
  ctx.lineWidth = 3;
  ctx.setLineDash([10, 10]);
  ctx.stroke();
  ctx.setLineDash([]);

  // ✨ center heart glow
  ctx.font = "60px serif";
  ctx.shadowColor = "#ff4d6d";
  ctx.shadowBlur = 40;
  ctx.fillText("💖", W/2 - 20, H/2 + 20);

  ctx.shadowBlur = 0;

  // 👇 Dynamic UI (name + %)
  drawDynamicUI(ctx, W, H, senderName, matchName, lovePercent);
      }
        
        // ========= ID 10 =========
        if (selectedBg.id === 10) {

  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, "#050505");
  grad.addColorStop(1, "#001f3f");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  for (let i = 0; i < 50; i++) {
    ctx.globalAlpha = Math.random() * 0.7;
    ctx.shadowColor = "rgba(0,150,255,0.8)";
    ctx.shadowBlur = 20;
    ctx.font = `${Math.random()*25+10}px serif`;
    ctx.fillText("💙", Math.random()*W, Math.random()*H);
  }

  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;

  drawNeonAvatar(ctx, avatar1, 250, H/2, ["#00c6ff","#0072ff","#00f7ff"]);
  drawNeonAvatar(ctx, avatar2, W-250, H/2, ["#00c6ff","#0072ff","#00f7ff"]);

  drawDynamicUI(ctx, W, H, senderName, matchName, lovePercent);
        }
        
        // ========= ID 11 =========
        if (selectedBg.id === 11) {

  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, "#000000");
  grad.addColorStop(1, "#2b0033");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  for (let i = 0; i < 55; i++) {
    ctx.globalAlpha = Math.random() * 0.8;
    ctx.shadowColor = "rgba(255,0,120,0.9)";
    ctx.shadowBlur = 25;
    ctx.font = `${Math.random()*25+12}px serif`;
    ctx.fillText("💗", Math.random()*W, Math.random()*H);
  }

  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;

  drawNeonAvatar(ctx, avatar1, 250, H/2, ["#ff0080","#ff4d6d","#ff00cc"]);
  drawNeonAvatar(ctx, avatar2, W-250, H/2, ["#ff0080","#ff4d6d","#ff00cc"]);

  drawDynamicUI(ctx, W, H, senderName, matchName, lovePercent);
        }

        
      } else {

        if (selectedBg.type === "circle") {
          drawCircle(ctx, avatar1, selectedBg.pos[0].x, selectedBg.pos[0].y, selectedBg.pos[0].size);

          const x2 = selectedBg.pos[1].x !== null
            ? selectedBg.pos[1].x
            : canvas.width - selectedBg.pos[1].size - 120;

          drawCircle(ctx, avatar2, x2, selectedBg.pos[1].y, selectedBg.pos[1].size);

        } else {
          ctx.drawImage(avatar1, selectedBg.pos[0].x, selectedBg.pos[0].y, selectedBg.pos[0].w, selectedBg.pos[0].h);

          const x2 = selectedBg.pos[1].x !== null
            ? selectedBg.pos[1].x
            : canvas.width - selectedBg.pos[1].w - 120;

          ctx.drawImage(avatar2, x2, selectedBg.pos[1].y, selectedBg.pos[1].w, selectedBg.pos[1].h);
        }
      }

      /* ================= SAVE ================= */

      const outputPath = path.join(__dirname, "pair_output.png");

      const out = fs.createWriteStream(outputPath);
      canvas.createPNGStream().pipe(out);

      out.on("finish", () => {
        api.sendMessage({
          body: `💖 ${senderName} ❤️ ${matchName}\n💯 Love: ${lovePercent}%`,
          attachment: fs.createReadStream(outputPath)
        }, event.threadID, () => fs.unlinkSync(outputPath));
      });

    } catch (err) {
      api.sendMessage("❌ Error:\n" + err.message, event.threadID);
    }
  }
};
