const os = require("os");
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const GHOST = fs.readJsonSync(path.join(__dirname, "../../ghostConfig.json"));

module.exports = {
  config: {
    name: "livedash",
    aliases: ["dash", "dashboard", "bdata"],
    version: "1.0", author: "Rakib Islam",
    countDown: 5, role: 0,
    shortDescription: "Live bot dashboard with GIF 📈",
    category: "system", guide: { en: "{pn}" }
  },
  onStart: async function ({ message, event, usersData, threadsData }) {
    await message.reaction("⏳", event.messageID);
    const upSec = process.uptime();
    const d = Math.floor(upSec/86400), h = Math.floor((upSec%86400)/3600), m = Math.floor((upSec%3600)/60), s = Math.floor(upSec%60);
    let userCount = "?", threadCount = "?";
    try { userCount = (await usersData.getAll()).length; } catch {}
    try { threadCount = (await threadsData.getAll()).length; } catch {}
    const totalCmds = fs.readdirSync(path.join(__dirname)).filter(f => f.endsWith(".js")).length;
    const body =
      `📈 ════════════════════ 📈\n` +
      `   𝗟𝗶𝘃𝗲 𝗕𝗼𝘁 𝗗𝗮𝘀𝗵𝗯𝗼𝗮𝗿𝗱\n` +
      `📈 ════════════════════ 📈\n\n` +
      `🤖 Bot        : ${GHOST.botName}\n` +
      `👑 Owner      : ${GHOST.ownerName}\n` +
      `📊 Commands   : ${totalCmds}+\n` +
      `👥 Users      : ${userCount}\n` +
      `💬 Groups     : ${threadCount}\n` +
      `⏱️  Uptime     : ${d}d ${h}h ${m}m ${s}s\n` +
      `💾 RAM        : ${Math.round((os.totalmem()-os.freemem())/1e6)}/${Math.round(os.totalmem()/1e6)}MB\n` +
      `⚡ CPU        : ${os.cpus().length} cores | ${os.loadavg()[0].toFixed(2)} load\n\n` +
      `📈 ════════════════════ 📈\n` +
      `  👻 Live Dashboard v1.0`;
    const gif = "https://media.tenor.com/svLMd5r2KRYAAAAC/neon-light.gif";
    try {
      const res = await axios.get(gif, { responseType: "arraybuffer", timeout: 8000 });
      const { PassThrough } = require("stream"); const st = new PassThrough(); st.end(Buffer.from(res.data));
      await message.reaction("✅", event.messageID); return message.reply({ body, attachment: st });
    } catch { await message.reaction("✅", event.messageID); return message.reply(body); }
  }
};
