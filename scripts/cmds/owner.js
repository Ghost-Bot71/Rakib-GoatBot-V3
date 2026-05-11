module.exports = {
  config: {
    name: "owner",
    aliases: ["ownar"],
    version: "1.0",
    author: "hoon",
    role: 0,
    category: "info",
    guide: {
      en: "{pn}"
    }
  },

  onStart: async function ({ api, event }) {

    const msg =
`╭━━━━━━━━━━━━━━━╮
     👑 𝐎𝐖𝐍𝐄𝐑 𝐈𝐍𝐅𝐎 👑
╰━━━━━━━━━━━━━━━╯

👤 𝐍𝐚𝐦𝐞
➤ 𝐑𝐀𝐊𝐈𝐁
➤ 𝐑𝐩: 𝐇𝐎𝐎𝐍

🆔 𝐔𝐈𝐃
➤ 𝟔𝟏𝟓𝟖𝟏𝟑𝟓𝟏𝟔𝟗𝟑𝟑𝟒𝟗

🛡️ 𝐑𝐨𝐥𝐞
➤ 𝐎𝐰𝐧𝐞𝐫 (𝐒𝐨𝐥𝐨)

🌐 𝐅𝐚𝐜𝐞𝐛𝐨𝐨𝐤
➤ www.facebook.com/hoon6t9

📧 𝐄𝐦𝐚𝐢𝐥
➤ bdrakib6t9@gmail.com

📨 𝐓𝐞𝐥𝐞𝐠𝐫𝐚𝐦
➤ @SpyerKing

📱 𝐖𝐡𝐚𝐭𝐬𝐀𝐩𝐩
➤ +880 1319 888 778

💻 𝐆𝐢𝐭𝐇𝐮𝐛
➤ github.com/bdrakib6t9

🌍 𝐖𝐞𝐛𝐬𝐢𝐭𝐞
➤ https://bdrakib6t9.vercel.app/

━━━━━━━━━━━━━━━━
✨ 𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲 𝐑𝐀𝐊𝐈𝐁 ✨`;

    api.sendMessage(msg, event.threadID, event.messageID);
  }
};
