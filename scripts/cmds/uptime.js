const os = require("os");

module.exports = {
  config: {
    name: "uptime",
    aliases: ["upt", "up"],
    version: "4.0",
    author: "Rakib",
    role: 0,
    category: "system",
    shortDescription: {
      en: "Show bot uptime and ping"
    },
    longDescription: {
      en: "Display bot uptime, system uptime, ping, users and groups"
    },
    guide: {
      en: "{pn}"
    }
  },

  onStart: async function ({ api, event, usersData, threadsData }) {
    try {

      // USERS & THREADS
      const allUsers = await usersData.getAll();
      const allThreads = await threadsData.getAll();

      // BOT UPTIME
      const botUptime = process.uptime();

      const bDays = Math.floor(botUptime / 86400);
      const bHours = Math.floor((botUptime % 86400) / 3600);
      const bMinutes = Math.floor((botUptime % 3600) / 60);
      const bSeconds = Math.floor(botUptime % 60);

      const botUptimeString =
        `${bDays}d ${bHours}h ${bMinutes}m ${bSeconds}s`;

      // SYSTEM UPTIME
      const sysUptime = os.uptime();

      const sDays = Math.floor(sysUptime / 86400);
      const sHours = Math.floor((sysUptime % 86400) / 3600);
      const sMinutes = Math.floor((sysUptime % 3600) / 60);
      const sSeconds = Math.floor(sysUptime % 60);

      const systemUptimeString =
        `${sDays}d ${sHours}h ${sMinutes}m ${sSeconds}s`;

      // RAM INFO
      const totalRAM = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);
      const freeRAM = (os.freemem() / 1024 / 1024 / 1024).toFixed(2);
      const usedRAM = (totalRAM - freeRAM).toFixed(2);

      // CPU INFO
      const cpuModel = os.cpus()[0].model;

      // PING CHECK
      const start = process.hrtime.bigint();

      api.sendMessage("🏓 Checking ping...", event.threadID, (err, info) => {
        if (err) {
          return api.sendMessage(
            "❌ Failed to check ping.",
            event.threadID,
            event.messageID
          );
        }

        const end = process.hrtime.bigint();
        const ping = Number(end - start) / 1e6;

        let pingStatus = "🔴 Very Slow";

        if (ping < 200)
          pingStatus = "🟢 Excellent";
        else if (ping < 400)
          pingStatus = "🙂 Good";
        else if (ping < 999)
          pingStatus = "🟠 Slow";

        const msg = `
╭───────────────
│ 🌟 𝗕𝗢𝗧 𝗨𝗣𝗧𝗜𝗠𝗘 🌟
├───────────────
│ ⏰ Bot Uptime
│ ${botUptimeString}
├───────────────
│ 🖥 System Uptime
│ ${systemUptimeString}
├───────────────
│ 📶 Ping
│ ${ping.toFixed(2)} ms
│ ${pingStatus}
├───────────────
│ 👤 Total Users: ${allUsers.length}
│ 👥 Total Groups: ${allThreads.length}
├───────────────
│ 💾 RAM Usage
│ ${usedRAM}GB / ${totalRAM}GB
├───────────────
│ ⚙️ CPU
│ ${cpuModel}
╰───────────────`;

        api.editMessage(msg, info.messageID);
      });

    } catch (error) {
      console.error(error);

      api.sendMessage(
        `❌ Error:\n${error.message}`,
        event.threadID,
        event.messageID
      );
    }
  }
};
