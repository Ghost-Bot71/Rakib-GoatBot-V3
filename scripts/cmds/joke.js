const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const GHOST = fs.readJsonSync(path.join(__dirname, "../../ghostConfig.json"));

const BANGLA_JOKES = [
  "👨 ডাক্তার: আপনি দিনে কতটা পানি খান?\n🧑 রোগী: কম খাই।\n👨 ডাক্তার: কতটুকু?\n🧑 রোগী: পানি খাই না, শুধু চা আর কোক। পানিতে সাঁতার কাটি! 😂",
  "মা: পড়তে বসো!\nছেলে: আম্মু, Einstein কি পড়তো?\nমা: হ্যাঁ।\nছেলে: তাও পারমাণু বোমা বানিয়েছে। আমি না পড়ে কী করব সেটা ভাবো! 😂",
  "বাবা: তুমি পরীক্ষায় কত পেয়েছ?\nছেলে: Teacher বলেছে গোপন রাখতে।\nবাবা: কেন?\nছেলে: কারণ এত কম নম্বর দেখলে নাকি মানুষ হাসে! 😭😂",
  "Teacher: সূর্য কোন দিক থেকে ওঠে?\nStudent: স্যার, আমাদের বাসায় সূর্য ওঠে না, বাবা উঠে রোদ আনেন! 😂",
  "ডাক্তার: আপনার স্মৃতিশক্তি কেমন?\nরোগী: ভালোই ছিল।\nডাক্তার: কতদিন ধরে সমস্যা?\nরোগী: কোন সমস্যার কথা বলছেন? 😂",
  "Wife: তোমার কী মনে হয় আমি সুন্দর না কি বুদ্ধিমান?\nHusband: দুটোই না, মানে দুটোই! 😅",
  "Boss: তুমি কাজ না করলে মাস শেষে বেতন পাবে না!\nEmployee: আর আপনি কাজ করলে তো পান-ই! 😂",
  "Friend: তোর girlfriend কী করে?\nAmi: অপেক্ষা করে।\nFriend: কীসের?\nAmi: আমার। আমি তো এখনো প্রেম করিনি! 😂",
  "মা: বাজার থেকে ১০টা ডিম আনো, একটা ভালো না হলেও চলবে।\nছেলে ৯টা ভালো ও ১টা পচা ডিম নিয়ে এল।\nমা: এটা কী?\nছেলে: তুমিই বললে একটা ভালো না হলেও চলবে! 😂",
  "Professor: তোমার assignment কই?\nStudent: স্যার, assignment করেছিলাম, কিন্তু বাতাসে উড়ে গেছে!\nProfessor: তুমি কি ভাবছ আমি বোকা?\nStudent: স্যার, আপনি তো Professor, বোকা হবেন কেন? 😂"
];

module.exports = {
  config: {
    name: "joke",
    aliases: ["jokes", "হাসি", "randomjoke"],
    version: "1.0",
    author: "Rakib Islam",
    countDown: 5,
    role: 0,
    shortDescription: "Random joke শোনো",
    longDescription: "Bangla ও English funny jokes",
    category: "fun",
    guide: "{pn} [bn | en | dark | programming]",
  },

  onStart: async function ({ args, message }) {
    const cat = (args[0] || "").toLowerCase();
    let joke = "";
    let setup = "", delivery = "";

    try {
      if (!cat || cat === "en" || cat === "programming") {
        const type = cat === "programming" ? "Programming" : "Any";
        const res = await axios.get(`https://v2.jokeapi.dev/joke/${type}?blacklistFlags=nsfw,racist,sexist&safe-mode`, { timeout: 8000 });
        const data = res.data;
        if (data.type === "twopart") {
          setup = data.setup;
          delivery = data.delivery;
        } else {
          joke = data.joke;
        }
      } else {
        joke = BANGLA_JOKES[Math.floor(Math.random() * BANGLA_JOKES.length)];
      }
    } catch {
      joke = BANGLA_JOKES[Math.floor(Math.random() * BANGLA_JOKES.length)];
    }

    if (setup && delivery) {
      return message.reply(
        `😂 𝗥𝗮𝗻𝗱𝗼𝗺 𝗝𝗼𝗸𝗲\n` +
        `━━━━━━━━━━━━━━━━━\n\n` +
        `❓ ${setup}\n\n` +
        `💬 ${delivery}\n\n` +
        `━━━━━━━━━━━━━━━━━\n` +
        `🇧🇩 বাংলায়: .joke bn\n👻 Ghost Bot — ${GHOST.ownerName}`
      );
    }

    return message.reply(
      `😂 𝗥𝗮𝗻𝗱𝗼𝗺 𝗝𝗼𝗸𝗲\n` +
      `━━━━━━━━━━━━━━━━━\n\n` +
      `${joke || BANGLA_JOKES[Math.floor(Math.random() * BANGLA_JOKES.length)]}\n\n` +
      `━━━━━━━━━━━━━━━━━\n` +
      `🔁 আরেকটা: .joke | 🇧🇩 বাংলা: .joke bn\n` +
      `👻 Ghost Bot — ${GHOST.ownerName}`
    );
  }
};
