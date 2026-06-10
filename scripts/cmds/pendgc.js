module.exports = {
config: {
name: "pendgc",
aliases: ["pndgc"],
version: "1.0",
author: "Rakib",
countDown: 5,
role: 1,
category: "group"
},

onReply: async function ({ api, event, Reply, message }) {
if (event.senderID != Reply.author) return;

const input = event.body.trim();
const args = input.split(/\s+/);

const action = args.shift()?.toLowerCase();

if (action === "cancel")
  return message.reply("❌ Cancelled.");

if (!["add", "del"].includes(action))
  return message.reply("Reply: add 1 2 অথবা del 1 2");

let success = 0;
let failed = 0;

for (const num of args) {
  const index = parseInt(num);

  if (
    isNaN(index) ||
    index < 1 ||
    index > Reply.pending.length
  ) continue;

  const user = Reply.pending[index - 1];

  try {

    if (action === "add") {
      await api.addUserToGroup(
        user.requesterID,
        event.threadID
      );
    }

    else {
      const queue = await api.getThreadInfo(event.threadID);

      queue.approvalQueue.splice(
        queue.approvalQueue.findIndex(
          x => x.requesterID == user.requesterID
        ),
        1
      );
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

  const info = await api.getThreadInfo(event.threadID);

  const pending = info.approvalQueue || [];

  if (!pending.length)
    return message.reply(
      "✅ No pending members found."
    );

  let msg = "📋 PENDING MEMBERS\n\n";

  for (let i = 0; i < pending.length; i++) {

    let name = "Unknown User";

    try {
      name = await usersData.getName(
        pending[i].requesterID
      );
    } catch {}

    msg +=

`${i + 1}. ${name}
🆔 ${pending[i].requesterID}

`;
}

  msg +=

"━━━━━━━━━━━━━━ Reply: add 1 3 del 2 cancel";

  api.sendMessage(
    msg,
    event.threadID,
    (err, info) => {
      global.GoatBot.onReply.set(
        info.messageID,
        {
          commandName: this.config.name,
          author: event.senderID,
          pending
        }
      );
    },
    event.messageID
  );

} catch (e) {
  message.reply(e.message);
}

}
};
