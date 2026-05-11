module.exports = {
  config: {
    name: "info",
    aliases: ["botinfo", "about"],
    version: "1.2",
    author: "Rakib",
    role: 0,
    category: "system",
    guide: {
      en: "{pn} : show bot & admin info"
    }
  },

  onStart: async function ({ api, event, usersData, threadsData }) {
    const start = Date.now();

    const botName = global.GoatBot?.config?.botName || "GOAT BOT";
    const prefix = global.GoatBot?.config?.prefix || ".";

    const uptime = process.uptime();
    const h = Math.floor(uptime / 3600);
    const m = Math.floor((uptime % 3600) / 60);
    const s = Math.floor(uptime % 60);

    let totalUsers = 0;
    let totalGroups = 0;

    try {
      if (usersData?.getAll) totalUsers = (await usersData.getAll()).length;
      if (threadsData?.getAll) totalGroups = (await threadsData.getAll()).length;
    } catch {}

    const ping = Date.now() - start;
    const totalCommands = global.GoatBot?.commands?.size || 0;

    const adminInfo =
`╭━━━━━━━━━━━━━━━╮
   👑 𝐎𝐖𝐍𝐄𝐑 & 𝐀𝐃𝐌𝐈𝐍 𝐈𝐍𝐅𝐎 👑
╰━━━━━━━━━━━━━━━╯

👤 𝐍𝐚𝐦𝐞
➤ 𝐑𝐀𝐊𝐈𝐁
➤ 𝐑𝐩: 𝐇𝐎𝐎𝐍

🆔 𝐔𝐈𝐃
➤ 𝟔𝟏𝟓𝟖𝟏𝟑𝟓𝟏𝟔𝟗𝟑𝟑𝟒𝟗

🛡️ 𝐑𝐨𝐥𝐞
➤ 𝐎𝐰𝐧𝐞𝐫 & 𝐀𝐝𝐦𝐢𝐧 (𝐒𝐨𝐥𝐨)

🌐 𝐅𝐚𝐜𝐞𝐛𝐨𝐨𝐤
➤ www.facebook.com/hoon6t9

📧 𝐄𝐦𝐚𝐢𝐥
➤ bdrakib6t9@gmail.com

📨 𝐓𝐞𝐥𝐞𝐠𝐫𝐚𝐦
➤ @SpyerKing

📱 𝐖𝐡𝐚𝐭𝐬𝐀𝐩𝐩
➤ +880 1319 888778

💻 𝐆𝐢𝐭𝐇𝐮𝐛
➤ github.com/bdrakib6t9

🌍 𝐖𝐞𝐛𝐬𝐢𝐭𝐞
➤ https://bdrakib6t9.vercel.app/`;

    api.sendMessage(
`╭━━━━━━━━━━━━━━━╮
        🤖 𝐁𝐎𝐓 𝐈𝐍𝐅𝐎
╰━━━━━━━━━━━━━━━╯

🔹 𝐍𝐚𝐦𝐞      : ${botName}
🔹 𝐏𝐫𝐞𝐟𝐢𝐱    : ${prefix}
🔹 𝐂𝐨𝐦𝐦𝐚𝐧𝐝𝐬  : ${totalCommands}
🔹 𝐏𝐢𝐧𝐠      : ${ping} 𝐦𝐬

⏱️ 𝐔𝐩𝐭𝐢𝐦𝐞
➤ ${h}𝐡 ${m}𝐦 ${s}𝐬

📊 𝐃𝐚𝐭𝐚𝐛𝐚𝐬𝐞
➤ 𝐔𝐬𝐞𝐫𝐬  : ${totalUsers}
➤ 𝐆𝐫𝐨𝐮𝐩𝐬 : ${totalGroups}

━━━━━━━━━━━━━━━━
${adminInfo}
━━━━━━━━━━━━━━━━
✅ 𝐒𝐭𝐚𝐭𝐮𝐬: 𝐑𝐮𝐧𝐧𝐢𝐧𝐠`,
      event.threadID,
      event.messageID
    );
  }
};
