module.exports = {
  config: {
    name: "spamkick",
    version: "3.0",
    author: "Rakib",
    role: 1,
    description: {
      en: "Kick users who spam emojis"
    },
    category: "box chat",
    guide: {
      en: "{pn} off/on"
    }
  },

  onStart: async ({ api, event, args }) => {
    if (!global.emojiSpam) global.emojiSpam = new Map();

    if (args[0] == "off") {
      global.emojiSpam.set(event.threadID, { off: true, users: {} });
      return api.sendMessage("❎ | Emoji Spam Kick disabled.", event.threadID);
    }

    if (args[0] == "on") {
      global.emojiSpam.set(event.threadID, { off: false, users: {} });
      return api.sendMessage("✅ | Emoji Spam Kick enabled.", event.threadID);
    }

    return api.sendMessage("Use: spamkick off / on", event.threadID);
  },

  onEvent: async ({ api, event, usersData }) => {
  const { threadID, senderID, body, attachments } = event;

  if (!global.emojiSpam) global.emojiSpam = new Map();

  // default ON
  if (!global.emojiSpam.has(threadID)) {
    global.emojiSpam.set(threadID, { off: false, users: {} });
  }

  const threadData = global.emojiSpam.get(threadID);
  if (threadData.off) return;

  if (!threadData.users[senderID]) {
    threadData.users[senderID] = {
      count: 0,
      time: Date.now(),
      warn: 0
    };
  }

  const user = threadData.users[senderID];

  const emojiRegex = /\p{Emoji}/gu;
  const onlyEmoji = body ? body.replace(emojiRegex, "").trim() === "" : false;

  const isGif = attachments?.some(att => att.type === "animated_image");
  const isSticker = attachments?.some(att => att.type === "sticker");

  if (!onlyEmoji && !isGif && !isSticker) return;

  user.count++;

  const limit = 8;
  const timeLimit = 15000;

  if (Date.now() - user.time > timeLimit) {
    user.count = 1;
    user.time = Date.now();
    return;
  }

  if (user.count >= limit) {

    const threadInfo = await api.getThreadInfo(threadID);

    const isAdmin = threadInfo.adminIDs.some(a => a.id == senderID);
    const isOwner = global.GoatBot.config.ownerBot.includes(senderID);

    if (isAdmin || isOwner) return;

    user.warn++;

    if (user.warn >= 3) {
      api.removeUserFromGroup(senderID, threadID);
      return api.sendMessage(
        `🚫 ${await usersData.getName(senderID)} kicked for spam`,
        threadID
      );
    } else {
      api.sendMessage(
        `⚠️ Warning ${user.warn}/3`,
        threadID
      );
    }

    user.count = 0;
    user.time = Date.now();
  }

  global.emojiSpam.set(threadID, threadData);
  }
