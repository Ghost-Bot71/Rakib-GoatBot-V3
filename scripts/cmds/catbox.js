const axios = require("axios");

async function handleCatboxUpload({ event, api, message }) {
  const { messageReply, messageID } = event;
  
  // ১. ইউজার কোনো ছবি বা ভিডিওতে রিপ্লাই করেছে কি না চেক করা
  if (!messageReply || !messageReply.attachments || messageReply.attachments.length === 0) {
    return message.reply("Please reply to an image or video.");
  }

  // ২. ফেসবুকের ওই মিডিয়া ফাইলের লিঙ্কটি নেওয়া
  const fileUrl = messageReply.attachments[0].url;

  // ৩. লোডিং রিয়্যাকশন (🕛) দেওয়া এবং মেসেজ পাঠানো
  api.setMessageReaction("🕛", messageID, () => {}, true);
  const loading = await message.reply("⏳ Meow~ Uploading your media via ACS RAKIB'S API Hub...");

  // ৫ সেকেন্ড পর লোডিং মেসেজটি স্ক্রিন থেকে মুছে ফেলা
  setTimeout(() => {
    api.unsendMessage(loading.messageID);
  }, 5000);

  try {
    // 🚀 আপনার নিজস্ব প্রিমিয়াম সাইবারপাংক এপিআই হাবের লিঙ্ক
    const apiHubUrl = `https://cyberpunk-api-hub--explainrhk.replit.app/api/catbox?url=${encodeURIComponent(fileUrl)}`;

    // ৪. আপনার এপিআই সার্ভারে ফাইল লিঙ্কটি পাঠানো
    const response = await axios.get(apiHubUrl);
    
    // এপিআই থেকে সরাসরি তৈরি হওয়া ক্যাটবক্স লিঙ্কটি নেওয়া
    const permanentLink = response.data;

    // ✅ কাজ সফল হলে গ্রিন টিক (✅) রিয়্যাকশন দেওয়া এবং লিঙ্কটি বটের চ্যাটে পাঠানো
    api.setMessageReaction("✅", messageID, () => {}, true);
    return message.reply(permanentLink);

  } catch (err) {
    // ❌ কোনো কারণে ফেইল হলে ক্রস (❌) রিয়্যাকশন ও এরর মেসেজ দেওয়া
    api.setMessageReaction("❌", messageID, () => {}, true);
    return message.reply("❌ Failed to upload via API Hub. Please check your server status.");
  }
}

module.exports = {
  config: {
    name: "catbox",
    aliases: ["ct"],
    version: "2.0",
    author: "Rakibul Hasan", // আপনার ডেভেলপার সিগনেচার
    countDown: 5,
    role: 0,
    shortDescription: "Upload media via ACS Rakib API Hub",
    longDescription: "Upload replied image or video to catbox using secure premium API Hub.",
    category: "tools",
    guide: {
      en: "{pn} (reply to image/video)"
    }
  },

  onStart: async function ({ event, api, message }) {
    return handleCatboxUpload({ event, api, message });
  }
};
