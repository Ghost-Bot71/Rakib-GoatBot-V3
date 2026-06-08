const utils = require("../../utils.js");
const sleep = ms => new Promise(r => setTimeout(r, ms));

module.exports = {
  config: {
    name: "crash",
    aliases: ["rocket"],
    version: "3.1",
    author: "Rakib",
    role: 0,
    category: "economy"
  },

  onStart: async function ({ api, message, event, args, usersData }) {
    const uid = event.senderID;
    const user = await usersData.get(uid) || {};
    const data = user.data || {};
    const name = user.name || "Unknown";
    const isVIP = data.vip === true;

    /* ===== PLAY LIMIT (MAX 50) ===== */
    let crashCount = Number(data.crashCount || 0);
    if (crashCount >= 30) {
      return message.reply("❌ আপনি আপনার দৈনিক ৩০ বারের খেলার লিমিট শেষ করে ফেলেছেন!");
    }

    /* ===== COOLDOWN ===== */
    const now = Date.now();
    if (now - (data.lastCrash || 0) < 10_000)
      return message.reply("⏳ Please wait before playing again.");

    /* ===== LOAD BALANCES (SAFE) ===== */
    let wallet = utils.safeBigInt(user.money);
    let bank   = utils.safeBigInt(data.bank);

    /* ===== BET & CASHOUT ===== */
    const bet = utils.parseAmount(
      args[0],
      "wallet",
      wallet,
      bank,
      0n
    );

    const cashout = Number(args[1]);

    if (!bet || typeof bet !== "bigint" || bet <= 0n || isNaN(cashout) || cashout < 1.1)
      return message.reply("❌ crash <bet> <cashout>");

    if (wallet < bet)
      return message.reply("❌ Not enough balance.");

    // লিমিট ১ বাড়িয়ে দেওয়া হলো
    crashCount += 1;

    /* ===== CRASH POINT ===== */
    const crashPoint =
      Math.max(
        1.0,
        (Math.random() * 6 + 1) *
        (Math.random() < 0.08 ? 2.5 : 1)
      );

    const sent = await message.reply("🚀 Launching...");

    /* ===== EDIT 1 ===== */
    await sleep(350);
    api.editMessage(
      `🚀 CRASH GAME\n\n👤 Player: ${name}\n📊 Played: ${crashCount}/30\n💥 Multiplier: 1.35x`,
      sent.messageID
    );

    /* ===== EDIT 2 ===== */
    await sleep(350);
    api.editMessage(
      `🚀 CRASH GAME\n\n👤 Player: ${name}\n📊 Played: ${crashCount}/30\n💥 Multiplier: 1.82x`,
      sent.messageID
    );

    /* ===== EDIT 3 ===== */
    await sleep(350);
    api.editMessage(
      `🚀 CRASH GAME\n\n👤 Player: ${name}\n📊 Played: ${crashCount}/30\n💥 Multiplier: 2.24x`,
      sent.messageID
    );

    /* ===== RESULT ===== */
    let profit = -bet;
    let resultText = "";

    const crashStats = data.crashStats || { win: "0", lose: "0" };

    if (cashout < crashPoint) {
      const vipBonus = isVIP ? 125n : 100n; // 25% VIP
      const win =
        (bet * BigInt(Math.floor(cashout * 100)) * vipBonus) /
        100n / 100n;

      wallet += win;
      profit = win;

      crashStats.win =
        (utils.safeBigInt(crashStats.win) + win).toString();

      resultText =
        `🎉 CASHED OUT at ${cashout.toFixed(2)}x\n` +
        (isVIP ? "👑 VIP Bonus: +25%\n" : "");
    }
    else {
      wallet -= bet;

      crashStats.lose =
        (utils.safeBigInt(crashStats.lose) + bet).toString();

      resultText =
        `💀 CRASHED at ${crashPoint.toFixed(2)}x`;
    }

    /* ===== AUTO BANK LIMIT (150cs) ===== */
    const fixed = utils.applyWalletLimit(wallet, bank);
    wallet = fixed.wallet;
    bank   = fixed.bank;

    /* ===== SAVE ===== */
    await usersData.set(uid, {
      ...user,
      money: wallet.toString(),
      data: {
        ...data,
        bank: bank.toString(),
        lastCrash: now,
        crashCount: crashCount,
        crashStats
      }
    });

    /* ===== FINAL EDIT (4) ===== */
    await sleep(400);
    api.editMessage(
      `🚀 CRASH RESULT\n\n` +
      `👤 Player: ${name}\n` +
      `📊 Played: ${crashCount}/30\n` + 
      `💥 Final Multiplier: ${Math.min(cashout, crashPoint).toFixed(2)}x\n\n` +
      `${resultText}\n` +
      `💵 Bet: ${utils.formatMoney(bet)}\n` +
      (profit > 0n
        ? `💰 Win: +${utils.formatMoney(profit)}\n`
        : `💸 Loss: -${utils.formatMoney(-profit)}\n`) +
      `💼 Wallet: ${utils.formatMoney(wallet)}\n` +
      `🏦 Bank: ${utils.formatMoney(bank)}`,
      sent.messageID
    );
  }
};
