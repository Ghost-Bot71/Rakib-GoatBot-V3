const { getDare, getTruth } = require("../../rakib/customApi/tdApi");

module.exports = {
  config: {
    name: "td",
    version: "1.0",
    author: "Rakib",
    role: 0,
    category: "fun",
    guide: "{pn} [truth/dare]"
  },

  onStart: async function ({ message, args }) {

    const type = args[0]?.toLowerCase();

    if (!type) {
      return message.reply(
        "🎲 Truth or Dare?\n\n👉 td truth\n👉 td dare"
      );
    }

    if (type === "truth") {
      const truth = await getTruth();
      return message.reply(`🤫 Truth:\n${truth}`);
    }

    if (type === "dare") {
      const dare = await getDare();
      return message.reply(`🔥 Dare:\n${dare}`);
    }

    return message.reply("❌ Use: td truth অথবা td dare");
  }
};
