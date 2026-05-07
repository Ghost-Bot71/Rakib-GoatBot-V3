module.exports = {
  config: {
    name: "mongodb",
    aliases: ["mdb"],
    version: "DEBUG-GLOBAL",
    author: "Rakib",
    role: 0,
    category: "system"
  },

  onStart: async function ({ api, event }) {
    try {

      const globalKeys = Object.keys(global);

      let message = "🔍 GLOBAL KEYS:\n\n";
      message += globalKeys.join("\n");

      // deeper check
      if (global.client) {
        message += "\n\n📦 global.client keys:\n";
        message += Object.keys(global.client).join("\n");
      }

      if (global.GoatBot) {
        message += "\n\n🐐 global.GoatBot keys:\n";
        message += Object.keys(global.GoatBot).join("\n");
      }

      api.sendMessage(message, event.threadID, event.messageID);

    } catch (error) {
      api.sendMessage(
        "❌ DEBUG ERROR:\n" + error.message,
        event.threadID
      );
    }
  }
};
