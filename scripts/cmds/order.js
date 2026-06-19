const { loadOwner } = require("../../rakib/customId/ownerUid");

module.exports = {
  config: {
    name: "order",
    aliases: [],
    version: "1.0",
    author: "Rakib",
    countDown: 15,
    role: 0,
    shortDescription: "Repeat text",
    longDescription: "Repeat text multiple times in one message",
    category: "utility",
  },

  onStart: async function ({ api, event, args }) {
    try {
      // 🔒 Owner Check (dynamic)
      const ownerUID = await loadOwner();
      const isOwner = Array.isArray(ownerUID)
        ? ownerUID.includes(String(event.senderID))
        : String(event.senderID) === String(ownerUID);

      if (!isOwner) {
        return api.sendMessage(
          "❌ | You are not allowed to use this command.",
          event.threadID,
          event.messageID
        );
      }
      // ---------------------

      if (args.length < 2) {
        return api.sendMessage(
          "Usage:\norder <count> <text>\norder list <count> <text>",
          event.threadID,
          event.messageID
        );
      }

      let isList = false;
      let count, text;

      // check if list mode
      if (args[0].toLowerCase() === "list") {
        isList = true;
        count = parseInt(args[1]);
        text = args.slice(2).join(" ");
      } else {
        count = parseInt(args[0]);
        text = args.slice(1).join(" ");
      }

      if (isNaN(count) || count <= 0) {
        return api.sendMessage("Invalid number!", event.threadID, event.messageID);
      }

      if (!text) {
        return api.sendMessage("Text missing!", event.threadID, event.messageID);
      }

      let result = "";

      for (let i = 1; i <= count; i++) {
        if (isList) {
          result += `${i}. ${text}\n`;
        } else {
          result += `${text}\n`;
        }
      }

      // Messenger limit safe (optional trim)
      if (result.length > 15000) {
        result = result.slice(0, 15000) + "\n...";
      }

      return api.sendMessage(result.trim(), event.threadID, event.messageID);

    } catch (err) {
      console.error(err);
      return api.sendMessage("Error occurred!", event.threadID, event.messageID);
    }
  }
};
