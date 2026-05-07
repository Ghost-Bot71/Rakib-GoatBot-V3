const utils = require("../../utils.js");
const { loadOwner } = require("../../rakib/customId/ownerUid");

module.exports = {
  config: {
    name: "total-bonus",
    aliases: ["tb"],
    version: "5.0",
    author: "Rakib",
    role: 0,
    category: "owner",
    description: {
      en: "Owner unlimited bonus (fully safe, no limit, no zero bug)",
      bn: "Owner এর জন্য আনলিমিটেড বোনাস (সম্পূর্ণ সেফ)"
    },
    guide: {
      en: "tb <money> <exp>",
      bn: "tb <money> <exp>"
    }
  },

  onStart: async function ({ message, event, args, usersData }) {

    // 🔒 Owner Check (dynamic + safe)
    const ownerUID = await loadOwner();
    const isOwner = Array.isArray(ownerUID)
      ? ownerUID.includes(String(event.senderID))
      : String(event.senderID) === String(ownerUID);

    if (!isOwner)
      return message.reply("❌ This command is owner-only.");

    const OWNER_UID = String(event.senderID);

    const moneyArg = args[0];
    const expArg = args[1];

    if (!moneyArg && !expArg)
      return message.reply("⚠️ Usage: tb <money> <exp>");

    const user = await usersData.get(OWNER_UID) || {};
    const data = user.data || {};

    // =========================
    // 💰 LOAD BALANCE (SAFE)
    // =========================
    let wallet = utils.safeBigInt(user.money);
    let bank   = utils.safeBigInt(data.bank);

    // =========================
    // 💵 PARSE MONEY (SAFE)
    // =========================
    let moneyAdd = 0n;

    if (moneyArg) {
      try {
        moneyAdd = utils.parseAmount(
          moneyArg,
          "wallet",
          wallet,
          bank,
          0n
        );
      } catch {
        return message.reply("❌ Invalid money format.");
      }

      if (!moneyAdd || typeof moneyAdd !== "bigint" || moneyAdd <= 0n)
        return message.reply("❌ Invalid money amount.");
    }

    // =========================
    // ⭐ PARSE EXP
    // =========================
    let expAdd = 0;

    if (expArg) {
      expAdd = parseInt(expArg);

      if (isNaN(expAdd) || expAdd < 0)
        return message.reply("❌ Invalid EXP amount.");
    }

    // =========================
    // ➕ APPLY MONEY
    // =========================
    wallet += moneyAdd;

    // 🏦 AUTO BANK LIMIT
    const fixed = utils.applyWalletLimit(wallet, bank);
    wallet = fixed.wallet;
    bank   = fixed.bank;

    // =========================
    // ⭐ APPLY EXP
    // =========================
    const newExp = (user.exp || 0) + expAdd;

    // =========================
    // 💾 SAVE
    // =========================
    await usersData.set(OWNER_UID, {
      ...user,
      money: wallet.toString(),
      exp: newExp,
      data: {
        ...data,
        bank: bank.toString()
      }
    });

    // =========================
    // 📤 OUTPUT
    // =========================
    return message.reply(
      "🎁 **TOTAL BONUS SUCCESS!**\n\n" +
      `💰 Balance Added: ${utils.formatMoney(moneyAdd)}\n` +
      `⭐ EXP Added: ${expAdd}\n\n` +
      `💼 Wallet: ${utils.formatMoney(wallet)}\n` +
      `🏦 Bank: ${utils.formatMoney(bank)}\n` +
      `📊 EXP: ${newExp}`
    );
  }
};
