const fs = require("fs");
const utils = require("../../utils.js");
const { getAvatarUrl } = require("../../rakib/customApi/getAvatarUrl");

module.exports = {
  config: {
    name: "spy",
    version: "2.1",
    author: "Rakib",
    countDown: 5,
    role: 0,
    shortDescription: "Deep profile inspection",
    longDescription:
      "Fetch detailed profile information with avatar, level, balance and rank.",
    category: "utility",
  },

  onStart: async function ({
    event,
    message,
    api,
    usersData,
    args,
  }) {
    try {
      const requesterID = event.senderID;
      const mentionIDs = Object.keys(event.mentions || {});
      const mentionedID = mentionIDs[0];

      let targetID;

      api.setMessageReaction("🕜", event.messageID, () => {}, true);

      /* ================= UID / LINK ================= */

      if (args[0]) {
        if (/^\d+$/.test(args[0])) {
          targetID = args[0];
        } else {
          const match = args[0].match(
            /profile\.php\?id=(\d+)/
          );

          if (match) targetID = match[1];
        }
      }

      /* ================= FALLBACK ================= */

      if (!targetID) {
        targetID =
          event.type === "message_reply" &&
          event.messageReply?.senderID
            ? event.messageReply.senderID
            : mentionedID || requesterID;
      }

      /* ================= USER INFO ================= */

      const fbData = await api.getUserInfo(targetID);
      const info = fbData?.[targetID];

      if (!info) {
        return message.reply(
          "⚠️ Could not retrieve profile info."
        );
      }

      /* ================= AVATAR ================= */

      let avatarPath = null;

      try {
        avatarPath = await getAvatarUrl(targetID);
      } catch (e) {
        console.log("Avatar Error:", e);
      }

      /* ================= DATABASE ================= */

      const userData =
        (await usersData.get(targetID)) || {};

      const requesterData =
        (await usersData.get(requesterID)) || {};

      const requesterName =
        requesterData.name || "Friend";

      /* ================= BASIC INFO ================= */

      const fullName = info.name || "Unknown";

      const gender =
        info.gender == 1
          ? "Female"
          : info.gender == 2
          ? "Male"
          : "Unknown";

      const exp = Number(userData.exp || 0);

      const level = Math.floor(
        Math.sqrt(exp) * 0.1
      );

      const location =
        info.hometown ||
        info.hometown_name ||
        info.location ||
        "Unknown";

      const birthday = info.isBirthday
        ? "🎉 Today!"
        : "Hidden";

      const friendStatus = info.isFriend
        ? "✅ Yes"
        : "❌ No";

      /* ================= MONEY SYSTEM ================= */

      let wallet = 0n;
      let bank = 0n;

      try {
        wallet = BigInt(userData.money ?? 0);
      } catch {}

      try {
        bank = BigInt(userData.data?.bank ?? 0);
      } catch {}

      const totalBalance = wallet + bank;

      /* ================= THREAD NICKNAME ================= */

      let nickname = "—";

      try {
        const threadInfo = await api.getThreadInfo(
          event.threadID
        );

        nickname =
          threadInfo.nicknames?.[targetID] || "—";
      } catch {}

      /* ================= RANK SYSTEM ================= */

      let rank = "—";

      try {
        const allUsers = await usersData.getAll();

        const sortedUsers = allUsers
          .filter(
            (u) => typeof u.exp === "number"
          )
          .sort((a, b) => b.exp - a.exp);

        const rankIndex = sortedUsers.findIndex(
          (u) =>
            String(
              u.userID || u.uid || u.id
            ) === String(targetID)
        );

        if (rankIndex !== -1) {
          rank = `#${rankIndex + 1}`;
        }
      } catch {}

      /* ================= MESSAGE ================= */

      const body = `
╔════════════════════╗
║ 🚀 𝐏𝐑𝐎𝐅𝐈𝐋𝐄 𝐈𝐍𝐒𝐈𝐆𝐇𝐓 ║
╚════════════════════╝

👤 𝐍𝐚𝐦𝐞        : ${fullName}
💬 𝐍𝐢𝐜𝐤𝐧𝐚𝐦𝐞     : ${nickname}
🆔 𝐔𝐈𝐃         : ${targetID}

💵 𝐖𝐚𝐥𝐥𝐞𝐭      : ${utils.formatMoney(wallet)}
🏦 𝐁𝐚𝐧𝐤        : ${utils.formatMoney(bank)}
💰 𝐓𝐨𝐭𝐚𝐥       : ${utils.formatMoney(totalBalance)}

⚡ 𝐗𝐏          : ${exp}
🎚 𝐋𝐞𝐯𝐞𝐥        : ${level}
🏅 𝐑𝐚𝐧𝐤        : ${rank}

⚧  𝐆𝐞𝐧𝐝𝐞𝐫      : ${gender}
🎂 𝐁𝐢𝐫𝐭𝐡𝐝𝐚𝐲     : ${birthday}
📍 𝐋𝐨𝐜𝐚𝐭𝐢𝐨𝐧     : ${location}
🤝 𝐅𝐫𝐢𝐞𝐧𝐝      : ${friendStatus}
💌 𝐑𝐞𝐥𝐚𝐭𝐢𝐨𝐧     : Single

🔗 𝐏𝐫𝐨𝐟𝐢𝐥𝐞      : https://www.facebook.com/${targetID}

✨ 𝐑𝐞𝐪𝐮𝐞𝐬𝐭𝐞𝐝 𝐛𝐲 : ${requesterName}
────────────────────────────
`;

      /* ================= SEND ================= */

      return message.reply({
        body,
        attachment:
          avatarPath &&
          fs.existsSync(avatarPath)
            ? fs.createReadStream(avatarPath)
            : null,
      });

    } catch (err) {
      console.error("SPY CMD ERROR:", err);

      api.setMessageReaction(
        "❌",
        event.messageID,
        () => {},
        true
      );

      return message.reply(
        "❌ Spy command failed."
      );
    }
  },
};
