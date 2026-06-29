const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const RAW_API = "https://raw.githubusercontent.com/bdrakib6t9/HOON/main/apiUrl.json";
const recentLinks = new Set();

async function getBaseUrl() {
  const { data } = await axios.get(RAW_API);
  if (!data.tik) throw new Error("TikTok API URL not found.");
  return data.tik.replace(/\/$/, "");
}

async function downloadTikTok(link, message, api) {
  if (!link) return message.reply("❌ | Invalid TikTok link.");
  
  if (recentLinks.has(link)) return;

  let wait;
  try {
    recentLinks.add(link);
    wait = await message.reply("⏳ | 𝗧𝗘𝗦𝗦𝗔 𝗕𝗢𝗧\n\nটিকটক ভিডিওটি প্রসেস হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন...");

    const baseUrl = await getBaseUrl();
    const apiUrl = `${baseUrl}/api/tiktok?url=${encodeURIComponent(link)}&apikey=rakib69`;

    const res = await axios.get(apiUrl);
    if (!res.data || !res.data.status || !res.data.data) {
      if (wait?.messageID) await api.unsendMessage(wait.messageID).catch(() => {});
      return message.reply("❌ | দুঃখিত, ভিডিওটি ডাউনলোড করা সম্ভব হয়নি।");
    }

    const data = res.data.data;
    const videoUrl = data.no_watermark || data.nowatermark || data.video || data.play || data.download;

    if (!videoUrl) {
      if (wait?.messageID) await api.unsendMessage(wait.messageID).catch(() => {});
      return message.reply("❌ | ভিডিও ফাইলটি খুঁজে পাওয়া যায়নি।");
    }

    const cache = path.join(__dirname, "cache");
    if (!fs.existsSync(cache)) fs.mkdirSync(cache, { recursive: true });
    const filePath = path.join(cache, `tiktok_${Date.now()}.mp4`);

    const stream = await axios({
      url: videoUrl,
      method: "GET",
      responseType: "stream",
      timeout: 300000,
      headers: { "User-Agent": "Mozilla/5.0" }
    });

    const writer = fs.createWriteStream(filePath);
    stream.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    });

    if (wait?.messageID) await api.unsendMessage(wait.messageID).catch(() => {});

    return message.reply(
      {
        body: `🚀 𝗧𝗘𝗦𝗦𝗔 𝗕𝗢𝗧 𝗔𝘂𝘁𝗼-𝗗𝗼𝘄𝗻𝗹𝗼𝗮𝗱𝗲𝗿

✅ ভিডিও সফলভাবে ডাউনলোড হয়েছে!

🎬 টাইটেল:
${data.title || "TikTok Video"}

⚡ ওয়াটারমার্ক: ❌
📥 কোয়ালিটি: HD / Original

━━━━━━━━━━━━━━━━━━
💙 Powered By 𝗧𝗘𝗦𝗦𝗔 𝗕𝗢𝗧`,
        attachment: fs.createReadStream(filePath)
      },
      () => {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }
    );
  } catch (err) {
    console.log(err);
    if (wait?.messageID) await api.unsendMessage(wait.messageID).catch(() => {});
    return message.reply("❌ | ত্রুটি হয়েছে: " + err.message);
  } finally {
    setTimeout(() => recentLinks.delete(link), 30000);
  }
}

module.exports = {
  config: {
    name: "autotiktok",
    version: "1.0",
    author: "Rakib Hasan",
    role: 0,
    category: "media",
    shortDescription: "Auto TikTok Downloader",
    longDescription: "Automatically download TikTok videos",
    guide: "{pn} <tiktok link>",
    aliases: ["tik", "tt", "tiktok"],
    countDown: 5
  },

  onStart: async function ({ message, args, api }) {
    if (!args[0]) return message.reply("⚠️ | দয়া করে একটি টিকটক ভিডিও লিঙ্ক দিন।");
    
    const link = args[0].trim();
    if (!/^https?:\/\/(?:www\.|m\.|vt\.|vm\.)?tiktok\.com\/[^\s]+/i.test(link)) {
      return message.reply("❌ | ইনভ্যালিড টিকটক লিঙ্ক।");
    }
    
    return downloadTikTok(link, message, api);
  },

  onChat: async function ({ event, message, api }) {
    if (typeof event.body !== "string") return;
    
    if (typeof api.getCurrentUserID === "function" && event.senderID == api.getCurrentUserID()) {
      return;
    }

    const match = event.body.match(/https?:\/\/(?:www\.|m\.|vt\.|vm\.)?tiktok\.com\/[^\s]+/i);
    if (!match) return;

    return downloadTikTok(match[0], message, api);
  }
};
