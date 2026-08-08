const axios = require("axios");
const baseApiUrl = async () => {
  const base = await axios.get(
    `https://noobs-api-team-url.vercel.app/N1SA9/baseApiUrl.json`,
  );
  return base.data.api;
};

module.exports.config = {
  name: "ss",
  version: "1.0",
  author: "Rakib Islam",
  role: 2,
  description: "Take a screenshot of a website",
  category: "utility",
  guide: { en: "screenshot [URL]" },
  coolDowns: 5,
};
exports.onStart = async function ({ api, event, args }) {
  const url = args.join(" ");
  if (!url) {
    return api.sendMessage("Please provide a URL.", event.threadID);
  }
  try {
    api.sendMessage(
      {
        body: "Screenshot Saved <😽",
        attachment: await global.utils.getStreamFromURL(
          `${await baseApiUrl()}/ss?url=${url}`,
        ),
      },
      event.threadID,
      event.messageID,
    );
  } catch (error) {
    console.error("Error taking screenshot:", error);
    api.sendMessage("Failed to take a screenshot.", event.threadID);
  }
};
