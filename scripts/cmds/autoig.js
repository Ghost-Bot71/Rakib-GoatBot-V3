const axios = require("axios");
const fs = require("fs");
const path = require("path");
const os = require("os");

module.exports = {
  config: {
    name: "autoig",
    version: "1.0.0",
    author: "Rakib",
    countDown: 5,
    role: 0,
    shortDescription: "Auto download Instagram videos",
    longDescription: "Automatically detects Instagram links in chat and downloads the video.",
    category: "media",
    guide: "Just send an Instagram link in the chat"
  },

  onStart: async function ({ message }) {
    message.reply("এই কমান্ডটি অটোমেটিক কাজ করে। চ্যাটে যেকোনো ইনস্টাগ্রাম লিংক দিলে বট নিজে থেকেই ভিডিও ডাউনলোড করে দেবে।");
  },

  onChat: async function ({ message, event }) {
    const body = event.body || "";
    
    // শুধু ইনস্টাগ্রামের লিংক আছে কিনা চেক করা
    const igRegex = /https:\/\/(www\.)?instagram\.com\/(reel|p|tv)\/[A-Za-z0-9_-]+/ig;
    const links = body.match(igRegex);

    if (!links || links.length === 0) return;

    try {
      const apiUrlRes = await axios.get("https://raw.githubusercontent.com/bdrakib6t9/HOON/main/apiUrl.json");
      const apiHost = apiUrlRes.data.yt; 

      for (const link of links) {
        
        const downloadApiUrl = `${apiHost}/instagram/video?url=${encodeURIComponent(link)}`;
        const tempPath = path.join(os.tmpdir(), `ig_video_${Date.now()}.mp4`);

        // Render বা Gitwork-এ ব্লক হওয়া ঠেকাতে User-Agent যুক্ত করা হলো
        const videoResponse = await axios({
          url: downloadApiUrl,
          method: "GET",
          responseType: "stream",
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
          }
        });

        const writer = fs.createWriteStream(tempPath);
        videoResponse.data.pipe(writer);

        await new Promise((resolve, reject) => {
          writer.on("finish", resolve);
          writer.on("error", reject);
        });
        
        // Messenger-এর জন্য উপযোগী টেক্সট স্টাইল
        await message.reply({
          body: `🚀 𝗧𝗘𝗦𝗦𝗔 𝗕𝗢𝗧 𝗔𝘂𝘁𝗼-𝗗𝗼𝘄𝗻𝗹𝗼𝗮𝗱𝗲𝗿\n\n✅ ভিডিও সফলভাবে ডাউনলোড হয়েছে!\n\n━━━━━━━━━━━━━━━━━━\n💙 Powered By TESSA BOT`,
          attachment: fs.createReadStream(tempPath)
        });

        // আপলোড পুরোপুরি শেষ হওয়ার জন্য ১০ সেকেন্ড সময় দিয়ে তারপর ফাইল ডিলিট করা
        setTimeout(() => {
          if (fs.existsSync(tempPath)) {
            try {
              fs.unlinkSync(tempPath);
            } catch (err) {
              console.error("[Auto IG File Delete Error]:", err.message);
            }
          }
        }, 10000); 

      }
    } catch (error) {
      console.error("[Auto IG Error]:", error.message);
    }
  }
};
