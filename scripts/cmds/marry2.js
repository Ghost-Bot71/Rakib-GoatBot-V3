const axios = require("axios");
module.exports = {
  config: {
    name: "marry2",
    aliases: ["propose2", "mywife2", "myhusband2"],
    version: "1.0", author: "Rakib Islam",
    countDown: 5, role: 0,
    shortDescription: "Marry2 — propose with animated GIF 💍",
    category: "romantic", guide: { en: "{pn} @mention" }
  },
  onStart: async function ({ message, event, usersData }) {
    const uid2 = Object.keys(event.mentions||{})[0]||event.messageReply?.senderID;
    if (!uid2) return message.reply("💍 Kake propose korbe?");
    const n1 = (await usersData.get(event.senderID))?.name||"You";
    const n2 = (await usersData.get(uid2))?.name||"Partner";
    const body = `💍 ${n1} PROPOSES TO ${n2}!\n\n💌 "${n2}, ami tomar sathe sara jibon katate chai!\nTumi ki amay biye korbe? 💍"\n\n❤️ Say YES! 🌹\n\n💍 By Rakib Islam | Ghost Net 👻`;
    const gif = "https://media.tenor.com/OhRuF8eMDmkAAAAC/love-anime.gif";
    try {
      const res = await axios.get(gif, { responseType:"arraybuffer", timeout:8000 });
      const {PassThrough}=require("stream"); const st=new PassThrough(); st.end(Buffer.from(res.data));
      return message.reply({ body, attachment: st });
    } catch { return message.reply(body); }
  }
};
