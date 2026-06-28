const { loadOwner } = require("../../rakib/customId/ownerUid");

module.exports = {
    config: {
        name: "reply",
        aliases: ["rep"],
        version: "1.0",
        role: 0, 
        author: "Author",
        shortDescription: "নির্দিষ্ট মেসেজে কাস্টম রিপ্লাই দেওয়া।",
        longDescription: "যেকোনো মেসেজে রিপ্লাই করে এই কমান্ডটি লিখলে বট ঠিক ওই মেসেজটিতেই আপনার দেওয়া টেক্সট লিখে রিপ্লাই করবে।",
        category: "utility",
        guide: "{pn} [text]"
    },

    onStart: async function ({ api, event, args, message }) {
        // 🔒 Owner Check
        const ownerUID = await loadOwner();
        const isOwner = Array.isArray(ownerUID)
            ? ownerUID.includes(String(event.senderID))
            : String(event.senderID) === String(ownerUID);

        if (!isOwner) {
            return message.reply("❌ Owner only command.");
        }

        // ইউজার কোনো মেসেজে রিপ্লাই দিয়েছে কি না তা চেক করা
        if (event.type !== "message_reply") {
            return message.reply("দয়া করে নির্দিষ্ট কোনো মেসেজে রিপ্লাই দিয়ে তারপর কমান্ডটি লিখুন।");
        }

        // কমান্ডের সাথে কোনো টেক্সট দেওয়া হয়েছে কি না তা চেক করা
        const text = args.join(" ");
        if (!text) {
            return message.reply("আপনি কী লিখে রিপ্লাই দিতে চান, সেটি কমান্ডের সাথে লিখুন।\nউদাহরণ: /reply দারুণ বলেছ!");
        }

        // টার্গেট করা মেসেজটিতে ইউজারের দেওয়া টেক্সট দিয়ে রিপ্লাই করা
        return api.sendMessage(text, event.threadID, event.messageReply.messageID);
    }
};
