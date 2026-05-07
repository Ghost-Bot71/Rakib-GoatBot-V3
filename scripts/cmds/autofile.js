const fs = require("fs");
const path = require("path");
const axios = require("axios");
const { loadBox } = require("../../rakib/customId/ownBox");

module.exports = {
  config: {
    name: "autofile",
    version: "2.0",
    author: "Rakib",
    role: 0,
    shortDescription: "Auto load js file when sent",
    longDescription: "Automatically download & load command when .js file is sent",
    category: "Bot account",
  },

  onStart: async function () {},

  onChat: async function ({ api, event }) {
    try {
      if (!event.attachments || event.attachments.length === 0) return;

      const attachment = event.attachments[0];

      // 🔒 Only allow .js file
      if (attachment.type !== "file" || !attachment.name.endsWith(".js")) return;

      // 🔥 Load allowed groups
      const ownBox = await loadBox();

      const isAllowedBox = Array.isArray(ownBox)
        ? ownBox.includes(event.threadID)
        : event.threadID === ownBox;

      // ❌ Block if not allowed group
      if (!isAllowedBox) return;

      const fileName = attachment.name;
      const filePath = path.join(__dirname, fileName);

      // 📥 Download file
      const response = await axios.get(attachment.url, {
        responseType: "arraybuffer"
      });

      fs.writeFileSync(filePath, response.data);

      // 🔄 Reload command
      delete require.cache[require.resolve(filePath)];
      require(filePath);

      // 👤 Sender info
      const senderID = event.senderID;
      let senderName = "Unknown User";

      try {
        const userInfo = await api.getUserInfo(senderID);
        senderName = userInfo[senderID]?.name || "Unknown User";
      } catch {}

      // ✅ Success message
      api.sendMessage(
        `✅ Command "${fileName}" loaded successfully!\n\n👤 Name: ${senderName}\n🆔 UID: ${senderID}`,
        event.threadID
      );

      // 📢 Notify admin groups
      if (ownBox && Array.isArray(ownBox)) {
        for (const thread of ownBox) {
          try {
            await api.sendMessage(
              `📥 New Command Loaded\n\n📄 File: ${fileName}\n👤 Name: ${senderName}\n🆔 UID: ${senderID}\n📌 From: ${event.threadID}`,
              thread
            );
          } catch (err) {
            console.log("Notify fail:", thread);
          }
        }
      }

    } catch (err) {
      console.log("AutoFile Error:", err);
    }
  }
};
