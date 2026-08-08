const fs = require("fs-extra");
const path = require("path");
const GHOST = fs.readJsonSync(path.join(__dirname, "../../ghostConfig.json"));
const SETTINGS_PATH = path.join(process.cwd(), "data", "ghostSettings.json");

function getSettings() {
  try { return fs.readJsonSync(SETTINGS_PATH); } catch { return {}; }
}
function saveSettings(data) {
  fs.ensureDirSync(path.dirname(SETTINGS_PATH));
  fs.writeJsonSync(SETTINGS_PATH, data, { spaces: 2 });
}
function getThread(tid) {
  const s = getSettings();
  if (!s[tid]) s[tid] = { silentMode: false, silentWhitelist: [], bbyEnabled: true, stickerReply: true };
  return s[tid];
}
function saveThread(tid, threadData) {
  const s = getSettings();
  s[tid] = threadData;
  saveSettings(s);
  if (!global.GoatBot.ghostSettings) global.GoatBot.ghostSettings = {};
  global.GoatBot.ghostSettings[tid] = threadData;
}

module.exports = {
  config: {
    name: "silent",
    aliases: ["botsilent", "silentmode", "sm"],
    version: "1.0",
    author: "Rakib Islam",
    countDown: 3,
    role: 1,
    shortDescription: "Bot silent mode — admin ও whitelist ছাড়া কেউ bot চালাতে পারবে না",
    longDescription: "Silent mode চালু থাকলে শুধু admin ও whitelist এ যোগ করা মানুষরা bot command ব্যবহার করতে পারবে",
    category: "group",
    guide: "{pn} [on | off | add @user | remove @user | list | status]",
  },
  onStart: async function ({ api, event, args, message }) {
    const { threadID, senderID, mentions } = event;
    const adminBot = global.GoatBot.config.adminBot || [];
    const threadData = global.db?.allThreadData?.find(t => t.threadID == threadID);
    const adminIDs = threadData?.adminIDs || [];
    const isAdmin = adminBot.includes(senderID) || adminIDs.includes(senderID);
    if (!isAdmin) return message.reply("❌ শুধু admin এই command ব্যবহার করতে পারবে!");

    const thread = getThread(threadID);
    const cmd = (args[0] || "").toLowerCase();

    if (!cmd || cmd === "status") {
      const wlText = thread.silentWhitelist.length
        ? thread.silentWhitelist.map((id, i) => `  ${i + 1}. ${id}`).join("\n")
        : "  কেউ নেই";
      return message.reply(
        `👻 𝗚𝗵𝗼𝘀𝘁 𝗕𝗼𝘁 — Silent Mode\n` +
        `━━━━━━━━━━━━━━━━━\n\n` +
        `📌 Status: ${thread.silentMode ? "🔴 ON (Silent)" : "🟢 OFF (Normal)"}\n\n` +
        `📋 Whitelist:\n${wlText}\n\n` +
        `━━━━━━━━━━━━━━━━━\n` +
        `Commands:\n` +
        `.silent on — Bot silent করো\n` +
        `.silent off — Bot normal করো\n` +
        `.silent add @user — Whitelist এ add করো\n` +
        `.silent remove @user — Whitelist থেকে বাদ দাও\n` +
        `.silent list — Whitelist দেখো\n\n` +
        `👤 Owner: ${GHOST.ownerName}`
      );
    }

    if (cmd === "on") {
      thread.silentMode = true;
      saveThread(threadID, thread);
      return message.reply(
        `🔴 Silent Mode চালু হয়েছে!\n\n` +
        `এখন শুধু admin ও whitelist এর মানুষরা bot use করতে পারবে।\n\n` +
        `Whitelist এ add করতে: .silent add @user\n` +
        `বন্ধ করতে: .silent off`
      );
    }

    if (cmd === "off") {
      thread.silentMode = false;
      saveThread(threadID, thread);
      return message.reply(`🟢 Silent Mode বন্ধ!\n\nএখন সবাই bot use করতে পারবে।`);
    }

    if (cmd === "add" || cmd === "wl") {
      const targets = Object.keys(mentions || {});
      if (!targets.length) return message.reply("❌ @mention করো কাকে whitelist এ add করবে!");
      for (const uid of targets) {
        if (!thread.silentWhitelist.includes(uid)) thread.silentWhitelist.push(uid);
      }
      saveThread(threadID, thread);
      const names = Object.values(mentions).join(", ");
      return message.reply(`✅ Whitelist এ add হয়েছে!\n\n${names}`);
    }

    if (cmd === "remove" || cmd === "rm") {
      const targets = Object.keys(mentions || {});
      if (!targets.length) return message.reply("❌ @mention করো কাকে whitelist থেকে বাদ দেবে!");
      thread.silentWhitelist = thread.silentWhitelist.filter(id => !targets.includes(id));
      saveThread(threadID, thread);
      const names = Object.values(mentions).join(", ");
      return message.reply(`✅ Whitelist থেকে বাদ দেওয়া হয়েছে:\n\n${names}`);
    }

    if (cmd === "list") {
      if (!thread.silentWhitelist.length) {
        return message.reply(`📋 Whitelist এখন খালি!\n\n.silent add @user দিয়ে add করো।`);
      }
      return message.reply(
        `📋 Silent Mode Whitelist\n━━━━━━━━━━━━━━━━━\n\n` +
        thread.silentWhitelist.map((id, i) => `${i + 1}. ${id}`).join("\n") +
        `\n\nমোট: ${thread.silentWhitelist.length} জন`
      );
    }

    return message.reply("❓ Unknown option.\nUse: on, off, add, remove, list, status");
  }
};
