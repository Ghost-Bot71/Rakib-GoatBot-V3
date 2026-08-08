"use strict";
// autodl.js — Multi-API Auto Downloader with fallbacks
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const SUPPORTED = [
  "tiktok.com", "vt.tiktok.com", "vm.tiktok.com",
  "facebook.com", "fb.watch",
  "instagram.com",
  "youtu.be", "youtube.com",
  "twitter.com", "x.com",
  "threads.net",
  "pin.it", "pinterest.com"
];

function isSupported(url) {
  return SUPPORTED.some(d => url.includes(d));
}

const APIS = [
  async (url) => {
    const r = await axios.get(`https://api.tiklydown.eu.org/api/download?url=${encodeURIComponent(url)}`, { timeout: 15000 });
    const d = r.data;
    if (d?.video?.noWatermark) return { url: d.video.noWatermark, caption: d.title || "" };
    if (d?.video?.watermark) return { url: d.video.watermark, caption: d.title || "" };
    throw new Error("no media");
  },
  async (url) => {
    const r = await axios.get(`https://api.cobalt.tools/api/json`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      data: JSON.stringify({ url, vCodec: "h264", vQuality: "720", aFormat: "mp3", isAudioOnly: false }),
      timeout: 20000
    });
    if (r.data?.url) return { url: r.data.url, caption: "" };
    throw new Error("no media");
  },
  async (url) => {
    const r = await axios.get(`https://tenzo.is-a.dev/api/download/alldl?url=${encodeURIComponent(url)}`, { timeout: 15000 });
    const d = r.data;
    if (d?.success && d?.videos?.[0]?.url) return { url: d.videos[0].url, caption: d.caption || d.title || "" };
    throw new Error("no media");
  },
  async (url) => {
    const r = await axios.get(`https://ssyoutube.com/api/info?url=${encodeURIComponent(url)}`, { timeout: 15000 });
    const d = r.data;
    if (d?.formats?.[0]?.url) return { url: d.formats[0].url, caption: d.title || "" };
    throw new Error("no media");
  }
];

async function fetchMedia(url) {
  for (const api of APIS) {
    try { return await api(url); } catch (_) {}
  }
  throw new Error("❌ কোনো API কাজ করছে না। লিঙ্কটি ঠিক আছে কিনা চেক করুন।");
}

module.exports = {
  config: {
    name: "autodl",
    version: "3.0", author: "Rakib Islam",
    countDown: 5, role: 0,
    shortDescription: "🎬 Auto Download — TikTok/FB/IG/YT/Twitter...",
    category: "media",
    guide: { en: "Just send a link! | TikTok, Facebook, Instagram, YouTube, Twitter সব সাপোর্ট করে" }
  },
  onStart: () => {},
  onChat: async function ({ api, event }) {
    const url = (event.body || "").trim();
    if (!url.startsWith("http") || !isSupported(url)) return;

    api.setMessageReaction("⌛", event.messageID, () => {}, true);

    const cacheDir = path.join(__dirname, "cache");
    await fs.ensureDir(cacheDir);
    const filePath = path.join(cacheDir, `dl_${Date.now()}.mp4`);

    try {
      const { url: mediaUrl, caption } = await fetchMedia(url);

      const media = await axios.get(mediaUrl, { responseType: "arraybuffer", timeout: 60000 });
      await fs.writeFile(filePath, Buffer.from(media.data));

      api.setMessageReaction("✅", event.messageID, () => {}, true);
      await api.sendMessage(
        { body: caption ? `📌 ${caption.slice(0, 200)}` : "✅ ভিডিও ডাউনলোড হয়েছে!", attachment: fs.createReadStream(filePath) },
        event.threadID,
        () => { try { fs.unlinkSync(filePath); } catch {} },
        event.messageID
      );
    } catch (err) {
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      await api.sendMessage(
        `❌ ডাউনলোড ব্যর্থ হয়েছে!\n\n${err.message || "Unknown error"}\n\n💡 অন্য একটি লিঙ্ক দিয়ে চেষ্টা করুন।`,
        event.threadID, () => {}, event.messageID
      );
      try { fs.unlinkSync(filePath); } catch {}
    }
  }
};
