const axios = require("axios");

module.exports = {
  config: {
    name: "reboot",
    version: "2.0",
    author: "Rakib Islam",
    aliases: ["restart2", "botreboot", "hardrestart"],
    countDown: 5,
    role: 2,
    shortDescription: "Bot reboot with animated status GIF",
    longDescription: "Restarts the Ghost Bot with an animated loading GIF and countdown",
    category: "admin",
    guide: { en: "{pn} — Reboot Ghost Bot" }
  },

  onStart: async function ({ message }) {
    const gif = "https://media.tenor.com/7Sv6qCJbqhsAAAAC/ghost-loading.gif";
    try {
      const res = await axios.get(gif, { responseType: "arraybuffer", timeout: 8000 });
      const { PassThrough } = require("stream");
      const s = new PassThrough(); s.end(Buffer.from(res.data));
      await message.reply({
        body: "🔄 ɢʜᴏꜱᴛ ʙᴏᴛ ʀᴇʙᴏᴏᴛɪɴɢ...\n\n⏳ Please wait 30 seconds\n👻 Ghost Bot will be back online shortly!\n\n🔥 Signed by: Rakib Islam",
        attachment: s
      });
    } catch {
      await message.reply("🔄 Rebooting Ghost Bot...");
    }

    setTimeout(() => process.exit(1), 3000);
  }
};
