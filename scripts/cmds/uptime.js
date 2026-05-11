const os = require("os");

module.exports = {
  config: {
    name: "uptime",
    aliases: ["upt", "up"],
    version: "3.1",
    author: "Rakib",
    role: 0,
    category: "system"
  },

  onStart: async function ({ api, event, usersData, threadsData }) {
    try {

      const allUsers = await usersData.getAll();
      const allThreads = await threadsData.getAll();

      // BOT UPTIME
      const botUptime = process.uptime();
      const bDays = Math.floor(botUptime / 86400);
      const bHours = Math.floor((botUptime % 86400) / 3600);
      const bMinutes = Math.floor((botUptime % 3600) / 60);
      const botUptimeString = `${bDays}d ${bHours}h ${bMinutes}m`;

      // SYSTEM UPTIME
      const sysUptime = os.uptime();
      const sDays = Math.floor(sysUptime / 86400);
      const sHours = Math.floor((sysUptime % 86400) / 3600);
      const sMinutes = Math.floor((sysUptime % 3600) / 60);
      const systemUptimeString = `${sDays}d ${sHours}h ${sMinutes}m`;

      // PING
      const start = process.hrtime.bigint();
      api.sendMessage("🏓", event.threadID, (err, info) => {
  	  const end = process.hrtime.bigint();
      const ping = Number(end - start) / 1e6;
      let pingStatus = "🔴 Very Slow";

      if (ping < 200)
      pingStatus = "🟢 Excellent";
	    else if (ping < 400)
	    pingStatus = "🙂 Good";
      else if (ping < 800)
      pingStatus = "🟠 Slow";

	    api.editMessage(`📶 Ping: ${ping.toFixed(2)} ms (${pingStatus})`,
      info.messageID
	  );
});
      // MESSAGE (BOLD STYLE)
      const msg =
`╭───────────────
╞🌟𝗕𝗢𝗧 𝗨𝗣𝗧𝗜𝗠𝗘🌟
╞───────────────
╞⏰𝗕𝗼𝘁 𝗨𝗽𝘁𝗶𝗺𝗲:${botUptimeString}
╞🖥𝗦𝘆𝘀𝘁𝗲𝗺 𝗨𝗽: ${systemUptimeString}
╞───────────────
╞📶 𝗣𝗶𝗻𝗴: ${ping} ms (${pingStatus})
╞───────────────
╞👤 𝗧𝗼𝘁𝗮𝗹 𝗨𝘀𝗲𝗿𝘀: ${allUsers.length}
╞👥 𝗧𝗼𝘁𝗮𝗹 𝗚𝗿𝗼𝘂𝗽𝘀: ${allThreads.length}
╰───────────────`;

      api.sendMessage(msg, event.threadID, event.messageID);

    } catch (error) {
      console.log(error);
      api.sendMessage("❌ Error retrieving uptime.", event.threadID, event.messageID);
    }
  }
};
