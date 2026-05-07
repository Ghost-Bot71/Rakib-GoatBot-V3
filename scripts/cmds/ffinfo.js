const axios = require("axios");

function formatTime(timestamp) {
  const date = new Date(Number(timestamp) * 1000);
  return date.toLocaleString("en-BD");
}

module.exports = {
  config: {
    name: "ffinfo",
    version: "2.0",
    author: "Rakib Hasan",
    countDown: 5,
    role: 0,
    shortDescription: "Free Fire Pro Info",
    longDescription: "Advanced FF account details",
    category: "game",
    guide: "{pn} <uid>"
  },

  onStart: async function ({ message, args }) {

    if (!args[0]) {
      return message.reply("❌ | UID দাও\nExample: freefire 1478563904");
    }

    const uid = args[0];
    const api = `https://rakib-ff-info-api.vercel.app/accinfo?uid=${uid}&region=bd`;

    try {
      const res = await axios.get(api);
      const d = res.data;

      const info = d.basicInfo;
      const clan = d.clanBasicInfo || {};
      const pet = d.petInfo || {};
      const social = d.socialInfo || {};
      const credit = d.creditScoreInfo || {};

      // Profile Image (fake mapping)
      const img = `https://ff.garena.com/images/head/${info.headPic}.png`;

      const msg = `
╭───『 𝗙𝗥𝗘𝗘 𝗙𝗜𝗥𝗘 𝗣𝗥𝗢 』───╮

👤 𝗡𝗮𝗺𝗲: ${info.nickname}
🆔 𝗨𝗜𝗗: ${info.accountId}
🌍 𝗥𝗲𝗴𝗶𝗼𝗻: ${info.region}
🎮 𝗟𝗲𝘃𝗲𝗹: ${info.level}
❤️ 𝗟𝗶𝗸𝗲𝘀: ${info.liked}

🏆 𝗕𝗥 𝗥𝗮𝗻𝗸: ${info.rank}
⭐ 𝗕𝗥 𝗦𝗰𝗼𝗿𝗲: ${info.rankingPoints}

🎯 𝗖𝗦 𝗥𝗮𝗻𝗸: ${info.csRank}
🔥 𝗖𝗦 𝗦𝗰𝗼𝗿𝗲: ${info.csRankingPoints}

🎖️ 𝗧𝗶𝘁𝗹𝗲: ${info.title}
🎴 𝗕𝗮𝗻𝗻𝗲𝗿: ${info.bannerId}

👥 𝗖𝗹𝗮𝗻: ${clan.clanName || "N/A"}
👑 𝗟𝗲𝘃𝗲𝗹: ${clan.clanLevel || "N/A"}
👤 𝗠𝗲𝗺𝗯𝗲𝗿𝘀: ${clan.currentMembers || 0}/${clan.maxMembers || 0}

🐾 𝗣𝗲𝘁: ${pet.petName || "N/A"}
🎖️ 𝗣𝗲𝘁 𝗟𝗲𝘃𝗲𝗹: ${pet.level || "N/A"}
🧬 𝗦𝗸𝗶𝗹𝗹: ${pet.selectedSkillId || "N/A"}

⚡ 𝗖𝗿𝗲𝗱𝗶𝘁 𝗦𝗰𝗼𝗿𝗲: ${credit.score || "N/A"}

🕒 𝗟𝗮𝘀𝘁 𝗟𝗼𝗴𝗶𝗻: ${formatTime(info.lastLoginAt)}

💬 𝗕𝗶𝗼:
${social.socialHighlight || "No bio"}

👑 𝗢𝘄𝗻𝗲𝗿: ${(d.Owners && d.Owners[0]) || "Unknown"}

╰───────────────╯
`;

      return message.reply({
        body: msg,
        attachment: await global.utils.getStreamFromURL(img)
      });

    } catch (e) {
      console.error(e);
      message.reply("❌ | Error fetching data");
    }
  }
};
