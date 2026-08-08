const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "trigger",
    version: "1.3",
    author: "Rakib Islam",
    countDown: 5,
    role: 0,
    shortDescription: "Trigger image",
    longDescription: "Trigger image (tag, reply, or yourself)",
    category: "fun",
    guide: {
      vi: "{pn} [@tag | reply | để trống]",
      en: "{pn} [@tag | reply | empty]"
    }
  },

  onStart: async function ({ event, message, usersData }) {
    let uid;

    if (Object.keys(event.mentions).length > 0) {
      uid = Object.keys(event.mentions)[0];
    } else if (event.type === "message_reply") {
      uid = event.messageReply.senderID;
    } else {
      uid = event.senderID;
    }

    try {
      const avatarURL = await usersData.getAvatarUrl(uid);
      const url = `https://some-random-api.com/canvas/misc/triggered?avatar=${encodeURIComponent(avatarURL)}`;
      const res = await axios.get(url, { responseType: "arraybuffer", timeout: 10000 });
      const tmpDir = path.join(__dirname, "tmp");
      fs.ensureDirSync(tmpDir);
      const pathSave = path.join(tmpDir, `${uid}_Trigger.gif`);
      fs.writeFileSync(pathSave, Buffer.from(res.data));
      message.reply({ attachment: fs.createReadStream(pathSave) }, () => {
        try { fs.unlinkSync(pathSave); } catch {}
      });
    } catch (e) {
      message.reply("❌ Trigger command failed: " + e.message);
    }
  }
};
