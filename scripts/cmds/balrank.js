const utils = require("../../utils.js");

module.exports = {
  config: {
    name: "balrank",
    aliases: ["rankbal", "wealthrank"],
    version: "1.0",
    author: "Rakib",
    countDown: 5,
    role: 0,
    description: {
      en: "View balance rank or user wealth profile",
      bn: "র‍্যাংক অথবা ইউজারের সম্পদের তথ্য দেখুন"
    },
    category: "economy"
  },

  langs: {
    en: {
      noData: "No user data found.",
      invalidRank: "Please enter a valid rank number.",
      notFound: "User not found."
    },
    bn: {
      noData: "কোনো ইউজারের ডাটা পাওয়া যায়নি।",
      invalidRank: "সঠিক র‍্যাংক নাম্বার দিন।",
      notFound: "ইউজার খুঁজে পাওয়া যায়নি।"
    }
  },

  onStart: async function ({
    api,
    event,
    message,
    usersData,
    threadsData,
    args,
    getLang
  }) {

    let allUsers;

    if (typeof usersData.getAll === "function")
      allUsers = await usersData.getAll();
    else if (global.db?.allUserData)
      allUsers = global.db.allUserData;
    else
      return message.reply(getLang("noData"));

    if (!allUsers || !allUsers.length)
      return message.reply(getLang("noData"));

    const leaderboard = [];

    for (const user of allUsers) {
      let wallet = 0n;
      let bank = 0n;

      try {
        wallet = BigInt(user.money || 0);
      } catch {}

      try {
        bank = BigInt(user.data?.bank || 0);
      } catch {}

      leaderboard.push({
        uid: String(user.userID || user.id),
        name: user.name || user.data?.name || "Unknown User",
        wallet,
        bank,
        total: wallet + bank
      });
    }

    leaderboard.sort((a, b) =>
      a.total > b.total ? -1 : a.total < b.total ? 1 : 0
    );

    let target;
    let rankPosition;

    // .balrank 5
    if (args[0] && !isNaN(args[0])) {
      const rank = parseInt(args[0]);

      if (rank < 1)
        return message.reply(getLang("invalidRank"));

      target = leaderboard[rank - 1];

      if (!target)
        return message.reply(getLang("notFound"));

      rankPosition = rank;
    }

    // Reply User
    else if (event.messageReply) {
      const uid = String(event.messageReply.senderID);

      target = leaderboard.find(
        u => String(u.uid) === uid
      );

      if (!target)
        return message.reply(getLang("notFound"));

      rankPosition =
        leaderboard.findIndex(
          u => String(u.uid) === uid
        ) + 1;
    }

    // Mention User
    else if (
      event.mentions &&
      Object.keys(event.mentions).length
    ) {
      const uid = Object.keys(event.mentions)[0];

      target = leaderboard.find(
        u => String(u.uid) === String(uid)
      );

      if (!target)
        return message.reply(getLang("notFound"));

      rankPosition =
        leaderboard.findIndex(
          u => String(u.uid) === String(uid)
        ) + 1;
    }

    // Self
    else {
      const uid = String(event.senderID);

      target = leaderboard.find(
        u => String(u.uid) === uid
      );

      if (!target)
        return message.reply(getLang("notFound"));

      rankPosition =
        leaderboard.findIndex(
          u => String(u.uid) === uid
        ) + 1;
    }

    /* GROUP COUNT */
    let groupCount = 0;

    try {
      const allThreads = await threadsData.getAll();

      for (const thread of allThreads) {
        const members =
          thread.members ||
          thread.participants ||
          thread.userInfo ||
          [];

        if (JSON.stringify(members).includes(target.uid))
          groupCount++;
      }
    } catch (e) {}

    const totalUsers = leaderboard.length;

    const top3 = leaderboard
      .slice(0, 3)
      .map((user, index) =>
        `${["🥇", "🥈", "🥉"][index]} ${user.name}`
      )
      .join("\n");

    const msg = `
╭━━━━━━━━━━━━━━━━━━╮
┃   ❀☞ 𝐌𝐎𝐍𝐄𝐘 𝐑𝐀𝐍𝐊 ☜❀
╰━━━━━━━━━━━━━━━━━━╯

👤 𝗡𝗮𝗺𝗲
╰➤ ${target.name}

🆔 𝗨𝗜𝗗
╰➤ ${target.uid}

🏆 𝗥𝗮𝗻𝗸
╰➤ #${rankPosition} / ${totalUsers}

👥 𝗚𝗿𝗼𝘂𝗽𝘀
╰➤ ${groupCount}

💼 𝗪𝗮𝗹𝗹𝗲𝘁
╰➤ ${utils.formatMoney(target.wallet)}

🏦 𝗕𝗮𝗻𝗸
╰➤ ${utils.formatMoney(target.bank)}

💰 𝗧𝗼𝘁𝗮𝗹 𝗪𝗲𝗮𝗹𝘁𝗵
╰➤ ${utils.formatMoney(target.total)}

━━━━━━━━━━━━━━━━━━
🌟 𝗧𝗢𝗣 𝟯 𝗥𝗜𝗖𝗛𝗘𝗦𝗧
━━━━━━━━━━━━━━━━━━
${top3}

━━━━━━━━━━━━━━━━━━
`;

    return message.reply(msg.trim());
  }
};
