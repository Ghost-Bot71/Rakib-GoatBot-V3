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

  // 🌈 gradient
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, "#ff4d6d");
  grad.addColorStop(0.5, "#ff7eb3");
  grad.addColorStop(1, "#ffb3c6");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // 🌟 center glow
  const glow = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, 400);
  glow.addColorStop(0, "rgba(255,255,255,0.3)");
  glow.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  // 💖 hearts overlay
  for (let i = 0; i < 70; i++) {
    const x = Math.random()*W;
    const y = Math.random()*H;

    ctx.globalAlpha = Math.random()*0.6 + 0.2;
    ctx.shadowColor = "#ff4d6d";
    ctx.shadowBlur = 25;
    ctx.font = `${Math.random()*25+15}px serif`;
    ctx.fillText("💖", x, y);
  }

  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;

  // 👇 avatars
  drawNeonAvatar(ctx, avatar1, 250, H/2, ["#ff4d6d","#ff00cc","#ff7eb3"]);
  drawNeonAvatar(ctx, avatar2, W-250, H/2, ["#ff4d6d","#ff00cc","#ff7eb3"]);

  // 🔗 love beam
  const beam = ctx.createLinearGradient(300, H/2, W-300, H/2);
  beam.addColorStop(0, "transparent");
  beam.addColorStop(0.5, "#ff4d6d");
  beam.addColorStop(1, "transparent");

  ctx.beginPath();
  ctx.moveTo(300, H/2);
  ctx.lineTo(W-300, H/2);
  ctx.strokeStyle = beam;
  ctx.lineWidth = 4;
  ctx.shadowColor = "#ff4d6d";
  ctx.shadowBlur = 20;
  ctx.stroke();

  ctx.shadowBlur = 0;

  // 💖 center icon
  ctx.font = "60px serif";
  ctx.fillText("💖", W/2 - 20, H/2 + 20);

  drawDynamicUI(ctx, W, H, senderName, matchName, lovePercent);
      }
        
       
        
        // ========= ID 10 =========
        if (selectedBg.id === 10) {

  // 🌌 gradient
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, "#000814");
  grad.addColorStop(1, "#001d3d");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // ✨ stars overlay
  for (let i = 0; i < 120; i++) {
    const x = Math.random()*W;
    const y = Math.random()*H;

    ctx.globalAlpha = Math.random();
    ctx.beginPath();
    ctx.arc(x, y, Math.random()*2+0.5, 0, Math.PI*2);
    ctx.fillStyle = "white";
    ctx.fill();
  }

  ctx.globalAlpha = 1;

  // 🌊 wave illusion
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.strokeStyle = `rgba(0,255,255,${0.05 + i*0.03})`;
    for (let x = 0; x < W; x += 20) {
      const y = H/2 + Math.sin(x*0.01 + i)*20;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  // 🧊 grid overlay
  ctx.strokeStyle = "rgba(255,255,255,0.05)";
  for (let x = 0; x < W; x += 60) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, H);
    ctx.stroke();
  }

  // 👇 avatars
  drawNeonAvatar(ctx, avatar1, 250, H/2, ["#00c6ff","#0072ff","#00f7ff"]);
  drawNeonAvatar(ctx, avatar2, W-250, H/2, ["#00c6ff","#0072ff","#00f7ff"]);

  // ⚡ beam
  ctx.beginPath();
  ctx.moveTo(300, H/2);
  ctx.lineTo(W-300, H/2);
  ctx.strokeStyle = "rgba(0,255,255,0.5)";
  ctx.lineWidth = 3;
  ctx.stroke();

  // ✨ center star
  ctx.font = "50px serif";
  ctx.fillText("✨", W/2 - 15, H/2 + 15);

  drawDynamicUI(ctx, W, H, senderName, matchName, lovePercent);
        }

        
        // ========= ID 11 =========
        if (selectedBg.id === 11) {

  // 🌌 gradient
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, "#000000");
  grad.addColorStop(1, "#2b0033");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // 🌙 moon
  const moonX = W - 180;
  const moonY = 140;

  const moon = ctx.createRadialGradient(moonX, moonY, 10, moonX, moonY, 90);
  moon.addColorStop(0, "#ffffff");
  moon.addColorStop(1, "transparent");

  ctx.fillStyle = moon;
  ctx.beginPath();
  ctx.arc(moonX, moonY, 90, 0, Math.PI*2);
  ctx.fill();

  // ✨ stars
  for (let i = 0; i < 80; i++) {
    ctx.fillStyle = "white";
    ctx.globalAlpha = Math.random();
    ctx.fillRect(Math.random()*W, Math.random()*H, 2, 2);
  }
  ctx.globalAlpha = 1;

  // 🌫️ center glow
  const glow = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, 400);
  glow.addColorStop(0, "rgba(255,0,150,0.2)");
  glow.addColorStop(1, "transparent");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  // 👇 avatars
  drawNeonAvatar(ctx, avatar1, 250, H/2, ["#ff0080","#ff4d6d","#ff00cc"]);
  drawNeonAvatar(ctx, avatar2, W-250, H/2, ["#ff0080","#ff4d6d","#ff00cc"]);

  // 🌌 beam
  ctx.beginPath();
  ctx.moveTo(300, H/2);
  ctx.lineTo(W-300, H/2);
  ctx.strokeStyle = "rgba(255,0,150,0.5)";
  ctx.lineWidth = 3;
  ctx.stroke();

  // 🌙 center icon
  ctx.font = "55px serif";
  ctx.fillText("🌙", W/2 - 20, H/2 + 20);

  drawDynamicUI(ctx, W, H, senderName, matchName, lovePercent);
        }
        

    //---------------------------------------------//
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
