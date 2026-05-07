const { loadOwner } = require("../../rakib/customId/ownerUid");

module.exports = {
  config: {
    name: "edc",
    aliases: ["edc"],
    version: "2.0",
    author: "Rakib",
    role: 0,
    shortDescription: "deploy event file",
    longDescription: "load js file into events folder (owner only)",
    category: "Bot account",
    guide: {
      en: "Reply a link and type: edc <eventName>"
    }
  },

  onStart: async function ({ api, event, args }) {

    // 🔒 Owner Check (dynamic + multi support)
    const ownerUID = await loadOwner();
    const isOwner = Array.isArray(ownerUID)
      ? ownerUID.includes(String(event.senderID))
      : String(event.senderID) === String(ownerUID);

    if (!isOwner) {
      return api.sendMessage(
        "❌ | You aren't allowed to use this command.",
        event.threadID,
        event.messageID
      );
    }

    const fs = require("fs");
    const axios = require("axios");
    const request = require("request");
    const cheerio = require("cheerio");
    const path = require("path");

    const { messageReply, threadID, messageID } = event;
    const name = args[0];

    if (!messageReply || !name) {
      return api.sendMessage(
        "❌ Reply to a code link and use: edc <eventName>",
        threadID,
        messageID
      );
    }

    const text = messageReply.body;
    const urlMatch = text.match(/https?:\/\/[^\s]+/);

    if (!urlMatch) {
      return api.sendMessage("❌ Invalid link.", threadID, messageID);
    }

    const url = urlMatch[0];

    const savePath = path.join(__dirname, "../events", `${name}.js`);

    // ⚠️ prevent overwrite
    if (fs.existsSync(savePath)) {
      return api.sendMessage(
        "⚠️ Event file already exists!",
        threadID,
        messageID
      );
    }

    // ===== Pastebin =====
    if (url.includes("pastebin")) {
      try {
        const res = await axios.get(url, { timeout: 15000 });
        fs.writeFileSync(savePath, res.data, "utf-8");

        return api.sendMessage(
          `✅ Event file added: ${name}.js\n👉 Restart or load to apply`,
          threadID,
          messageID
        );

      } catch (e) {
        console.error("Pastebin error:", e);
        return api.sendMessage("❌ Failed to apply pastebin code.", threadID, messageID);
      }
    }

    // ===== Buildtool / TinyURL =====
    if (url.includes("buildtool") || url.includes("tinyurl")) {
      request(url, (err, res, body) => {
        if (err) {
          return api.sendMessage("❌ Error fetching link.", threadID, messageID);
        }

        const $ = cheerio.load(body);
        const code = $(".language-js").first().text();

        if (!code) {
          return api.sendMessage("❌ No JS code found.", threadID, messageID);
        }

        fs.writeFileSync(savePath, code, "utf-8");

        return api.sendMessage(
          `✅ Event file added: ${name}.js`,
          threadID,
          messageID
        );
      });
      return;
    }

    // ===== Google Drive =====
    if (url.includes("drive.google")) {
      try {
        const idMatch = url.match(/[-\w]{25,}/);
        if (!idMatch) throw new Error("Invalid Drive ID");

        const downloadUrl = `https://drive.google.com/uc?id=${idMatch[0]}&export=download`;

        const res = await axios.get(downloadUrl, {
          responseType: "arraybuffer",
          timeout: 15000
        });

        fs.writeFileSync(savePath, res.data);

        return api.sendMessage(
          `✅ Event file added: ${name}.js\n⚠️ If error, save drive file as .txt`,
          threadID,
          messageID
        );

      } catch (e) {
        console.error("Drive error:", e);
        return api.sendMessage("❌ Failed to download from Drive.", threadID, messageID);
      }
    }

    return api.sendMessage("❌ Unsupported link.", threadID, messageID);
  }
};
