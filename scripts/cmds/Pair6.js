const axios = require("axios");
const fsE = require("fs-extra");
const path = require("path");

const baseApiUrl = async () => {
  try {
    const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json", { timeout: 5000 });
    return base.data.mahmud;
  } catch { return "https://noobs-api.top/dipto"; }
};

const LOVE_GIFS = [
  "https://media.tenor.com/OhRuF8eMDmkAAAAC/love-anime.gif",
  "https://media.tenor.com/BrYkfyF2LKUAAAAC/anime-love.gif",
  "https://media.tenor.com/k0_apKlkNx0AAAAC/couple-anime.gif",
  "https://media.tenor.com/N3BJfA-C1oQAAAAC/anime-girl.gif",
];

module.exports = {
  config: {
    name: "pair6",
    aliases: ["lovepair6", "match6"],
    version: "2.0",
    author: "Rakib Islam",
    countDown: 10,
    role: 0,
    shortDescription: "Love pair v6 - profile card + GIF animation",
    category: "love",
    guide: { en: "{pn}" }
  },

  onStart: async function ({ api, event }) {
    await api.setMessageReaction("💕", event.messageID, () => {}, true);
    const outputPath = path.join(__dirname, "cache", "pair6_" + event.senderID + "_" + Date.now() + ".png");
    await fsE.ensureDir(path.dirname(outputPath));

    try {
      const threadData = await api.getThreadInfo(event.threadID);
      const users = threadData.userInfo;
      const myData = users.find(u => u.id === event.senderID);
      const myGender = myData && myData.gender ? myData.gender.toUpperCase() : null;
      let matchCandidates = [];
      if (myGender === "MALE") matchCandidates = users.filter(u => u.gender === "FEMALE" && u.id !== event.senderID);
      else if (myGender === "FEMALE") matchCandidates = users.filter(u => u.gender === "MALE" && u.id !== event.senderID);
      else matchCandidates = users.filter(u => u.id !== event.senderID);

      if (!matchCandidates.length) {
        return api.sendMessage("No match found in this group!", event.threadID, event.messageID);
      }

      const match = matchCandidates[Math.floor(Math.random() * matchCandidates.length)];
      const name1 = (myData && myData.name) ? myData.name : "You";
      const name2 = match.name || "Partner";
      const pct = Math.floor(Math.random() * 31) + 70;

      const body = "Love Pair Card v6\n================\n" +
        name1 + "\n loves \n" + name2 + "\n\n" +
        "Love: " + pct + "%\n================\nGhost Net | Rakib Islam";

      let cardSent = false;
      try {
        const apiUrl = await baseApiUrl();
        const { data } = await axios.get(apiUrl + "/api/pair/mahmud?user1=" + event.senderID + "&user2=" + match.id + "&style=6", { responseType: "arraybuffer", timeout: 15000 });
        fsE.writeFileSync(outputPath, Buffer.from(data));
        await api.sendMessage({ body, attachment: fsE.createReadStream(outputPath) }, event.threadID, () => { try { fsE.unlinkSync(outputPath); } catch {} }, event.messageID);
        cardSent = true;
      } catch {}

      const gif = LOVE_GIFS[2];
      try {
        const res = await axios.get(gif, { responseType: "arraybuffer", timeout: 10000 });
        const { PassThrough } = require("stream");
        const st = new PassThrough(); st.end(Buffer.from(res.data));
        if (!cardSent) {
          await api.sendMessage({ body, attachment: st }, event.threadID, event.messageID);
        } else {
          await api.sendMessage({ body: "Ghost Net Love Pair v6!", attachment: st }, event.threadID);
        }
      } catch {
        if (!cardSent) await api.sendMessage(body, event.threadID, event.messageID);
      }
      await api.setMessageReaction("✅", event.messageID, () => {}, true);
    } catch (err) {
      try { fsE.unlinkSync(outputPath); } catch {}
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      api.sendMessage("Error: " + err.message, event.threadID, event.messageID);
    }
  }
};
