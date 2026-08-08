const axios = require("axios");

// API URL
const API_URL = "https://balance-bot-api.onrender.com";

// 🔹 Get balance
async function getBalance(userID) {
  try {
    const res = await axios.get(`${API_URL}/api/balance/${userID}`);
    return res.data.balance || 100;
  } catch {
    return 100;
  }
}

// 🔹 Win balance
async function winGame(userID, amount) {
  try {
    const res = await axios.post(`${API_URL}/api/balance/win`, { userID, amount });
    return res.data.success ? res.data.balance : null;
  } catch {
    return null;
  }
}

// 🔹 Lose balance
async function loseGame(userID, amount) {
  try {
    const res = await axios.post(`${API_URL}/api/balance/lose`, { userID, amount });
    return res.data.success ? res.data.balance : null;
  } catch {
    return null;
  }
}

module.exports = {
  config: {
    name: "bet",
    version: "4.1",
    author: "Rakib Islam",
    countDown: 5,
    role: 0,
    description: "Spin and win/loss money. Use '/spin <amount>' or '/spin top'.",
    category: "economy",
    guide: {
      en: "{p}spin <amount>\n{p}spin top"
    }
  },

  onStart: async function ({ message, event, args }) {
    const senderID = event.senderID;
    const subCommand = args[0];

    // ✅ /spin top leaderboard (simple message, needs usersData if leaderboard API exists)
    if (subCommand === "top") {
      return message.reply("🏆 Spin leaderboard not implemented with API yet.");
    }

    // ✅ /spin <amount>
    const betAmount = parseInt(subCommand);
    if (isNaN(betAmount) || betAmount <= 0) {
      return message.reply("❌ Usage:\n/spin <amount>\n/spin top");
    }

    let balance = await getBalance(senderID);
    if (balance < betAmount) {
      return message.reply(`❌ Not enough money.\n💰 Your balance: ${balance} $`);
    }

    // Deduct bet first
    balance = await loseGame(senderID, betAmount);

    // Outcomes with multipliers (60% win chance)
    const outcomes = [
      { text: "💥 You lost everything!", multiplier: 0 },   // loss
      { text: "😞 You got back half.", multiplier: 0.5 },   // partial
      { text: "🟡 You broke even.", multiplier: 1 },        // break even
      { text: "🟢 You doubled your money!", multiplier: 2 },
      { text: "🔥 You tripled your bet!", multiplier: 3 },
      { text: "🎉 JACKPOT! 10x reward!", multiplier: 10 }  // rare
    ];

    // 60% normal, 40% rare logic for jackpot
    let outcome;
    const rand = Math.random();
    if (rand < 0.6) {
      outcome = outcomes[Math.floor(Math.random() * 4)]; // first 4 are common
    } else {
      outcome = outcomes[Math.floor(Math.random() * 2) + 4]; // last 2 are rare
    }

    const reward = Math.floor(betAmount * outcome.multiplier);
    const newBalance = reward > 0 ? await winGame(senderID, reward) : balance;

    return message.reply(
`${outcome.text}
🎰 You bet: ${betAmount} $
💸 You won: ${reward} $
💰 New balance: ${newBalance} $`
    );
  }
};
