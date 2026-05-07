const { loadBox } = require("../../rakib/customId/ownBox");

module.exports = {
config: {
name: "botsts",
aliases: [],
version: "4.1",
author: "Rakib",
countDown: 5,
role: 0,
shortDescription: "Bot add/remove log",
longDescription: "Log bot add/remove with reason",
category: "System",
},

onEvent: async function ({ event, api }) {

async function getUserName(uid) {
  try {
    const info = await api.getUserInfo(uid);
    return info[uid]?.name || "Unknown User";
  } catch {
    return "Unknown User";
  }
}

async function getBotStatus(threadID) {
  try {
    await api.sendMessage("⏳ Checking...", threadID);
    return "RUNNING ✅";
  } catch {
    return "PENDING ⏳";
  }
}

// 🔥 Load admin groups
const ownBox = await loadBox();
if (!ownBox || ownBox.length === 0) return;

// =========================
// ✅ BOT ADDED
// =========================
if (
  event.logMessageType === "log:subscribe" &&
  event.logMessageData.addedParticipants?.some(
    (user) => user.userFbId == api.getCurrentUserID()
  )
) {
  try {
    const threadInfo = await api.getThreadInfo(event.threadID);

    const groupName = threadInfo.threadName || "Unnamed Group";
    const memberCount = threadInfo.participantIDs.length;

    const adderID = event.author || "Unknown";
    const adderName = await getUserName(adderID);

    const status = await getBotStatus(event.threadID);

    const msg =
      `✅ BOT ADDED\n\n` +
      `📌 Group: ${groupName}\n` +
      `🆔 Thread ID: ${event.threadID}\n` +
      `👥 Members: ${memberCount}\n` +
      `⚙️ Status: ${status}\n\n` +
      `➕ Added By:\n` +
      `👤 Name: ${adderName}\n` +
      `🆔 UID: ${adderID}`;

    for (const threadID of ownBox) {
      try {
        await api.sendMessage(msg, threadID);
      } catch (e) {
        console.log("Send fail:", threadID);
      }
    }

  } catch (e) {
    console.log("Add log error:", e);
  }
}

// =========================
// ❌ BOT LEFT / REMOVED
// =========================
if (
  event.logMessageType === "log:unsubscribe" &&
  event.logMessageData.leftParticipantFbId ==
    api.getCurrentUserID()
) {
  try {
    const threadInfo = await api.getThreadInfo(event.threadID);
    const groupName = threadInfo.threadName || "Unknown Group";

    const authorID = event.author || "Unknown";
    const authorName = await getUserName(authorID);

    let reason = "UNKNOWN";

    if (authorID == api.getCurrentUserID()) {
      reason = "SELF LEFT 🤖";
    } else if (authorID !== "Unknown") {
      reason = "REMOVED BY ADMIN 🚫";
    }

    const msg =
      `❌ BOT LEFT\n\n` +
      `📌 Group: ${groupName}\n` +
      `🆔 Thread ID: ${event.threadID}\n` +
      `📊 Reason: ${reason}\n\n` +
      `👤 Action By:\n` +
      `👤 Name: ${authorName}\n` +
      `🆔 UID: ${authorID}`;

    for (const threadID of ownBox) {
      try {
        await api.sendMessage(msg, threadID);
      } catch (e) {
        console.log("Send fail:", threadID);
      }
    }

  } catch (e) {
    console.log("Leave log error:", e);
  }
}

},

onStart: async function ({ event, api }) {
return api.sendMessage(
"🤖 Bot Status Logger Active ✅",
event.threadID,
event.messageID
);
},
};
