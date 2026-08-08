"use strict";
const axios = require("axios");
const { PassThrough } = require("stream");
const os = require("os");
const path = require("path");
const fs = require("fs");

const OWNER = { name: "Rakib Islam", fb: "facebook.com/profile.php?id=61575436812912" };
const GIF = "https://media.tenor.com/L6wCiCd8IQEAAAAC/robot-technology.gif";

module.exports = {
  config: {
    name: "info",
    aliases: ["botinfo", "about"],
    version: "3.0", author: "Rakib Islam",
    countDown: 5, role: 0,
    shortDescription: "🤖 Bot Info — Tech Card",
    category: "info",
    guide: { en: "{pn}" }
  },
  onStart: async function ({ message, event }) {
    await message.reaction("⏳", event.messageID);
    const upSec = Math.floor(process.uptime());
    const h = Math.floor(upSec/3600), m = Math.floor((upSec%3600)/60), s = upSec%60;
    const usedMB = Math.round((os.totalmem()-os.freemem())/1024/1024);
    const totalMB = Math.round(os.totalmem()/1024/1024);
    let totalCmds = 0;
    try { totalCmds = fs.readdirSync(path.join(__dirname)).filter(f=>f.endsWith(".js")).length; } catch {}

    const card =
      `\n🤖 ╔══════════════════════════════╗\n` +
      `🤖 ║   🔷 𝗕𝗢𝗧 𝗜𝗡𝗙𝗢 𝗖𝗔𝗥𝗗 🔷    ║\n` +
      `🤖 ╚══════════════════════════════╝\n\n` +
      `📛 𝗕𝗼𝘁 𝗡𝗮𝗺𝗲   : Rakib Bot\n` +
      `👑 𝗢𝘄𝗻𝗲𝗿      : ${OWNER.name}\n` +
      `⏱️  𝗨𝗽𝘁𝗶𝗺𝗲    : ${h}h ${m}m ${s}s\n` +
      `💾 𝗠𝗲𝗺𝗼𝗿𝘆     : ${usedMB}MB / ${totalMB}MB\n` +
      `📦 𝗖𝗼𝗺𝗺𝗮𝗻𝗱𝘀  : ${totalCmds}+\n` +
      `🖥️  𝗡𝗼𝗱𝗲.𝗷𝘀   : ${process.version}\n` +
      `🌐 𝗣𝗹𝗮𝘁𝗳𝗼𝗿𝗺  : ${os.type()} ${os.arch()}\n` +
      `🔗 𝗙𝗮𝗰𝗲𝗯𝗼𝗼𝗸  : ${OWNER.fb}\n\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `⚡ 𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 𝗥𝗮𝗸𝗶𝗯 𝗜𝘀𝗹𝗮𝗺 🇧🇩`;
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
