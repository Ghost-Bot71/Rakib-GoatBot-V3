module.exports = {
  config: {
    name: "docs",
    aliases: ["gdc"],
    version: "2.0",
    author: "Rakib",
    role: 4,
    shortDescription: "load command from google docs",
    longDescription: "deploy js code from google docs link (owner only)",
    category: "Bot account",
    guide: {
      en: "Reply a Google Docs link and type: docs <commandName>"
    }
  },

  onStart: async function ({ api, event, args }) {
    const axios = require("axios");
    const fs = require("fs");
    const path = require("path");

    const { messageReply, threadID, messageID } = event;
    const name = args[0];

    if (!messageReply || !name) {
      return api.sendMessage(
        "❌ Reply to a Google Docs link and use: docs <commandName>",
        threadID,
        messageID
      );
    }

    const text = messageReply.body;

    if (!text.includes("docs.google.com/document")) {
      return api.sendMessage(
        "❌ This is not a valid Google Docs link.",
        threadID,
        messageID
      );
    }

    // 📌 Extract document ID
    const match = text.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (!match) {
      return api.sendMessage(
        "❌ Cannot extract document ID.",
        threadID,
        messageID
      );
    }

    const docId = match[1];

    // 📥 Export as plain text
    const exportUrl = `https://docs.google.com/document/d/${docId}/export?format=txt`;
    const savePath = path.join(__dirname, `${name}.js`);

    try {
      const res = await axios.get(exportUrl, {
        responseType: "text",
        timeout: 15000
      });

      if (!res.data || res.data.length < 10) {
        return api.sendMessage(
          "❌ Empty or invalid document content.",
          threadID,
          messageID
        );
      }

      fs.writeFileSync(savePath, res.data, "utf-8");

      return api.sendMessage(
        `✅ Command "${name}.js" added successfully!\n👉 Use: load ${name}`,
        threadID,
        messageID
      );

    } catch (err) {
      console.error("DOCS ERROR:", err);

      return api.sendMessage(
        "❌ Failed to fetch Google Docs content.\nMake sure the doc is PUBLIC.",
        threadID,
        messageID
      );
    }
  }
};
