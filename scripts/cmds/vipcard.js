const axios = require("axios");
const { PassThrough } = require("stream");

function fmtFull(n) {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function fmt(n) {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(2) + "B";
  if (n >= 1_000_000)     return (n / 1_000_000).toFixed(2) + "M";
  if (n >= 1_000)         return (n / 1_000).toFixed(1) + "K";
  return n.toString();
}

function cardNum(uid) {
  const d = uid.toString();
  return `▓▓▓▓ ▓▓▓▓ ▓▓▓▓ ${d.slice(-4)}`;
}

function expiry() {
  const d = new Date();
  return `${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear() + 5}`;
}

module.exports = {
  config: {
    name: "vipcard",
    aliases: ["vip", "vipcards", "goldcard"],
    version: "2.0",
    author: "Rakib Islam",
    countDown: 10,
    role: 0,
    shortDescription: "👑 VIP Gold Card",
    longDescription: "Show your VIP/Admin gold card. Only VIP and Admin users get the gold card.",
    category: "economy",
    guide: { en: "{pn} — Your VIP card\n{pn} @mention — Someone else's VIP card" }
  },

  onStart: async function ({ message, event, usersData, args }) {
    const { senderID, mentions, messageReply } = event;

    let targetID = senderID;
    const mentionKeys = Object.keys(mentions || {});
    if (mentionKeys.length > 0) targetID = mentionKeys[0];
    else if (messageReply?.senderID) targetID = messageReply.senderID;

    const config = global.GoatBot?.config || {};
    const adminList = config.adminBot || [];
    const masterUID = config.masterUID || "";
    const isAdmin = adminList.includes(targetID) || targetID === masterUID;
    const isCaller = senderID === targetID;

    try {
      const userData = await usersData.get(targetID);
      const name = userData?.name || "Unknown";
      const money = userData?.money ?? 0;
      const exp = userData?.exp ?? 0;

      const allData = await usersData.getAll();
      const sorted = allData.sort((a, b) => (b.money || 0) - (a.money || 0));
      const rank = sorted.findIndex(u => u.userID == targetID) + 1;

      let tier, tierEmoji, tierColor;
      if (targetID === masterUID) {
        tier = "👑 OWNER";
        tierEmoji = "👑";
        tierColor = "DIAMOND";
      } else if (isAdmin) {
        tier = "🔴 ADMIN VIP";
        tierEmoji = "🔴";
        tierColor = "PLATINUM";
      } else if (money >= 1_000_000_000) {
        tier = "💎 DIAMOND";
        tierEmoji = "💎";
        tierColor = "GOLD";
      } else {
        if (isCaller) {
          return message.reply(
            "❌ শুধুমাত্র Admin, Owner এবং Billionaire (1B+) users VIP Card পাবে!\n\n" +
            `💰 আপনার Balance: ৳${fmtFull(money)}\n` +
            `🎯 Target for VIP: ৳1,000,000,000`
          );
        } else {
          return message.reply(`❌ ${name} এর VIP Card নেই।`);
        }
      }

      const stars = "⭐".repeat(5);
      const line = "═══════════════════════════════════════";

      const card =
        `${tierEmoji} ╔${line}╗ ${tierEmoji}\n` +
        `   ║     𝗘𝗪𝗥 𝗛𝗜𝗡𝗔𝗧𝗔 — 𝗩𝗜𝗣 𝗖𝗔𝗥𝗗       ║\n` +
        `   ║          ${tierColor} EDITION           ║\n` +
        `   ╠${line}╣\n` +
        `   ║  ${stars}                         ║\n` +
        `   ║  🔑 ${cardNum(targetID)}         ║\n` +
        `   ╠${line}╣\n` +
        `   ║  👤 Cardholder : ${name.padEnd(20)}║\n` +
        `   ║  🎖️ Tier       : ${tier.padEnd(20)}║\n` +
        `   ║  📅 Valid Until: ${expiry().padEnd(20)}║\n` +
        `   ╠${line}╣\n` +
        `   ║  💰 Balance    : ৳${fmt(money).padEnd(19)}║\n` +
        `   ║  🏅 Global Rank: #${String(rank).padEnd(19)}║\n` +
        `   ║  📊 EXP Points : ${fmt(exp).padEnd(20)}║\n` +
        `   ╠${line}╣\n` +
        `   ║     🤖 Ghost Net Edition — Ewr Hinata   ║\n` +
        `   ║     👑 Owner: Rakib Islam, Saidpur       ║\n` +
        `   ╚${line}╝`;

      const gif = "https://media.tenor.com/ZPMQxrj03OIAAAAC/gold-card-credit-card.gif";
      try {
        const res = await axios.get(gif, { responseType: "arraybuffer", timeout: 8000 });
        const st = new PassThrough();
        st.end(Buffer.from(res.data));
        return message.reply({ body: `${tierEmoji} VIP Gold Card:\n\n${card}`, attachment: st });
      } catch {
        return message.reply(`${tierEmoji} VIP Gold Card:\n\n${card}`);
      }
    } catch (err) {
      return message.reply("❌ VIP Card দেখতে সমস্যা হয়েছে।");
    }
  }
};
