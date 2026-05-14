module.exports = {
  config: {
    name: "cf",
    aliases: ["confess", "confusion"],
    version: "1.0",
    author: "Rakib",
    countDown: 15,
    role: 0,
    description: "Confess your love to someone",
    category: "fun",
    guide: {
      en: "{pn} @user - Confess to tagged user\n" +
          "{pn} (reply) - Confess to replied message sender\n" +
          "{pn} [uid] - Confess using UID"
    }
  },

  onStart: async function ({ api, event, args, usersData, message }) {
    const { threadID, senderID, messageReply, mentions } = event;

    try {
      let targetID = null;

      // Determine target
      if (messageReply) {
        targetID = messageReply.senderID;
      } else if (Object.keys(mentions || {}).length > 0) {
        targetID = Object.keys(mentions)[0];
      } else if (args[0] && /^\d+$/.test(args[0])) {
        targetID = args[0];
      }

      if (!targetID) {
        return message.reply("❌ 𝖯𝗅𝖾𝖺𝗌𝖾 𝗍𝖺𝗀, 𝗋𝖾𝗉𝗅𝗒, 𝗈𝗋 𝗉𝗋𝗈𝗏𝗂𝖽𝖾 𝖴𝖨𝖣");
      }

      if (targetID === senderID) {
        return message.reply("😅 𝖸𝗈𝗎 𝖼𝖺𝗇'𝗍 𝖼𝗈𝗇𝖿𝖾𝗌𝗌 𝗍𝗈 𝗒𝗈𝗎𝗋𝗌𝖾𝗅𝖿!");
      }

      const senderName = await usersData.getName(senderID);
      const targetName = await usersData.getName(targetID);

      // Random confession messages
      const confessions = [
        `𝖨'𝗏𝖾 𝗁𝖺𝖽 𝖿𝖾𝖾𝗅𝗂𝗇𝗀𝗌 𝖿𝗈𝗋 𝗒𝗈𝗎 𝖿𝗈𝗋 𝖺 𝗐𝗁𝗂𝗅𝖾...`,
        `𝖸𝗈𝗎 𝗆𝖺𝗄𝖾 𝗆𝗒 𝗁𝖾𝖺𝗋𝗍 𝗌𝗄𝗂𝗉 𝖺 𝖻𝖾𝖺𝗍...`,
        `𝖨 𝖼𝖺𝗇'𝗍 𝗌𝗍𝗈𝗉 𝗍𝗁𝗂𝗇𝗄𝗂𝗇𝗀 𝖺𝖻𝗈𝗎𝗍 𝗒𝗈𝗎...`,
        `𝖸𝗈𝗎'𝗋𝖾 𝗍𝗁𝖾 𝗈𝗇𝖾 𝖨'𝗏𝖾 𝖻𝖾𝖾𝗇 𝗐𝖺𝗂𝗍𝗂𝗇𝗀 𝖿𝗈𝗋...`,
        `𝖬𝗒 𝗁𝖾𝖺𝗋𝗍 𝖻𝖾𝗅𝗈𝗇𝗀𝗌 𝗍𝗈 𝗒𝗈𝗎...`
      ];

      const confession = confessions[Math.floor(Math.random() * confessions.length)];

      const confessionMsg = `💌 𝗟𝗢𝗩𝗘 𝗖𝗢𝗡𝗙𝗘𝗦𝗦𝗜𝗢𝗡\n` +
        `━━━━━━━━━━━━━━━━━━\n\n` +
        `𝖥𝗋𝗈𝗆: ${senderName}\n` +
        `𝖳𝗈: ${targetName}\n\n` +
        `💕 ${confession}\n\n` +
        `💝 𝖶𝗂𝗅𝗅 𝗒𝗈𝗎 𝖻𝖾 𝗆𝗂𝗇𝖾?\n\n` +
        `━━━━━━━━━━━━━━━━━━\n` +
        `💡 𝖱𝖾𝗉𝗅𝗒 𝗐𝗂𝗍𝗁: Yes, No, 𝗈𝗋 Maybe`;

      const mentions = [{ tag: targetName, id: targetID }];

      return message.reply({
        body: confessionMsg,
        mentions: mentions
      }, (err, info) => {
        if (err) return;

        global.GoatBot.onReply.set(info.messageID, {
          commandName: this.config.name,
          messageID: info.messageID,
          confessorID: senderID,
          targetID: targetID,
          confessorName: senderName,
          targetName: targetName
        });
      });

    } catch (error) {
      console.error(error);
      return message.reply("❌ 𝖠𝗇 𝖾𝗋𝗋𝗈𝗋 𝗈𝖼𝖼𝗎𝗋𝗋𝖾𝖽");
    }
  },

  onReply: async function ({ api, event, Reply, message }) {
    const { senderID, body } = event;

    // Only target can reply
    if (senderID !== Reply.targetID) {
      return;
    }

    const response = body.trim().toLowerCase();

    let replyMsg = "";
    let emoji = "";

    if (response === "yes" || response === "y") {
      emoji = "💖💕✨";
      replyMsg = `🎉 𝗖𝗢𝗡𝗚𝗥𝗔𝗧𝗨𝗟𝗔𝗧𝗜𝗢𝗡𝗦! ${emoji}\n` +
        `━━━━━━━━━━━━━━━━━━\n\n` +
        `${Reply.targetName} 𝗌𝖺𝗂𝖽 𝗬𝗘𝗦! 💝\n\n` +
        `${Reply.confessorName} 𝖺𝗇𝖽 ${Reply.targetName}\n` +
        `𝖺𝗋𝖾 𝗇𝗈𝗐 𝗍𝗈𝗀𝖾𝗍𝗁𝖾𝗋! 💑\n\n` +
        `━━━━━━━━━━━━━━━━━━\n` +
        `💕 𝖫𝗈𝗏𝖾 𝗐𝗂𝗇𝗌! 𝖧𝖺𝗉𝗉𝗒 𝖿𝗈𝗋 𝗒𝗈𝗎 𝖻𝗈𝗍𝗁!`;

    } else if (response === "no" || response === "n") {
      emoji = "💔😢";
      replyMsg = `💔 𝗥𝗘𝗝𝗘𝗖𝗧𝗘𝗗 ${emoji}\n` +
        `━━━━━━━━━━━━━━━━━━\n\n` +
        `${Reply.targetName} 𝗌𝖺𝗂𝖽 𝗡𝗢... 😔\n\n` +
        `𝖣𝗈𝗇'𝗍 𝗐𝗈𝗋𝗋𝗒 ${Reply.confessorName},\n` +
        `𝗍𝗁𝖾𝗋𝖾'𝗌 𝗌𝗈𝗆𝖾𝗈𝗇𝖾 𝗈𝗎𝗍 𝗍𝗁𝖾𝗋𝖾 𝖿𝗈𝗋 𝗒𝗈𝗎! 💪\n\n` +
        `━━━━━━━━━━━━━━━━━━`;

    } else if (response === "maybe" || response === "m") {
      emoji = "🤔💭";
      replyMsg = `🤔 𝗠𝗔𝗬𝗕𝗘... ${emoji}\n` +
        `━━━━━━━━━━━━━━━━━━\n\n` +
        `${Reply.targetName} 𝗌𝖺𝗂𝖽 𝗠𝗔𝗬𝗕𝗘! 💭\n\n` +
        `𝖳𝗁𝖾𝗋𝖾'𝗌 𝗌𝗍𝗂𝗅𝗅 𝗁𝗈𝗉𝖾, ${Reply.confessorName}!\n` +
        `𝖪𝖾𝖾𝗉 𝗍𝗋𝗒𝗂𝗇𝗀! 💪💕\n\n` +
        `━━━━━━━━━━━━━━━━━━`;

    } else {
      return; // Ignore other responses
    }

    const mentions = [
      { tag: Reply.confessorName, id: Reply.confessorID },
      { tag: Reply.targetName, id: Reply.targetID }
    ];

    message.reply({
      body: replyMsg,
      mentions: mentions
    });

    // Clean up onReply
    global.GoatBot.onReply.delete(Reply.messageID);
  }
};
