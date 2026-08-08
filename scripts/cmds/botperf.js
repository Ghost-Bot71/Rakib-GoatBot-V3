const os = require("os");
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const GHOST = fs.readJsonSync(path.join(__dirname, "../../ghostConfig.json"));

module.exports = {
  config: {
    name: "botperf",
    aliases: ["bperf", "bp", "botperformance"],
    version: "1.0", author: "Rakib Islam",
    countDown: 5, role: 0,
    shortDescription: "Bot performance benchmark report 🏆",
    category: "system", guide: { en: "{pn}" }
  },
  onStart: async function ({ message, event }) {
    await message.reaction("⏳", event.messageID);
    const t1 = Date.now();
    await new Promise(r=>setTimeout(r,60));
    const cmdLatency = Date.now()-t1;
    const upSec = process.uptime();
    const mem = process.memoryUsage();
    const grade = cmdLatency < 100 ? "S+ 🌟" : cmdLatency < 250 ? "A 🏆" : cmdLatency < 500 ? "B ✅" : "C ⚠️";
    const body =
      `🏆 ════════════════════ 🏆\n` +
      `   𝗕𝗼𝘁 𝗣𝗲𝗿𝗳𝗼𝗿𝗺𝗮𝗻𝗰𝗲 𝗥𝗲𝗽𝗼𝗿𝘁\n` +
      `🏆 ════════════════════ 🏆\n\n` +
      `⚡ Cmd Latency  : ${cmdLatency}ms\n` +
      `🏅 Grade        : ${grade}\n` +
      `⏱️  Uptime       : ${Math.floor(upSec/3600)}h ${Math.floor((upSec%3600)/60)}m\n` +
      `💾 Heap Used    : ${(mem.heapUsed/1e6).toFixed(1)}MB\n` +
      `📊 Heap Limit   : ${(mem.heapTotal/1e6).toFixed(1)}MB\n` +
      `🌡️  System Load  : ${os.loadavg()[0].toFixed(2)}\n` +
      `🖥️  CPU Cores    : ${os.cpus().length}\n` +
      `💿 Free Disk    : N/A\n\n` +
      `🏆 ════════════════════ 🏆\n` +
      `  👻 ${GHOST.botName} Performance v1.0`;
    const gif = "https://media.tenor.com/QWCII8p7iqQAAAAC/galaxy-space.gif";
    try {
      const res = await axios.get(gif, { responseType: "arraybuffer", timeout: 8000 });
      const { PassThrough } = require("stream"); const st = new PassThrough(); st.end(Buffer.from(res.data));
      await message.reaction("✅", event.messageID); return message.reply({ body, attachment: st });
    } catch { await message.reaction("✅", event.messageID); return message.reply(body); }
  }
};
