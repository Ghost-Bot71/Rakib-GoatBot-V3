const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const GHOST = fs.readJsonSync(path.join(__dirname, "../../ghostConfig.json"));

const BASE_API_URL = "https://raw.githubusercontent.com/Mostakim0978/D1PT0/refs/heads/main/baseApiUrl.json";

async function getApiBase() {
  try {
    const r = await axios.get(BASE_API_URL, { timeout: 8000 });
    return r.data.api;
  } catch {
    return "https://dipto-the-best.vercel.app";
  }
}

module.exports = {
  config: {
    name: "coverdesign",
    aliases: ["cdesign", "fbcoverdesign", "coverd"],
    version: "1.0",
    author: "Rakib Islam",
    countDown: 10,
    role: 0,
    shortDescription: "🖼️ Facebook Cover Design — 3 templates, full details",
    longDescription: "Facebook cover photo তৈরি করো — নাম, title, address, email, phone, color দিয়ে। 3টা template আছে।",
    category: "image",
    guide: [
      "{pn} [v1/v2/v3] - [name] - [title] - [address] - [email] - [phone] - [color]",
      "Example: .coverdesign v1 - Rakib Islam - Developer - Dhaka - rakib@email.com - 01700000000 - purple",
      "Example: .coverdesign v2 - Ghost Bot - Owner - Bangladesh - - - blue",
      "Color options: white, black, red, blue, green, purple, pink, gold",
      "{pn} help — সব template দেখো",
    ].join("\n"),
  },

  onStart: async function ({ api, event, args, message, usersData }) {
    const { threadID, messageID, senderID, mentions, messageReply } = event;

    if (args[0] === "help" || args[0] === "templates") {
      return message.reply(
        `🖼️ 𝗖𝗼𝘃𝗲𝗿 𝗗𝗲𝘀𝗶𝗴𝗻 𝗛𝗲𝗹𝗽\n━━━━━━━━━━━━━━━━━━\n\n` +
        `📌 Format:\n.coverdesign [v1/v2/v3] - name - title - address - email - phone - color\n\n` +
        `🎨 Templates:\n` +
        `• v1 — Classic Professional\n` +
        `• v2 — Modern Minimal\n` +
        `• v3 — Bold Creative\n\n` +
        `🌈 Colors: white, black, red, blue, green, purple, pink, gold\n\n` +
        `📌 Example:\n.coverdesign v2 - Rakib Islam - Bot Developer - Dhaka BD - rakib@mail.com - 01700000 - blue\n\n` +
        `━━━━━━━━━━━━━━━━━━\n👻 Ghost Bot — ${GHOST.ownerName}`
      );
    }

    const input = args.join(" ");
    if (!input || !input.includes("-")) {
      return message.reply(
        `❌ Format ঠিক নেই!\n\n📌 Use:\n.coverdesign v1 - [name] - [title] - [address] - [email] - [phone] - [color]\n\n💡 .coverdesign help দিলে সব দেখবে।`
      );
    }

    const parts = input.split("-").map(s => s.trim());
    const v = parts[0] || "v1";
    const name = parts[1] || "Ghost Bot";
    const title = parts[2] || "Ghost Net Edition";
    const address = parts[3] || "Bangladesh";
    const email = parts[4] || "ghost@bot.com";
    const phone = parts[5] || "01700000000";
    const color = parts[6] || "purple";

    const validV = ["v1", "v2", "v3"].includes(v) ? v : "v1";

    api.setMessageReaction("🎨", messageID, () => {}, true);

    const targetID = Object.keys(mentions || {})[0] || messageReply?.senderID || senderID;
    const avatarUrl = `https://graph.facebook.com/${targetID}/picture?width=720&height=720&access_token=6628568379|c1e620fa708a1d5696fb991c1bde5662`;

    const base = await getApiBase();
    const coverUrl = `${base}/fbcover?v=${validV}&name=${encodeURIComponent(name)}&title=${encodeURIComponent(title)}&address=${encodeURIComponent(address)}&email=${encodeURIComponent(email)}&phone=${encodeURIComponent(phone)}&color=${encodeURIComponent(color)}&avatar=${encodeURIComponent(avatarUrl)}`;

    const cacheDir = path.join(__dirname, "cache");
    await fs.ensureDir(cacheDir);
    const outPath = path.join(cacheDir, `cover_${Date.now()}.png`);

    let imgBuffer;
    try {
      const res = await axios.get(coverUrl, { responseType: "arraybuffer", timeout: 20000 });
      imgBuffer = Buffer.from(res.data);
      if (imgBuffer.length < 1000) throw new Error("Image too small — API may have failed");
    } catch (e) {
      api.setMessageReaction("❌", messageID, () => {}, true);
      return message.reply(
        `❌ Cover তৈরি করা যায়নি।\n\nError: ${e.message}\n\n💡 কিছুক্ষণ পর আবার try করো অথবা v1/v2/v3 পরিবর্তন করো।\n\n👻 Ghost Bot`
      );
    }

    await fs.writeFile(outPath, imgBuffer);

    await api.sendMessage(
      {
        body: `🖼️ 𝗙𝗮𝗰𝗲𝗯𝗼𝗼𝗸 𝗖𝗼𝘃𝗲𝗿 𝗗𝗲𝘀𝗶𝗴𝗻\n━━━━━━━━━━━━━━━━━━\n👤 Name: ${name}\n🏷️ Title: ${title}\n📍 Address: ${address}\n📧 Email: ${email}\n📞 Phone: ${phone}\n🎨 Template: ${validV.toUpperCase()} | Color: ${color}\n━━━━━━━━━━━━━━━━━━\n👻 Ghost Bot — ${GHOST.ownerName}`,
        attachment: fs.createReadStream(outPath),
      },
      threadID,
      () => { try { fs.unlinkSync(outPath); } catch {} },
      messageID
    );
    api.setMessageReaction("✅", messageID, () => {}, true);
  }
};
