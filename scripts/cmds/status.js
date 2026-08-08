const os = require("os");
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const GHOST = fs.readJsonSync(path.join(__dirname, "../../ghostConfig.json"));

module.exports = {
  config: {
    name: "status",
    aliases: ["botstatus", "bstatus", "stat"],
    version: "2.0", author: "Rakib Islam",
    countDown: 5, role: 0,
    shortDescription: "Full bot status check with GIF 🟢",
    category: "system", guide: { en: "{pn}" }
  },
  onStart: async function ({ message, event }) {
    await message.reaction("⏳", event.messageID);
    const sec = process.uptime();
    const h = Math.floor(sec/3600), m = Math.floor((sec%3600)/60), s = Math.floor(sec%60);
    const memTotal = (os.totalmem()/1024/1024).toFixed(0);
    const memFree = (os.freemem()/1024/1024).toFixed(0);
    const memUsed = (memTotal - memFree);
    const memPct = Math.round((memUsed/memTotal)*100);
    const bar = n => "█".repeat(Math.floor(n/10)) + "░".repeat(10-Math.floor(n/10));
    const cpuLoad = os.loadavg()[0].toFixed(2);
    const cpuPct = Math.min(Math.round(cpuLoad*10),100);
    const body =
      `🟢 ══════════════════════ 🟢\n` +
      `   𝗙𝘂𝗹𝗹 𝗕𝗼𝘁 𝗦𝘁𝗮𝘁𝘂𝘀 𝗖𝗵𝗲𝗰𝗸\n` +
      `🟢 ══════════════════════ 🟢\n\n` +
      `✅ Bot Status  : ONLINE\n` +
      `⏱️  Uptime      : ${h}h ${m}m ${s}s\n` +
      `🔧 Node.js     : ${process.version}\n\n` +
      `💾 RAM Usage:\n   [${bar(memPct)}] ${memPct}%\n   ${memUsed}MB / ${memTotal}MB\n\n` +
      `⚡ CPU Load:\n   [${bar(cpuPct)}] ${cpuPct}%\n   Load Avg: ${cpuLoad}\n\n` +
      `🖥️  OS         : ${os.type()} ${os.arch()}\n` +
      `📡 Hostname    : ${os.hostname()}\n\n` +
      `🟢 ══════════════════════ 🟢\n` +
      `  👻 ${GHOST.botName} — Status Monitor`;
    const gif = "https://media.tenor.com/A5RJ0VFVLMQAAAAC/cyber-hacker.gif";
    try {
      const res = await axios.get(gif, { responseType: "arraybuffer", timeout: 8000 });
      const { PassThrough } = require("stream"); const st = new PassThrough(); st.end(Buffer.from(res.data));
      await message.reaction("✅", event.messageID);
      return message.reply({ body, attachment: st });
    } catch { await message.reaction("✅", event.messageID); return message.reply(body); }
  }
};
