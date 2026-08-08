"use strict";
// ⚡ hack2.js — RGB Animated Hack Card
const axios = require("axios");
const { PassThrough } = require("stream");
const fs = require("fs");
const path = require("path");

const CACHE = path.join(__dirname, "cache");
if (!fs.existsSync(CACHE)) fs.mkdirSync(CACHE, { recursive: true });

// RGB color cycle for jimp card
function makeRgbCard(targetName, ip, loc, isp, device) {
  try {
    const { Jimp, loadFont } = require("jimp");
    const pnpm = path.join(__dirname, "../../node_modules/.pnpm");
    return (async () => {
      const W = 640, H = 360;
      // Pick RGB phase
      const phase = Date.now() % 3;
      const bg = phase === 0 ? 0x0d0d1aff : phase === 1 ? 0x0a1a0aff : 0x1a0a0aff;
      const ac = phase === 0 ? [0x00,0xff,0xff] : phase === 1 ? [0x00,0xff,0x44] : [0xff,0x44,0x44];

      const img = new Jimp({ width: W, height: H, color: bg });
      const D = img.bitmap.data;

      // Border glow
      for (let i = 0; i < 4; i++) {
        for (let x = i; x < W-i; x++) {
          const set = (y) => { const idx=(y*W+x)*4; D[idx]=ac[0];D[idx+1]=ac[1];D[idx+2]=ac[2];D[idx+3]=255; };
          set(i); set(H-1-i);
        }
        for (let y = i; y < H-i; y++) {
          const set = (x2) => { const idx=(y*W+x2)*4; D[idx]=ac[0];D[idx+1]=ac[1];D[idx+2]=ac[2];D[idx+3]=255; };
          set(i); set(W-1-i);
        }
      }

      // Scanlines
      for (let y = 0; y < H; y += 4) {
        for (let x = 0; x < W; x++) {
          const idx=(y*W+x)*4;
          D[idx+3] = Math.min(D[idx+3], 180);
        }
      }

      const fontDir = fs.readdirSync(pnpm).find(d=>d.startsWith("@jimp+plugin-print@"));
      if (fontDir) {
        const base = path.join(pnpm, fontDir, "node_modules/@jimp/plugin-print/dist/fonts/open-sans");
        const f32 = await loadFont(path.join(base, "open-sans-32-white/open-sans-32-white.fnt"));
        const f16 = await loadFont(path.join(base, "open-sans-16-white/open-sans-16-white.fnt"));
        await img.print({ font: f32, x: 20, y: 20, text: "HACK COMPLETE!" });
        await img.print({ font: f16, x: 20, y: 70,  text: `TARGET : ${targetName}` });
        await img.print({ font: f16, x: 20, y: 100, text: `IP     : ${ip}` });
        await img.print({ font: f16, x: 20, y: 130, text: `LOC    : ${loc}` });
        await img.print({ font: f16, x: 20, y: 160, text: `ISP    : ${isp}` });
        await img.print({ font: f16, x: 20, y: 190, text: `DEVICE : ${device}` });
        await img.print({ font: f16, x: 20, y: 230, text: "[100% FAKE DATA — JUST FOR FUN]" });
        // Tint all text to the accent color
        img.scan(0, 0, W, H, function(x2, y2, idx) {
          if (this.bitmap.data[idx+3] > 100 && this.bitmap.data[idx] > 150) {
            this.bitmap.data[idx]   = ac[0];
            this.bitmap.data[idx+1] = ac[1];
            this.bitmap.data[idx+2] = ac[2];
          }
        });
      }

      return img.getBuffer("image/png");
    })();
  } catch (e) {
    return null;
  }
}

const GIFS = [
  "https://media.tenor.com/A5RJ0VFVLMQAAAAC/cyber-hacker.gif",
  "https://media.tenor.com/QBbEUPiCkfoAAAAC/matrix-code.gif"
];

module.exports = {
  config: {
    name: "hack2",
    aliases: ["rgbhack", "cyberhack"],
    version: "2.0", author: "Rakib Islam",
    countDown: 10, role: 0,
    shortDescription: "🌈 RGB Hack Animation — Cyber Style!",
    longDescription: "RGB animated fake hack card with cyber GIF. mention বা reply করো।",
    category: "fun",
    guide: { en: "{pn} @mention অথবা reply করে" }
  },

  onStart: async function ({ api, event, message, usersData }) {
    const { mentions, senderID, messageReply, threadID } = event;
    const mentionIDs = Object.keys(mentions || {});
    const targetID = mentionIDs[0] || messageReply?.senderID || senderID;

    let targetName = "Unknown";
    try { targetName = (await usersData.get(targetID))?.name || "Unknown"; } catch {}

    const ip = Array.from({length:4}, ()=>Math.floor(Math.random()*255)).join(".");
    const locs = ["Dhaka, BD 🇧🇩","Chittagong, BD 🇧🇩","Sylhet, BD 🇧🇩","Rajshahi, BD 🇧🇩","Khulna, BD 🇧🇩"];
    const isps = ["Grameenphone","Robi","Banglalink","Teletalk","Airtel BD"];
    const devices = ["Android 14 📱","iOS 17 📱","Windows 11 💻","Ubuntu 22 🐧","macOS Sonoma 💻"];
    const loc = locs[Math.floor(Math.random()*locs.length)];
    const isp = isps[Math.floor(Math.random()*isps.length)];
    const device = devices[Math.floor(Math.random()*devices.length)];

    const phases = [
      `🔴 𝗥𝗚𝗕 𝗛𝗔𝗖𝗞𝗘𝗥 𝗩𝟮\n━━━━━━━━━━━━━━━━━━\n🎯 Target: ${targetName}\n\n⠋ Initializing RGB scanner...\n⣾ ██░░░░░░░░ 20%`,
      `🟢 𝗥𝗚𝗕 𝗛𝗔𝗖𝗞𝗘𝗥 𝗩𝟮\n━━━━━━━━━━━━━━━━━━\n🎯 Target: ${targetName}\n\n✅ Scanner ready!\n📡 Bypassing firewall...\n⣾ █████░░░░░ 50%`,
      `🔵 𝗥𝗚𝗕 𝗛𝗔𝗖𝗞𝗘𝗥 𝗩𝟮\n━━━━━━━━━━━━━━━━━━\n🎯 Target: ${targetName}\n\n✅ Firewall bypassed!\n🔐 Cracking encryption...\n⣾ ████████░░ 80%`,
      `🌈 𝗥𝗚𝗕 𝗛𝗔𝗖𝗞𝗘𝗥 𝗩𝟮\n━━━━━━━━━━━━━━━━━━\n\n✅ 𝗛𝗔𝗖𝗞 𝗦𝗨𝗖𝗖𝗘𝗦𝗦𝗙𝗨𝗟!\n\n🎯 Name   : ${targetName}\n🌐 IP     : ${ip}\n📍 Loc    : ${loc}\n📶 ISP    : ${isp}\n📱 Device : ${device}\n\n⚠️ 100% FAKE — Just for fun!\n━━━━━━━━━━━━━━━━━━\n🌈 RGB Hack v2.0 — Rakib Islam`
    ];

    const sent = await api.sendMessage(phases[0], threadID);
    for (let i = 1; i < phases.length; i++) {
      await new Promise(r => setTimeout(r, 2000));
      try { await api.editMessage(phases[i], sent.messageID); } catch {}
    }

    // Send RGB card + GIF
    try {
      const cardBuf = await makeRgbCard(targetName, ip, loc, isp, device);
      let attachment;
      if (cardBuf) {
        const file = path.join(CACHE, `hack2-${Date.now()}.png`);
        fs.writeFileSync(file, cardBuf);
        attachment = fs.createReadStream(file);
        attachment.on("close", () => { try { fs.unlinkSync(file); } catch {} });
      }
      if (!attachment) {
        const gifRes = await axios.get(GIFS[0], { responseType: "arraybuffer", timeout: 8000 });
        const st = new PassThrough(); st.end(Buffer.from(gifRes.data));
        attachment = st;
      }
      return api.sendMessage({ body: "🌈 RGB Hack Complete!", attachment }, threadID);
    } catch {}
  }
};
