const axios = require("axios");
const fs = require("fs");
const path = require("path");

const CONFIG_URL =
  "https://raw.githubusercontent.com/bdrakib6t9/HOON/main/apiUrl.json";

async function getApiUrl(key) {
  const { data } = await axios.get(CONFIG_URL, {
    timeout: 30000
  });

  if (!data || !data[key]) {
    throw new Error(`API URL not found for key: ${key}`);
  }

  return data[key];
}

module.exports = {
  config: {
    name: "sing",
    aliases: [],
    version: "1.1",
    author: "Rakib",
    countDown: 5,
    role: 0,
    shortDescription: "Play SoundCloud music",
    longDescription: "Search and play music from SoundCloud",
    category: "music",
    guide: {
      en: "{pn} <song name>"
    }
  },

  onStart: async function ({ api, message, event, args }) {
    const cacheDir = path.join(__dirname, "cache");

    try {
      const query = args.join(" ").trim();

      if (!query) {
        return message.reply("🎵 | Please enter a song name.");
      }

      if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir, { recursive: true });
      }

      const searchingMsg = await message.reply(
        `🔍 | Searching "${query}"...`
      );

      const BASE_URL = await getApiUrl("sing");

      const apiRes = await axios.get(
        `${BASE_URL}/soundcloud/audio`,
        {
          params: { q: query },
          timeout: 60000
        }
      );

      const data = apiRes.data;

      if (!data?.status || !data?.result) {
        await api.unsendMessage(searchingMsg.messageID);
        return message.reply("❌ | Song not found.");
      }

      const song = data.result;

      if (!song.audio) {
        await api.unsendMessage(searchingMsg.messageID);
        return message.reply("❌ | Audio URL not found.");
      }

      const filePath = path.join(
        cacheDir,
        `song_${Date.now()}.mp3`
      );

      const audioResponse = await axios({
        url: song.audio,
        method: "GET",
        responseType: "stream",
        timeout: 120000
      });

      const writer = fs.createWriteStream(filePath);

      audioResponse.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
      });

      await api.unsendMessage(searchingMsg.messageID);

      await message.reply({
        body:
`𖤍 𝗧𝗘𝗦𝗦𝗔 𝗕𝗢𝗧 𖤍

🎵 Title: ${song.title || "Unknown"}
👤 Artist: ${song.artist || "Unknown"}
⏱ Duration: ${song.duration || 0}s`,

        attachment: fs.createReadStream(filePath)
      });

      setTimeout(() => {
        try {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        } catch (_) {}
      }, 5000);

    } catch (err) {
      console.error("SING CMD ERROR:", err);

      return message.reply(
        `❌ | Failed to fetch song.\n\n${err.message}`
      );
    }
  }
};
