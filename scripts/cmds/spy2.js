"use strict";
// spy2.js — Deep Profile Spy with GIF animation
const axios = require("axios");
const { PassThrough } = require("stream");
const fs = require("fs-extra");
const path = require("path");

const GIF_URLS = [
  "https://media.tenor.com/A5RJ0VFVLMQAAAAC/cyber-hacker.gif",
  "https://media.tenor.com/QBbEUPiCkfoAAAAC/matrix-code.gif"
];

function fmt(n) {
  if (n === undefined || n === null) return "0";
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function rankLabel(exp) {
  if (exp >= 1_000_000) return "👑 Legend";
  if (exp >= 500_000)   return "💎 Diamond";
  if (exp >= 100_000)   return "🥇 Gold";
  if (exp >= 50_000)    return "🥈 Silver";
  if (exp >= 10_000)    return "🥉 Bronze";
  return "🌱 Beginner";
}

module.exports = {
  config: {
    name: "spy2",
    aliases: ["deepspy","profile2","stalk2"],
    version: "2.0", author: "Rakib Islam",
    countDown: 8, role: 0,
    shortDescription: "🕵️ Deep Spy v2 — Cyber Profile Scan",
    longDescription: "Deeply scan any user's profile with cyber GIF animation. @mention বা reply করো।",
    category: "utility",
    guide: { en: "{pn} @mention অথবা reply করে" }
  },

  onStart: async function ({ api, event, message, usersData }) {
    const { mentions, senderID, messageReply, threadID } = event;
    const mentionIDs = Object.keys(mentions || {});
    const targetID = mentionIDs[0] || messageReply?.senderID || senderID;

    await message.reaction("🔍", event.messageID);

    let name = "Unknown";
    let balance = 0, exp = 0;
    try {
      const userData = await usersData.get(targetID);
      name = userData?.name || "Unknown";
      balance = userData?.money || 0;
      exp = userData?.exp || 0;
    } catch {}

    const ip = Array.from({length:4},()=>Math.floor(Math.random()*255)).join(".");
    const locs = ["Dhaka, BD 🇧🇩","Chittagong, BD 🇧🇩","Sylhet, BD 🇧🇩","Rajshahi, BD 🇧🇩","Khulna, BD 🇧🇩","Barisal, BD 🇧🇩"];
    const devices = ["Android 14 📱","iOS 17 📱","Windows 11 💻","Ubuntu 22 🐧"];
    const loc    = locs[Math.floor(Math.random()*locs.length)];
    const device = devices[Math.floor(Math.random()*devices.length)];
    const rank   = rankLabel(exp);

    // Animated scanning phases
    const scan1 = await api.sendMessage(
      `🕵️ 𝗗𝗘𝗘𝗣 𝗦𝗣𝗬 𝗩𝟮\n━━━━━━━━━━━━━━━━━\n🎯 Target: ${name}\n\n⠋ Initializing scan...\n⣾ ░░░░░░░░░░ 0%`,
      threadID
    );

    await new Promise(r=>setTimeout(r,1500));
    try { await api.editMessage(
      `🕵️ 𝗗𝗘𝗘𝗣 𝗦𝗣𝗬 𝗩𝟮\n━━━━━━━━━━━━━━━━━\n🎯 Target: ${name}\n\n✅ Scanner ready!\n📡 Scanning network...\n⣾ ████░░░░░░ 40%`,
      scan1.messageID
    ); } catch {}

    await new Promise(r=>setTimeout(r,1500));
    try { await api.editMessage(
      `🕵️ 𝗗𝗘𝗘𝗣 𝗦𝗣𝗬 𝗩𝟮\n━━━━━━━━━━━━━━━━━\n🎯 Target: ${name}\n\n✅ Network found!\n💾 Accessing database...\n⣾ ████████░░ 80%`,
      scan1.messageID
    ); } catch {}

    await new Promise(r=>setTimeout(r,1500));

    const result =
      `🕵️ 𝗗𝗘𝗘𝗣 𝗦𝗣𝗬 𝗥𝗘𝗣𝗢𝗥𝗧\n` +
      `━━━━━━━━━━━━━━━━━━━━━━\n\n` +
      `👤 𝗡𝗮𝗺𝗲    : ${name}\n` +
      `🆔 𝗨𝗜𝗗     : ${targetID}\n` +
      `🌐 𝗙𝗮𝗸𝗲 𝗜𝗣  : ${ip}\n` +
      `📍 𝗟𝗼𝗰     : ${loc}\n` +
      `📱 𝗗𝗲𝘃𝗶𝗰𝗲  : ${device}\n` +
      `━━━━━━━━━━━━━━━━━━━━━━\n` +
      `💰 𝗕𝗮𝗹𝗮𝗻𝗰𝗲 : ৳${fmt(balance)}\n` +
      `⭐ 𝗘𝗫𝗣     : ${fmt(exp)}\n` +
      `🏆 𝗥𝗮𝗻𝗸    : ${rank}\n` +
      `━━━━━━━━━━━━━━━━━━━━━━\n` +
      `⚠️ IP/Location 100% fake!\n` +
      `🕵️ Ghost Spy v2 — Rakib Islam`;

    try { await api.editMessage(result, scan1.messageID); } catch {}

    // Send GIF
    for (const url of GIF_URLS) {
      try {
        const res = await axios.get(url, { responseType: "arraybuffer", timeout: 8000 });
        const st = new PassThrough(); st.end(Buffer.from(res.data));
        await message.reaction("✅", event.messageID);
        return api.sendMessage({ body: "🔍 Scan complete!", attachment: st }, threadID);
      } catch {}
    }
    await message.reaction("✅", event.messageID);
  }
};
