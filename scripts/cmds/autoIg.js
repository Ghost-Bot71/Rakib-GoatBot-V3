const axios = require("axios");
const fs = require("fs");
const path = require("path");
const os = require("os");

module.exports = {
  config: {
    name: "autoIg",
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
    
    const igRegex = /https:\/\/(www\.)?instagram\.com\/(reel|p|tv)\/[A-Za-z0-9_-]+/ig;
    const links = body.match(igRegex);

    if (!links || links.length === 0) return;

    try {
      const apiUrlRes = await axios.get("https://raw.githubusercontent.com/bdrakib6t9/HOON/main/apiUrl.json");
      
      const apiHost = apiUrlRes.data.yt; 

      for (const link of links) {
        
        const downloadApiUrl = `${apiHost}/instagram/video?url=${encodeURIComponent(link)}`;
        
        const tempPath = path.join(os.tmpdir(), `ig_video_${Date.now()}.mp4`);

        const videoResponse = await axios({
          url: downloadApiUrl,
          method: "GET",
          responseType: "stream"
        });

        const writer = fs.createWriteStream(tempPath);
        videoResponse.data.pipe(writer);

        await new Promise((resolve, reject) => {
          writer.on("finish", resolve);
          writer.on("error", reject);
        });
        
        await message.reply({
          body: "✅ Instagram Video:",
          attachment: fs.createReadStream(tempPath)
        });

        fs.unlinkSync(tempPath);
      }
    } catch (error) {
      console.error("[Auto IG Error]:", error.message);
    }
  }
};
