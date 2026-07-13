const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "file",
    version: "2.0",
    author: "Rakib",
    countDown: 5,
    role: 4,
    category: "admin",
    guide: "{pn} <fileName>"
  },

  onStart: async function ({ args, api, event }) {
    const fileName = args[0];

    if (!fileName) {
      return api.sendMessage(
        "❌ | Please provide a file name.",
        event.threadID,
        event.messageID
      );
    }

    const filePath = path.join(__dirname, `${fileName}.js`);

    if (!fs.existsSync(filePath)) {
      return api.sendMessage(
        `❌ | File not found: ${fileName}.js`,
        event.threadID,
        event.messageID
      );
    }

    try {
      const fileContent = fs.readFileSync(filePath, "utf8");

      // ⚠️ Prevent very large message crash
      if (fileContent.length > 15000) {
        return api.sendMessage(
          "⚠️ File too large! Use smaller file or split it.",
          event.threadID,
          event.messageID
        );
      }

      return api.sendMessage(
        { body: fileContent },
        event.threadID,
        event.messageID
      );

    } catch (err) {
      console.error("FILE READ ERROR:", err);

      return api.sendMessage(
        "❌ | Failed to read file.",
        event.threadID,
        event.messageID
      );
    }
  }
};
