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

          const grad = ctx.createLinearGradient(0, 0, W, H);
          grad.addColorStop(0, "#ff758c");
          grad.addColorStop(1, "#fbc2eb");
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, W, H);

          drawNeonAvatar(ctx, avatar1, 250, H / 2, ["#ff00cc", "#00f7ff", "#ff4d6d"]);
          drawNeonAvatar(ctx, avatar2, W - 250, H / 2, ["#ff00cc", "#00f7ff", "#ff4d6d"]);
        }

        // ========= ID 10 =========
        if (selectedBg.id === 10) {

          const grad = ctx.createLinearGradient(0, 0, W, H);
          grad.addColorStop(0, "#000");
          grad.addColorStop(1, "#001f3f");
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, W, H);

          drawNeonAvatar(ctx, avatar1, 250, H / 2, ["#00c6ff", "#0072ff", "#00f7ff"]);
          drawNeonAvatar(ctx, avatar2, W - 250, H / 2, ["#00c6ff", "#0072ff", "#00f7ff"]);
        }

        // ========= ID 11 =========
        if (selectedBg.id === 11) {

          const grad = ctx.createLinearGradient(0, 0, W, H);
          grad.addColorStop(0, "#000");
          grad.addColorStop(1, "#2b0033");
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, W, H);

          drawNeonAvatar(ctx, avatar1, 250, H / 2, ["#ff0080", "#ff4d6d", "#ff00cc"]);
          drawNeonAvatar(ctx, avatar2, W - 250, H / 2, ["#ff0080", "#ff4d6d", "#ff00cc"]);
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
