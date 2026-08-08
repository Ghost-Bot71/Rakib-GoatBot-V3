"use strict";
const axios = require("axios");
const { PassThrough } = require("stream");
const os = require("os");
const fs = require("fs");
const path = require("path");

const GIF = "https://media.tenor.com/fYUYJPSa33MAAAAC/coding-programmer.gif";

module.exports = {
  config: {
    name: "cpanel2",
    aliases: ["adminpanel", "rpanel2", "bpanel"],
    version: "1.0", author: "Rakib Islam",
    countDown: 10, role: 2,
    shortDescription: "🔧 Admin Panel — Full Control",
    category: "admin",
    guide: { en: "{pn}" }
  },
  onStart: async function ({ message, event }) {
    await message.reaction("⏳", event.messageID);
    const upSec = Math.floor(process.uptime());
    const h = Math.floor(upSec/3600), m = Math.floor((upSec%3600)/60), s = upSec%60;
    const freeMB = Math.round(os.freemem()/1024/1024);
    const totalMB = Math.round(os.totalmem()/1024/1024);
    const usedPct = Math.round(((totalMB-freeMB)/totalMB)*100);
    let cmds = 0;
    try { cmds = fs.readdirSync(path.join(__dirname)).filter(f=>f.endsWith(".js")).length; } catch {}
    const ts = new Date().toLocaleString("en-US",{timeZone:"Asia/Dhaka",hour12:false});

    const body =
      `\n🔧 ┌──────────────────────────────┐\n` +
      `🔧 │   🛡️  𝗔𝗗𝗠𝗜𝗡 𝗖𝗢𝗡𝗧𝗥𝗢𝗟 𝗣𝗔𝗡𝗘𝗟  │\n` +
      `🔧 └──────────────────────────────┘\n\n` +
      `⚙️  𝗦𝘆𝘀𝘁𝗲𝗺 𝗜𝗻𝗳𝗼:\n` +
      `   • Bot Status  : 🟢 ONLINE\n` +
      `   • Uptime      : ${h}h ${m}m ${s}s\n` +
      `   • Commands    : ${cmds} loaded\n` +
      `   • Node.js     : ${process.version}\n` +
      `   • OS          : ${os.type()} ${os.arch()}\n\n` +
      `💾 𝗠𝗲𝗺𝗼𝗿𝘆:\n` +
      `   • Used  : ${totalMB-freeMB}MB\n` +
      `   • Free  : ${freeMB}MB\n` +
      `   • Total : ${totalMB}MB\n` +
      `   • Usage : ${usedPct}%\n\n` +
      `🕐 𝗦𝗲𝗿𝘃𝗲𝗿 𝗧𝗶𝗺𝗲 (𝗕𝗗):\n` +
      `   ${ts}\n\n` +
      `🔧 ─────────────────────────────────\n` +
      `   🔑 Admin Access — Rakib Islam`;

    try {
      const res = await axios.get(GIF, { responseType: "arraybuffer", timeout: 8000 });
      const st = new PassThrough(); st.end(Buffer.from(res.data));
      await message.reaction("✅", event.messageID);
      return message.reply({ body, attachment: st });
    } catch {
      await message.reaction("✅", event.messageID);
      return message.reply(body);
    }
  }
};
