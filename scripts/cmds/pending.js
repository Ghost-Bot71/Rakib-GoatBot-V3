module.exports = {
  config: {
    name: "pending",
    version: "2.0",
    author: "Rakib",
    countDown: 5,
    role: 2,
    category: "owner",
    shortDescription: {
      en: "View pending group invites"
    }
  },

  onReply: async function ({ api, event, Reply, commandName }) {
    if (String(event.senderID) !== String(Reply.author)) return;

    const { body, threadID, messageID } = event;
    const args = body.trim().split(/\s+/);
    const type = args[0]?.toLowerCase();
    const index = parseInt(args[1]);

    if (!index || index <= 0 || index > Reply.pending.length)
      return api.sendMessage("❌ Invalid number", threadID, messageID);

    const targetThread = Reply.pending[index - 1].threadID;

    if (type === "add") {
      api.sendMessage(
        `✅ Bot approved this group!\nUse command list to see commands.`,
        targetThread
      );
      return api.sendMessage("✅ Group approved", threadID, messageID);
    }

    if (type === "del") {
      api.removeUserFromGroup(api.getCurrentUserID(), targetThread);
      return api.sendMessage("❌ Bot removed from that group", threadID, messageID);
    }
  },

  onStart: async function ({ api, event, commandName }) {
    const { threadID, messageID } = event;

    let msg = "";
    let index = 1;

    try {
      var spam = await api.getThreadList(100, null, ["OTHER"]) || [];
      var pending = await api.getThreadList(100, null, ["PENDING"]) || [];
    } catch (e) {
      return api.sendMessage("❌ Can't get pending list", threadID, messageID);
    }

    const list = [...spam, ...pending].filter(
      group => group.isSubscribed && group.isGroup
    );

    for (const single of list)
      msg += `${index++}/ ${single.name} (${single.threadID})\n`;

    if (list.length === 0)
      return api.sendMessage("✅ No pending groups", threadID, messageID);

    api.sendMessage(
      `📌 Pending Groups: ${list.length}\n\n${msg}\nReply:\nadd <number> → approve\ndel <number> → delete`,
      threadID,
      (err, info) => {
        global.GoatBot.onReply.set(info.messageID, {
          commandName,
          messageID: info.messageID,
          author: event.senderID,
          pending: list
        });
      },
      messageID
    );
  }
};
