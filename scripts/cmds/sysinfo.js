const os = require("os");
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const GHOST = fs.readJsonSync(path.join(__dirname, "../../ghostConfig.json"));

module.exports = {
  config: {
    name: "sysinfo",
    aliases: ["system", "sys", "osinfo"],
    version: "1.0", author: "Rakib Islam",
    countDown: 5, role: 0,
    shortDescription: "System info — OS, CPU, RAM details 🖥️",
    category: "system", guide: { en: "{pn}" }
  },
  onStart: async function ({ message, event }) {
    await message.reaction("⏳", event.messageID);
    const cpu = os.cpus()[0];
    const body =
      `🖥️  ════════════════════ 🖥️\n` +
      `   𝗦𝘆𝘀𝘁𝗲𝗺 𝗜𝗻𝗳𝗼𝗿𝗺𝗮𝘁𝗶𝗼𝗻\n` +
      `🖥️  ════════════════════ 🖥️\n\n` +
      `🐧 OS Type    : ${os.type()}\n` +
      `🏗️  Arch       : ${os.arch()}\n` +
      `📡 Hostname   : ${os.hostname()}\n` +
      `🌡️  Platform   : ${os.platform()}\n` +
      `🖥️  CPU        : ${cpu.model.slice(0,35)}\n` +
      `⚡ CPU Speed  : ${cpu.speed}MHz\n` +
      `🔢 Cores      : ${os.cpus().length}\n` +
      `💾 Total RAM  : ${(os.totalmem()/1e9).toFixed(2)}GB\n` +
      `🆓 Free RAM   : ${(os.freemem()/1e9).toFixed(2)}GB\n` +
      `⏱️  Uptime     : ${Math.floor(os.uptime()/3600)}h ${Math.floor((os.uptime()%3600)/60)}m\n` +
      `🏠 Home Dir   : ${os.homedir()}\n` +
      `📁 Temp Dir   : ${os.tmpdir()}\n\n` +
      `🖥️  ════════════════════ 🖥️\n` +
      `  👻 ${GHOST.botName}`;
    const gif = "https://media.tenor.com/QWCII8p7iqQAAAAC/galaxy-space.gif";
    try {
      const res = await axios.get(gif, { responseType: "arraybuffer", timeout: 8000 });
      const { PassThrough } = require("stream"); const st = new PassThrough(); st.end(Buffer.from(res.data));
      await message.reaction("✅", event.messageID); return message.reply({ body, attachment: st });
    } catch { await message.reaction("✅", event.messageID); return message.reply(body); }
  }
};
