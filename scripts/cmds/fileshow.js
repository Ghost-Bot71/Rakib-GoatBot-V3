const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "fileshow",
    version: "3.0",
    author: "Rakib",
    countDown: 5,
    role: 4,
    category: "admin",
    guide: "{pn} <path>\nExample:\nfile uid\nfile rakib/customApi/ownerUid"
  },

  onStart: async function ({ args, api, event }) {
    const input = args[0];

    if (!input) {
      return api.sendMessage(
        "❌ | Provide file path.\nExample:\nfile index\nfile rakib/customApi/getAvatarUrl",
        event.threadID,
        event.messageID
      );
    }

    // 🔐 Security check
    if (input.includes("..")) {
      return api.sendMessage(
        "❌ Invalid path!",
        event.threadID,
        event.messageID
      );
    }

    // 📄 Ensure .js extension
    const filePathInput = input.endsWith(".js") ? input : `${input}.js`;

    // 📁 Root directory (repo root)
    const rootDir = path.join(__dirname, "../../..");

    const fullPath = path.join(rootDir, filePathInput);

    // ❌ File exists?
    if (!fs.existsSync(fullPath)) {
      return api.sendMessage(
        `❌ File not found:\n${filePathInput}`,
        event.threadID,
        event.messageID
      );
    }

    try {
      const fileContent = fs.readFileSync(fullPath, "utf8");

      // ⚠️ বড় file block
      if (fileContent.length > 15000) {
        return api.sendMessage(
          "⚠️ File too large! Use smaller file.",
          event.threadID,
          event.messageID
        );
      }

      return api.sendMessage(
        {
          body: `📄 ${filePathInput}\n\n${fileContent}`
        },
        event.threadID,
        event.messageID
      );

    } catch (err) {
      console.error("FILE READ ERROR:", err);

      return api.sendMessage(
        "❌ Failed to read file.",
        event.threadID,
        event.messageID
      );
    }
  }
};
