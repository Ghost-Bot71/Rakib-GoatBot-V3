const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const GHOST = fs.readJsonSync(path.join(__dirname, "../../ghostConfig.json"));

module.exports = {
  config: {
    name: "coverquote",
    aliases: ["cquote", "quotcover", "qcover"],
    version: "1.0",
    author: "Rakib Islam",
    countDown: 10,
    role: 0,
    shortDescription: "💬 Quote Cover Photo — aesthetic quote + name",
    longDescription: "Aesthetic quote দিয়ে Facebook cover photo তৈরি করো। name + quote + color দিতে হবে।",
    category: "image",
    guide: [
      "{pn} [name] - [quote] - [color]",
      "Example: .coverquote Rakib Islam - Life is short, make it count - dark",
      "Example: .coverquote Ghost Bot - হাসো, বাঁচো, ভালো থাকো - blue",
      "Colors: dark, blue, red, green, purple, pink, gold, white",
    ].join("\n"),
  },

  onStart: async function ({ api, event, args, message, usersData }) {
    const { threadID, messageID, senderID, mentions, messageReply } = event;

    const input = args.join(" ");
    if (!input || !input.includes("-")) {
      return message.reply(
        `❌ Format ঠিক নেই!\n\n📌 Use:\n.coverquote [name] - [quote] - [color]\n\n📌 Example:\n.coverquote Rakib Islam - Life is beautiful - dark\n\n👻 Ghost Bot`
      );
    }

    const parts = input.split("-").map(s => s.trim());
    const name = parts[0] || "Ghost Bot";
    const quote = parts[1] || "Life is beautiful ✨";
    const colorInput = (parts[2] || "dark").toLowerCase();

    const colorMap = {
      dark: "0d0d1a", blue: "0a1628", red: "1a0a0a", green: "0a1a0a",
      purple: "1a0a2e", pink: "1a0a1a", gold: "1a1500", white: "f0f0f0",
    };
    const bgColor = colorMap[colorInput] || "0d0d1a";

    api.setMessageReaction("💬", messageID, () => {}, true);

    const targetID = Object.keys(mentions || {})[0] || messageReply?.senderID || senderID;
    const avatarUrl = `https://graph.facebook.com/${targetID}/picture?width=400&height=400&access_token=6628568379|c1e620fa708a1d5696fb991c1bde5662`;

    const cardUrl = `https://api.popcat.xyz/welcomecard?background=${bgColor}&text1=${encodeURIComponent(name)}&text2=${encodeURIComponent('"' + quote + '"')}&text3=Ghost+Bot+%F0%9F%91%BB&avatar=${encodeURIComponent(avatarUrl)}`;

    const fallbackQuoteUrl = `https://api.popcat.xyz/quote?text=${encodeURIComponent(quote)}&name=${encodeURIComponent(name)}&color=white`;

    const cacheDir = path.join(__dirname, "cache");
    await fs.ensureDir(cacheDir);
    const outPath = path.join(cacheDir, `quotcover_${Date.now()}.png`);

    let imgBuffer;
    try {
      const res = await axios.get(cardUrl, { responseType: "arraybuffer", timeout: 15000 });
      imgBuffer = Buffer.from(res.data);
      if (imgBuffer.length < 1000) throw new Error("fallback");
    } catch {
      try {
        const res2 = await axios.get(fallbackQuoteUrl, { responseType: "arraybuffer", timeout: 12000 });
        imgBuffer = Buffer.from(res2.data);
      } catch (e) {
        api.setMessageReaction("❌", messageID, () => {}, true);
        return message.reply(`❌ Quote cover তৈরি করা যায়নি।\nError: ${e.message}`);
      }
    }

    await fs.writeFile(outPath, imgBuffer);

    await api.sendMessage(
      {
        body: `💬 𝗤𝘂𝗼𝘁𝗲 𝗖𝗼𝘃𝗲𝗿 𝗣𝗵𝗼𝘁𝗼\n━━━━━━━━━━━━━━━━━━\n👤 Name: ${name}\n✍️ Quote: "${quote}"\n🎨 Theme: ${colorInput}\n━━━━━━━━━━━━━━━━━━\n👻 Ghost Bot — ${GHOST.ownerName}`,
        attachment: fs.createReadStream(outPath),
      },
      threadID,
      () => { try { fs.unlinkSync(outPath); } catch {} },
      messageID
    );
    api.setMessageReaction("✅", messageID, () => {}, true);
  }
};
