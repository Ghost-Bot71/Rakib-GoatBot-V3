module.exports.config = {
  name: "spamkick",
  version: "2.0.0",
  role: 0,
  author: "Rakib",
  usePrefix: true,
  description: {
    en: "Auto kick spammer (auto enabled on restart)"
  },
  category: "group",
  guide: {
    en: "[on/off]"
  },
  countDown: 5
};

// 🔥 AUTO ENABLE SYSTEM (IMPORTANT)
if (!global.antispam) global.antispam = new Map();

module.exports.onChat = async ({ api, event, usersData, commandName }) => {
  const { senderID, threadID } = event;

  // 👉 Always auto enable after restart
  if (!global.antispam.has(threadID)) {
    global.antispam.set(threadID, { users: {} });
  }

  const threadInfo = global.antispam.get(threadID);

  if (!(senderID in threadInfo.users)) {
    threadInfo.users[senderID] = { count: 1, time: Date.now() };
  } else {
    threadInfo.users[senderID].count++;

    const timePassed = Date.now() - threadInfo.users[senderID].time;
    const messages = threadInfo.users[senderID].count;

    const timeLimit = 80000; // 80 sec
    const messageLimit = 14;

    if (messages > messageLimit && timePassed < timeLimit) {

      // ❌ bot admin kick করবে না
      if (global.GoatBot.config.adminBot.includes(senderID)) return;

      api.removeUserFromGroup(senderID, threadID, async (err) => {
        if (err) return console.error(err);

        const name = await usersData.getName(senderID);

        api.sendMessage({
          body: `🚫 ${name} has been removed for spamming.\nUID: ${senderID}\n👉 React to add again.`
        }, threadID, (error, info) => {

          global.GoatBot.onReaction.set(info.messageID, {
            commandName,
            uid: senderID,
            messageID: info.messageID
          });

        });
      });

      // reset
      threadInfo.users[senderID] = { count: 1, time: Date.now() };

    } else if (timePassed > timeLimit) {
      threadInfo.users[senderID] = { count: 1, time: Date.now() };
    }
  }

  global.antispam.set(threadID, threadInfo);
};

module.exports.onReaction = async ({ api, event, Reaction, threadsData, usersData, role }) => {
  const { uid, messageID } = Reaction;

  if (role < 1) return;

  const { adminIDs, approvalMode } = await threadsData.get(event.threadID);
  const botID = api.getCurrentUserID();

  try {
    await api.addUserToGroup(uid, event.threadID);

    if (approvalMode === true && !adminIDs.includes(botID)) {
      await api.unsendMessage(messageID);
    } else {
      await api.unsendMessage(messageID);
    }

  } catch (err) {
    console.log("Failed to re-add user");
  }
};

module.exports.onStart = async ({ api, event, args }) => {
  switch (args[0]) {

    case "on":
      if (!global.antispam) global.antispam = new Map();
      global.antispam.set(event.threadID, { users: {} });
      api.sendMessage("✅ Spam kick is ON (Auto enabled always).", event.threadID);
      break;

    case "off":
      if (global.antispam.has(event.threadID)) {
        global.antispam.delete(event.threadID);
        api.sendMessage("❌ Spam kick OFF (But will auto ON after restart 😏)", event.threadID);
      } else {
        api.sendMessage("Already OFF", event.threadID);
      }
      break;

    default:
      api.sendMessage("Use: spamkick on / off", event.threadID);
  }
};
