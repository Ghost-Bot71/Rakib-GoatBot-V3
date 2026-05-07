module.exports = {
  config: {
    name: "gchat",
    aliases: ["gcchat"],
    version: "18.0",
    author: "Rakib",
    countDown: 5,
    role: 0,
    category: "system"
  },

  langs: {
    en: { noContent: "Please provide survey text." },
    bn: { noContent: "কমান্ডের পরে জোরিপ লিখো।" }
  },

  // ================= START =================
  onStart: async function ({ api, message, event, args, threadsData, getLang }) {

    const adminThreadID = event.threadID;

    let content = args.join(" ").trim();
    if (!content && event.messageReply?.body)
      content = event.messageReply.body;

    if (!content)
      return message.reply(getLang("noContent"));

    const progressMsg = await message.reply("🚀 𝐆-𝐂𝐇𝐀𝐓 𝐒𝐓𝐀𝐑𝐓𝐈𝐍𝐆...");

    let allThreads = [];

    try {
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

    const surveyBody =
      "📩 𝐆𝐋𝐎𝐁𝐀𝐋 𝐂𝐇𝐀𝐓\n\n" +
      content +
      "\n\n👉 Reply to this message to give your opinion.";

    let success = 0;
    let fail = 0;

    for (const tid of targets) {

      await new Promise(resolve => {

        api.sendMessage(surveyBody, tid, (err, info) => {

          if (!err && info?.messageID) {

            success++;

            global.GoatBot.onReply.set(info.messageID, {
              commandName: this.config.name,
              type: "joripReply",
              adminThreadID,
              originalMessage: content
            });

          } else fail++;

          resolve();
        });

      });

      await new Promise(r => setTimeout(r, 120));
    }

    api.editMessage(
      `✅ G-CHAT FINISHED\n\n📤 Sent: ${success}\n❌ Failed: ${fail}`,
      progressMsg.messageID
    );
  },

  // ================= REPLY SYSTEM =================
  onReply: async function ({ api, event, Reply, usersData, threadsData }) {

    const senderID = String(event.senderID);
    const threadID = event.threadID;
    const text = event.body || "(no text)";

    let senderName = "User";
    let currentGroupName = "Unknown Group";

    try {
      senderName = await usersData.getName(senderID);
    } catch {}

    try {
      const info = await threadsData.get(threadID);
      currentGroupName = info?.threadName || "Unknown Group";
    } catch {}

    const previousMessage =
      Reply.originalMessage || "(no previous message)";

    const formattedMessage =
      "📢 𝐆-𝐂𝐇𝐀𝐓 𝐑𝐄𝐏𝐋𝐘\n\n" +
      "👤 From: " + senderName + "\n" +
      "👥 Group: " + currentGroupName + "\n\n" +
      "🔁 Replying to:\n" +
      `"${previousMessage}"\n\n` +
      text;

    // ================= USER → ADMIN =================
    if (Reply.type === "joripReply" || Reply.type === "ownerReplyBack") {

      api.sendMessage(formattedMessage, Reply.adminThreadID, (err, info) => {

        if (!err && info?.messageID) {

          global.GoatBot.onReply.set(info.messageID, {
            commandName: this.config.name,
            type: "ownerReply",
            originalThreadID: threadID,
            originalUserID: senderID,
            adminThreadID: Reply.adminThreadID,
            originalMessage: text
          });

        }

      });

      return api.setMessageReaction("✅", event.messageID, () => {}, true);
    }

    // ================= ADMIN → USER =================
    if (Reply.type === "ownerReply") {

      const targetThread = Reply.originalThreadID;
      const targetUser = Reply.originalUserID;

      api.sendMessage({
        body: formattedMessage,
        mentions: [{
          id: targetUser,
          tag: `@${await usersData.getName(targetUser)}`
        }]
      }, targetThread, (err, info) => {

        if (!err && info?.messageID) {

          global.GoatBot.onReply.set(info.messageID, {
            commandName: this.config.name,
            type: "ownerReplyBack",
            adminThreadID: Reply.adminThreadID,
            originalMessage: text
          });

        }

      });

      return api.setMessageReaction("✅", event.messageID, () => {}, true);
    }
  }
};
