const { loadOwner } = require("../../rakib/customId/ownerUid");

module.exports = {
  config: {
    name: "debug",
    aliases: ["dg"],
    version: "2.0",
    author: "Rakib",
    role: 0,
    shortDescription: "Debug why bot not working in this chat",
    longDescription: "Diagnose bot permission, request & thread issues",
    category: "Utility"
  },

  onStart: async function ({ event, api }) {

    // 🔒 Owner Check (dynamic + multi support)
    const ownerUID = await loadOwner();
    const isOwner = Array.isArray(ownerUID)
      ? ownerUID.includes(String(event.senderID))
      : String(event.senderID) === String(ownerUID);

    if (!isOwner) {
      return api.sendMessage(
        "❌ এই কমান্ডটি শুধু Bot Owner ব্যবহার করতে পারবেন।",
        event.threadID,
        event.messageID
      );
    }

    const threadID = event.threadID;
    let report = "🧪 BOT DEBUG REPORT\n";
    report += "━━━━━━━━━━━━━━━━━━\n";

    /* 1️⃣ Thread Info */
    let threadInfo;
    try {
      threadInfo = await api.getThreadInfo(threadID);

      report += "📌 Thread Info: OK\n";
      report += `• Name: ${threadInfo.threadName || "Inbox"}\n`;
      report += `• Type: ${threadInfo.isGroup ? "Group Chat" : "Inbox"}\n`;
      report += `• Members: ${threadInfo.participantIDs.length}\n`;

    } catch (e) {
      report += "❌ Thread Info: FAILED\n";
      report += "➡️ Possible reasons:\n";
      report += "• Message request not accepted\n";
      report += "• Bot blocked or restricted\n";

      return api.sendMessage(report, threadID, event.messageID);
    }

    /* 2️⃣ Bot Admin Check */
    let isAdminNow = true;

    if (threadInfo.isGroup) {
      const botID = api.getCurrentUserID();

      isAdminNow = threadInfo.adminIDs
        .map(e => e.id)
        .includes(botID);

      report += `\n👑 Bot Admin: ${isAdminNow ? "YES" : "NO ❌"}\n`;

      if (!isAdminNow) {
        report += "➡️ Bot admin না হলে কিছু command কাজ করবে না\n";
      }
    }

    /* 3️⃣ Bot Mute Check */
    if (threadInfo.muteUntil && threadInfo.muteUntil > Date.now()) {
      report += "\n🔇 Bot Muted: YES ❌\n";
    } else {
      report += "\n🔊 Bot Muted: NO\n";
    }

    /* 4️⃣ Send Message Test */
    let sendTest = true;

    try {
      const testMsg = await api.sendMessage(
        "🧪 Debug test message (auto-delete)",
        threadID
      );

      // auto delete after 3 sec
      setTimeout(() => {
        api.unsendMessage(testMsg.messageID);
      }, 3000);

    } catch (e) {
      sendTest = false;
    }

    report += `\n📨 Send Message Test: ${sendTest ? "OK" : "FAILED ❌"}\n`;

    /* 5️⃣ Final Diagnosis */
    report += "\n━━━━━━━━━━━━━━━━━━\n";
    report += "🧠 DIAGNOSIS:\n";

    if (!sendTest) {
      report += "❌ Bot cannot send message\n";
      report += "➡️ Possible reasons:\n";
      report += "• Message request not accepted\n";
      report += "• Bot restricted / blocked by Facebook\n";
    } 
    else if (threadInfo.isGroup && !isAdminNow) {
      report += "⚠️ Bot is not admin\n";
      report += "➡️ Ask group admin to make bot admin\n";
    } 
    else {
      report += "✅ Bot should work normally here\n";
      report += "➡️ If still not working, FB silent block possible\n";
    }

    return api.sendMessage(report, threadID, event.messageID);
  }
};
