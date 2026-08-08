"use strict";
const axios = require("axios");
const { PassThrough } = require("stream");
const os = require("os");

const OWNER = { name: "Rakib Islam", address: "Saidpur, Nilphamari, BD" };
const GIF = "https://media.tenor.com/6u3OELQf8WMAAAAC/glitch-art.gif";

module.exports = {
  config: {
    name: "info2",
    aliases: ["botinfo2", "holo"],
    version: "1.0", author: "Rakib Islam",
    countDown: 5, role: 0,
    shortDescription: "🌈 Bot Info — Holographic Style",
    category: "info",
    guide: { en: "{pn}" }
  },
  onStart: async function ({ message, event }) {
    await message.reaction("⏳", event.messageID);
    const upSec = Math.floor(process.uptime());
    const h = Math.floor(upSec/3600), m = Math.floor((upSec%3600)/60), s = upSec%60;
    const ts = new Date().toLocaleString("en-US",{timeZone:"Asia/Dhaka"});

    const card =
      `\n✨ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓\n` +
      `🌈    𝗛𝗢𝗟𝗢𝗚𝗥𝗔𝗣𝗛𝗜𝗖 𝗕𝗢𝗧 𝗜𝗗   \n` +
      `✨ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓\n\n` +
      `◉ 𝗕𝗼𝘁    : Rakib Bot v3.0\n` +
      `◉ 𝗢𝘄𝗻𝗲𝗿  : ${OWNER.name}\n` +
      `◉ 𝗕𝗮𝘀𝗲   : ${OWNER.address}\n` +
      `◉ 𝗨𝗽𝘁𝗶𝗺𝗲 : ${h}h ${m}m ${s}s\n` +
      `◉ 𝗥𝗔𝗠    : ${Math.round((os.totalmem()-os.freemem())/1024/1024)}MB / ${Math.round(os.totalmem()/1024/1024)}MB\n` +
      `◉ 𝗖𝗣𝗨    : ${os.cpus()[0]?.model?.slice(0,30)||"Unknown"}\n` +
      `◉ 𝗧𝗶𝗺𝗲   : ${ts} (BD)\n\n` +
      `🌈 ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓\n` +
      `💠 𝗔𝗨𝗧𝗛: RAKIB-BOT-HOLO-AUTH ✓`;
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
