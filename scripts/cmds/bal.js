"use strict";
const axios = require("axios");
const path = require("path");
const fs = require("fs-extra");

const ADMIN_BAL = 5_000_000_000;
const USER_BAL  = 1_000_000_000;

function fmt(n) {
  if (n>=1e9) return (n/1e9).toFixed(2)+"B";
  if (n>=1e6) return (n/1e6).toFixed(2)+"M";
  if (n>=1e3) return (n/1e3).toFixed(1)+"K";
  return n.toString();
}
function fmtFull(n) { return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g,","); }
function cardNum(uid) { return `•••• •••• •••• ${uid.toString().slice(-4)}`; }
function expiry() { const d=new Date(); return `${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()+3}`; }
function rankLabel(m) {
  if (m>=1e9) return "👑 BILLIONAIRE";
  if (m>=1e8) return "💎 RICH";
  if (m>=1e7) return "🥇 GOLD";
  if (m>=1e6) return "🥈 SILVER";
  return "⭐ REGULAR";
}

const CACHE = path.join(__dirname, "cache");

async function buildCard(uid, name, money, rank, total, status) {
  try {
    const jimp = require("jimp");
    const { Jimp, loadFont } = jimp;
    await fs.ensureDir(CACHE);

    const W = 680, H = 320;
    const img = new Jimp({ width: W, height: H });
    const D = img.bitmap.data;

    // Dark gradient background
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const idx = (y*W+x)*4;
        const t = y/H;
        D[idx]   = Math.round(10 + t*20);
        D[idx+1] = Math.round(10 + t*15);
        D[idx+2] = Math.round(30 + t*40);
        D[idx+3] = 255;
      }
    }

    // Gold border
    for (let i = 0; i < 4; i++) {
      for (let x = i; x < W-i; x++) {
        const set = (y2) => { const idx=(y2*W+x)*4; D[idx]=218;D[idx+1]=165;D[idx+2]=32;D[idx+3]=255; };
        set(i); set(H-1-i);
      }
      for (let y = i; y < H-i; y++) {
        const set = (x2) => { const idx=(y*W+x2)*4; D[idx]=218;D[idx+1]=165;D[idx+2]=32;D[idx+3]=255; };
        set(i); set(W-1-i);
      }
    }

    // Avatar circle (left side)
    const avatarSize = 160;
    const avX = 40, avY = Math.floor((H-avatarSize)/2);
    try {
      const avRes = await axios.get(
        `https://graph.facebook.com/${uid}/picture?width=200&height=200&type=normal`,
        { responseType:"arraybuffer", timeout:8000 }
      );
      const avImg = await Jimp.read(Buffer.from(avRes.data));
      avImg.resize({ w: avatarSize, h: avatarSize });
      // Circular mask
      for (let cy = 0; cy < avatarSize; cy++) {
        for (let cx = 0; cx < avatarSize; cx++) {
          const dx = cx - avatarSize/2, dy = cy - avatarSize/2;
          if (dx*dx+dy*dy > (avatarSize/2)*(avatarSize/2)) {
            avImg.bitmap.data[(cy*avatarSize+cx)*4+3] = 0;
          }
        }
      }
      img.composite(avImg, avX, avY);

      // Gold circle border around avatar
      const cx = avX+avatarSize/2, cyc = avY+avatarSize/2, rad = avatarSize/2+3;
      for (let angle = 0; angle < 360; angle += 0.5) {
        const a = angle * Math.PI/180;
        for (let r = rad; r <= rad+3; r++) {
          const px = Math.round(cx + r*Math.cos(a));
          const py = Math.round(cyc + r*Math.sin(a));
          if (px>=0&&px<W&&py>=0&&py<H) {
            const idx = (py*W+px)*4;
            D[idx]=218;D[idx+1]=165;D[idx+2]=32;D[idx+3]=255;
          }
        }
      }
    } catch {}

    // Load font — works with pnpm (.pnpm path) and npm (direct node_modules path)
    let f32 = null, f16 = null;
    try {
      // Strategy 1: pnpm store path
      let fontBase = null;
      const pnpmDir = path.join(__dirname,"../../node_modules/.pnpm");
      if (fs.existsSync(pnpmDir)) {
        const match = fs.readdirSync(pnpmDir).find(d=>d.startsWith("@jimp+plugin-print@"));
        if (match) fontBase = path.join(pnpmDir,match,"node_modules/@jimp/plugin-print/dist/fonts/open-sans");
      }
      // Strategy 2: direct node_modules (npm install)
      if (!fontBase) {
        const direct = path.join(__dirname,"../../node_modules/@jimp/plugin-print/dist/fonts/open-sans");
        if (fs.existsSync(direct)) fontBase = direct;
      }
      if (fontBase) {
        f32 = await loadFont(path.join(fontBase,"open-sans-32-white/open-sans-32-white.fnt"));
        f16 = await loadFont(path.join(fontBase,"open-sans-16-white/open-sans-16-white.fnt"));
      }
    } catch {}
    if (f32 && f16) {

      const tx = 220;
      await img.print({ font:f32, x:tx, y:18, text:name.slice(0,20) });
      await img.print({ font:f16, x:tx, y:65, text:`Card: ${cardNum(uid)}` });
      await img.print({ font:f16, x:tx, y:90, text:`Valid: ${expiry()}   Status: ${status}` });

      // Balance (larger)
      await img.print({ font:f32, x:tx, y:130, text:`\u09F3 ${fmtFull(money)}` });
      await img.print({ font:f16, x:tx, y:172, text:`(${fmt(money)})` });

      await img.print({ font:f16, x:tx, y:210, text:`Rank: #${rank} / ${total}` });
      await img.print({ font:f16, x:tx, y:240, text:`${rankLabel(money)}` });
      await img.print({ font:f16, x:40,  y:H-35, text:`Ghost Net Economy  |  Owner: Rakib Islam` });
    }

    const out = path.join(CACHE, `bal_${uid}_${Date.now()}.png`);
    await img.write(out);
    return out;
  } catch (e) {
    return null;
  }
}

module.exports = {
  config: {
    name: "bal",
    aliases: ["balance","money","wallet"],
    version: "5.0", author: "Rakib Islam",
    countDown: 5, role: 0,
    shortDescription: "💳 Balance Card with Profile Photo",
    category: "economy",
    guide: { en: "{pn} | {pn} @mention | {pn} reply" }
  },

  onStart: async function ({ message, event, usersData, api }) {
    const { senderID, mentions, messageReply } = event;
    let targetID = senderID;
    const mk = Object.keys(mentions||{});
    if (mk.length>0) targetID=mk[0];
    else if (messageReply?.senderID) targetID=messageReply.senderID;

    await message.reaction("⏳", event.messageID);

    try {
      let ud = await usersData.get(targetID);
      const name = ud?.name || "Unknown";
      let money = ud?.money ?? 0;

      const cfg = global.GoatBot?.config || {};
      const isAdmin = (cfg.adminBot||[]).includes(targetID);
      if (money <= 0) {
        const st = isAdmin ? ADMIN_BAL : USER_BAL;
        await usersData.addMoney(targetID, st); money = st;
      }

      const all = await usersData.getAll();
      const sorted = all.sort((a,b)=>(b.money||0)-(a.money||0));
      const rank = sorted.findIndex(u=>u.userID==targetID)+1;
      const total = sorted.length;
      const status = isAdmin ? "👑 ADMIN" : money>=1e9 ? "💎 VIP" : "⭐ USER";
      const isSelf = targetID === senderID;

      // Try jimp card
      const cardPath = await buildCard(targetID, name, money, rank, total, status);
      await message.reaction("✅", event.messageID);

      if (cardPath && fs.existsSync(cardPath)) {
        const stream = fs.createReadStream(cardPath);
        stream.on("close", () => { try { fs.unlinkSync(cardPath); } catch {} });
        return message.reply({
          body: `💳 ${isSelf?"তোমার":name+"এর"} Balance Card`,
          attachment: stream
        });
      }

      // Fallback text card
      const line = "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━";
      return message.reply(
        `${line}\n` +
        `  💳 GHOST NET — BALANCE CARD\n` +
        `${line}\n` +
        `  👤 ${name}\n` +
        `  🔑 ${cardNum(targetID)}\n` +
        `  💰 ৳${fmtFull(money)} (${fmt(money)})\n` +
        `  🏅 Rank: #${rank}/${total}  ${status}\n` +
        `${line}`
      );
    } catch {
      await message.reaction("❌", event.messageID);
      return message.reply("❌ Balance দেখতে সমস্যা হয়েছে।");
    }
  }
};
