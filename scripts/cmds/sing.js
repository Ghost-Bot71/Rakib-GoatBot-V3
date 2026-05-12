const axios = require("axios");

module.exports = {
  config: {
    name: "song",
    aliases: ["sing", "music"],
    version: "3.0",
    author: "Rakib",
    countDown: 5,
    role: 0,
    shortDescription: "Search and download songs",
    longDescription: "Search YouTube songs and download audio",
    category: "media"
  },

  onStart: async function ({ api, event, args, message }) {
    try {
      const query = args.join(" ").trim();

      if (!query) {
        return message.reply(
          "⚠️ | Please enter a song name."
        );
      }

      const searchUrl =
        `https://rakib-ytv-api.onrender.com/api/search?q=${encodeURIComponent(query)}&apikey=rakib69`;

      const res = await axios.get(searchUrl);

      const results =
        res.data.items ||
        res.data.results ||
        res.data.data ||
        [];

      if (!results.length) {
        return message.reply("❌ | No results found.");
      }

      // Convert duration to seconds
      function durationToSeconds(duration) {
        if (!duration) return 0;

        const parts = duration
          .split(":")
          .map(Number);

        if (parts.length === 3) {
          return (
            parts[0] * 3600 +
            parts[1] * 60 +
            parts[2]
          );
        }

        if (parts.length === 2) {
          return (
            parts[0] * 60 +
            parts[1]
          );
        }

        return parts[0];
      }

      // Filter under 6 min
      const filtered = results.filter(item => {
        const duration =
          item.duration ||
          item.lengthText ||
          item.timestamp ||
          "0:00";

        return durationToSeconds(duration) <= 360;
      });

      if (!filtered.length) {
        return message.reply(
          "❌ | No songs under 6 minutes found."
        );
      }

      const top = filtered.slice(0, 5);

      let body =
        `🎵 Search Results for: ${query}\n\n`;

      const attachments = [];

      for (let i = 0; i < top.length; i++) {
        const item = top[i];

        const title =
          item.title ||
          "Unknown Title";

        const channel =
          item.channelTitle ||
          item.author ||
          "Unknown Channel";

        const duration =
          item.duration ||
          item.lengthText ||
          item.timestamp ||
          "Unknown";

        const thumbnail =
          item.thumbnail ||
          item.thumbnails?.[0]?.url ||
          item.thumbnails?.default?.url;

        body +=
          `${i + 1}. ${title}\n` +
          `⏱ ${duration}\n` +
          `👤 ${channel}\n\n`;

        if (thumbnail) {
          try {
            const stream =
              await global.utils.getStreamFromURL(thumbnail);

            attachments.push(stream);
          } catch {}
        }
      }

      body +=
        "↩️ Reply with a number (1-5) to download audio.";

      const sent = await message.reply({
        body,
        attachment: attachments
      });

      global.GoatBot.onReply.set(sent.messageID, {
        commandName: this.config.name,
        author: event.senderID,
        results: top
      });

    } catch (e) {
      console.log(e);

      return message.reply(
        "❌ Error:\n" + e.message
      );
    }
  },

  onReply: async function ({ event, Reply, message }) {
    try {
      if (event.senderID !== Reply.author) {
        return;
      }

      const num = parseInt(event.body);

      if (
        isNaN(num) ||
        num < 1 ||
        num > 5
      ) {
        return message.reply(
          "⚠️ | Reply with a number between 1-5."
        );
      }

      const item =
        Reply.results[num - 1];

      if (!item) {
        return message.reply(
          "❌ | Invalid selection."
        );
      }

      const videoId =
        item.videoId ||
        item.id?.videoId ||
        item.id;

      if (!videoId) {
        return message.reply(
          "❌ | Video ID not found."
        );
      }

      const infoUrl =
        `https://rakib-ytv-api.onrender.com/api/info?videoId=${videoId}&apikey=rakib69`;

      const infoRes =
        await axios.get(infoUrl);

      const info =
        infoRes.data.data ||
        infoRes.data;

      const title =
        info.title ||
        item.title ||
        "Unknown";

      const thumbnail =
        info.thumbnail ||
        item.thumbnail;

      await message.reply({
        body:
          `⏳ Downloading Audio...\n\n` +
          `🎵 ${title}`,
        attachment: thumbnail
          ? await global.utils.getStreamFromURL(thumbnail)
          : null
      });

      const downloadUrl =
        "https://rakib-yt-api.onrender.com/youtube/audio";

      const dlRes = await axios.post(
        downloadUrl,
        {
          url:
            `https://www.youtube.com/watch?v=${videoId}`
        },
        {
          responseType: "stream",
          headers: {
            "Content-Type": "application/json"
          }
        }
      );

      return message.reply({
        body:
          `✅ ${title}`,
        attachment: dlRes.data
      });

    } catch (e) {
      console.log(e);

      return message.reply(
        "❌ Download failed.\n" +
        e.message
      );
    }
  }
};
