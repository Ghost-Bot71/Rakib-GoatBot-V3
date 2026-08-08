const axios = require("axios");
const { PassThrough } = require("stream");

const lotterySessions = new Map();

function fmtFull(n) {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
function fmt(n) {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(2) + "B";
  if (n >= 1_000_000)     return (n / 1_000_000).toFixed(2) + "M";
  if (n >= 1_000)         return (n / 1_000).toFixed(1) + "K";
  return n.toString();
}
function parseAmount(str) {
  if (!str) return NaN;
  str = str.toLowerCase().replace(/,/g, "");
  if (str.endsWith("b")) return parseFloat(str) * 1_000_000_000;
  if (str.endsWith("m")) return parseFloat(str) * 1_000_000;
  if (str.endsWith("k")) return parseFloat(str) * 1_000;
  return parseFloat(str);
}

const TICKETS = [
  { emoji: "🎟️", name: "Basic",    cost: 10_000,   jackpot: 500_000,   odds: 0.03 },
  { emoji: "💫", name: "Silver",   cost: 50_000,   jackpot: 2_000_000, odds: 0.025 },
  { emoji: "⭐", name: "Gold",     cost: 200_000,  jackpot: 8_000_000, odds: 0.02 },
  { emoji: "💎", name: "Diamond",  cost: 1_000_000, jackpot: 50_000_000, odds: 0.015 },
  { emoji: "👑", name: "Royal",    cost: 5_000_000, jackpot: 250_000_000, odds: 0.01 },
];

module.exports = {
  config: {
    name: "lottery",
    aliases: ["lotto", "ticket"],
    version: "3.0",
    author: "Rakib Islam",
    countDown: 10,
    role: 0,
    shortDescription: "🎰 Lottery Ticket System",
    longDescription: "Buy lottery tickets and win big! 5 ticket tiers from Basic to Royal.",
    category: "game",
    guide: {
      en: "{pn} — Show ticket info\n{pn} <tier 1-5> — Buy ticket\n{pn} buy <amount> — Buy by amount\nExample: .lottery 2\n         .lottery buy 50000"
    }
  },

  onStart: async function ({ message, event, usersData, args }) {
    const { senderID } = event;

    if (!args[0] || args[0] === "info" || args[0] === "list") {
      const list = TICKETS.map((t, i) =>
        `${t.emoji} Tier ${i + 1}: ${t.name}\n   💵 Cost: ৳${fmtFull(t.cost)}\n   🏆 Jackpot: ৳${fmt(t.jackpot)}\n   📊 Win Rate: ${(t.odds * 100).toFixed(1)}%`
      ).join("\n\n");

      const gif = "https://media.tenor.com/gPBNw22DtFkAAAAC/lottery-lucky.gif";
      try {
        const res = await axios.get(gif, { responseType: "arraybuffer", timeout: 6000 });
        const st = new PassThrough(); st.end(Buffer.from(res.data));
        return message.reply({
          body: `🎟️ ══ 𝗟𝗢𝗧𝗧𝗘𝗥𝗬 𝗧𝗜𝗖𝗞𝗘𝗧𝗦 ══ 🎟️\n━━━━━━━━━━━━━━━━━━━━━━━\n\n${list}\n\n━━━━━━━━━━━━━━━━━━━━━━━\n📌 Usage: .lottery <tier 1-5>\n🤖 Ghost Net — Ewr Hinata`,
          attachment: st
        });
      } catch {
        return message.reply(`🎟️ Lottery Tickets:\n\n${list}\n\nUsage: .lottery <tier 1-5>`);
      }
    }

    let tierIndex = -1;
    const arg = args[0].toLowerCase();

    if (arg === "buy" && args[1]) {
      const amt = parseAmount(args[1]);
      if (!isNaN(amt)) {
        tierIndex = TICKETS.findIndex(t => t.cost <= amt && amt < (TICKETS[TICKETS.indexOf(t) + 1]?.cost || Infinity));
        if (tierIndex === -1) tierIndex = TICKETS.filter(t => t.cost <= amt).length - 1;
      }
    } else if (!isNaN(arg) && parseInt(arg) >= 1 && parseInt(arg) <= TICKETS.length) {
      tierIndex = parseInt(arg) - 1;
    } else {
      const amt = parseAmount(arg);
      if (!isNaN(amt)) {
        tierIndex = TICKETS.filter(t => t.cost <= amt).length - 1;
      }
    }

    if (tierIndex < 0) tierIndex = 0;
    const ticket = TICKETS[tierIndex];

    try {
      let userData = await usersData.get(senderID);
      let money = userData?.money ?? 0;

      if (money <= 0) {
        money = 1_000_000_000;
        await usersData.addMoney(senderID, money);
      }

      if (money < ticket.cost) {
        return message.reply(
          `❌ যথেষ্ট balance নেই!\n` +
          `আপনার Balance: ৳${fmtFull(money)}\n` +
          `${ticket.emoji} ${ticket.name} Ticket: ৳${fmtFull(ticket.cost)}\n\n` +
          `💡 অন্য tier select করুন: .lottery 1`
        );
      }

      await usersData.subtractMoney(senderID, ticket.cost);

      const rand = Math.random();
      const won = rand < ticket.odds;
      const bigwin = rand < ticket.odds * 0.1;

      let prize = 0;
      let resultMsg = "";

      if (bigwin) {
        prize = ticket.jackpot * 2;
        resultMsg = `🎊 𝗠𝗘𝗚𝗔 𝗝𝗔𝗖𝗞𝗣𝗢𝗧! DOUBLE WIN!!! 🎊\n💰 Prize: ৳${fmtFull(prize)}`;
      } else if (won) {
        prize = ticket.jackpot;
        resultMsg = `🎉 𝗝𝗔𝗖𝗞𝗣𝗢𝗧! You won! 🎉\n💰 Prize: ৳${fmtFull(prize)}`;
      } else {
        const smallPrize = Math.random() < 0.3;
        if (smallPrize) {
          prize = Math.floor(ticket.cost * (0.1 + Math.random() * 0.5));
          resultMsg = `✅ Small Win! 🎈\n💰 Prize: ৳${fmtFull(prize)}`;
        } else {
          resultMsg = `😢 Not this time! Better luck next draw!`;
        }
      }

      let newMoney = money - ticket.cost;
      if (prize > 0) {
        await usersData.addMoney(senderID, prize);
        newMoney = newMoney + prize;
      }

      const body =
        `🎟️ ══ 𝗟𝗢𝗧𝗧𝗘𝗥𝗬 𝗗𝗥𝗔𝗪 ══ 🎟️\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `${ticket.emoji} Ticket: ${ticket.name} Tier ${tierIndex + 1}\n` +
        `💵 Cost: ৳${fmtFull(ticket.cost)}\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `🎲 Drawing...\n\n` +
        `${resultMsg}\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `📊 Balance: ৳${fmtFull(Math.max(0, newMoney))}\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `🤖 Ghost Net — .lottery to play again`;

      const gif = won || prize > 0
        ? "https://media.tenor.com/gPBNw22DtFkAAAAC/lottery-lucky.gif"
        : "https://media.tenor.com/j1X_eJkrgLEAAAAC/money-cash.gif";

      try {
        const res = await axios.get(gif, { responseType: "arraybuffer", timeout: 8000 });
        const st = new PassThrough(); st.end(Buffer.from(res.data));
        return message.reply({ body, attachment: st });
      } catch {
        return message.reply(body);
      }
    } catch (err) {
      return message.reply("❌ Lottery তে সমস্যা হয়েছে। আবার try করুন।");
    }
  }
};
