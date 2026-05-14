module.exports = {
  config: {
    name: "protect",
    version: "1.0",
    author: "Rakib",
    role: 1,
    shortDescription: "Smart auto protect system",
    category: "group",
    guide: "{pn} off"
  },

  onStart: async ({ event, message, threadsData, args }) => {
    const { threadID } = event;

    if (args[0] === "off") {
      await threadsData.set(threadID, { enable: false }, "data.protect");
      return message.reply("🔓 PROTECT OFF ❌");
    }

    return message.reply("⚠️ Usage: /protect off");
  },

  onEvent: async ({ api, event, threadsData }) => {
    const { threadID, author, logMessageType, logMessageData } = event;

    let protectData = await threadsData.get(threadID, "data.protect");

    // 🔥 AUTO ENABLE (default ON সবসময়)
    if (!protectData || protectData.enable !== false) {
      const info = await api.getThreadInfo(threadID);

      if (!protectData || !protectData.name) {
        const data = {
          enable: true,
          name: info.threadName || "",
          emoji: info.emoji || "",
          color: info.color || "",
          nickname: {}
        };

        const members = info.members || [];
        members.forEach(u => {
          data.nickname[u.userID] = u.nickname || "";
        });

        await threadsData.set(threadID, data, "data.protect");
        protectData = data;
      } else {
        protectData.enable = true;
      }
    }

    // ❌ যদি OFF করা থাকে
    if (protectData?.enable === false) return;

    const info = await api.getThreadInfo(threadID);
    const isAdmin = info.adminIDs.some(e => e.id === author);
    const isBot = api.getCurrentUserID() === author;

    // 🆕 New member join → nickname track
    if (logMessageType === "log:subscribe") {
      const addedUsers = logMessageData.addedParticipants || [];

      for (const user of addedUsers) {
        await threadsData.set(
          threadID,
          "",
          `data.protect.nickname.${user.userFbId}`
        );
      }
    }

    // 🚫 Non-admin protection
    if (!isAdmin && !isBot) {

      // NAME
      if (logMessageType === "log:thread-name") {
        api.setTitle(protectData.name, threadID);
      }

      // EMOJI
      if (logMessageType === "log:thread-icon") {
        api.changeThreadEmoji(protectData.emoji, threadID);
      }

      // COLOR
      if (logMessageType === "log:thread-color") {
        api.changeThreadColor(protectData.color, threadID);
      }

      // NICKNAME (SMART)
      if (logMessageType === "log:user-nickname") {
        const { participant_id } = logMessageData;

        // 👤 নিজের nickname নিজে change → allow
        if (participant_id == author) {
          await threadsData.set(
            threadID,
            logMessageData.nickname || "",
            `data.protect.nickname.${participant_id}`
          );
          return;
        }

        // ❌ অন্যের nickname change → revert
        api.changeNickname(
          protectData.nickname[participant_id] || "",
          threadID,
          participant_id
        );
      }
    }

    // 👑 Admin changes → update save
    if (isAdmin) {

      if (logMessageType === "log:thread-name") {
        await threadsData.set(threadID, logMessageData.name || "", "data.protect.name");
      }

      if (logMessageType === "log:thread-icon") {
        await threadsData.set(threadID, logMessageData.thread_icon || "", "data.protect.emoji");
      }

      if (logMessageType === "log:thread-color") {
        await threadsData.set(threadID, logMessageData.theme_id || "", "data.protect.color");
      }

      if (logMessageType === "log:user-nickname") {
        const { participant_id, nickname } = logMessageData;

        await threadsData.set(
          threadID,
          nickname || "",
          `data.protect.nickname.${participant_id}`
        );
      }
    }
  }
};
