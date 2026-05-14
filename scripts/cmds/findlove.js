module.exports = {
  config: {
    name: "findlove",
    aliases: ["matchmaker"],
    version: "1.0",
    author: "Rakib",
    countDown: 10,
    role: 0,
    description: "Find love matches in the group",
    category: "fun",
    guide: {
      en: "{pn} - Find random couple\n" +
          "{pn} @user1 @user2 - Check compatibility\n" +
          "{pn} @user - Find match for tagged user"
    }
  },

  onStart: async function ({ api, event, message }) {
    const { threadID, mentions } = event;

    try {
      const threadInfo = await api.getThreadInfo(threadID);
      const users = threadInfo.userInfo;
      const botID = api.getCurrentUserID();

      const validUsers = users.filter(u => u.id !== botID);

      if (validUsers.length < 2) {
        return message.reply("❌ Not enough users!");
      }

      let user1, user2;

      const mentionedUsers = Object.keys(mentions || {});

      // 👉 CASE 1: Two mentions
      if (mentionedUsers.length >= 2) {
        user1 = users.find(u => u.id == mentionedUsers[0]);
        user2 = users.find(u => u.id == mentionedUsers[1]);
      }

      // 👉 CASE 2: One mention → find opposite gender
      else if (mentionedUsers.length === 1) {
        user1 = users.find(u => u.id == mentionedUsers[0]);

        const oppositeUsers = users.filter(
          u =>
            u.id !== user1.id &&
            ((user1.gender === "MALE" && u.gender === "FEMALE") ||
             (user1.gender === "FEMALE" && u.gender === "MALE"))
        );

        if (!oppositeUsers.length)
          return message.reply("❌ No opposite gender found!");

        user2 = oppositeUsers[Math.floor(Math.random() * oppositeUsers.length)];
      }

      // 👉 CASE 3: Random → male + female pair
      else {
        const males = users.filter(u => u.gender === "MALE");
        const females = users.filter(u => u.gender === "FEMALE");

        if (!males.length || !females.length)
          return message.reply("❌ Need both male & female users!");

        user1 = males[Math.floor(Math.random() * males.length)];
        user2 = females[Math.floor(Math.random() * females.length)];
      }

      const user1Name = user1.name;
      const user2Name = user2.name;

      const compatibility = Math.floor(Math.random() * 101);

      let status = "";
      let emoji = "";

      if (compatibility >= 90) {
        status = "𝗣𝗘𝗥𝗙𝗘𝗖𝗧 𝗠𝗔𝗧𝗖𝗛! 💕";
        emoji = "💑💖✨";
      } else if (compatibility >= 70) {
        status = "𝗚𝗥𝗘𝗔𝗧 𝗖𝗢𝗨𝗣𝗟𝗘! 💝";
        emoji = "💑💕";
      } else if (compatibility >= 50) {
        status = "𝗚𝗢𝗢𝗗 𝗖𝗛𝗔𝗡𝗖𝗘! 💓";
        emoji = "💑";
      } else if (compatibility >= 30) {
        status = "𝗠𝗔𝗬𝗕𝗘... 💭";
        emoji = "🤔";
      } else {
        status = "𝗡𝗢𝗧 𝗥𝗘𝗔𝗟𝗟𝗬... 💔";
        emoji = "😅";
      }

      const quotes = [
        "Their hearts beat in sync",
        "Destiny brought them together",
        "They complete each other",
        "Love is in the air",
        "A match made in heaven",
        "They’re meant to be",
        "True love never dies",
        "Soulmates forever",
        "The stars aligned for them",
        "Love at first sight"
      ];

      const quote = quotes[Math.floor(Math.random() * quotes.length)];

      const response = `💕 LOVE MATCHMAKER ${emoji}\n` +
        `━━━━━━━━━━━━━━━━━━\n\n` +
        `👫 Couple:\n   ${user1Name} 💖 ${user2Name}\n\n` +
        `📊 Compatibility: ${compatibility}%\n` +
        `💝 Status: ${status}\n\n` +
        `✨ Quote:\n   "${quote}"\n\n` +
        `━━━━━━━━━━━━━━━━━━`;

      return message.reply({
        body: response,
        mentions: [
          { tag: user1Name, id: user1.id },
          { tag: user2Name, id: user2.id }
        ]
      });

    } catch (error) {
      console.error(error);
      return message.reply("❌ Error while matchmaking");
    }
  }
};
