const axios = require("axios");
const { PassThrough } = require("stream");

function fmtFull(n) {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function parseAmount(str) {
  if (!str) return NaN;
  str = str.toLowerCase().replace(/,/g, "");
  if (str.endsWith("b")) return parseFloat(str) * 1_000_000_000;
  if (str.endsWith("m")) return parseFloat(str) * 1_000_000;
  if (str.endsWith("k")) return parseFloat(str) * 1_000;
  return parseFloat(str);
}

module.exports = {
  config: {
    name: "addbal",
    aliases: ["addmoney", "setbal", "removebal", "subtractbal"],
    version: "2.0",
    author: "Rakib Islam",
    countDown: 5,
    role: 2,
    shortDescription: "💰 Admin: Add/remove balance",
    longDescription: "Admin command to add or remove balance from any user.",
    category: "admin",
    guide: {
      en: "{pn} @mention +amount — Add balance\n{pn} @mention -amount — Remove balance\n{pn} @mention 0 — Reset to 0\nExample: {pn} @Rakib +5B"
    }
  },

  onStart: async function ({ message, event, usersData, args }) {
    const { senderID, mentions, messageReply } = event;

    const config = global.GoatBot?.config || {};
    const adminList = config.adminBot || [];
    const masterUID = config.masterUID || "";
    const isAdmin = adminList.includes(senderID) || senderID === masterUID;
    if (!isAdmin) {
      return message.reply("❌ শুধুমাত্র Admin ব্যবহার করতে পারবে!");
    }

    let targetID;
    const mentionKeys = Object.keys(mentions || {});
    if (mentionKeys.length > 0) targetID = mentionKeys[0];
    else if (messageReply?.senderID) targetID = messageReply.senderID;

    if (!targetID) {
      return message.reply(
        "💰 Admin Balance Control:\n" +
        ".addbal @mention +1M  — Add 1M\n" +
        ".addbal @mention -500K — Remove 500K\n" +
        ".addbal @mention 5B   — Set to 5B\n" +
        ".addbal @mention reset — Reset to 0"
      );
    }

    const amtStr = args.filter(a => !a.startsWith("@") && !a.includes("@")).join("").trim();
    let action = "add";
    let amount = 0;

    if (amtStr === "reset" || amtStr === "0") {
      action = "reset";
    } else if (amtStr.startsWith("+")) {
      action = "add";
      amount = parseAmount(amtStr.slice(1));
    } else if (amtStr.startsWith("-")) {
      action = "remove";
      amount = parseAmount(amtStr.slice(1));
    } else {
      amount = parseAmount(amtStr);
      action = "add";
    }

    try {
      const targetData = await usersData.get(targetID);
      const targetName = targetData?.name || "Unknown";
      const oldBal = targetData?.money ?? 0;

      if (action === "reset") {
        await usersData.subtractMoney(targetID, oldBal);
        const msg =
          `🔄 Balance Reset Done!\n` +
          `━━━━━━━━━━━━━━━━━\n` +
          `👤 User: ${targetName}\n` +
          `💰 Old: ৳${fmtFull(oldBal)}\n` +
          `💰 New: ৳0\n` +
          `━━━━━━━━━━━━━━━━━\n` +
          `👑 By: Admin`;
        return message.reply(msg);
      }

      if (isNaN(amount) || amount <= 0) {
        return message.reply("❌ সঠিক amount দিন! যেমন: +1M, -500K, +5B");
      }

      let newBal;
      if (action === "add") {
        await usersData.addMoney(targetID, Math.round(amount));
        newBal = oldBal + Math.round(amount);
      } else {
        await usersData.subtractMoney(targetID, Math.round(amount));
        newBal = Math.max(0, oldBal - Math.round(amount));
      }

      const emoji = action === "add" ? "➕" : "➖";
      const msg =
        `${emoji} 𝗕𝗔𝗟𝗔𝗡𝗖𝗘 𝗨𝗣𝗗𝗔𝗧𝗘𝗗\n` +
        `━━━━━━━━━━━━━━━━━━━━━\n` +
        `👤 User  : ${targetName}\n` +
        `💰 Old   : ৳${fmtFull(oldBal)}\n` +
        `${emoji} Change : ৳${fmtFull(Math.round(amount))}\n` +
        `💎 New   : ৳${fmtFull(newBal)}\n` +
        `━━━━━━━━━━━━━━━━━━━━━\n` +
        `👑 Updated by Admin`;

      return message.reply(msg);
    } catch (err) {
      return message.reply("❌ Balance update হয়নি। আবার try করুন।");
    }
  }
};
