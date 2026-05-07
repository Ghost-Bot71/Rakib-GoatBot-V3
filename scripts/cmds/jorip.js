const { loadOwner } = require("../../rakib/customId/ownerUid");
const { loadBox } = require("../../rakib/customId/ownBox");

module.exports = {
  config: {
    name: "jorip",
    aliases: ["survey"],
    version: "13.0",
    author: "Rakib",
    countDown: 5,
    role: 0,
    category: "system"
  },

  langs: {
    en: {
      notOwner: "❌ Owner only command.",
      noContent: "Please provide survey text."
    },
    bn: {
      notOwner: "❌ এই কমান্ড শুধু Owner ব্যবহার করতে পারবে।",
      noContent: "কমান্ডের পরে জোরিপ লিখো।"
    }
  },

  // ================= START =================
  onStart: async function ({ api, message, event, args, threadsData, getLang }) {

    // 🔥 load owner UID
    const ownerUIDsRaw = await loadOwner();

    const ownerUIDs = Array.isArray(ownerUIDsRaw)
      ? ownerUIDsRaw.map(String)
      : [String(ownerUIDsRaw)];

    const senderID = String(event.senderID);

    if (!ownerUIDs.includes(senderID))
      return message.reply(getLang("notOwner"));

    let content = args.join(" ").trim();
    if (!content && event.messageReply?.body)
      content = event.messageReply.body;

    if (!content)
      return message.reply(getLang("noContent"));

    const progressMsg = await message.reply("🚀 Jorip starting...");

    let allThreads = [];
    try {
      if (threadsData?.getAll)
        allThreads = await threadsData.getAll();
    } catch {}

    if ((!allThreads || allThreads.length === 0) && global.db?.allThreadData)
      allThreads = global.db.allThreadData;

    if (!allThreads || allThreads.length === 0)
      return api.editMessage("❌ No thread data found.", progressMsg.messageID);

    const targets = allThreads
      .filter(t => !(t.banned?.status || t.data?.banned?.status))
      .map(t => t.threadID || t.id)
      .filter(Boolean);

    const total = targets.length;
    let sent = 0;
    let failed = 0;
    let editCount = 0;

    const surveyBody =
      "📊 𝐉𝐎𝐑𝐈𝐏\n\n" +
      content +
      "\n\n👉 Reply to this message to give your opinion.";

    for (const tid of targets) {

      api.sendMessage(surveyBody, tid, (err, info) => {

        if (!err && info?.messageID) {
          global.GoatBot.onReply.set(info.messageID, {
            commandName: this.config.name,
            type: "joripReply"
          });
          sent++;
        } else failed++;

        const processed = sent + failed;

        if (processed % 50 === 0 && editCount < 5) {
          editCount++;
          api.editMessage(
            `📡 Progress\nTotal: ${total}\nProcessed: ${processed}`,
            progressMsg.messageID
          );
        }

        if (processed === total) {
          api.editMessage(
            `✅ Completed!\nTotal: ${total}\nSent: ${sent}\nFailed: ${failed}`,
            progressMsg.messageID
          );
        }
      });

      await new Promise(r => setTimeout(r, 120));
    }
  },

  // ================= REPLY SYSTEM =================
  onReply: async function ({ api, event, Reply, usersData, threadsData }) {

    const senderID = String(event.senderID);
    const threadID = event.threadID;
    const text = event.body || "(no text)";

    // 🔥 load owner + admin box
    const ownerUIDsRaw = await loadOwner();
    const adminBoxesRaw = await loadBox();

    const ownerUIDs = Array.isArray(ownerUIDsRaw)
      ? ownerUIDsRaw.map(String)
      : [String(ownerUIDsRaw)];

    const adminThreadIDs = Array.isArray(adminBoxesRaw)
      ? adminBoxesRaw.map(String)
      : [String(adminBoxesRaw)];

    // ================= USER SIDE =================
    if (Reply.type === "joripReply" || Reply.type === "ownerReplyBack") {

      let userName = "User";
      let threadName = "Unknown Group";

      try { userName = await usersData.getName(senderID); } catch {}
      try {
        const info = await threadsData.get(threadID);
        threadName = info?.threadName || "Unknown Group";
      } catch {}

      const forwardText =
        "📩 𝐉𝐎𝐑𝐈𝐏 𝐑𝐄𝐒𝐏𝐎𝐍𝐒𝐄\n\n" +
        "👤 User: " + userName + "\n" +
        "👥 Group: " + threadName + "\n\n" +
        "💬 " + text;

      for (const adminID of adminThreadIDs) {
        api.sendMessage(forwardText, adminID, (err, info) => {
          if (!err && info?.messageID) {
            global.GoatBot.onReply.set(info.messageID, {
              commandName: this.config.name,
              type: "ownerReply",
              originalThreadID: threadID,
              originalUserID: senderID,
              originalMessage: text
            });
          }
        });
      }

      return api.setMessageReaction("✅", event.messageID, () => {}, true);
    }

    // ================= OWNER SIDE =================
    if (Reply.type === "ownerReply") {

      if (!ownerUIDs.includes(senderID)) return;

      const targetThread = Reply.originalThreadID;
      const targetUser = Reply.originalUserID;
      const originalMessage = Reply.originalMessage || "";

      let userName = "User";
      try { userName = await usersData.getName(targetUser); } catch {}

      const mentionTag = `@${userName}`;

      const bodyText =
        "📢 𝐎𝐖𝐍𝐄𝐑 𝐑𝐄𝐏𝐋𝐘\n\n" +
        "🔁 Replying to:\n" +
        `"${originalMessage}"\n\n` +
        `${mentionTag}\n\n` +
        text;

      api.sendMessage({
        body: bodyText,
        mentions: [{
          id: targetUser,
          tag: mentionTag
        }]
      }, targetThread, (err, info) => {

        if (!err && info?.messageID) {
          global.GoatBot.onReply.set(info.messageID, {
            commandName: this.config.name,
            type: "ownerReplyBack"
          });
        }
      });

      return api.setMessageReaction("✅", event.messageID, () => {}, true);
    }
  }
};
