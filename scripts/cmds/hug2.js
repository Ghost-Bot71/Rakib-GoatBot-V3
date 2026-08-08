const axios = require("axios");
const GIFS = [
  "https://media.tenor.com/N3BJfA-C1oQAAAAC/anime-girl.gif",
  "https://media.tenor.com/FBi2gu-MQUYAAAAC/aesthetic-anime.gif",
  "https://media.tenor.com/7h5XK2ZBMHQAAAAC/anime-cute.gif",
];
module.exports = {
  config: {
    name: "hug2",
    aliases: ["h2", "bighug", "warmhug"],
    version: "2.0", author: "Rakib Islam",
    countDown: 5, role: 0,
    shortDescription: "Hug2 — Warm anime hug GIF 🤗",
    category: "fun", guide: { en: "{pn} @mention" }
  },
  onStart: async function ({ message, event, usersData }) {
    const uid1 = event.senderID;
    const uid2 = Object.keys(event.mentions || {})[0] || event.messageReply?.senderID;
    if (!uid2) return message.reply("🤗 কাকে hug করবে? মেনশন দাও!");
    const name1 = (await usersData.get(uid1))?.name || "তুমি";
    const name2 = (await usersData.get(uid2))?.name || "সে";
    const lines = [
      `🤗 ${name1} tightly hugged ${name2}! Ekdom warm feeling! 💚`,
      `🫂 ${name2} tumi feel koro ${name1} er care! Hug hug hug! 🌸`,
      `🤗 Big bear hug from ${name1} to ${name2}! 💞`,
    ];
    const body = lines[Math.floor(Math.random()*lines.length)] +
      `\n\n🤗 ════ Hug2 Command ════ 🤗\n  By Rakib Islam | Ghost Net 👻`;
    const gif = GIFS[Math.floor(Math.random()*GIFS.length)];
    try {
      const res = await axios.get(gif, { responseType: "arraybuffer", timeout: 10000 });
      const { PassThrough } = require("stream"); const st = new PassThrough(); st.end(Buffer.from(res.data));
      return message.reply({ body, attachment: st });
    } catch { return message.reply(body); }
  }
};
