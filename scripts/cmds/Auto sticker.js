const fs = require("fs-extra");
const path = require("path");
const SETTINGS_PATH = path.join(process.cwd(), "data", "ghostSettings.json");
const GHOST = fs.readJsonSync(path.join(__dirname, "../../ghostConfig.json"));

function getThreadSettings(tid) {
  try {
    const s = fs.readJsonSync(SETTINGS_PATH);
    return s[tid] || { stickerReply: true };
  } catch { return { stickerReply: true }; }
}
function saveThreadSettings(tid, obj) {
  try {
    fs.ensureDirSync(path.dirname(SETTINGS_PATH));
    const s = fs.existsSync(SETTINGS_PATH) ? fs.readJsonSync(SETTINGS_PATH) : {};
    s[tid] = { ...(s[tid] || {}), ...obj };
    fs.writeJsonSync(SETTINGS_PATH, s, { spaces: 2 });
    if (!global.GoatBot.ghostSettings) global.GoatBot.ghostSettings = {};
    global.GoatBot.ghostSettings[tid] = s[tid];
  } catch {}
}

const STICKER_LIST = [
  "997237917529747","610031329418350","610502019371281","610569272697889",
  "610569976031152","476425823021014","476426593020937","476429343020662",
  "476425429687720","1303078524468983","1303078351135667","1303076361135866",
  "1303077221135780","587748556953567","587538733641216","587532536975169",
  "587534000308356","8298078730277844","2041012262792914","788171644590353",
  "2041021119458695","456545803421865","2041015016125972","456536873422758",
  "456539756755803","456538446755934","456537923422653","551710548197410",
  "3258106924322842","3258108400989361","529234074205621","2041012539459553",
  "2041012109459596","2041011389459668","2041011836126290","2041012406126233"
];

const GIF_URLS = [
  "https://media.giphy.com/media/ICOgUNjpvO0PC/giphy.gif",
  "https://media.giphy.com/media/l0HlBO7eyXzSZkJri/giphy.gif",
  "https://media.giphy.com/media/5GoVLqeAOo6PK/giphy.gif",
  "https://media.giphy.com/media/3oEjHAUOqG3lSS0f1C/giphy.gif",
  "https://media.giphy.com/media/AcfTF7tyikWyroP0x7/giphy.gif"
];

module.exports = {
  config: {
    name: "autosticker",
    aliases: ["sticker", "stickerreply", "sr"],
    version: "5.0",
    author: "Rakib Islam",
    countDown: 1,
    role: 0,
    description: "Sticker/GIF reply with on/off toggle per group.",
    category: "group",
    guide: "{pn} [on | off | status]"
  },

  onStart: async function ({ api, event, args, message }) {
    const { threadID, senderID } = event;
    const adminBot = global.GoatBot.config.adminBot || [];
    const threadData = global.db?.allThreadData?.find(t => t.threadID == threadID);
    const adminIDs = threadData?.adminIDs || [];
    const isAdmin = adminBot.includes(senderID) || adminIDs.includes(senderID);
    if (!isAdmin) return message.reply("❌ শুধু admin এই command ব্যবহার করতে পারবে!");

    const cmd = (args[0] || "status").toLowerCase();
    const settings = getThreadSettings(threadID);

    if (cmd === "on") {
      saveThreadSettings(threadID, { stickerReply: true });
      return message.reply(`✅ Sticker/GIF Auto-Reply চালু!\n\nএখন কেউ sticker বা GIF পাঠালে bot reply দেবে।\n\n👻 Ghost Bot — ${GHOST.ownerName}`);
    }
    if (cmd === "off") {
      saveThreadSettings(threadID, { stickerReply: false });
      return message.reply(`❌ Sticker/GIF Auto-Reply বন্ধ!\n\n👻 Ghost Bot — ${GHOST.ownerName}`);
    }
    return message.reply(
      `🎭 Sticker/GIF Auto-Reply\n━━━━━━━━━━━━━━━━━\n\n` +
      `📌 Status: ${settings.stickerReply !== false ? "🟢 ON" : "🔴 OFF"}\n\n` +
      `.sticker on — চালু করো\n.sticker off — বন্ধ করো\n\n👻 Ghost Bot — ${GHOST.ownerName}`
    );
  },

  onChat: async function ({ api, event }) {
    const { attachments, threadID, messageID, senderID } = event;
    if (!attachments || !attachments.length) return;
    if (api.getCurrentUserID() === senderID) return;

    const settings = getThreadSettings(threadID);
    if (settings.stickerReply === false) return;

    const att = attachments[0];
    const isSticker = att.type === "sticker";
    const isGif = att.type === "animated_image" || (att.type === "photo" && att.animated) || (att.url && att.url.includes(".gif"));

    if (isSticker) {
      const randomSticker = STICKER_LIST[Math.floor(Math.random() * STICKER_LIST.length)];
      return api.sendMessage({ sticker: randomSticker }, threadID, messageID);
    }

    if (isGif) {
      const randomSticker = STICKER_LIST[Math.floor(Math.random() * STICKER_LIST.length)];
      return api.sendMessage({ sticker: randomSticker }, threadID, messageID);
    }
  }
};
