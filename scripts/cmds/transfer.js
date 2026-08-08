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
    name: "transfer",
    aliases: ["give", "send"],
    version: "2.0",
    author: "Rakib Islam",
    countDown: 10,
    role: 0,
    shortDescription: "💸 Transfer balance to another user",
    longDescription: "Transfer your balance to another user. Admin can transfer to/from anyone.",
    category: "economy",
    guide: { en: "{pn} @mention <amount>\nExample: {pn} @Rakib 500000\nSupports: 1M, 500K, 1B" }
  },

  onStart: async function ({ message, event, usersData, args }) {
    const { senderID, mentions, messageReply } = event;

    let targetID;
    const mentionKeys = Object.keys(mentions || {});
    if (mentionKeys.length > 0) targetID = mentionKeys[0];
    else if (messageReply?.senderID) targetID = messageReply.senderID;

    if (!targetID) {
      return message.reply(
        "💸 Transfer করতে:\n" +
        ".transfer @mention <amount>\n" +
        ".transfer reply <amount>\n\n" +
        "উদাহরণ: .transfer @Rakib 1M"
      );
    }

    if (targetID === senderID) {
      return message.reply("❌ নিজেকে transfer করা যাবে না!");
    }

    const amountStr = args.filter(a => !a.includes("@")).pop();
    const amount = parseAmount(amountStr);

    if (!amount || isNaN(amount) || amount <= 0) {
      return message.reply("❌ সঠিক amount দিন!\nউদাহরণ: .transfer @Rakib 1M");
    }

    if (amount < 1) {
      return message.reply("❌ Minimum transfer: ৳1");
    }

    try {
      const config = global.GoatBot?.config || {};
      const adminList = config.adminBot || [];
      const masterUID = config.masterUID || "";
      const isAdmin = adminList.includes(senderID) || senderID === masterUID;

      const senderData = await usersData.get(senderID);
      const receiverData = await usersData.get(targetID);
      const senderMoney = senderData?.money ?? 0;
      const senderName = senderData?.name || "Unknown";
      const receiverName = receiverData?.name || "Unknown";

      if (!isAdmin && senderMoney < amount) {
        return message.reply(
          `❌ যথেষ্ট balance নেই!\n` +
          `আপনার Balance: ৳${fmtFull(senderMoney)}\n` +
          `Transfer Amount: ৳${fmtFull(Math.round(amount))}`
        );
      }

      await usersData.subtractMoney(senderID, Math.round(amount));
      await usersData.addMoney(targetID, Math.round(amount));

      const newSenderBal = isAdmin ? senderMoney : senderMoney - Math.round(amount);
      const tax = 0;

      const msg =
        `✅ 𝗧𝗥𝗔𝗡𝗦𝗙𝗘𝗥 𝗦𝗨𝗖𝗖𝗘𝗦𝗦𝗙𝗨𝗟\n` +
        `━━━━━━━━━━━━━━━━━━━━━━\n` +
        `💸 From : ${senderName}\n` +
        `💰 To   : ${receiverName}\n` +
        `💵 Amount: ৳${fmtFull(Math.round(amount))}\n` +
        `━━━━━━━━━━━━━━━━━━━━━━\n` +
        `📊 Your new balance: ৳${fmtFull(Math.max(0, newSenderBal))}\n` +
        `━━━━━━━━━━━━━━━━━━━━━━\n` +
        `🤖 Ghost Net — Ewr Hinata`;

      const gif = "https://media.tenor.com/j1X_eJkrgLEAAAAC/money-cash.gif";
      try {
        const res = await axios.get(gif, { responseType: "arraybuffer", timeout: 8000 });
        const st = new PassThrough();
        st.end(Buffer.from(res.data));
        return message.reply({ body: msg, attachment: st });
      } catch {
        return message.reply(msg);
      }
    } catch (err) {
      return message.reply("❌ Transfer হয়নি। আবার try করুন।");
    }
  }
};
