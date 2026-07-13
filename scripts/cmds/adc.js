module.exports = {
  config: {
    name: "adc",
    aliases: ["adc"],
    version: "2.0",
    author: "Rakib",
    countDown: 5,
    role: 4,
    shortDescription: {
      en: "Apply command from Google Drive (.txt)"
    },
    longDescription: {
      en: "Owner only – apply/update command files from Drive"
    },
    category: "Bot account",
    guide: {
      en: "{pn} <commandName> (reply to Drive txt link)"
    }
  },

  onStart: async function ({ api, event, args }) {
    const fs = require("fs");
    const path = require("path");
    const axios = require("axios");

    const { threadID, messageID, messageReply, type } = event;
    const fileName = args[0];

    if (!fileName) {
      return api.sendMessage(
        "❌ | Usage: reply Drive .txt link and type: adc <commandName>",
        threadID,
        messageID
      );
    }

    if (type !== "message_reply" || !messageReply?.body) {
      return api.sendMessage(
        "❌ | Please reply to a Google Drive .txt file link.",
        threadID,
        messageID
      );
    }

    const driveLink = messageReply.body;

    if (!driveLink.includes("drive.google")) {
      return api.sendMessage(
        "❌ | This is not a Google Drive link.",
        threadID,
        messageID
      );
    }

    // 🔍 Extract file ID
    const idMatch = driveLink.match(/[-\w]{25,}/);
    if (!idMatch) {
      return api.sendMessage(
        "❌ | Invalid Google Drive link.",
        threadID,
        messageID
      );
    }

    const fileID = idMatch[0];
    const downloadURL = `https://drive.google.com/uc?id=${fileID}&export=download`;
    const savePath = path.join(__dirname, `${fileName}.js`);

    try {
      const res = await axios.get(downloadURL, {
        responseType: "arraybuffer",
        timeout: 15000
      });

      fs.writeFileSync(savePath, res.data);

      return api.sendMessage(
        `✅ | Applied successfully!\n📄 File: ${fileName}.js\n👉 Now type: load ${fileName}`,
        threadID,
        messageID
      );

    } catch (err) {
      console.error("ADC error:", err);

      return api.sendMessage(
        `❌ | Failed to apply ${fileName}.js`,
        threadID,
        messageID
      );
    }
  }
};
