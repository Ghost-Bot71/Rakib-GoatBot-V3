/**
 * prefix.js — Ghost Net Prefix Command
 * - "prefix" typed by anyone → shows prefix info + OWNER'S PFP (UID 61582040799720)
 * - Admin types just the prefix char alone (e.g., ".") → @mention + unique special reply
 */
const fs   = require("fs-extra");
const path = require("path");
const axios = require("axios");
const { utils } = global;

const OWNER_UID = "61582040799720";

// Unique admin-prefix replies (rotates so it doesn't feel repetitive)
const ADMIN_REPLIES = [
  (name) => `🔑 𝗛𝗲𝘆 @${name}!\n👑 𝗔𝗱𝗺𝗶𝗻 𝗱𝗲𝘁𝗲𝗰𝘁𝗲𝗱 — 𝗶𝗻𝗶𝘁𝗶𝗮𝗹𝗶𝘇𝗶𝗻𝗴 𝗯𝗼𝘁 𝗶𝗻𝘁𝗲𝗿𝗳𝗮𝗰𝗲...\n⚙️ 𝗦𝘆𝘀𝘁𝗲𝗺 𝗿𝗲𝗮𝗱𝘆.`,
  (name) => `⚡ 𝗪𝗲𝗹𝗰𝗼𝗺𝗲 𝗯𝗮𝗰𝗸 @${name}!\n🤖 𝗚𝗵𝗼𝘀𝘁 𝗕𝗼𝘁 𝗮𝘁 𝘆𝗼𝘂𝗿 𝘀𝗲𝗿𝘃𝗶𝗰𝗲 𝟮𝟰/𝟳.`,
  (name) => `👻 𝗔𝗱𝗺𝗶𝗻 @${name} 𝗼𝗻𝗹𝗶𝗻𝗲!\n🌐 𝗚𝗵𝗼𝘀𝘁 𝗡𝗲𝘁 𝗘𝗱𝗶𝘁𝗶𝗼𝗻 — 𝗳𝘂𝗹𝗹𝘆 𝗮𝗰𝘁𝗶𝘃𝗲.`,
  (name) => `🔥 @${name} 𝗵𝗮𝘀 𝗮𝗿𝗿𝗶𝘃𝗲𝗱!\n💎 𝗕𝗼𝘁 𝗮𝗱𝗺𝗶𝗻 𝗰𝗼𝗻𝗻𝗲𝗰𝘁𝗲𝗱 — 𝗮𝗹𝗹 𝗳𝘂𝗻𝗰𝘁𝗶𝗼𝗻𝘀 𝘂𝗻𝗹𝗼𝗰𝗸𝗲𝗱.`,
  (name) => `💠 @${name} — 𝗔𝗱𝗺𝗶𝗻 𝗮𝗰𝗰𝗲𝘀𝘀 𝗰𝗼𝗻𝗳𝗶𝗿𝗺𝗲𝗱.\n🤖 𝗥𝗲𝗮𝗱𝘆 𝗳𝗼𝗿 𝗰𝗼𝗺𝗺𝗮𝗻𝗱𝘀.`
];
let _adminReplyIdx = 0;
function nextAdminReply(name) {
  const reply = ADMIN_REPLIES[_adminReplyIdx % ADMIN_REPLIES.length](name);
  _adminReplyIdx++;
  return reply;
}

// Fetch owner's profile picture
async function getOwnerPFP() {
  const url = `https://graph.facebook.com/${OWNER_UID}/picture?width=512&height=512&access_token=6628568379|c1e620fa708a1d5696fb991c1bde5662`;
  try {
    return await utils.getStreamFromURL(url);
  } catch {
    return null;
  }
}

module.exports = {
  config: {
    name: "prefix",
    version: "2.0",
    author: "Rakib Islam",
    countDown: 5,
    role: 0,
    description: "𝗣𝗿𝗲𝗳𝗶𝘅 𝗶𝗻𝗳𝗼 + 𝗮𝗱𝗺𝗶𝗻 𝗱𝗲𝘁𝗲𝗰𝘁𝗶𝗼𝗻",
    category: "⚙️ Configuration",
    guide: {
      en:
        "『 𝗣𝗿𝗲𝗳𝗶𝘅 𝗦𝗲𝘁𝘁𝗶𝗻𝗴𝘀 』\n"
      + "│\n"
      + "│ 🔹 {pn} <prefix>    — 𝘀𝗲𝘁 𝗽𝗿𝗲𝗳𝗶𝘅 𝗳𝗼𝗿 𝘁𝗵𝗶𝘀 𝗰𝗵𝗮𝘁\n"
      + "│ 🔹 {pn} <prefix> -g — 𝘀𝗲𝘁 𝗴𝗹𝗼𝗯𝗮𝗹 𝗽𝗿𝗲𝗳𝗶𝘅 (𝗔𝗱𝗺𝗶𝗻)\n"
      + "│ ♻️ {pn} reset        — 𝗿𝗲𝘀𝗲𝘁 𝘁𝗼 𝗱𝗲𝗳𝗮𝘂𝗹𝘁\n"
    }
  },

  langs: {
    en: {
      reset:
        "┌─『 𝗣𝗿𝗲𝗳𝗶𝘅 𝗥𝗲𝘀𝗲𝘁 』\n"
      + `│ ✅ 𝗗𝗲𝗳𝗮𝘂𝗹𝘁 𝗿𝗲𝘀𝘁𝗼𝗿𝗲𝗱: %1`,
      onlyAdmin:
        "┌─『 𝗣𝗲𝗿𝗺𝗶𝘀𝘀𝗶𝗼𝗻 𝗗𝗲𝗻𝗶𝗲𝗱 』\n"
      + "│ ⛔ 𝗢𝗻𝗹𝘆 𝗯𝗼𝘁 𝗮𝗱𝗺𝗶𝗻𝘀 𝗰𝗮𝗻 𝗰𝗵𝗮𝗻𝗴𝗲 𝗴𝗹𝗼𝗯𝗮𝗹 𝗽𝗿𝗲𝗳𝗶𝘅!",
      confirmGlobal:
        "┌─『 𝗚𝗹𝗼𝗯𝗮𝗹 𝗣𝗿𝗲𝗳𝗶𝘅 𝗖𝗵𝗮𝗻𝗴𝗲 』\n"
      + "│ ⚙️ 𝗥𝗲𝗮𝗰𝘁 𝘁𝗼 𝗰𝗼𝗻𝗳𝗶𝗿𝗺.",
      confirmThisThread:
        "┌─『 𝗖𝗵𝗮𝘁 𝗣𝗿𝗲𝗳𝗶𝘅 𝗖𝗵𝗮𝗻𝗴𝗲 』\n"
      + "│ ⚙️ 𝗥𝗲𝗮𝗰𝘁 𝘁𝗼 𝗰𝗼𝗻𝗳𝗶𝗿𝗺.",
      successGlobal:
        "┌─『 𝗣𝗿𝗲𝗳𝗶𝘅 𝗨𝗽𝗱𝗮𝘁𝗲𝗱 』\n"
      + `│ ✅ 𝗚𝗹𝗼𝗯𝗮𝗹 𝗽𝗿𝗲𝗳𝗶𝘅: %1`,
      successThisThread:
        "┌─『 𝗣𝗿𝗲𝗳𝗶𝘅 𝗨𝗽𝗱𝗮𝘁𝗲𝗱 』\n"
      + `│ ✅ 𝗖𝗵𝗮𝘁 𝗽𝗿𝗲𝗳𝗶𝘅: %1\n`
    }
  },

  onStart: async function ({ message, role, args, commandName, event, threadsData, getLang }) {
    if (!args[0]) return message.SyntaxError();

    if (args[0] === "reset") {
      await threadsData.set(event.threadID, null, "data.prefix");
      return message.reply(getLang("reset", global.GoatBot.config.prefix));
    }

    const newPrefix = args[0];
    const formSet = {
      commandName,
      author: event.senderID,
      newPrefix,
      setGlobal: args[1] === "-g"
    };

    if (formSet.setGlobal && role < 2) {
      return message.reply(getLang("onlyAdmin"));
    }

    const confirmMessage = formSet.setGlobal ? getLang("confirmGlobal") : getLang("confirmThisThread");
    return message.reply(confirmMessage, (err, info) => {
      formSet.messageID = info.messageID;
      global.GoatBot.onReaction.set(info.messageID, formSet);
    });
  },

  onReaction: async function ({ message, threadsData, event, Reaction, getLang }) {
    const { author, newPrefix, setGlobal } = Reaction;
    if (event.userID !== author) return;

    if (setGlobal) {
      global.GoatBot.config.prefix = newPrefix;
      fs.writeFileSync(global.client.dirConfig, JSON.stringify(global.GoatBot.config, null, 2));
      return message.reply(getLang("successGlobal", newPrefix));
    }

    await threadsData.set(event.threadID, newPrefix, "data.prefix");
    return message.reply(getLang("successThisThread", newPrefix));
  },

  onChat: async function ({ event, message, threadsData, usersData, role }) {
    const globalPrefix = global.GoatBot.config.prefix;
    const threadPrefix = await threadsData.get(event.threadID, "data.prefix") || globalPrefix;
    const body = (event.body || "").trim();

    // ── Case 1: Anyone types "prefix" → show prefix info + owner PFP
    if (body.toLowerCase() === "prefix") {
      const ownerImg = await getOwnerPFP();
      const infoBody =
        `╔══『 𝗣𝗥𝗘𝗙𝗜𝗫 𝗜𝗡𝗙𝗢 』══╗\n` +
        `║ 🌍 𝗚𝗹𝗼𝗯𝗮𝗹  : ${globalPrefix}\n` +
        `║ 💬 𝗧𝗵𝗶𝘀 𝗖𝗵𝗮𝘁: ${threadPrefix}\n` +
        `║ 💡 𝗧𝘆𝗽𝗲 ${threadPrefix}help 𝘁𝗼 𝘀𝗲𝗲 𝗮𝗹𝗹 𝗰𝗺𝗱𝘀\n` +
        `╚═══════════════════╝\n` +
        `👻 𝗚𝗵𝗼𝘀𝘁 𝗡𝗲𝘁 | 𝗕𝘆 𝗥𝗮𝗸𝗶𝗯 𝗜𝘀𝗹𝗮𝗺`;

      if (ownerImg) {
        return message.reply({ body: infoBody, attachment: ownerImg });
      }
      return message.reply(infoBody);
    }

    // ── Case 2: Admin types ONLY the prefix character (e.g. ".") alone → unique @mention reply
    if (body === threadPrefix && role >= 1) {
      try {
        let senderName = "Admin";
        try {
          const userData = await usersData.get(event.senderID);
          senderName = userData?.name || "Admin";
        } catch {}

        const replyBody = nextAdminReply(senderName);
        return message.reply({
          body: replyBody,
          mentions: [{
            tag: `@${senderName}`,
            id: event.senderID,
            fromIndex: replyBody.indexOf(`@${senderName}`)
          }]
        });
      } catch {}
    }
  }
};
