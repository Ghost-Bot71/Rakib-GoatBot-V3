const fs = require("fs-extra");
const path = require("path");
const SETTINGS_PATH = path.join(process.cwd(), "data", "ghostSettings.json");

function loadSettings() {
  if (!fs.existsSync(SETTINGS_PATH)) return {};
  try { return fs.readJsonSync(SETTINGS_PATH); } catch { return {}; }
}
function saveSettings(data) {
  fs.ensureDirSync(path.dirname(SETTINGS_PATH));
  fs.writeJsonSync(SETTINGS_PATH, data, { spaces: 2 });
}

module.exports = {
  config: {
    name: "secretmode",
    aliases: ["secret", "adultmode", "18mode"],
    version: "2.0", author: "Rakib Islam",
    countDown: 5, role: 1,
    shortDescription: "Secret/18+ mode toggle — Admin only 🔒",
    category: "admin", guide: { en: "{pn} on/off" }
  },
  onStart: async function ({ message, event, args }) {
    const { threadID, senderID } = event;
    const action = args[0]?.toLowerCase();
    if (!["on","off"].includes(action)) {
      const s = loadSettings();
      const current = s[threadID]?.secretMode ? "🟢 ON" : "🔴 OFF";
      return message.reply(
        `🔒 𝗦𝗲𝗰𝗿𝗲𝘁 𝗠𝗼𝗱𝗲\n━━━━━━━━━━━━━━━━\n` +
        `Current Status: ${current}\n\n` +
        `✅ .secretmode on — Enables 18+ commands\n` +
        `❌ .secretmode off — Disables 18+ commands\n\n` +
        `⚠️ Admin only command!\n👻 Ghost Net | Rakib Islam`
      );
    }
    const s = loadSettings();
    if (!s[threadID]) s[threadID] = {};
    s[threadID].secretMode = action === "on";
    saveSettings(s);
    return message.reply(
      action === "on"
        ? `🔓 Secret Mode ON!\n✅ 18+ commands are now visible!\n⚠️ Use responsibly!\n👻 Ghost Net | Rakib Islam`
        : `🔒 Secret Mode OFF!\n✅ 18+ commands are now hidden!\n👻 Ghost Net | Rakib Islam`
    );
  }
};
