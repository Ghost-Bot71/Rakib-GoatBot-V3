const fs = require("fs-extra");
const path = require("path");
const GHOST = fs.readJsonSync(path.join(__dirname, "../../ghostConfig.json"));

module.exports = {
  config: {
    name: "restart", aliases: ["reboot"],
    version: "1.0", author: "Rakib Islam", countDown: 5, role: 2,
    shortDescription: "Bot restart করো", longDescription: "Ghost Bot কে restart করো (owner only)",
    category: "owner", guide: "{pn}",
  },
  onStart: async function ({ message, event }) {
    await message.reply(`🔄 Ghost Bot restarting...\n\n👻 ${GHOST.botName} — ${GHOST.ownerName}`);
    setTimeout(() => process.exit(2), 2000);
  }
};
