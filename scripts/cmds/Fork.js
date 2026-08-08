module.exports = {
  config: {
    name: "fork",
    version: "1.4",
    author: "Rakib Islam",
    countDown: 2,
    role: 0,
    shortDescription: "Show official fork link with owner info",
    category: "utils",
    guide: {
      en: "Type 'fork' to see the link and owner."
    }
  },

  langs: {
    en: {
      current: "╭───────『 🌐 』───────╮\n\n    OFFICIAL GITHUB FORK \n\n  🔗 Link: %1\n  👤 Owner: 🆁🅰🅺🅸🅱\n\n╰───────『 ✨ 』───────╯"
    }
  },

  onStart: async function ({ message, getLang }) {
    const link = "FORK NAI🌚";
    return message.reply(getLang("current", link));
  },

  onChat: async function ({ message, getLang, event }) {
    if (event.body && event.body.toLowerCase() === "fork") {
      const link = "FORK NAI🌚";
      return message.reply(getLang("current", link));
    }
  }
};
