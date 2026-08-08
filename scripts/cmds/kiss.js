const axios = require("axios");
const fs = require("fs");
const path = require("path");

const getApiBase = async () => {
  try {
    const base = await axios.get(
      "https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json",
      { timeout: 8000 }
    );
    return base.data.mahmud;
  } catch {
    return "https://hinata-api.vercel.app";
  }
};

module.exports = {
  config: {
    name: "kiss",
    version: "2.0",
    author: "Rakib Islam",
    countDown: 5,
    role: 0,
    longDescription: "Generate anime-style kiss image",
    category: "love",
    guide: "{pn} @mention or reply"
  },

  onStart: async function ({ message, event, api }) {
    try {
      const { mentions, messageReply, senderID, threadID, messageID } = event;

      let targetID;
      const mentionKeys = Object.keys(mentions || {});
      if (mentionKeys.length > 0) {
        targetID = mentionKeys[0];
      } else if (messageReply?.senderID) {
        targetID = messageReply.senderID;
      }

      if (!targetID) {
        return message.reply("💋 @mention করুন অথবা কারো message এ reply দিন!\nExample: .kiss @name");
      }
      if (targetID === senderID) {
        return message.reply("😅 নিজেকে kiss করা যাবে না!");
      }

      const base = await getApiBase();
      const apiURL = `${base}/api/kiss`;

      const response = await axios.post(
        apiURL,
        { senderID, targetID },
        { responseType: "arraybuffer", timeout: 15000 }
      );

      const imgPath = path.join(__dirname, `kiss_${senderID}_${targetID}.png`);
      fs.writeFileSync(imgPath, Buffer.from(response.data, "binary"));

      const targetInfo = await api.getUserInfo(targetID);
      const targetName = targetInfo[targetID]?.name || "Friend";

      message.reply({
        body: `💋 ${targetName} কে kiss করা হলো!`,
        attachment: fs.createReadStream(imgPath),
        mentions: [{ tag: targetName, id: targetID }]
      });

      setTimeout(() => { try { fs.unlinkSync(imgPath); } catch {} }, 10000);

    } catch (err) {
      console.error("KISS ERROR:", err.message);
      message.reply("❌ Kiss image তৈরিতে সমস্যা হয়েছে। আবার try করুন!");
    }
  }
};
