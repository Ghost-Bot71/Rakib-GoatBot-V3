const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const GHOST = fs.readJsonSync(path.join(__dirname, "../../ghostConfig.json"));

module.exports = {
  config: {
    name: "hug",
    aliases: ["hugme", "abrazo"],
    version: "3.0",
    author: "Rakib Islam",
    countDown: 5,
    role: 0,
    shortDescription: "কাউকে জড়িয়ে ধরো! 🤗",
    longDescription: "Anime-style হাগ GIF — mention বা reply করলে সেই ব্যক্তিকে tag করে।",
    category: "love",
    guide: "{pn} @mention অথবা reply",
  },

  onStart: async function ({ api, event, message, usersData }) {
    const { mentions, senderID, threadID, messageID, messageReply } = event;
    const mentionIDs = Object.keys(mentions || {});
    const targetID = mentionIDs[0] || messageReply?.senderID || null;

    if (!targetID) {
      return message.reply("🤗 @mention করুন অথবা কারো message এ reply দিন!\nExample: .hug @name");
    }
    if (targetID === senderID) {
      return message.reply("😅 নিজেকে hug করা যাবে না! অন্য কাউকে hug করো! 🤗");
    }

    api.setMessageReaction("🤗", messageID, () => {}, true);

    let gifUrl = "";
    const apis = [
      () => axios.get("https://api.waifu.pics/sfw/hug", { timeout: 10000 }).then(r => r.data.url),
      () => axios.get("https://nekos.life/api/v2/img/hug", { timeout: 8000 }).then(r => r.data.url),
      () => axios.get("https://api.otakugifs.xyz/gif?reaction=hug", { timeout: 8000 }).then(r => r.data.url),
    ];

    for (const fn of apis) {
      try { gifUrl = await fn(); if (gifUrl) break; } catch {}
    }

    if (!gifUrl) {
      api.setMessageReaction("❌", messageID, () => {}, true);
      return message.reply("❌ Hug GIF পাওয়া যায়নি! কিছুক্ষণ পর try করো।");
    }

    let senderName = "Someone", targetName = "Friend";
    try { senderName = await usersData.getName(senderID) || "Someone"; } catch {}
    try { targetName = await usersData.getName(targetID) || "Friend"; } catch {}

    const bodyText = `🤗 ${senderName} তোমাকে জড়িয়ে ধরলো!\n━━━━━━━━━━━━━━━━━━\n👻 Ghost Bot — ${GHOST.ownerName}`;

    const attachment = await global.utils.getStreamFromURL(gifUrl).catch(() => null);
    if (!attachment) return message.reply(`🤗 Hug!\n${gifUrl}`);

    const form = { body: bodyText, attachment };
    if (mentionIDs[0] && mentions[mentionIDs[0]]) {
      form.mentions = [{ tag: mentions[mentionIDs[0]], id: targetID }];
    }
    await message.reply(form);
    api.setMessageReaction("✅", messageID, () => {}, true);
  }
};
