const { loadBox } = require("../../rakib/customId/ownBox");

module.exports = {
  config: {
    name: "adcall",
    version: "4.0",
    author: "Rakib",
    role: 0,
    shortDescription: "Send message to admin groups",
    category: "utility",
    guide: {
      en: "{pn} <message>"
    }
  },

  onStart: async function ({ api, event, args }) {

    const msg = args.join(" ");

    if (!msg) {
      return api.sendMessage(
        "❌ Please provide a message.",
        event.threadID
      );
    }

    try {

      // 🔥 load group IDs from GitHub
      const ownBox = await loadBox();

      if (!ownBox || ownBox.length === 0) {
        return api.sendMessage(
          "❌ No admin groups configured.",
          event.threadID
        );
      }

      const senderInfo = await api.getUserInfo(event.senderID);
      const senderName = senderInfo[event.senderID]?.name || "Unknown";

      const forwardMsg =
`📢 𝗔𝗗𝗖𝗔𝗟𝗟 𝗔𝗟𝗘𝗥𝗧

👤 From: ${senderName}
🆔 User ID: ${event.senderID}
💬 Message: ${msg}

📍 From Group ID: ${event.threadID}`;

      let successCount = 0;

      for (const threadID of ownBox) {
        try {
          await api.sendMessage(forwardMsg, threadID);
          successCount++;
        } catch (err) {
          console.log("❌ Failed to send to:", threadID);
        }
      }

      if (successCount > 0) {
        api.sendMessage(
          `✅ Message sent to ${successCount} admin group(s).`,
          event.threadID
        );
      } else {
        api.sendMessage(
          "❌ Could not send to any admin group.",
          event.threadID
        );
      }

    } catch (err) {
      console.error("adcall error:", err);
      api.sendMessage(
        "❌ Something went wrong.",
        event.threadID
      );
    }
  }
};
