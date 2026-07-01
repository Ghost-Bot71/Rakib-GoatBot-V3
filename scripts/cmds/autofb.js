const fs = require("fs-extra");
const axios = require("axios");
const cheerio = require("cheerio");
const path = require("path");
const os = require("os");
const { getStreamFromURL, randomString } = global.utils || {};

module.exports = {
  threadStates: {},
  config: {
    name: 'autofb',
    version: '1.0',
    author: 'Rakib',
    countDown: 5,
    role: 0,
    shortDescription: 'Auto video downloader for Facebook',
    longDescription: '',
    category: 'media',
    guide: {
      en: '{p}{n}',
    }
  },
  
  onStart: async function ({ api, event }) {
    const threadID = event.threadID;

    if (!this.threadStates[threadID]) {
      this.threadStates[threadID] = {};
    }

    const body = event.body || "";
    if (body.toLowerCase().includes('autolink')) {
      api.sendMessage("AutoLink is active.", event.threadID, event.messageID);
    }
  },

  onChat: async function ({ api, event }) {
    const body = event.body || ""; // স্টিকার বা ছবি দিলে যেন ক্র্যাশ না করে

    const linkData = this.checkLink(body);
    if (linkData) {
      console.log(`Attempting to download from URL: ${linkData.url}`);
      this.downLoad(linkData.url, api, event);
    }
  },

  downLoad: function (url, api, event) {
    const time = Date.now();
    // /cache ফোল্ডার না থাকলে যেন এরর না দেয়, তাই os.tmpdir() ব্যবহার করা হলো
    const filePath = path.join(os.tmpdir(), `fb_video_${time}.mp4`);

    if (url.includes("facebook") || url.includes("fb.watch")) {
      this.downloadFacebook(url, api, event, filePath);
    }
  },

  downloadFacebook: async function (url, api, event, filePath) {
    try {
      const res = await fbDownloader(url);
      if (res.success && res.download && res.download.length > 0) {
        
        // সবচেয়ে ভালো কোয়ালিটির ভিডিও লিংক নেওয়া (প্রথমটি সাধারণত SD বা HD হয়)
        const videoUrl = res.download[0].url; 
        
        const response = await axios({
          method: "GET",
          url: videoUrl,
          responseType: "stream",
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
          }
        });

        if (response.headers['content-length'] > 87031808) {
          return api.sendMessage("The file is too large, cannot be sent", event.threadID, event.messageID);
        }

        const writer = fs.createWriteStream(filePath);
        response.data.pipe(writer);

        // ফাইল পুরোপুরি সেভ হওয়া পর্যন্ত অপেক্ষা করা
        await new Promise((resolve, reject) => {
          writer.on('finish', resolve);
          writer.on('error', reject);
        });
          
        const messageBody = `🚀 𝗧𝗘𝗦𝗦𝗔 𝗕𝗢𝗧 𝗔𝘂𝘁𝗼-𝗗𝗼𝘄𝗻𝗹𝗼𝗮𝗱𝗲𝗿\n\n✅ ভিডিও সফলভাবে ডাউনলোড হয়েছে!\n\n━━━━━━━━━━━━━━━━━━\n💙 Powered By TESSA BOT`;

        api.sendMessage({
          body: messageBody,
          attachment: fs.createReadStream(filePath)
        }, event.threadID, () => {
          // মেসেজ সেন্ড হওয়ার পর কিছুটা সময় নিয়ে ফাইল ডিলিট করা
          setTimeout(() => {
            if (fs.existsSync(filePath)) {
              try {
                fs.unlinkSync(filePath);
              } catch (err) {
                console.error("[Auto FB File Delete Error]:", err.message);
              }
            }
          }, 10000);
        }, event.messageID);
        
      } else {
        // ভিডিও খুঁজে না পেলে খালি মেসেজ না পাঠিয়ে এরর লগ করা ভালো
        console.log("Could not extract Facebook video link.");
      }
    } catch (err) {
      console.error(err);
    }
  },

  checkLink: function (url) {
    if (!url) return null;

    if (url.includes("facebook") || url.includes("fb.watch")) {
      return { url: url };
    }

    const fbWatchRegex = /fb\.watch\/[a-zA-Z0-9_-]+/i;
    if (fbWatchRegex.test(url)) {
      return { url: url };
    }

    return null;
  }
};

async function fbDownloader(url) {
  try {
    const response1 = await axios({
      method: 'POST',
      url: 'https://snapsave.app/action.php?lang=vn',
      headers: {
        "accept": "*/*",
        "accept-language": "vi,en-US;q=0.9,en;q=0.8",
        "content-type": "multipart/form-data",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "sec-ch-ua": "\"Chromium\";v=\"110\", \"Not A(Brand\";v=\"24\", \"Microsoft Edge\";v=\"110\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "Referer": "https://snapsave.app/vn",
        "Referrer-Policy": "strict-origin-when-cross-origin"
      },
      data: { url }
    });

    let html;
    const evalCode = response1.data.replace('return decodeURIComponent', 'html = decodeURIComponent');
    eval(evalCode);
    html = html.split('innerHTML = "')[1].split('";\n')[0].replace(/\\"/g, '"');

    const $ = cheerio.load(html);
    const download = [];

    const tbody = $('table').find('tbody');
    const trs = tbody.find('tr');

    trs.each(function (i, elem) {
      const trElement = $(elem);
      const tds = trElement.children();
      const quality = $(tds[0]).text().trim();
      const vidUrl = $(tds[2]).children('a').attr('href');
      if (vidUrl != undefined) {
        download.push({
          quality,
          url: vidUrl
        });
      }
    });

    return {
      success: true,
      video_length: $("div.clearfix > p").text().trim(),
      download
    };
  } catch (err) {
    console.error('Error in Facebook Downloader:', err.message);
    return { success: false };
  }
}
