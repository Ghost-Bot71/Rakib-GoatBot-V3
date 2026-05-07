const { getCaption } = require("../../rakib/customApi/captionApi");

module.exports = {
  config: {
    name: "caption",
    aliases: ["cp"],
    version: "1.0",
    author: "Rakib",
    role: 0,
    category: "fun",
    guide: "{pn} [en/funny/sad/romantic]"
  },

  onStart: async function ({ message, args }) {

    const type = args[0]?.toLowerCase();

    const validTypes = ["en", "funny", "sad", "romantic"];

    if (!type) {
      return message.reply(
        "✨ Caption Categories:\n\n👉 cp en\n👉 cp funny\n👉 cp sad\n👉 cp romantic"
      );
    }

    if (!validTypes.includes(type)) {
      return message.reply("❌ Invalid type!\nUse: en / funny / sad / romantic");
    }

    const caption = await getCaption(type);

    return message.reply(`💬 ${type.toUpperCase()} Caption:\n\n${caption}`);
  }
};
