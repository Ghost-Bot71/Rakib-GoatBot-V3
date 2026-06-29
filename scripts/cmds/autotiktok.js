const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

// ডাউনলোডার ফাংশন যা Raw API ব্যবহার করবে
async function downloadTikTok(link, message, api) {
  try {
    const rawApi = "https://raw.githubusercontent.com/bdrakib6t9/HOON/main/apiUrl.json";
    const apiData = await axios.get(rawApi);
    const baseUrl = apiData.data.tik;

    if (!baseUrl) return message.reply("❌ | TikTok API URL not found.");

    const wait = await message.reply("⏳ Downloading TikTok video...");

    // Raw API এর ডকুমেন্টেশন অনুযায়ী লিংক পাঠানো হচ্ছে
    const apiUrl = `${baseUrl}/api/tiktok/download?url=${encodeURIComponent(link)}&apikey=rakib69`;
    const res = await axios.get(apiUrl);

    if (!res.data || !res.data.status) {
      await api.unsendMessage(wait.messageID);
      return message.reply("❌ | No result found for this link.");
    }

    const videoUrl = res.data.data.no_watermark || res.data.data.video;
    const title = res.data.data.title || "TikTok Video";

    const cacheFolder = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheFolder)) fs.mkdirSync(cacheFolder, { recursive: true });
    
    const filePath = path.join(cacheFolder, `tik_${Date.now()}.mp4`);

    const downloadRes = await axios({
      method: "GET",
      url: videoUrl,
      responseType: "stream",
      headers: { "User-Agent": "Mozilla/5.0" },
      timeout: 300000
    });

    const writer = fs.createWriteStream(filePath);
    downloadRes.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    });

    await api.unsendMessage(wait.messageID);

    return message.reply(
      {
        body: `🚀 𝗧𝗘𝗦𝗦𝗔 𝗕𝗢𝗧 🤖\n🎬 𝗧𝗶𝗸𝗧𝗼𝗸 𝗩𝗶𝗱𝗲𝗼 𝗗𝗲𝗹𝗶𝘃𝗲𝗿𝗲𝗱\n💎 ${title}\nmodified:hoon`,
        attachment: fs.createReadStream(filePath)
      },
      () => {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }
    );
  } catch (err) {
    console.error(err);
    return message.reply(`❌ | Download failed.\n\n${err.message}`);
  }
}

module.exports = {
  config: {
    name: "autotiktok",
    aliases: [],
    version: "2.0",
    author: "Rakib Hasan",
    countDown: 5,
    role: 0,
    shortDescription: "Auto TikTok Downloader",
    longDescription: "Download TikTok video from link using Raw API",
    category: "media",
    guide: "{pn} <tiktok link>"
  },

  onStart: async function ({ message, args, api }) {
    const link = args.join(" ");
    if (!link) return message.reply("⚠️ | Please enter a TikTok link.");
    await downloadTikTok(link, message, api);
  },

  onChat: async function ({ event, message, api }) {
    if (event.body) {
      const tiktokRegex = /https:\/\/(www\.|vt\.|vm\.|lite\.)?tiktok\.com\/[A-Za-z0-9_-]+/g;
      const match = event.body.match(tiktokRegex);
      if (match) {
        await downloadTikTok(match[0], message, api);
      }
    }
  }
};
