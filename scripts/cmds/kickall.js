module.exports = {
  config: {
    name: "kickall",
    version: "2.0",
    author: "Rakib",
    countDown: 10,
    role: 4,
    description: {
      vi: "Kick toàn bộ thành viên trong nhóm",
      en: "Kick all members in the group"
    },
    category: "box chat",
    guide: {
      vi: "{pn}",
      en: "{pn}"
    }
  },

  langs: {
    vi: {
      needAdmin: "❌ Bot cần quyền quản trị viên",
      done: "✅ Đã kick toàn bộ thành viên"
    },
    en: {
      needAdmin: "❌ Bot must be group admin",
      done: "✅ All members have been kicked"
    }
  },

  onStart: async function ({ api, event, message, getLang }) {
    const botID = api.getCurrentUserID();

    // 📌 Thread info
    let threadInfo;
    try {
      threadInfo = await api.getThreadInfo(event.threadID);
    } catch {
      return message.reply("❌ Failed to get thread info");
    }

    // 🔍 Bot admin check
    const isAdmin = threadInfo.adminIDs
      .map(e => String(e.id))
      .includes(String(botID));

    if (!isAdmin)
      return message.reply(getLang("needAdmin"));

    const members = threadInfo.participantIDs.map(String);

    // 👑 admins (except bot)
    const admins = threadInfo.adminIDs
      .map(e => String(e.id))
      .filter(uid => uid !== String(botID));

    // 👤 normal members (except bot and admins)
    const normalMembers = members.filter(uid =>
      uid !== String(botID) && !admins.includes(uid)
    );

    const delay = ms => new Promise(r => setTimeout(r, ms));

    // 🚫 Kick admins first
    for (const uid of admins) {
      try {
        await api.removeUserFromGroup(uid, event.threadID);
        await delay(700);
      } catch (e) {
        console.error("Kick admin error:", e.message);
      }
    }

    // 🚫 Kick normal members
    for (const uid of normalMembers) {
      try {
        await api.removeUserFromGroup(uid, event.threadID);
        await delay(700);
      } catch (e) {
        console.error("Kick user error:", e.message);
      }
    }

    return message.reply(getLang("done"));
  }
};
