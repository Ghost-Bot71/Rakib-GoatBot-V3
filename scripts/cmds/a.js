module.exports = {
  config: {
    name: "a",
    aliases: ["mask", "customtag", "tc"],
    version: "3.5",
    author: "Rakib Islam",
    countDown: 1,
    role: 0,
    shortDescription: "Tag someone with custom text using command/aliases",
    category: "fun",
    guide: {
      en: "{pn} [Your Custom Text] (Reply to someone's message)"
    }
  },

  onStart: async function ({ api, event, args, message }) {
    const { type, messageReply, threadID, messageID } = event;

    // ১. চেক: মেসেজটি অবশ্যই কোনো মেসেজের 'Reply' হতে হবে
    if (type !== "message_reply") {
      return message.reply("⚠️ দয়া করে কারো মেসেজে Reply দিয়ে এই কমান্ডটি ব্যবহার করুন!");
    }

    // ২. চেক: কমান্ড বা আলাইয়াসের পাশে কোনো কাস্টম টেক্সট লেখা হয়েছে কিনা
    const textToSend = args.join(" ").trim();
    if (!textToSend) {
      return message.reply("❌ ট্যাগের জায়গায় কী লেখা উঠবে, সেই টেক্সটটি কমান্ডের পাশে লিখে দিন! (যেমন: .a কি করো)");
    }

    const targetID = messageReply.senderID; // যার মেসেজে রিপ্লাই দেওয়া হয়েছে (ভিকটিম)

    try {
      // চ্যাট স্ক্রিন ফ্রেশ রাখার জন্য আপনার পাঠানো মূল কমান্ড মেসেজটি ডিলিট করা
      try { 
        await api.unsendMessage(messageID); 
      } catch (e) {
        // বটের মেসেজ ডিলিট করার পারমিশন না থাকলে স্কিপ করবে
      }

      // ৩. কাস্টম মাস্কিং মেসেজ সরাসরি পুশ
      return api.sendMessage({
        body: textToSend,
        mentions: [{
          tag: textToSend, // চ্যাটে শুধু এই কাস্টম টেক্সটটাই ব্লু কালার ট্যাগ হয়ে দেখাবে
          id: targetID     // ব্যাকগ্রাউন্ডে ভিকটিমের আইডির লিংক ও নোটিফিকেশন
        }]
      }, threadID);

    } catch (err) {
      console.error("Command Masking Error:", err);
    }
  }
};
