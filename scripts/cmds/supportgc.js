module.exports = {
  config: {
    name: "supportgc",
    version: "1.0",
    author: "Rakib",
    role: 0,
    shortDescription: "Join support group",
    longDescription: "Add user to support group",
    category: "system",
    guide: {
      en: "{pn}"
    }
  },

  onStart: async ({ api, event, message }) => {
    const SUPPORT_GC = "1391985172712942";
    const uid = event.senderID;

    try {
      await api.addUserToGroup(uid, SUPPORT_GC);

      return message.reply(
        "✅ আপনাকে সাপোর্ট গ্রুপে যোগ করার অনুরোধ পাঠানো হয়েছে।"
      );
    } catch (err) {
      return message.reply(
        "❌ আপনাকে গ্রুপে যোগ করা যায়নি। কন্টাক্ট প্লিজ: https://www.facebook.com/hoon6t9"
      );
    }
  }
};
