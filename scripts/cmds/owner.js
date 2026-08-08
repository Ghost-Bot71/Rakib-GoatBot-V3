"use strict";
const axios = require("axios");
const { PassThrough } = require("stream");

const OWNER = {
  name: "Rakib Islam",
  address: "Saidpur, Nilphamari, Bangladesh",
  age: "Secret 🔒",
  job: "Student & Developer",
  hobby: "Gaming & Travelling 🎮✈️",
  fb: "facebook.com/profile.php?id=61575436812912"
};

const GIF = "https://media.tenor.com/A5RJ0VFVLMQAAAAC/cyber-hacker.gif";

module.exports = {
  config: {
    name: "owner",
    aliases: ["ownerinfo", "dev"],
    version: "3.0", author: "Rakib Islam",
    countDown: 5, role: 0,
    shortDescription: "👑 Owner Profile — Neon Cyber",
    category: "info",
    guide: { en: "{pn}" }
  },
  onStart: async function ({ message, event }) {
    await message.reaction("⏳", event.messageID);
    const card =
      `\n🌐 ╔══════════════════════════╗\n` +
      `🌐 ║  ⚡ 𝗢𝗪𝗡𝗘𝗥 𝗣𝗥𝗢𝗙𝗜𝗟𝗘 ⚡  ║\n` +
      `🌐 ╚══════════════════════════╝\n\n` +
      `👤 𝗡𝗮𝗺𝗲     : ${OWNER.name}\n` +
      `📍 𝗔𝗱𝗱𝗿𝗲𝘀𝘀  : ${OWNER.address}\n` +
      `🎂 𝗔𝗴𝗲      : ${OWNER.age}\n` +
      `💼 𝗝𝗼𝗯      : ${OWNER.job}\n` +
      `🎮 𝗛𝗼𝗯𝗯𝘆   : ${OWNER.hobby}\n` +
      `🔗 𝗙𝗮𝗰𝗲𝗯𝗼𝗼𝗸 : ${OWNER.fb}\n\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `🇧🇩 𝗠𝗮𝗱𝗲 𝘄𝗶𝘁𝗵 ❤️  𝗳𝗿𝗼𝗺 𝗕𝗮𝗻𝗴𝗹𝗮𝗱𝗲𝘀𝗵`;
    try {
      const res = await axios.get(GIF, { responseType: "arraybuffer", timeout: 8000 });
      const st = new PassThrough(); st.end(Buffer.from(res.data));
      await message.reaction("✅", event.messageID);
      return message.reply({ body: card, attachment: st });
    } catch {
      await message.reaction("✅", event.messageID);
      return message.reply(card);
    }
  }
};
