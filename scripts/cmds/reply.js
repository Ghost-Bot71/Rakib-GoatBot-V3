module.exports = {
    config: {
        name: "reply",
        aliases: ["rep"],
        version: "1.0",
        role: 4,
        author: "Rakib",
        shortDescription: "নির্দিষ্ট মেসেজে কাস্টม রিপ্লাই দেওয়া।",
        longDescription: "যেকোনো মেসেজে রিপ্লাই করে এই কমান্ডটি লিখলে বট ঠিক ওই মেসেজটিতেই আপনার দেওয়া টেক্সট লিখে রিপ্লাই করবে।",
        category: "utility",
        guide: "{pn} [text]"
    },

    onStart: async function ({ api, event, args, message }) {
        if (event.type !== "message_reply") {
            return message.reply("দয়া করে নির্দিষ্ট কোনো মেসেজে রিপ্লাই দিয়ে তারপর কমান্ডটি লিখুন।");
        }

        const text = args.join(" ");
        if (!text) {
            return message.reply("আপনি কী লিখে রিপ্লাই দিতে চান, সেটি কমান্ডের সাথে লিখুন।\nউদাহরণ: /reply দারুণ বলেছ!");
        }

        return api.sendMessage(text, event.threadID, event.messageReply.messageID);
    }
};
