module.exports = {
  config: {
    name: "approved",
    aliases: ["aprv", "aprvd","approve"],
    version: "1.0",
    author: "Rakib",
    countDown: 5,
    role: 2,
    shortDescription: "Manage pending requests",
    longDescription: "Approve or delete pending group users",
    category: "owner"
  },

  onReply: async function ({ api, event, Reply, message }) {
    const { author, pending, messageID } = Reply;

    if (String(event.senderID) !== String(author)) return;

    const input = event.body.trim();

    // cancel
    if (input.toLowerCase() === "cancel") {
      try {
        api.unsendMessage(messageID);
      } catch (e) {}

      return message.reply("❌ Operation cancelled.");
    }

    const args = input.split(/\s+/);
    const action = args.shift()?.toLowerCase();

    if (!["add", "del"].includes(action))
      return message.reply("❌ Use: add 1 2 OR del 1 2");

    let success = 0;
    let failed = 0;

    for (const num of args) {
      const index = parseInt(num);

      if (isNaN(index) || index < 1 || index > pending.length)
        continue;

      const target = pending[index - 1];

      try {

        // approve
        if (action === "add") {
          await api.handleMessageRequest(target.threadID, true);

          await api.sendMessage(
            "✅ Your pending request has been approved.",
            target.threadID
          );
        }

        // delete/reject
        else if (action === "del") {
          await api.handleMessageRequest(target.threadID, false);
        }

        success++;

      } catch (e) {
        failed++;
      }
    }

    return message.reply(
      `✅ Success: ${success}\n❌ Failed: ${failed}`
    );
  },

  onStart: async function ({ api, event, message, usersData }) {

    try {

      const spam = await api.getThreadList(100, null, ["OTHER"]) || [];
      const pending = await api.getThreadList(100, null, ["PENDING"]) || [];

      // only users
      const list = [...spam, ...pending].filter(
        t => !t.isGroup
      );

      if (!list.length)
        return message.reply("✅ No pending users found.");

      let msg = `📋 PENDING USERS LIST\n\n`;

      for (let i = 0; i < list.length; i++) {

        let name = list[i].name || "Unknown User";

        try {
          name = await usersData.getName(list[i].threadID);
        } catch (e) {}

        msg += `${i + 1}. ${name}\n🆔 ${list[i].threadID}\n\n`;
      }

      msg +=
`━━━━━━━━━━━━━━
Reply:
add 1 2 → approve
del 1 2 → delete
cancel → unsend message`;

      return api.sendMessage(
        msg,
        event.threadID,
        (err, info) => {

          global.GoatBot.onReply.set(info.messageID, {
            commandName: this.config.name,
            messageID: info.messageID,
            author: event.senderID,
            pending: list
          });

        },
        event.messageID
      );

    } catch (e) {

      return message.reply(
        `❌ Error:\n${e.message}`
      );

    }
  }
};
