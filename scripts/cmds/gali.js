const axios = require("axios");
const GALIS = [
  "তুই একটা ঢেমনা বলদ! 😡", "তোর মতো গাধা আর দেখিনি! 🫏",
  "তুই আসল মূর্খের রাজা! 👑", "তোর brain-এ RAM নেই, পুরাই storage full গোবর দিয়ে! 💩",
  "তুই বেয়াদব শালা! 😤", "যা ব্যাটা তুই একটা মস্ত গরু! 🐄",
  "তোরে দেখলে মাথা ঘোরে! 🤢", "চুপ কর বলদের বাচ্চা! 🤐",
  "তুই আস্ত একটা নির্বোধ! 🤡", "ভাগ এইখান থেকে মূর্খ! 🚫",
];
module.exports = {
  config: {
    name: "gali",
    aliases: ["abuse", "insult", "curse"],
    version: "1.0", author: "Rakib Islam",
    countDown: 5, role: 0,
    shortDescription: "Gali command — insult someone 😤 (fun only!)",
    category: "fun", guide: { en: "{pn} @mention" }
  },
  onStart: async function ({ message, event, usersData }) {
    const uid2 = Object.keys(event.mentions||{})[0]||event.messageReply?.senderID;
    if (!uid2) return message.reply("😤 Kake gali debo? Mention dao!");
    const n1 = (await usersData.get(event.senderID))?.name||"তুমি";
    const n2 = (await usersData.get(uid2))?.name||"সে";
    const gali = GALIS[Math.floor(Math.random()*GALIS.length)];
    const body = `😤 ${n1} says to ${n2}:\n\n${gali}\n\n⚠️ Just for fun! No hate!\n  By Rakib Islam | Ghost Net 👻`;
    try {
      const gifRes = await axios.get("https://media.tenor.com/QWCII8p7iqQAAAAC/galaxy-space.gif", { responseType: "arraybuffer", timeout: 10000 });
      const { PassThrough } = require("stream");
      const gifSt = new PassThrough(); gifSt.end(Buffer.from(gifRes.data));
      return message.reply({ body, attachment: gifSt });
    } catch {
      return message.reply(body);
    }
  }
};
