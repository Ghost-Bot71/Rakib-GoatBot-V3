module.exports = {
  config: {
    name: "sell",
    aliases: ["sellall"],
    version: "1.0",
    author: "Rakib",
    countDown: 5,
    role: 0,
    shortDescription: "Sell your mined resources",
    longDescription: "Sell resources from your mining inventory for money",
    category: "economy",
    guide: {
      en: "{pn} all - Sell all resources\n{pn} [resource name] - Sell specific resource"
    }
  },

  onStart: async function ({ message, args, usersData }) {
    const userData = await usersData.get(message.senderID);

    if (!userData.data.mining || !userData.data.mining.resources) {
      return message.reply("❌ You have no resources to sell!");
    }

    const resources = userData.data.mining.resources;
    const RESOURCES = require("./mine.js").RESOURCES || global.RESOURCES;

    let totalEarned = 0;
    let soldText = "";

    // SELL ALL
    if (args[0] === "all") {
      for (const [id, amount] of Object.entries(resources)) {
        if (amount > 0 && RESOURCES[id]) {
          const res = RESOURCES[id];
          const value = Math.floor(amount * res.valuePerGram);

          totalEarned += value;
          soldText += `\n${res.emoji} ${res.name}: +$${value.toLocaleString()}`;

          resources[id] = 0;
        }
      }

      if (totalEarned === 0) {
        return message.reply("❌ Nothing to sell!");
      }

      userData.money = (userData.money || 0) + totalEarned;

      await usersData.set(message.senderID, {
        money: userData.money,
        data: userData.data
      });

      return message.reply(
        `💰 SOLD ALL RESOURCES\n━━━━━━━━━━━━━━\n${soldText}\n\n💵 Total Earned: $${totalEarned.toLocaleString()}`
      );
    }

    // SELL SPECIFIC
    const input = args.join(" ").toLowerCase();

    const found = Object.entries(RESOURCES).find(
      ([id, res]) => res.name.toLowerCase() === input || id === input
    );

    if (!found) {
      return message.reply("❌ Resource not found!");
    }

    const [resourceId, resource] = found;

    if (!resources[resourceId] || resources[resourceId] <= 0) {
      return message.reply(`❌ You don't have any ${resource.name}!`);
    }

    const amount = resources[resourceId];
    const value = Math.floor(amount * resource.valuePerGram);

    resources[resourceId] = 0;
    userData.money = (userData.money || 0) + value;

    await usersData.set(message.senderID, {
      money: userData.money,
      data: userData.data
    });

    return message.reply(
      `💰 SOLD ${resource.name}\n━━━━━━━━━━━━━━\n${resource.emoji} ${amount}${resource.unit}\n💵 Earned: $${value.toLocaleString()}`
    );
  }
};
