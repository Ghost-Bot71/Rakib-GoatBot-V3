module.exports = {
  config: {
    name: "inbox",
    aliases: ["in"],
    version: "1.0",
    author: "Rakib",
    countDown: 10,
    role: 0,
    shortDescription: {
      en: "Send message to inbox"
    },
    category: "fun"
  },

  onStart: async function ({ api, event, message }) {
    try {

      message.reply(
        "✅ Message sent successfully!\n📩 Check your inbox or message request."
      );

      api.sendMessage(
        "🤖 Hello! I'm tessa Bot.",
        event.senderID
      );

    } catch (error) {
      console.log(error);
      message.reply("❌ Failed to send message.");
    }
  }
};
