const utils = require("../../utils.js");
const { loadOwner } = require("../../rakib/customId/ownerUid");

module.exports = {
  config: {
    name: "eco",
    version: "3.0",
    author: "Rakib",
    role: 0,
    category: "owner",
    shortDescription: {
      en: "Economy control system"
    }
  },

  langs: {
    en: {
      resetUser: "✅ User balance reset.",
      resetAll: "✅ All users balance reset.",
      addedUser: "💰 Added %1 to user.",
      addedAll: "💰 Added %1 to all users.",
      invalid: "❌ Invalid amount",
      notOwner: "❌ Only bot owner can use this command."
    }
  },

  onStart: async function ({ message, event, args, usersData, getLang }) {

    // 🔒 Owner Check (dynamic + multi support)
    const ownerUID = await loadOwner();
    const isOwner = Array.isArray(ownerUID)
      ? ownerUID.includes(String(event.senderID))
      : String(event.senderID) === String(ownerUID);

    if (!isOwner)
      return message.reply(getLang("notOwner"));

    const WALLET_LIMIT = utils.parseAmount("150cs");
    const sub = args[0];

    if (!sub)
      return message.reply(getLang("invalid"));

    // =========================
    // RESET SYSTEM
    // =========================
    if (sub === "reset") {

      // 🔁 single user
      if (event.messageReply) {

        const uid = event.messageReply.senderID;

        await usersData.set(uid, {
          money: "0",
          data: {
            bank: "0",
            loan: "0"
          }
        });

        return message.reply(getLang("resetUser"));
      }

      // 🔁 all users
      const allUsers = await usersData.getAll();

      for (const user of allUsers) {
        await usersData.set(user.userID, {
          money: "0",
          data: {
            bank: "0",
            loan: "0"
          }
        });
      }

      return message.reply(getLang("resetAll"));
    }

    // =========================
    // ADD MONEY
    // =========================
    if (sub === "add") {

      const amount = utils.parseAmount(args[1]);

      if (!amount || typeof amount !== "bigint" || amount <= 0n)
        return message.reply(getLang("invalid"));

      // ➕ ONE USER
      if (event.messageReply) {

        const uid = event.messageReply.senderID;
        const userData = await usersData.get(uid) || {};

        let wallet = BigInt(userData.money || 0);
        let bank = BigInt(userData.data?.bank || 0);
        let loan = BigInt(userData.data?.loan || 0);

        wallet += amount;

        if (wallet > WALLET_LIMIT) {
          const extra = wallet - WALLET_LIMIT;
          wallet = WALLET_LIMIT;
          bank += extra;
        }

        await usersData.set(uid, {
          money: wallet.toString(),
          data: {
            bank: bank.toString(),
            loan: loan.toString()
          }
        });

        return message.reply(
          getLang("addedUser", utils.formatMoney(amount))
        );
      }

      // ➕ ALL USERS
      const allUsers = await usersData.getAll();

      for (const user of allUsers) {

        let wallet = BigInt(user.money || 0);
        let bank = BigInt(user.data?.bank || 0);
        let loan = BigInt(user.data?.loan || 0);

        wallet += amount;

        if (wallet > WALLET_LIMIT) {
          const extra = wallet - WALLET_LIMIT;
          wallet = WALLET_LIMIT;
          bank += extra;
        }

        await usersData.set(user.userID, {
          money: wallet.toString(),
          data: {
            bank: bank.toString(),
            loan: loan.toString()
          }
        });
      }

      return message.reply(
        getLang("addedAll", utils.formatMoney(amount))
      );
    }

    return message.reply(getLang("invalid"));
  }
};
