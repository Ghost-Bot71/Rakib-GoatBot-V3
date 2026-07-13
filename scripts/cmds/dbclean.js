module.exports = {
  config: {
    name: "dbclean",
    version: "2.0",
    author: "Rakib",
    countDown: 10,
    role: 4,
    description: {
      en: "Clean users who are no longer in the current group"
    },
    category: "system",
    guide: {
      en: "{pn}"
    }
  },

  onStart: async function ({ api, event, message, threadsData }) {
    try {
      const threadID = event.threadID;
      const threadData = await threadsData.get(threadID);

      if (!threadData) {
        return message.reply(
          "❌ | Thread data not found"
        );
      }

      if (!threadData.members || !Array.isArray(threadData.members)) {
        return message.reply(
          "❌ | Members data not found"
        );
      }

      await message.reply("🔄 | Cleaning database...");

      // Get real members from Facebook
      const threadInfo = await api.getThreadInfo(threadID);
      const participantIDs = threadInfo.participantIDs.map(String);

      const oldMembers = threadData.members;

      // Keep only users currently in group
      const activeMembers = oldMembers.filter(user =>
        participantIDs.includes(String(user.userID))
      );

      const removedMembers = oldMembers.filter(user =>
        !participantIDs.includes(String(user.userID))
      );

      // Save cleaned data
      await threadsData.set(
        threadID,
        activeMembers,
        "members"
      );

      let preview = "";

      if (removedMembers.length > 0) {
        const show = removedMembers.slice(0, 20);

        preview =
          "\n\n🗑 Removed Users:\n" +
          show.map((u, i) =>
            `${i + 1}. ${u.name || "Unknown"}`
          ).join("\n");

        if (removedMembers.length > 20) {
          preview += `\n...and ${removedMembers.length - 20} more`;
        }
      }

      return message.reply(
        `🧹 DATABASE CLEAN COMPLETE\n\n` +
        `👥 Database Members: ${oldMembers.length}\n` +
        `👥 Current Group Members: ${participantIDs.length}\n` +
        `✅ Kept: ${activeMembers.length}\n` +
        `🗑 Removed: ${removedMembers.length}` +
        preview
      );

    } catch (err) {
      console.error(err);
      return message.reply(
        "❌ | Database clean failed\n\n" +
        err.message
      );
    }
  }
};
