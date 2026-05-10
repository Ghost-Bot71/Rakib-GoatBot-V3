const { loadOwner } = require("../../rakib/customId/ownerUid");

module.exports = {
  config: {
    name: "spam",
    version: "1.2",
    author: "Rakib",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Spam text message"
    },
    longDescription: {
      en: "Send same message multiple times"
    },
    category: "utility",
    guide: {
      en: "{pn} <count> <text>"
    }
  },

  onStart: async function ({ api, event, args, message }) {

    // Load owner UID
    const ownerUid = await loadOwner();

    // Support single UID / array UID
    const isOwner = Array.isArray(ownerUid)
      ? ownerUid.includes(event.senderID)
      : String(ownerUid) === String(event.senderID);

    if (!isOwner) {
      return message.reply("⚠️ | এই কমান্ড শুধু বট Owner ব্যবহার করতে পারবে।");
    }

    const count = parseInt(args[0]);

    if (!count || count < 1) {
      return message.reply(
        "⚠️ | ব্যবহার:\nspam <সংখ্যা> <টেক্সট>\n\nউদাহরণ:\nspam 10 Hello"
      );
    }

    if (count > 100) {
      return message.reply("⚠️ | একবারে সর্বোচ্চ 100 বার spam করা যাবে।");
    }

    const text = args.slice(1).join(" ");

    if (!text) {
      return message.reply("⚠️ | স্প্যাম করার জন্য টেক্সট লিখুন।");
    }

    for (let i = 0; i < count; i++) {
      await api.sendMessage(text, event.threadID);
    }
  }
};
