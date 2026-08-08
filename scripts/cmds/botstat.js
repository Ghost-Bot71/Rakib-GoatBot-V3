const os = require("os");
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const GHOST = fs.readJsonSync(path.join(__dirname, "../../ghostConfig.json"));

module.exports = {
  config: {
    name: "botstat",
    aliases: ["bstat", "botstats", "stats"],
    version: "1.0", author: "Rakib Islam",
    countDown: 5, role: 0,
    shortDescription: "Bot stats with command count & anime GIF 📊",
    category: "system", guide: { en: "{pn}" }
  },
  onStart: async function ({ message, event }) {
    await message.reaction("⏳", event.messageID);
    const sec = process.uptime();
    const h = Math.floor(sec/3600), m = Math.floor((sec%3600)/60), s = Math.floor(sec%60);
    const totalCmds = fs.readdirSync(path.join(__dirname)).filter(f => f.endsWith(".js")).length;
    const body =
      `📊 ══════════════════════ 📊\n` +
      `   𝗘𝘄𝗿 𝗛𝗶𝗻𝗮𝘁𝗮 — Bot Stats\n` +
      `📊 ══════════════════════ 📊\n\n` +
      `🤖 Bot Name    : ${GHOST.botName}\n` +
      `👑 Owner       : ${GHOST.ownerName}\n` +
      `🔑 Prefix      : ${GHOST.prefix}\n` +
      `💻 Commands    : ${totalCmds}+\n` +
      `⏱️  Uptime      : ${h}h ${m}m ${s}s\n` +
      `🔧 Node.js     : ${process.version}\n` +
      `🖥️  Platform    : ${os.platform()}\n` +
      `💾 RAM         : ${Math.round((os.totalmem()-os.freemem())/1e6)}MB / ${Math.round(os.totalmem()/1e6)}MB\n` +
      `⚡ CPU Cores   : ${os.cpus().length}\n` +
      `🌐 Edition     : ${GHOST.botEdition}\n\n` +
      `📊 ══════════════════════ 📊\n` +
      `  Made with ❤️ by ${GHOST.ownerName}`;
    const gif = "https://media.tenor.com/7h5XK2ZBMHQAAAAC/anime-cute.gif";
    try {
      const res = await axios.get(gif, { responseType: "arraybuffer", timeout: 8000 });
      const { PassThrough } = require("stream"); const st = new PassThrough(); st.end(Buffer.from(res.data));
      await message.reaction("✅", event.messageID); return message.reply({ body, attachment: st });
    } catch { await message.reaction("✅", event.messageID); return message.reply(body); }
  }
};
