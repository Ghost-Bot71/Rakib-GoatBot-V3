// Upgrade Baby Chatbot with Rakib Custom Replies & On/Off Toggle
// Author: Rakib Islam (ACS RAKIB)
// Fixed and Optimized for GoatBot

const axios = require('axios');

const baseApiUrl = async () => {
    return "https://noobs-api.top/dipto";
};

// 👑 রাকিব ভাইয়ের জন্য স্পেশাল ক্রেজি ও ফানি বাংলিশ রিপ্লাই লিস্ট
const rakibCrazyReplies = [
    "Oh God! Rakib Islam er kotha bolchen? Uni toh eygulor shob meyer hobo jamai! 😹💍",
    "Rakib toh amader boss, group er shob meyer crush! Tarporeo single thakte bhalobashe! 😎🔥",
    "Areeh amr real owner Rakib er kotha boltechen? Uni toh ekta pure jadur moni! 🙈💝",
    "Rakib bhai ekhon busy ache, hoyto kono meyer sathe prem kortese nahle coding! 🤫😂",
    "Rakib holo eygulor king! Unar name fालतू kotha bolle usta lagaye dimu! 😼💢",
    "Shunlam Rakib naki shob meyer inbox e line mare? Shotti naki bhai? 😜🫣",
    "Rakib Islam? Oh, uni toh amader area er top handsome chele! 😎✨"
];

const fallbackReplies = [
    "Bolo baby, humm shunchi toh! 😘",
    "Hey baby, ami ekhon tomar sathe golpo korte ready! 💞",
    "Kotha bolo baby, chup thakle bhalo lage na! 🥺❤️",
    "Tumi chara ami WiFi chara phone er moto offline! 📶💔",
    "Babu, tumi amr hashir remix version! 🎶💓",
    "Ajke amr mon bhalo nei, amake ekta kiss diba? 🥺💋"
];

module.exports.config = {
    name: "baby",
    aliases: ["bbe", "babe", "botchan"], // 'bby', 'jan', 'janu' বাদ দেওয়া হয়েছে যাতে অন্য ফাইলের সাথে ঝামেলা না হয়!
    version: "7.0.0",
    author: "Rakib Islam",
    countDown: 0,
    role: 0,
    description: "Better than all sim simi - Optimized with Rakib Special Mode",
    category: "chat",
    guide: {
        en: "{pn} [on/off] — Turn chatbot on or off\n{pn} [message] — Chat with baby"
    }
};

module.exports.onStart = async ({ api, event, args, threadsData }) => {
    const link = `${await baseApiUrl()}/baby`;
    const dipto = args.join(" ").toLowerCase().trim();
    const uid = event.senderID;
    const tid = event.threadID;

    // ── ⚙️ ON/OFF TOGGLE SYSTEM ───────────────────────────────────────
    if (args[0] === 'off') {
        await threadsData.set(tid, false, "data.babyChatbotStatus");
        return api.sendMessage("❌ baby চ্যাটবটটি এই গ্রুপের জন্য অফ করা হলো।", tid, event.messageID);
    }
    if (args[0] === 'on') {
        await threadsData.set(tid, true, "data.babyChatbotStatus");
        return api.sendMessage("✅ baby চ্যাটবট সফলভাবে অন করা হয়েছে! এখন মেজাজ বুঝে কাপল ভাইব দেবো। 😘", tid, event.messageID);
    }

    // গ্লোবাল স্ট্যাটাস চেক
    const status = await threadsData.get(tid, "data.babyChatbotStatus") ?? true;
    if (!status) return;

    // ── 👑 RAKIB SPECIAL CHECK ────────────────────────────────────────
    if (dipto.includes("rakib") || dipto.includes("rakibul") || dipto.includes("রাকিব")) {
        const rReply = rakibCrazyReplies[Math.floor(Math.random() * rakibCrazyReplies.length)];
        return api.sendMessage(rReply, tid, event.messageID);
    }

    try {
        if (!args[0]) {
            return api.sendMessage(fallbackReplies[Math.floor(Math.random() * fallbackReplies.length)], tid, event.messageID);
        }

        // দীপ্ত এপিআই ব্লক থাকলে অল্টারনেটিভ মেসেজ হ্যান্ডলিং
        if (args[0] === 'teach' || args[0] === 'remove' || args[0] === 'rm' || args[0] === 'edit') {
            return api.sendMessage("⚠️ Dipto er API offline thakar karone ekhon r notun kotha shikhano jabe na, kintu ami unar puran database r local memory diye kotha bolte parbo! 😉", tid, event.messageID);
        }

        if (args[0] === 'list' || args[0] === 'msg') {
            return api.sendMessage("📊 Database system updating by developer...", tid, event.messageID);
        }

        // মেইন এপিআই চ্যাট রিকোয়েস্ট
        const res = await axios.get(`${link}?text=${encodeURIComponent(dipto)}&senderID=${uid}&font=1`, { timeout: 6000 });
        const dReply = res.data.reply || fallbackReplies[Math.floor(Math.random() * fallbackReplies.length)];
        
        api.sendMessage(dReply, tid, (error, info) => {
            if (!error && info) {
                global.GoatBot.onReply.set(info.messageID, {
                    commandName: this.config.name,
                    type: "reply",
                    messageID: info.messageID,
                    author: uid
                });
            }
        }, event.messageID);

    } catch (e) {
        // এপিআই অফ থাকলে লোকাল রিপ্লাই দেবে
        const fReply = fallbackReplies[Math.floor(Math.random() * fallbackReplies.length)];
        api.sendMessage(fReply, tid, (error, info) => {
            if (!error && info) {
                global.GoatBot.onReply.set(info.messageID, {
                    commandName: this.config.name,
                    type: "reply",
                    messageID: info.messageID,
                    author: uid
                });
            }
        }, event.messageID);
    }
};

module.exports.onReply = async ({ api, event, threadsData }) => {
    if (event.type !== "message_reply") return;

    const tid = event.threadID;
    const status = await threadsData.get(tid, "data.babyChatbotStatus") ?? true;
    if (!status) return;

    const bodyText = (event.body || "").toLowerCase().trim();

    // রিপ্লাইতেও রাকিব ভাইয়ের চেক
    if (bodyText.includes("rakib") || bodyText.includes("rakibul") || bodyText.includes("রাকিব")) {
        const rReply = rakibCrazyReplies[Math.floor(Math.random() * rakibCrazyReplies.length)];
        return api.sendMessage(rReply, tid, event.messageID);
    }

    try {
        const link = `${await baseApiUrl()}/baby`;
        const res = await axios.get(`${link}?text=${encodeURIComponent(bodyText)}&senderID=${event.senderID}&font=1`, { timeout: 6000 });
        const replyText = res.data.reply || fallbackReplies[Math.floor(Math.random() * fallbackReplies.length)];
        
        await api.sendMessage(replyText, tid, (error, info) => {
            if (info) {
                global.GoatBot.onReply.set(info.messageID, {
                    commandName: this.config.name,
                    type: "reply",
                    messageID: info.messageID,
                    author: event.senderID
                });
            }
        }, event.messageID);
    } catch (err) {
        const fReply = fallbackReplies[Math.floor(Math.random() * fallbackReplies.length)];
        await api.sendMessage(fReply, tid, (error, info) => {
            if (info) {
                global.GoatBot.onReply.set(info.messageID, {
                    commandName: this.config.name,
                    type: "reply",
                    messageID: info.messageID,
                    author: event.senderID
                });
            }
        }, event.messageID);
    }
};

module.exports.onChat = async ({ api, event, threadsData }) => {
    try {
        const body = event.body ? event.body.toLowerCase().trim() : "";
        if (!body) return;
        if (event.type === "message_reply") return;

        const tid = event.threadID;
        const status = await threadsData.get(tid, "data.babyChatbotStatus") ?? true;
        if (!status) return;

        // ট্রিগার ওয়ার্ডস চেক (কনফ্লিক্ট এড়াতে সীমিত ট্রিগার)
        const localTriggers = ["baby", "bbe", "babe", "botchan"];
        const triggered = localTriggers.some((w) => body.startsWith(w));
        
        // ডিরেক্ট রাকিব ভাই ট্রিগার চেক
        const hasRakib = body.includes("rakib") || body.includes("rakibul") || body.includes("রাকিব");

        if (!triggered && !hasRakib) return;

        if (hasRakib) {
            const rReply = rakibCrazyReplies[Math.floor(Math.random() * rakibCrazyReplies.length)];
            return api.sendMessage(rReply, tid, event.messageID);
        }

        // ট্রিগার বাদ দিয়ে টেক্সট এক্সট্র্যাক্ট করা
        let arr = body;
        for (const prefix of localTriggers) {
            if (body.startsWith(prefix)) {
                arr = body.slice(prefix.length).trim();
                break;
            }
        }

        if (!arr) {
            const randomMsg = fallbackReplies[Math.floor(Math.random() * fallbackReplies.length)];
            return api.sendMessage(randomMsg, tid, (error, info) => {
                if (info) {
                    global.GoatBot.onReply.set(info.messageID, {
                        commandName: this.config.name,
                        type: "reply",
                        messageID: info.messageID,
                        author: event.senderID
                    });
                }
            }, event.messageID);
        }

        const link = `${await baseApiUrl()}/baby`;
        const res = await axios.get(`${link}?text=${encodeURIComponent(arr)}&senderID=${event.senderID}&font=1`, { timeout: 6000 });
        const a = res.data.reply || fallbackReplies[Math.floor(Math.random() * fallbackReplies.length)];
        
        await api.sendMessage(a, tid, (error, info) => {
            if (info) {
                global.GoatBot.onReply.set(info.messageID, {
                    commandName: this.config.name,
                    type: "reply",
                    messageID: info.messageID,
                    author: event.senderID
                });
            }
        }, event.messageID);

    } catch (err) {
        const randomMsg = fallbackReplies[Math.floor(Math.random() * fallbackReplies.length)];
        api.sendMessage(randomMsg, event.threadID, (error, info) => {
            if (info) {
                global.GoatBot.onReply.set(info.messageID, {
                    commandName: this.config.name,
                    type: "reply",
                    messageID: info.messageID,
                    author: event.senderID
                });
            }
        }, event.messageID);
    }
};
    
