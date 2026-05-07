const { loadOwner } = require("../../rakib/customId/ownerUid");

module.exports = {
  config: {
    name: "loadfile",
    aliases: ["glc"],
    version: "4.0",
    author: "Rakib",
    role: 0,
    shortDescription: "load file anywhere",
    longDescription: "load JS file from Google Docs to root or custom path (owner only)",
    category: "Bot account",
    guide: {
      en: "Reply docs link & type:\nloadfile uid.js\nor\nloadfile rakib/customId/ownBox.js"
    }
  },

  onStart: async function ({ api, event, args }) {

    const axios = require("axios");
    const fs = require("fs");
    const path = require("path");

    const { threadID, messageID, messageReply } = event;

    // 🔒 Owner check
    const ownerUID = await loadOwner();
    const isOwner = Array.isArray(ownerUID)
      ? ownerUID.includes(String(event.senderID))
      : String(event.senderID) === String(ownerUID);

    if (!isOwner) {
      return api.sendMessage("❌ You are not allowed.", threadID, messageID);
    }

    // ❌ Input check
    if (!messageReply || !args[0]) {
      return api.sendMessage(
        "❌ Usage:\nloadfile uid.js\nor\nloadfile rakib/customId/ownBox.js",
        threadID,
        messageID
      );
    }

    const inputPath = args[0];

    // 🔐 Security check
    if (inputPath.includes("..")) {
      return api.sendMessage("❌ Invalid path!", threadID, messageID);
    }

    // 📌 Validate file extension
    if (!inputPath.endsWith(".js")) {
      return api.sendMessage("❌ Only .js files allowed!", threadID, messageID);
    }

    const text = messageReply.body;

    if (!text.includes("docs.google.com/document")) {
      return api.sendMessage("❌ Invalid Google Docs link.", threadID, messageID);
    }

    // 📌 Extract doc ID
    const match = text.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (!match) {
      return api.sendMessage("❌ Cannot extract document ID.", threadID, messageID);
    }

    const docId = match[1];
    const exportUrl = `https://docs.google.com/document/d/${docId}/export?format=txt`;

    try {
      const res = await axios.get(exportUrl, {
        responseType: "text",
        timeout: 15000
      });

      const code = res.data;

      if (!code || code.length < 20) {
        return api.sendMessage("❌ Empty document.", threadID, messageID);
      }

      // 📁 Root directory (repo root)
      const rootDir = path.join(__dirname, "../../..");

      // 📌 Final path
      const savePath = path.join(rootDir, inputPath);

      // ❌ Prevent nested file confusion
      if (inputPath.split("/").some(p => p.includes(".")) && !inputPath.endsWith(".js")) {
        return api.sendMessage("❌ Invalid file path.", threadID, messageID);
      }

      // 📂 Ensure folder exists
      const folderDir = path.dirname(savePath);
      if (!fs.existsSync(folderDir)) {
        fs.mkdirSync(folderDir, { recursive: true });
      }

      // ❌ Prevent overwrite
      if (fs.existsSync(savePath)) {
        return api.sendMessage(
          `⚠️ File already exists:\n${inputPath}\n❌ Skipped (no overwrite).`,
          threadID,
          messageID
        );
      }

      // 💾 Save file
      fs.writeFileSync(savePath, code, "utf-8");

      return api.sendMessage(
        `✅ File loaded successfully!\n📂 ${inputPath}`,
        threadID,
        messageID
      );

    } catch (err) {
      console.error("LOADFILE ERROR:", err);
      return api.sendMessage(
        "❌ Failed to fetch Docs. Make sure it's PUBLIC.",
        threadID,
        messageID
      );
    }
  }
};
