"use strict";
// daily.js — Improved Daily Reward System with Streak + GIF
const axios = require("axios");
const { PassThrough } = require("stream");

function fmt(n) { return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g,","); }

const GIF_DAILY = "https://media.tenor.com/0SiIqmhSEbMAAAAC/jackpot-casino.gif";
const GIF_WAIT  = "https://media.tenor.com/LLmKHnq2A6cAAAAC/neon-cyberpunk.gif";

// Base rewards per weekday (index 0 = Sunday)
const DAY_REWARD = [1000,1200,1400,1600,1800,2200,3000];
const DAY_NAMES  = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday 🎉"];

// Streak bonus multipliers
function streakBonus(streak) {
  if (streak >= 30) return 5.0;
  if (streak >= 14) return 3.0;
  if (streak >= 7)  return 2.0;
  if (streak >= 3)  return 1.5;
  return 1.0;
}

function getToday() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;
}

function getYesterday() {
  const d = new Date(); d.setDate(d.getDate()-1);
  return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;
}

module.exports = {
  config: {
    name: "daily",
    aliases: ["dailyreward","dr","claim"],
    version: "3.0", author: "Rakib Islam",
    countDown: 5, role: 0,
    shortDescription: "🎁 Daily Reward — Streak Bonus System",
    longDescription: "Claim daily coins with streak bonus! Longer streak = more coins.",
    category: "game",
    guide: { en: "{pn} — claim daily\n{pn} streak — see your streak\n{pn} info — reward table" }
  },

  onStart: async function ({ args, message, event, usersData }) {
    const { senderID } = event;
    const sub = (args[0] || "").toLowerCase();

    if (sub === "info") {
      return message.reply(
        `🎁 𝗗𝗔𝗜𝗟𝗬 𝗥𝗘𝗪𝗔𝗥𝗗 𝗧𝗔𝗕𝗟𝗘\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━\n` +
        DAY_NAMES.map((d,i)=>`${d.padEnd(12)}: ৳${fmt(DAY_REWARD[i])}`).join("\n") +
        `\n━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `🔥 Streak Bonuses:\n` +
        `   3+ days  : 1.5x\n` +
        `   7+ days  : 2x\n` +
        `   14+ days : 3x\n` +
        `   30+ days : 5x!\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `⏰ Resets every 24h (midnight)`
      );
    }

    try {
      let userData = await usersData.get(senderID);
      const today = getToday();
      const yesterday = getYesterday();
      const d = userData.data || {};

      if (sub === "streak") {
        const streak = d.dailyStreak || 0;
        const mult = streakBonus(streak);
        return message.reply(
          `🔥 𝗬𝗼𝘂𝗿 𝗦𝘁𝗿𝗲𝗮𝗸: ${streak} day${streak!==1?"s":""}\n` +
          `⚡ Current Bonus: ${mult}x\n` +
          `💰 Balance: ৳${fmt(userData.money || 0)}`
        );
      }

      if (d.lastDailyDate === today) {
        const timeLeft = new Date();
        timeLeft.setHours(24,0,0,0);
        const diffMs = timeLeft - new Date();
        const h = Math.floor(diffMs/3600000);
        const m = Math.floor((diffMs%3600000)/60000);
        return message.reply(
          `⏰ 𝗔𝗹𝗿𝗲𝗮𝗱𝘆 𝗖𝗹𝗮𝗶𝗺𝗲𝗱!\n\n` +
          `🔥 Streak : ${d.dailyStreak||0} days\n` +
          `⏳ Next claim in: ${h}h ${m}m\n` +
          `💰 Balance: ৳${fmt(userData.money||0)}\n\n` +
          `💡 .daily streak দিয়ে streak দেখো`
        );
      }

      // Update streak
      let streak = (d.dailyStreak || 0);
      if (d.lastDailyDate === yesterday) {
        streak++;
      } else {
        streak = 1; // streak broken
      }

      const dayIdx = new Date().getDay();
      const baseReward = DAY_REWARD[dayIdx];
      const mult = streakBonus(streak);
      const totalReward = Math.round(baseReward * mult);

      d.dailyStreak = streak;
      d.lastDailyDate = today;

      await usersData.set(senderID, {
        money: (userData.money || 0) + totalReward,
        exp: (userData.exp || 0) + Math.round(totalReward / 10),
        data: d
      });

      const newBalance = (userData.money || 0) + totalReward;
      const body =
        `🎁 𝗗𝗔𝗜𝗟𝗬 𝗥𝗘𝗪𝗔𝗥𝗗 𝗖𝗟𝗔𝗜𝗠𝗘𝗗!\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `📅 Day     : ${DAY_NAMES[dayIdx]}\n` +
        `🔥 Streak  : ${streak} day${streak!==1?"s":""} 🔥\n` +
        `⚡ Bonus   : ${mult}x\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `💵 Base    : ৳${fmt(baseReward)}\n` +
        `🎁 Total   : ৳${fmt(totalReward)}\n` +
        `📊 Balance : ৳${fmt(newBalance)}\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━\n` +
        (streak >= 7 ? `🏆 ${streak} Day Streak! Keep it up!\n` : `💡 Daily claim করো streak বাড়াও!\n`) +
        `⏰ Next claim: tomorrow`;

      try {
        const res = await axios.get(GIF_DAILY, { responseType: "arraybuffer", timeout: 6000 });
        const st = new PassThrough(); st.end(Buffer.from(res.data));
        return message.reply({ body, attachment: st });
      } catch {
        return message.reply(body);
      }

    } catch (err) {
      return message.reply("❌ Daily reward এ সমস্যা হয়েছে। আবার চেষ্টা করো।");
    }
  }
};
