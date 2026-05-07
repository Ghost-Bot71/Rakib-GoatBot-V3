const { loadOwner } = require("../../rakib/customId/ownerUid");

module.exports = {
  config: {
    name: "gcn",
    aliases: ["groupnameall"],
    version: "2.0",
    author: "Rakib",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Change name of all group chats"
    },
    longDescription: {
      en: "Change the name of all group chats where the bot is present"
    },
    category: "owner",
    guide: {
      en: "{pn} <new group name>"
    },
    envConfig: {
      delayPerGroup: 250
    }
  },

  langs: {
    en: {
      missingName: "Please enter the new name for all group chats",
      noPermission: "❌ Only bot owner can use this command.",
      successMessage: "✅ Successfully changed all group names to '%1'",
      partialSuccessMessage: "⚠️ Changed name but failed in some groups:\n%2",
      sendingNotification: "Processing %1 group chats..."
    }
  },

  onStart: async function ({ api, args, threadsData, message, event, getLang }) {

    // 🔒 Owner Check (dynamic + safe)
    const ownerUID = await loadOwner();
    const isOwner = Array.isArray(ownerUID)
      ? ownerUID.includes(String(event.senderID))
      : String(event.senderID) === String(ownerUID);

    if (!isOwner) {
      return message.reply(getLang("noPermission"));
    }

    const newGroupName = args.join(" ");

    if (!newGroupName) {
      return message.reply(getLang("missingName"));
    }

    const botID = api.getCurrentUserID();

    // 📌 সব group collect
    const allThread = await threadsData.getAll();

    const threadIds = allThread
      .filter(t =>
        t.isGroup &&
        t.members?.some(m => String(m.userID) === String(botID))
      )
      .map(t => t.threadID);

    if (!threadIds.length) {
      return message.reply("❌ No groups found.");
    }

    message.reply(getLang("sendingNotification", threadIds.length));

    // 🔄 delay system (avoid rate limit)
    const delay = ms => new Promise(r => setTimeout(r, ms));

    const failedThreads = [];

    for (const threadId of threadIds) {
      try {
        await api.setTitle(newGroupName, threadId);
        await delay(module.exports.config.envConfig.delayPerGroup);
      } catch {
        failedThreads.push(threadId);
      }
    }

    // ✅ result
    if (failedThreads.length === 0) {
      return message.reply(getLang("successMessage", newGroupName));
    } else {
      return message.reply(
        getLang(
          "partialSuccessMessage",
          newGroupName,
          failedThreads.join(", ")
        )
      );
    }
  }
};
