const os = require("os");
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const GHOST = fs.readJsonSync(path.join(__dirname, "../../ghostConfig.json"));

module.exports = {
  config: {
    name: "uptime",
    aliases: ["up", "upt"],
    version: "4.0",
    author: "Rakib Islam",
    countDown: 5, role: 0,
    shortDescription: "Bot uptime — Galaxy neon animated GIF 🚀",
    longDescription: "Shows bot uptime with beautiful neon galaxy GIF animation.",
    category: "system", guide: { en: "{pn}" }
  },
  onStart: async function ({ message, event }) {
    await message.reaction("⏳", event.messageID);
    const sec = process.uptime();
    const d = Math.floor(sec/86400), h = Math.floor((sec%86400)/3600), m = Math.floor((sec%3600)/60), s = Math.floor(sec%60);
    const mem = process.memoryUsage();
    const toMB = b => (b/1024/1024).toFixed(1);
    const ping = Date.now() - Date.now() + 1;
    const body =
      `⚡ ════════════════════ ⚡\n` +
      `   🌌 𝗘𝘄𝗿 𝗛𝗶𝗻𝗮𝘁𝗮 — Uptime Status\n` +
      `⚡ ════════════════════ ⚡\n\n` +
      `⏱️  Running Since : ${d}d ${h}h ${m}m ${s}s\n` +
      `💾 Heap Used     : ${toMB(mem.heapUsed)} MB\n` +
      `🧠 Heap Total    : ${toMB(mem.heapTotal)} MB\n` +
      `📦 RSS           : ${toMB(mem.rss)} MB\n` +
      `🖥️  CPU Cores     : ${os.cpus().length}\n` +
      `🌐 Platform      : ${os.platform()}\n` +
      `🔧 Node.js       : ${process.version}\n\n` +
      `⚡ ════════════════════ ⚡\n` +
      `  👻 ${GHOST.botName} | ${GHOST.ownerName}`;
    const gifs = [
      "https://media.tenor.com/XjMPL3X2YNIAAAAC/anime-bot.gif",
      "https://media.tenor.com/QWCII8p7iqQAAAAC/galaxy-space.gif",
      "https://media.tenor.com/svLMd5r2KRYAAAAC/neon-light.gif",
    ];
    const gif = gifs[Math.floor(Math.random() * gifs.length)];
    try {
      const res = await axios.get(gif, { responseType: "arraybuffer", timeout: 8000 });
      const { PassThrough } = require("stream"); const st = new PassThrough(); st.end(Buffer.from(res.data));
      await message.reaction("✅", event.messageID);
      return message.reply({ body, attachment: st });
    } catch { await message.reaction("✅", event.messageID); return message.reply(body); }
  }
};
