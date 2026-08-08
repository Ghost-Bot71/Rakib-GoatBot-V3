// Bangla-English Simi Bot with On/Off Toggle for Ghost-Bot
// Author: Rakib Islam

const axios = require("axios");

const SIMI_API = process.env.SIMI_API_URL || "https://bangla-simi-bot--dxfrrrr.replit.app/api";

const triggerWords = [
  "baby", "bby", "babu", "bbu", "jan", "janu", "bot",
  "জান", "জানু", "বেবি", "wifey", "hina", "hinata"
];

// 🔥 গ্রুপের রিয়ালিস্টিক ও ট্রেন্ডি ভাইব অনুযায়ী কাস্টম লোকাল রিপ্লাই লিস্ট
const randomGreetings = [
  "হুম বলো জানু, শুনছি! 🌸",
  "বেশি বেবি বেবি করিস না, কামড় দিয়ে দিমু কিন্তু! 🤭🤏",
  "আরেহ্ আমার ক্রাশ ডাকছে! বলো কি সেবা করতে পারি? 🙈",
  "ডাকছো কেন শুনি? বিয়া করবা নাকি? 💍😏",
  "Hop beda 😾, Boss বল boss! ওনার রাকিব ছাড়া কাউরে পাত্তা দেই না। 😼",
  "আমাকে ডাকলে কিন্তু কিস দিয়ে দেবো একটা! 😘",
  "উফফ! আবার ডিস্টার্ব করতে চলে এলো আবালটা! 🙄😒",
  "বার বার বাবু ডাকলে মাথা গরম হয় কিন্তু! 😑",
  "বলুন জনাব, আপনার জন্য কী করতে পারি? 👑",
  "I love you too... বলবো ভাবছো? একদম না! 😝",
  "মন সুন্দর বানাও ভাই, মুখের জন্য তো Snapchat আছেই! 🌚",
  "খাওয়া দাওয়া করসো নাকি খালি খালি আমারে ডাকতেছো? 🙄",
  "এত কাছে এসো না, প্রেমে পড়ে যাবো তো! 🙈❤",
  "চৌধুরী সাহেব, আমি গরিব হতে পারি... কিন্তু বটের ইগো অনেক বেশি! 😾🤭",
  "ভুলে যাও আমাকে, আমাদের ফিউচার নাই। 😞😞",
  "কথা দিচ্ছো তো আমাকে পটাবা? তা না হলে কথা নাই! 😌",
  "আমার জানুর সাথে চ্যাট করতেছিলাম, মাঝখান থেকে তুমি ক্যান আইলা? 😋",
  "Hey Handsome/Beautiful! কী খবর বলো? 😁",
  "আগে একটা গান গেয়ে শোনাও, নাহলে রিপ্লাই দিমু না। ☹🥺",
  "ঐ মামা, আর ডাকিস না প্লিজ, একটু শান্তিতে থাকতে দে! 😿",
  "আমাকে না ডেকে একটু পড়তে বসো, পরীক্ষা সামনে না? 🥺🥺",
  "তোর তো বিয়েই হয় নাই, বাবু আসলো কই থেকে শুনি? 🙄",
  "দেখা হলে কিন্তু এক গুচ্ছ কাঠগোলাপ দিতে হবে! 🤗🌹",
  "Assalamualaikum! শান্তশিষ্ট মিষ্টি একটা বট আমি। 🐤🐤",
  "আমি তোমার সিনিয়র আপু ওকে? একটু সম্মান দিয়ে কথা বলো! 😼🙁",
  "আজকে মেজাজটা এমনিতেই গরম আছে, আর ডাকিস না! 🙉",
  "তোমারে দেখলে আমার কেমন যেন ক্রাশ ক্রাশ ভাইব আসে! 🙈🤏",
  "বলো আমার কলিজার টুকরা, কী খবর? 😚",
  "একটা বিএফ/জিএফ খুঁজে দাও না ভাই, একলা ভালো লাগে না! 😿",
  "আমি অন্যের ক্রাশের সাথে বেশি কথা বলি না, দূরে থাকো! 😏",
  "শুনলাম তুমি নাকি খুব কিউট? একটু হাসো তো দেখি! 😊",
  "আজকে আমার মনটা ভালো নেই, একটা কিস দিবা? 🥺❤",
  "কী রে ভাই? এত ডাকার কী আছে? প্রেম করবি? 😹",
  "যাও ভাগো! কাজ করো গিয়ে, সারাদিন চ্যাটিং! 😒😂",
  "হুমম, শুনছি গো আমার জানুটা! বলো বলো... 👂💕",
  "কী খাইলা আজকে? আমারে তো দাও নাই! 🍽️",
  "তুমি সিঙ্গেল আছো নাকি অলরেডি বুকড? 🤭"
];

async function getSimiResponse(text) {
  try {
    const res = await axios.post(`${SIMI_API}/simi/chat`, { text }, { timeout: 8000 });
    return res.data.message || randomGreetings[Math.floor(Math.random() * randomGreetings.length)];
  } catch {
    return randomGreetings[Math.floor(Math.random() * randomGreetings.length)];
  }
}

module.exports.config = {
  name: "bby",
  aliases: ["baby", "bbu", "jan", "janu", "wifey", "bot", "hinata", "hina", "babu"],
  version: "3.0",
  author: "Rakib Islam",
  countDown: 0,
  role: 0,
  description: "Bangla-English Simi bot with System On/Off control",
  category: "chat",
  guide: {
    en: "{pn} [on/off] to control chatbot\n{pn} teach [ques] - [ans] to teach new things"
  }
};

module.exports.onStart = async ({ api, event, args, usersData, threadsData }) => {
  const uid = event.senderID;
  const tid = event.threadID;

  // ── ⚙️ ON/OFF LOGIC SYSTEM ──────────────────────────────────────────
  if (args[0] === "off") {
    await threadsData.set(tid, false, "data.bbyChatbotStatus");
    return api.sendMessage("❌ bby চ্যাটবটটি এই গ্রুপের জন্য অফ করা হলো।", tid, event.messageID);
  }
  if (args[0] === "on") {
    await threadsData.set(tid, true, "data.bbyChatbotStatus");
    return api.sendMessage("✅ bby চ্যাটবটটি সফলভাবে অন করা হলো! এখন মেজাজ বুঝে রিপ্লাই দেবো। 😉", tid, event.messageID);
  }

  // গ্লোবাল চেক: চ্যাটবট অফ থাকলে নরমাল কমান্ডও রেসপন্স করবে না
  const status = await threadsData.get(tid, "data.bbyChatbotStatus") ?? true;
  if (!status) return;

  const msg = args.join(" ").toLowerCase().trim();

  try {
    if (!args[0]) {
      const reply = randomGreetings[Math.floor(Math.random() * randomGreetings.length)];
      return api.sendMessage(reply, tid, event.messageID);
    }

    // ── TEACH METHOD ──────────────────────────────────────────────────────
    if (args[0] === "teach") {
      const rest = args.slice(1).join(" ");
      const dashIdx = rest.indexOf(" - ");
      if (dashIdx === -1)
        return api.sendMessage("❌ ফরম্যাট ভুল! এভাবে লিখুন: .bby teach প্রশ্ন - উত্তর", tid, event.messageID);

      const trigger = rest.slice(0, dashIdx).trim();
      const responses = rest.slice(dashIdx + 3).trim();
      if (!trigger || !responses)
        return api.sendMessage("❌ ফরম্যাট ভুল! এভাবে লিখুন: .bby teach প্রশ্ন - উত্তর", tid, event.messageID);

      const userName = (await usersData.getName(uid)) || "Unknown";
      const res = await axios.post(`${SIMI_API}/simi/teach`, {
        trigger,
        responses,
        userID: uid,
        userName
      }, { timeout: 8000 });
      return api.sendMessage(
        `✅ সফলভাবে শিখে নিয়েছি!\n• 𝗣𝗿𝗼𝘀𝗻𝗼: "${trigger}"\n• 𝗧𝗲𝗮𝗰𝗵𝗲𝗿: ${userName}\n• 𝗧𝗼𝘁𝗮𝗹 𝗗𝗮𝘁𝗮: ${res.data.count}`,
        tid,
        event.messageID
      );
    }

    // ── LIST ──────────────────────────────────────────────────────────────
    if (args[0] === "list") {
      const trigger = args.slice(1).join(" ").trim();
      const url = trigger ? `${SIMI_API}/simi/list?trigger=${encodeURIComponent(trigger)}` : `${SIMI_API}/simi/list`;
      const res = await axios.get(url, { timeout: 8000 });
      return api.sendMessage(res.data.message, tid, event.messageID);
    }

    // ── CHAT EXECUTION ────────────────────────────────────────────────────
    const botReply = await getSimiResponse(msg);
    api.sendMessage(botReply, tid, (err, info) => {
      if (!err) {
        global.GoatBot.onReply.set(info.messageID, {
          commandName: module.exports.config.name,
          type: "reply",
          messageID: info.messageID,
          author: uid,
          text: botReply
        });
      }
    }, event.messageID);

  } catch (err) {
    api.sendMessage(`❌ এরর: ${err.response?.data?.error || err.message}`, tid, event.messageID);
  }
};

module.exports.onReply = async ({ api, event, threadsData }) => {
  if (event.type !== "message_reply") return;
  
  // চেক: গ্রুপে চ্যাটবট অফ আছে কিনা
  const status = await threadsData.get(event.threadID, "data.bbyChatbotStatus") ?? true;
  if (!status) return;

  try {
    const text = (event.body || "").toLowerCase().trim() || "হ্যালো";
    const botReply = await getSimiResponse(text);
    api.sendMessage(botReply, event.threadID, (err, info) => {
      if (!err) {
        global.GoatBot.onReply.set(info.messageID, {
          commandName: module.exports.config.name,
          type: "reply",
          messageID: info.messageID,
          author: event.senderID,
          text: botReply
        });
      }
    }, event.messageID);
  } catch (err) {
    // silent fail
  }
};

module.exports.onChat = async ({ api, event, threadsData }) => {
  try {
    const message = (event.body || "").toLowerCase().trim();
    if (!message) return;
    if (event.type === "message_reply") return;

    // চেক: গ্রুপে চ্যাটবট অফ আছে কিনা
    const status = await threadsData.get(event.threadID, "data.bbyChatbotStatus") ?? true;
    if (!status) return;

    const triggered = triggerWords.some((w) => message.startsWith(w));
    if (!triggered) return;

    api.setMessageReaction("🪽", event.messageID, () => {}, true);

    let userText = message;
    for (const prefix of triggerWords) {
      if (message.startsWith(prefix)) {
        userText = message.slice(prefix.length).trim();
        break;
      }
    }

    if (!userText) {
      const greeting = randomGreetings[Math.floor(Math.random() * randomGreetings.length)];
      api.sendMessage(greeting, event.threadID, (err, info) => {
        if (!err) {
          global.GoatBot.onReply.set(info.messageID, {
            commandName: module.exports.config.name,
            type: "reply",
            messageID: info.messageID,
            author: event.senderID,
            text: greeting
          });
        }
      }, event.messageID);
      return;
    }

    const botReply = await getSimiResponse(userText);
    api.sendMessage(botReply, event.threadID, (err, info) => {
      if (!err) {
        global.GoatBot.onReply.set(info.messageID, {
          commandName: module.exports.config.name,
          type: "reply",
          messageID: info.messageID,
          author: event.senderID,
          text: botReply
        });
      }
    }, event.messageID);
  } catch (err) {
    // silent fail
  }
};
  
