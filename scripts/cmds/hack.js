const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const GHOST = fs.readJsonSync(path.join(__dirname, "../../ghostConfig.json"));

module.exports = {
  config: {
    name: "hack",
    aliases: ["ghosthack", "ghack2"],
    version: "2.0",
    author: "Rakib Islam",
    countDown: 10,
    role: 0,
    shortDescription: "Fake hacking animation (just for fun!) — mention বা reply করো",
    longDescription: "মজার fake hacking animation। mention বা reply দিলে সেই ব্যক্তিকে হ্যাক করবে!",
    category: "fun",
    guide: "{pn} @mention অথবা reply করে",
  },
  onStart: async function ({ api, event, message, usersData }) {
    const { mentions, senderID, messageReply, threadID } = event;
    const mentionIDs = Object.keys(mentions || {});
    const targetID = mentionIDs[0] || messageReply?.senderID || senderID;

    let targetName = "Unknown";
    try { targetName = await usersData.getName(targetID) || "Unknown"; } catch {}

    const ip = `${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}`;
    const locs = ["Dhaka, BD","Chittagong, BD","Sylhet, BD","Rajshahi, BD","Khulna, BD"];
    const isps = ["Grameenphone","Robi","Banglalink","Teletalk","Airtel"];
    const devices = ["Android 13","iOS 17","Windows 11","Ubuntu 22.04"];
    const loc = locs[Math.floor(Math.random()*locs.length)];
    const isp = isps[Math.floor(Math.random()*isps.length)];
    const device = devices[Math.floor(Math.random()*devices.length)];

    const sent = await api.sendMessage(`👾 𝗚𝗛𝗢𝗦𝗧 𝗛𝗔𝗖𝗞𝗘𝗥\n━━━━━━━━━━━━━━━━━\n\n🎯 Target: ${targetName}\n🔍 Scanning...\n\n⏳ Please wait...`, threadID);

    await new Promise(r => setTimeout(r, 2000));
    try { await api.editMessage(`👾 𝗚𝗛𝗢𝗦𝗧 𝗛𝗔𝗖𝗞𝗘𝗥\n━━━━━━━━━━━━━━━━━\n\n🎯 Target: ${targetName}\n\n📡 Connecting... ✅\n🔐 Bypassing firewall... ✅\n💻 Accessing database... ⏳\n\n⌛ Processing...`, sent.messageID); } catch {}

    await new Promise(r => setTimeout(r, 2500));
    try { await api.editMessage(
      `👾 𝗚𝗛𝗢𝗦𝗧 𝗛𝗔𝗖𝗞𝗘𝗥\n` +
      `━━━━━━━━━━━━━━━━━\n\n` +
      `✅ HACK SUCCESSFUL!\n\n` +
      `🎯 Name: ${targetName}\n` +
      `🌐 IP: ${ip}\n` +
      `📍 Location: ${loc}\n` +
      `📶 ISP: ${isp}\n` +
      `📱 Device: ${device}\n\n` +
      `⚠️ Just for fun! 100% fake data.\n` +
      `━━━━━━━━━━━━━━━━━\n` +
      `👻 Ghost Bot — ${GHOST.ownerName}`,
      sent.messageID
    ); } catch {}

    // Send animated GIF at end
    try {
      const gifRes = await axios.get("https://media.tenor.com/A5RJ0VFVLMQAAAAC/cyber-hacker.gif", { responseType: "arraybuffer", timeout: 10000 });
      const { PassThrough } = require("stream");
      const gifSt = new PassThrough(); gifSt.end(Buffer.from(gifRes.data));
      await api.sendMessage({ body: "💀 Ghost Net Hack Complete! — Rakib Islam", attachment: gifSt }, threadID);
    } catch {}
  }
};
