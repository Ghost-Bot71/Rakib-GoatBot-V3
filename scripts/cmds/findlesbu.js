module.exports = {
  config: {
    name: "findlesbu",
    aliases: ["whoislesbian", "lesbufinder"],
    version: "1.0",
    author: "Rakib",
    countDown: 10,
    role: 0,
    description: "Find the most lesbian female in the group (just for fun!)",
    category: "fun",
    guide: {
      en: "{pn} - Find a random lesbian female in the group"
    }
  },

  onStart: async function ({ api, event, message }) {
    const { threadID } = event;

    try {
      const threadInfo = await api.getThreadInfo(threadID);
      const users = threadInfo.userInfo;

      const botID = api.getCurrentUserID();

      // ✅ FILTER ONLY FEMALE USERS
      const femaleUsers = users.filter(
        u => u.id !== botID && u.gender === "FEMALE"
      );

      if (femaleUsers.length === 0) {
        return message.reply("❌ No female users found in this group!");
      }

      // RANDOM PICK
      const selected = femaleUsers[Math.floor(Math.random() * femaleUsers.length)];
      const userID = selected.id;
      const userName = selected.name;

      const percentage = Math.floor(Math.random() * 101);

      let statusMessage = "";
      let emoji = "";

      if (percentage >= 90) {
        statusMessage = "𝗘𝗫𝗧𝗥𝗘𝗠𝗘𝗟𝗬 𝗟𝗘𝗦𝗕𝗜𝗔𝗡! 💅✨";
        emoji = "🏳️‍🌈🏳️‍🌈🏳️‍🌈";
      } else if (percentage >= 70) {
        statusMessage = "𝗩𝗘𝗥𝗬 𝗟𝗘𝗦𝗕𝗜𝗔𝗡! 🌈";
        emoji = "🏳️‍🌈🏳️‍🌈";
      } else if (percentage >= 50) {
        statusMessage = "𝗣𝗥𝗘𝗧𝗧𝗬 𝗟𝗘𝗦𝗕𝗜𝗔𝗡! 💖";
        emoji = "🏳️‍🌈";
      } else if (percentage >= 30) {
        statusMessage = "𝗦𝗟𝗜𝗚𝗛𝗧𝗟𝗬 𝗟𝗘𝗦𝗕𝗜𝗔𝗡 👀";
        emoji = "🌈";
      } else {
        statusMessage = "𝗕𝗔𝗥𝗘𝗟𝗬 𝗟𝗘𝗦𝗕𝗜𝗔𝗡 😏";
        emoji = "✨";
      }

      const funFacts = [
        "𝖲𝗁𝖾 𝗁𝖺𝗌 𝖺 𝗌𝗈𝖿𝗍 𝗋𝖺𝗂𝗇𝖻𝗈𝗐 𝖺𝗎𝗋𝖺",
        "𝖧𝖾𝗋 𝖿𝖺𝗏𝗈𝗋𝗂𝗍𝖾 𝖼𝗈𝗅𝗈𝗋 𝗂𝗌 𝗉𝗋𝗈𝖻𝖺𝖻𝗅𝗒 𝗋𝖺𝗂𝗇𝖻𝗈𝗐",
        "𝖲𝗁𝖾 𝗈𝗐𝗇𝗌 𝖼𝗎𝗍𝖾 𝖺𝗇𝖽 𝖼𝗈𝗅𝗈𝗋𝖿𝗎𝗅 𝗂𝗍𝖾𝗆𝗌",
        "𝖲𝗁𝖾 𝗁𝖺𝗌 𝖺 𝗎𝗇𝗂𝗊𝗎𝖾 𝖼𝗁𝖺𝗋𝗆",
        "𝖲𝗁𝖾 𝗌𝗁𝗂𝗇𝖾𝗌 𝗐𝗂𝗍𝗁 𝖼𝗈𝗇𝖿𝗂𝖽𝖾𝗇𝖼𝖾",
        "𝖧𝖾𝗋 𝗉𝗅𝖺𝗒𝗅𝗂𝗌𝗍 𝗂𝗌 𝖿𝗎𝗅𝗅 𝗈𝖿 𝗏𝗂𝖻𝖾𝗌",
        "𝖲𝗁𝖾 𝗁𝖺𝗌 𝖺 𝗀𝗋𝖾𝖺𝗍 𝖿𝖺𝗌𝗁𝗂𝗈𝗇 𝗌𝗍𝗒𝗅𝖾",
        "𝖲𝗁𝖾 𝖻𝗋𝗂𝗇𝗀𝗌 𝗉𝗈𝗌𝗂𝗍𝗂𝗏𝖾 𝖾𝗇𝖾𝗋𝗀𝗒",
        "𝖲𝗁𝖾 𝗅𝗈𝗏𝖾𝗌 𝖽𝗋𝖺𝗆𝖺 𝖺𝗇𝖽 𝖿𝗎𝗇",
        "𝖲𝗁𝖾 𝗂𝗌 𝖼𝗈𝗇𝖿𝗂𝖽𝖾𝗇𝗍 𝖺𝗇𝖽 𝖻𝗈𝗅𝖽"
      ];

      const randomFact = funFacts[Math.floor(Math.random() * funFacts.length)];

      const response = `🏳️‍🌈 𝗟𝗘𝗦𝗕𝗜𝗔𝗡 𝗗𝗘𝗧𝗘𝗖𝗧𝗢𝗥 ${emoji}\n` +
        `━━━━━━━━━━━━━━━━━━\n\n` +
        `🎯 𝖳𝖺𝗋𝗀𝖾𝗍 𝖥𝗈𝗎𝗇𝖽: ${userName}\n\n` +
        `📊 𝖫𝖾𝗌𝖻𝗂𝖺𝗇 𝖫𝖾𝗏𝖾𝗅: ${percentage}%\n` +
        `🌈 𝖲𝗍𝖺𝗍𝗎𝗌: ${statusMessage}\n\n` +
        `💡 𝖥𝗎𝗇 𝖥𝖺𝖼𝗍:\n   ${randomFact}\n\n` +
        `━━━━━━━━━━━━━━━━━━\n`;

      return message.reply({
        body: response,
        mentions: [{ tag: userName, id: userID }]
      });

    } catch (error) {
      console.error(error);
      return message.reply("❌ Error while finding user");
    }
  }
};
