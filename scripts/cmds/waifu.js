const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const GHOST = fs.readJsonSync(path.join(__dirname, "../../ghostConfig.json"));

const CATEGORIES = ["waifu","neko","shinobu","megumin","bully","cuddle","cry","kiss","lick","hug","awoo","pat","smug","bonk","yeet","blush","smile","wave","highfive","handhold","nom","bite","glomp","slap","kill","kick","happy","wink","poke","dance","cringe"];

module.exports = {
  config: {
    name: "waifu",
    aliases: ["neko", "animegif", "wf"],
    version: "2.0",
    author: "Rakib Islam",
    countDown: 5,
    role: 0,
    shortDescription: "Random anime waifu / GIF — mention বা reply করলে tag করে",
    longDescription: "Random anime waifu image বা action GIF। mention বা reply দিলে সেই person কে tag করে।",
    category: "anime",
    guide: "{pn} [category] @mention অথবা reply\nCategories: waifu, neko, hug, pat, kiss, slap, dance, cry...",
  },
  onStart: async function ({ api, event, args, message, usersData }) {
    const { mentions, senderID, messageReply } = event;
    const mentionIDs = Object.keys(mentions || {});
    const targetID = mentionIDs[0] || messageReply?.senderID || null;
    const cat = (args.find(a => CATEGORIES.includes(a.toLowerCase())) || "waifu").toLowerCase();

    let imgUrl = "";
    try {
      const res = await axios.get(`https://api.waifu.pics/sfw/${cat}`, { timeout: 10000 });
      imgUrl = res.data?.url || "";
    } catch {
      try {
        const res2 = await axios.get(`https://nekos.life/api/v2/img/${cat}`, { timeout: 8000 });
        imgUrl = res2.data?.url || "";
      } catch {}
    }

    if (!imgUrl) return message.reply(`❌ "${cat}" image পাওয়া যায়নি!\n\nExample: .waifu hug\nCategories: ${CATEGORIES.slice(0,10).join(", ")}...`);

    let bodyText = `✨ 「 ${cat.toUpperCase()} 」\n👻 Ghost Bot — ${GHOST.ownerName}`;
    if (targetID) {
      let targetName = "Friend", senderName = "Someone";
      try { targetName = await usersData.getName(targetID) || "Friend"; senderName = await usersData.getName(senderID) || "Someone"; } catch {}
      const actionMap = { hug:"জড়িয়ে ধরলো 🤗", kiss:"kiss করলো 💋", slap:"চড় দিলো 👋", pat:"মাথায় হাত বুলালো 🥰", cuddle:"কাছে টেনে নিলো 💕", cry:"কান্না করছে 😭", wave:"হাত নাড়লো 👋", bite:"কামড় দিলো 😬", poke:"খোঁচা দিলো 👉" };
      bodyText = `${senderName} তোমাকে ${actionMap[cat] || `${cat} করলো ✨`}!\n👻 Ghost Bot — ${GHOST.ownerName}`;
    }

    const attachment = await global.utils.getStreamFromURL(imgUrl).catch(() => null);
    if (!attachment) return message.reply(`🖼️ ${cat.toUpperCase()}:\n${imgUrl}`);
    const form = { body: bodyText, attachment };
    if (targetID && Object.values(mentions)[0]) form.mentions = [{ tag: Object.values(mentions)[0], id: targetID }];
    return message.reply(form);
  }
};
