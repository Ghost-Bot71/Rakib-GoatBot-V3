const utils = require("../../utils.js");
const { loadOwner } = require("../../rakib/customId/ownerUid");

module.exports = {
  config: {
    name: "eco",
    version: "4.0",
    author: "Rakib",
    role: 0,
    category: "owner",
    shortDescription: {
      en: "Advanced economy control system"
    }
  },

  langs: {
    en: {
      helpMenu: "➜ **𝐇𝐞𝐥𝐩 𝐌𝐞𝐧𝐮**\n\n" +
                "• 𝐞𝐜𝐨 𝐚𝐝𝐝 𝐮𝐬𝐞𝐫𝐬 <𝐚𝐦𝐨𝐮𝐧𝐭>\n" +
                "• 𝐞𝐜𝐨 𝐫𝐞𝐬𝐞𝐭 𝐮𝐬𝐞𝐫𝐬 𝐚𝐥𝐥\n" +
                "• 𝐞𝐜𝐨 𝐫𝐞𝐬𝐞𝐭 𝐮𝐬𝐞𝐫𝐬 <𝐚𝐦𝐨𝐮𝐧𝐭>\n\n" +
                "• 𝐞𝐜𝐨 𝐚𝐝𝐝 <𝐚𝐦𝐨𝐮𝐧𝐭>\n" +
                "• 𝐞𝐜𝐨 𝐫𝐞𝐬𝐞𝐭 𝐚𝐥𝐥\n" +
                "• 𝐞𝐜𝐨 𝐫𝐞𝐬𝐞𝐭 <𝐚𝐦𝐨𝐮𝐧𝐭>\n\n" +
                "• 𝐞𝐜𝐨 𝐫𝐞𝐬𝐞𝐭 𝐚𝐥𝐥 <𝐮𝐢𝐝>\n" +
                "• 𝐞𝐜𝐨 𝐫𝐞𝐬𝐞𝐭 <𝐚𝐦𝐨𝐮𝐧𝐭> <𝐮𝐢𝐝>\n" +
                "• 𝐞𝐜𝐨 𝐚𝐝𝐝 <𝐚𝐦𝐨𝐮𝐧𝐭> <𝐮𝐢𝐝>",
      resetUser: "✅ User (%1) balance fully reset.",
      resetAllUsers: "✅ All users balance fully reset.",
      deductedUser: "📉 Deducted %1 from user (%2) wallet.",
      deductedAllUsers: "📉 Deducted %1 from all users wallet.",
      addedUser: "💰 Added %1 to user (%2) wallet.",
      addedAllUsers: "💰 Added %1 to all users wallet.",
      invalid: "❌ Invalid Command or Amount! Use `eco` to see help menu.",
      notOwner: "❌ Only bot owner can use this command."
    }
  },

  onStart: async function ({ message, event, args, usersData, getLang }) {

    // 🔒 Owner Check
    const ownerUID = await loadOwner();
    const isOwner = Array.isArray(ownerUID)
      ? ownerUID.includes(String(event.senderID))
      : String(event.senderID) === String(ownerUID);

    if (!isOwner) return message.reply(getLang("notOwner"));

    // 📖 Help Menu Display
    if (args.length === 0) {
      return message.reply(getLang("helpMenu"));
    }

    const WALLET_LIMIT = utils.parseAmount("150cs");
    const action = args[0]?.toLowerCase(); // add, reset

    // Target User ID (UID) বের করার লজিক (Reply, Mention, বা direct Input)
    let targetUID = null;
    if (event.messageReply) {
      targetUID = event.messageReply.senderID;
    } else if (Object.keys(event.mentions).length > 0) {
      targetUID = Object.keys(event.mentions)[0];
    }

    // ==========================================
    // 💥 ACTION: ADD
    // ==========================================
    if (action === "add") {
      const sub = args[1]?.toLowerCase();

      if (!sub) return message.reply(getLang("invalid"));

      // ➜ eco add users 5b (সবার ওয়ালেটে যোগ)
      if (sub === "users") {
        const amount = utils.parseAmount(args[2]);
        if (!amount || typeof amount !== "bigint" || amount <= 0n) return message.reply(getLang("invalid"));

        const allUsers = await usersData.getAll();
        for (const user of allUsers) {
          let wallet = BigInt(user.money || 0);
          let bank = BigInt(user.data?.bank || 0);
          let loan = BigInt(user.data?.loan || 0);

          wallet += amount;
          if (wallet > WALLET_LIMIT) {
            bank += (wallet - WALLET_LIMIT);
            wallet = WALLET_LIMIT;
          }

          await usersData.set(user.userID, { money: wallet.toString(), data: { bank: bank.toString(), loan: loan.toString() } });
        }
        return message.reply(getLang("addedAllUsers", utils.formatMoney(amount)));
      }

      // ➜ eco add 5b <uid> OR eco add 5b (Reply/Mention)
      const amount = utils.parseAmount(args[1]);
      if (!amount || typeof amount !== "bigint" || amount <= 0n) return message.reply(getLang("invalid"));

      // যদি আর্গুমেন্টে UID থাকে (যেমন: eco add 5b 1000xxx)
      if (args[2] && !targetUID) {
        targetUID = args[2];
      }

      if (!targetUID) return message.reply(getLang("invalid"));

      const userData = await usersData.get(targetUID) || {};
      let wallet = BigInt(userData.money || 0);
      let bank = BigInt(userData.data?.bank || 0);
      let loan = BigInt(userData.data?.loan || 0);

      wallet += amount;
      if (wallet > WALLET_LIMIT) {
        bank += (wallet - WALLET_LIMIT);
        wallet = WALLET_LIMIT;
      }

      await usersData.set(targetUID, { money: wallet.toString(), data: { bank: bank.toString(), loan: loan.toString() } });
      return message.reply(getLang("addedUser", utils.formatMoney(amount), targetUID));
    }

    // ==========================================
    // 💥 ACTION: RESET
    // ==========================================
    if (action === "reset") {
      const sub = args[1]?.toLowerCase();

      if (!sub) return message.reply(getLang("invalid"));

      // ----------------------------------------
      // SUB-ACTION: USERS (সবার জন্য)
      // ----------------------------------------
      if (sub === "users") {
        const nextArg = args[2]?.toLowerCase();

        // ➜ eco reset users all
        if (nextArg === "all") {
          const allUsers = await usersData.getAll();
          for (const user of allUsers) {
            await usersData.set(user.userID, { money: "0", data: { bank: "0", loan: "0" } });
          }
          return message.reply(getLang("resetAllUsers"));
        }

        // ➜ eco reset users 5b
        const amount = utils.parseAmount(args[2]);
        if (!amount || typeof amount !== "bigint" || amount <= 0n) return message.reply(getLang("invalid"));

        const allUsers = await usersData.getAll();
        for (const user of allUsers) {
          let wallet = BigInt(user.money || 0);
          let bank = BigInt(user.data?.bank || 0);
          let loan = BigInt(user.data?.loan || 0);

          wallet = wallet > amount ? wallet - amount : 0n;

          await usersData.set(user.userID, { money: wallet.toString(), data: { bank: bank.toString(), loan: loan.toString() } });
        }
        return message.reply(getLang("deductedAllUsers", utils.formatMoney(amount)));
      }

      // ----------------------------------------
      // SUB-ACTION: ALL (ব্যক্তিগত সম্পূর্ণ রিসেট)
      // ----------------------------------------
      // ➜ eco reset all <uid> OR eco reset all (Reply/Mention)
      if (sub === "all") {
        if (args[2] && !targetUID) targetUID = args[2];

        if (!targetUID) return message.reply(getLang("invalid"));

        await usersData.set(targetUID, { money: "0", data: { bank: "0", loan: "0" } });
        return message.reply(getLang("resetUser", targetUID));
      }

      // ----------------------------------------
      // SUB-ACTION: AMOUNT DEDUCT (টাকা কেটে নেওয়া)
      // ----------------------------------------
      // ➜ eco reset 5b <uid> OR eco reset 5b (Reply/Mention)
      const amount = utils.parseAmount(args[1]);
      if (!amount || typeof amount !== "bigint" || amount <= 0n) return message.reply(getLang("invalid"));

      if (args[2] && !targetUID) targetUID = args[2];

      if (!targetUID) return message.reply(getLang("invalid"));

      const userData = await usersData.get(targetUID) || {};
      let wallet = BigInt(userData.money || 0);
      let bank = BigInt(userData.data?.bank || 0);
      let loan = BigInt(userData.data?.loan || 0);

      wallet = wallet > amount ? wallet - amount : 0n;

      await usersData.set(targetUID, { money: wallet.toString(), data: { bank: bank.toString(), loan: loan.toString() } });
      return message.reply(getLang("deductedUser", utils.formatMoney(amount), targetUID));
    }

    return message.reply(getLang("invalid"));
  }
};
