const axios = require("axios");

module.exports = {
  config: {
    name: "video",
    aliases: ["ytvideo", "vdl"],
    version: "2.0",
    author: "Rakib",
    countDown: 5,
    role: 0,
    shortDescription: "Search and download videos",
    longDescription: "Search YouTube videos and download mp4",
    category: "media"
  },

  onStart: async function ({ event, args, message }) {
    try {
      const query = args.join(" ").trim();

      if (!query) {
        return message.reply(
          "⚠️ | Please enter a video name."
        );
      }

      // Format duration
      function formatDuration(duration) {
        if (!duration || isNaN(duration)) {
          return "0:00";
        }

        const minutes =
          Math.floor(duration / 60);

        const seconds =
          duration % 60;

        return (
          `${minutes}:` +
          `${String(seconds).padStart(2, "0")}`
        );
      }

      const searchUrl =
        `https://rakib-ytv-api.onrender.com/api/search?q=${encodeURIComponent(query)}&apikey=rakib69`;

      const res = await axios.get(searchUrl);

      const results =
        res.data.results ||
        res.data.items ||
        res.data.data ||
        [];

      if (!results.length) {
        return message.reply(
          "❌ | No results found."
        );
      }

      // Under 15 min
      const filtered = results.filter(item => {
        return (
          typeof item.duration === "number" &&
          item.duration <= 900
        );
      });

      if (!filtered.length) {
        return message.reply(
          "❌ | No videos under 15 minutes found."
        );
      }

      const top = filtered.slice(0, 5);

      let body =
        `🎬 Search Results for: ${query}\n\n`;

      const attachments = [];

      for (let i = 0; i < top.length; i++) {
        const item = top[i];

        const title =
          item.title ||
          "Unknown Title";

        const channel =
          item.channel ||
          item.channelTitle ||
          item.author ||
          "Unknown Channel";

        const duration =
          formatDuration(item.duration);

        const thumbnail =
          item.thumbnail;

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
        "↩️ Reply with a number (1-5) to download video.";

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

  onReply: async function ({
    api,
    event,
    Reply,
    message
  }) {
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

      // remove old search message
      try {
        await api.unsendMessage(
          event.messageReply.messageID
        );
      } catch {}

      const loading =
        await message.reply("⏳");

      const videoId =
        item.videoId;

      const title =
        item.title ||
        "Unknown";

      const downloadUrl =
        "https://rakib-yt-api.onrender.com/youtube/video";

      const dlRes = await axios.post(
        downloadUrl,
        {
          url:
            `https://www.youtube.com/watch?v=${videoId}`,
          quality: "720p"
        },
        {
          responseType: "stream",
          headers: {
            "Content-Type": "application/json"
          }
        }
      );

      // remove loading msg
      try {
        await api.unsendMessage(
          loading.messageID
        );
      } catch {}

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
