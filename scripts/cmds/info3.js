"use strict";
const axios = require("axios");
const { PassThrough } = require("stream");
const os = require("os");
const path = require("path");
const fs = require("fs");

const GIF = "https://media.tenor.com/fYUYJPSa33MAAAAC/coding-programmer.gif";

module.exports = {
  config: {
    name: "info3",
    aliases: ["botinfo3", "sysinfo"],
    version: "1.0", author: "Rakib Islam",
    countDown: 5, role: 0,
    shortDescription: "🖥️ Bot Info — Dark Minimal",
    category: "info",
    guide: { en: "{pn}" }
  },
  onStart: async function ({ message, event }) {
    await message.reaction("⏳", event.messageID);
    const upSec = Math.floor(process.uptime());
    const h = Math.floor(upSec/3600), m = Math.floor((upSec%3600)/60), s = upSec%60;
    const freeMB = Math.round(os.freemem()/1024/1024);
    const totalMB = Math.round(os.totalmem()/1024/1024);
    const usedPct = Math.round(((totalMB-freeMB)/totalMB)*100);
    const bar = p => "█".repeat(Math.floor(p/10)) + "░".repeat(10-Math.floor(p/10));
    let cmds = 0;
    try { cmds = fs.readdirSync(path.join(__dirname)).filter(f=>f.endsWith(".js")).length; } catch {}

    const card =
      `\n🖤 ══════════════════════════════\n` +
      `   💻 𝗦𝗬𝗦𝗧𝗘𝗠 𝗦𝗧𝗔𝗧𝗨𝗦 𝗥𝗘𝗣𝗢𝗥𝗧\n` +
      `🖤 ══════════════════════════════\n\n` +
      `  🤖 Bot      : Rakib Bot\n` +
      `  👑 Owner    : Rakib Islam\n` +
      `  📦 Commands : ${cmds}+\n` +
      `  ⏱️  Uptime   : ${h}h ${m}m ${s}s\n\n` +
      `  💾 RAM Usage:\n` +
      `  [${bar(usedPct)}] ${usedPct}%\n` +
      `  ${totalMB-freeMB}MB used / ${totalMB}MB total\n\n` +
      `  🟢 Status   : ONLINE\n` +
      `  🌐 Platform : ${os.type()}\n` +
      `  📌 Node.js  : ${process.version}\n\n` +
      `🖤 ══════════════════════════════\n` +
      `   ✅ All systems operational`;
    try {
      const res = await axios.get(GIF, { responseType: "arraybuffer", timeout: 8000 });
      const st = new PassThrough(); st.end(Buffer.from(res.data));
      await message.reaction("✅", event.messageID);
      return message.reply({ body: card, attachment: st });
    } catch {
      await message.reaction("✅", event.messageID);
      return message.reply(card);
    }
  }
};
