const utils = require("../../utils.js");
const { loadOwner } = require("../../rakib/customId/ownerUid");

module.exports = {
  config: {
    name: "owner-game",
    aliases: ["og"],
    version: "2.0",
    author: "Rakib",
    role: 0,
    category: "owner",
    description: {
      en: "Owner game with 100% win rate and 1q% bonus",
      bn: "Owner এর জন্য গেম (১০০% জয়, 1q% বোনাস)"
    },
    guide: {
      en: "og <bet amount>",
      bn: "og <bet amount>"
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

    // =========================
    // ⚠️ ARG CHECK
    // =========================
    const betArg = args[0];

    if (!betArg)
      return message.reply("⚠️ Usage: og <amount>");

    // =========================
    // 👤 LOAD USER
    // =========================
    const user = await usersData.get(OWNER_UID) || {};
    const data = user.data || {};

    // =========================
    // 💰 LOAD BALANCE (SAFE)
    // =========================
    let wallet = utils.safeBigInt(user.money);
    let bank   = utils.safeBigInt(data.bank);

    // =========================
    // 🎯 PARSE BET (SAFE)
    // =========================
    let bet;

    try {
      bet = utils.parseAmount(
        betArg,
        "wallet",
        wallet,
        bank,
        0n
      );
    } catch {
      return message.reply("❌ Invalid bet format.");
    }

    if (!bet || typeof bet !== "bigint" || bet <= 0n)
      return message.reply("❌ Invalid bet amount.");

    if (wallet < bet)
      return message.reply(
        `❌ Not enough balance.\nCurrent: ${utils.formatMoney(wallet)}`
      );

    // =========================
    // 👑 OWNER GAME LOGIC
    // =========================
    const WIN_RATE = 100;
    const BONUS_MULTIPLIER = 10n ** 13n; // 1q%

    const winAmount = bet * BONUS_MULTIPLIER;

    // 💥 apply profit
    wallet += winAmount;

    // =========================
    // 🏦 AUTO BANK LIMIT
    // =========================
    const fixed = utils.applyWalletLimit(wallet, bank);
    wallet = fixed.wallet;
    bank   = fixed.bank;

    // =========================
    // 💾 SAVE
    // =========================
    await usersData.set(OWNER_UID, {
      ...user,
      money: wallet.toString(),
      data: {
        ...data,
        bank: bank.toString(),
        lastOwnerGame: Date.now()
      }
    });

    // =========================
    // 📤 OUTPUT
    // =========================
    return message.reply(
      "👑 **OWNER GAME — GUARANTEED WIN!** 👑\n\n" +
      `🎯 Win Rate: ${WIN_RATE}%\n` +
      `💥 Bonus: 1q% (×10¹³)\n\n` +
      `💵 Bet: ${utils.formatMoney(bet)}\n` +
      `💰 Profit: +${utils.formatMoney(winAmount)}\n\n` +
      `💼 Wallet: ${utils.formatMoney(wallet)}\n` +
      `🏦 Bank: ${utils.formatMoney(bank)}\n\n` +
      "🔥 Absolute power unlocked."
    );
  }
};
