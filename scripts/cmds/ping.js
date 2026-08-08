const fs = require("fs-extra");
const path = require("path");
const GHOST = fs.readJsonSync(path.join(__dirname, "../../ghostConfig.json"));

module.exports = {
  config: {
    name: "ping", aliases: ["p", "speed"],
    version: "1.0", author: "Rakib Islam", countDown: 3, role: 0,
    shortDescription: "Bot ping check করো", longDescription: "Ghost Bot এর response time চেক করো",
    category: "info", guide: "{pn}",
  },
  onStart: async function ({ message, event }) {
    const start = Date.now();
    const sent = await message.reply(`🏓 Pinging...`);
    const ping = Date.now() - start;
    const uptime = process.uptime();
    const h = Math.floor(uptime/3600), m = Math.floor((uptime%3600)/60), s = Math.floor(uptime%60);
    const bars = ping < 100 ? "🟢🟢🟢🟢🟢" : ping < 300 ? "🟡🟡🟡🟢🟢" : ping < 600 ? "🟠🟠🟡🟢🟢" : "🔴🔴🟠🟠🟡";
    return message.reply(
      `🏓 𝗣𝗼𝗻𝗴!\n\n` +
      `⚡ Ping: ${ping}ms\n` +
      `${bars}\n` +
      `⏱️ Uptime: ${h}h ${m}m ${s}s\n` +
      `📊 Status: ${ping < 500 ? "✅ Online" : "⚠️ Slow"}\n\n` +
      `━━━━━━━━━━━━━━━━━━\n` +
      `👻 Ghost Bot — ${GHOST.ownerName}`
    );
  }
};
