const axios = require("axios");
const { loadOwner } = require("../../rakib/customId/ownerUid");

module.exports = {
  config: {
    name: "reteach",
    version: "2.0",
    author: "rakib",
    role: 0,
    category: "ai",
    guide: {
      en: "reteach hi - hello"
    }
  },

  onStart: async function ({ api, event, args }) {

    // 🔒 Owner Check (dynamic + safe)
    const ownerUID = await loadOwner();
    const isOwner = Array.isArray(ownerUID)
      ? ownerUID.includes(String(event.senderID))
      : String(event.senderID) === String(ownerUID);

    if (!isOwner) {
      return api.sendMessage(
        "eta jar kaj se korbe - tomar dorkar nai",
        event.threadID,
        event.messageID
      );
    }

    const input = args.join(" ").trim();

    if (!input) {
      return api.sendMessage(
        "⚠️ Example:\nreteach hi - hello",
        event.threadID,
        event.messageID
      );
    }

    // 🔍 Smart split (support multiple formats)
    let splitChar = null;

    if (input.includes("|")) splitChar = "|";
    else if (input.includes("-")) splitChar = "-";
    else if (input.includes("=>")) splitChar = "=>";

    if (!splitChar) {
      return api.sendMessage(
        "❌ Format:\nreteach hi - hello\nreteach hi | hello",
        event.threadID,
        event.messageID
      );
    }

    const parts = input.split(splitChar);

    if (parts.length < 2) {
      return api.sendMessage(
        "❌ Invalid format",
        event.threadID,
        event.messageID
      );
    }

    const question = parts[0].trim();
    const newReply = parts.slice(1).join(splitChar).trim();

    if (!question || !newReply) {
      return api.sendMessage(
        "❌ Question বা Reply ফাঁকা",
        event.threadID,
        event.messageID
      );
    }

    try {
      const res = await axios.get(
        "https://rakib-api.vercel.app/api/simma-remove",
        {
          params: {
            question,
            newReply,
            apikey: "rakib69"
          },
          timeout: 15000
        }
      );

      const msg =
        res.data?.message ||
        res.data?.result ||
        `✅ Reteach Successful\n🧠 ${question} → ${newReply}`;

      return api.sendMessage(
        msg,
        event.threadID,
        event.messageID
      );

    } catch (e) {
      console.error("RETEACH ERROR:", e.message);

      return api.sendMessage(
        "❌ API error or server not responding.",
        event.threadID,
        event.messageID
      );
    }
  }
};
