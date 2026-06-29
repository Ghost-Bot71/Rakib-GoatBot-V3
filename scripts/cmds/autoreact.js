module.exports = {
  config: {
    name: "autoreact",
    version: "1.0",
    author: "Rakib",
    countDown: 0,
    role: 0,
    shortDescription: "Auto React",
    longDescription: "React ⌛ to any message containing a link",
    category: "events",
    guide: {
      en: ""
    }
  },

  onStart: async function () {},

  onChat: async function ({ api, event }) {
    if (!event.body) return;

    const linkRegex =
      /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9-]+\.(com|net|org|xyz|io|me|app|dev|co|info|tv|gg|ly|ai|bd)(\/[^\s]*)?)/i;

    if (linkRegex.test(event.body)) {
      try {
        await api.setMessageReaction("⌛", event.messageID, () => {}, true);
      } catch (e) {
        console.log("AutoReact Error:", e);
      }
    }
  }
};
