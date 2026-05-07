module.exports = {
config: {
name: "birthday",
aliases: ["wish"],
version: "2.0",
author: "Rakib",
role: 0,
countDown: 5,
category: "love",
guide: "{pn} @mention | reply | uid"
},

onStart: async function ({ api, event, args }) {

let targetID;
let name = "Friend";

// mention
if (Object.keys(event.mentions).length > 0) {
  targetID = Object.keys(event.mentions)[0];
  name = event.mentions[targetID].replace("@", "");
}

// reply
else if (event.messageReply) {
  targetID = event.messageReply.senderID;
  name = "Friend";
}

// uid
else if (args[0]) {
  targetID = args[0];
  name = "Friend";
}

else {
  return api.sendMessage("❌ | Mention / Reply / UID required to send birthday wish.", event.threadID, event.messageID);
}

const wishes = [

"🎉 𝐇𝐚𝐩𝐩𝐲 𝐁𝐢𝐫𝐭𝐡𝐝𝐚𝐲 ${name}! 🎂   ✨ May your day be filled with happiness and love! 💖",

"🎂 𝐖𝐢𝐬𝐡𝐢𝐧𝐠 𝐲𝐨𝐮 𝐚 𝐯𝐞𝐫𝐲 𝐡𝐚𝐩𝐩𝐲 𝐛𝐢𝐫𝐭𝐡𝐝𝐚𝐲 ${name}! 🎉   🎁 Hope your life is full of success and joy!",

"🎊 𝐇𝐚𝐩𝐩𝐲 𝐁𝐢𝐫𝐭𝐡𝐝𝐚𝐲 ${name}! 🥳   💫 May all your dreams come true!",

"🎂 𝐌𝐚𝐧𝐲 𝐦𝐚𝐧𝐲 𝐡𝐚𝐩𝐩𝐲 𝐫𝐞𝐭𝐮𝐫𝐧𝐬 ${name}! 🎉   💝 Stay blessed always!",

"🎉 Cheers to another year ${name}! 🥂   🎂 Have an amazing birthday!",

"🎂 Happy Birthday ${name}! 🎁   🌟 May your day shine like the stars!",

"🥳 Happy Birthday ${name}! 🎂   💖 Wishing you lots of happiness!",

"🎉 Another year older, wiser and cooler 😎   Happy Birthday ${name}! 🎂",

"🎂 Wishing you endless joy ${name}! 🎊",

"🎁 Hope your birthday is full of surprises ${name}! 🎉",

"🎉 Happy Cake Day ${name}! 🍰",

"🎂 May happiness follow you forever ${name}! 💫",

"🥳 It's your special day ${name}! 🎉 Enjoy!",

"🎊 Sending birthday hugs to you ${name}! 🤗",

"🎂 May your year be magical ${name}! ✨",

"🎉 Happy Birthday Legend ${name}! 👑",

"🎂 Another adventure begins today ${name}! 🚀",

"🎁 Wishing you health, love and success ${name}!",

"🎉 Stay awesome always ${name}! 😎",

"🎂 Today is all about YOU ${name}! 🥳",

"🎊 May all your wishes come true ${name}! ✨",

"🎂 Keep shining always ${name}! 🌟",

"🎉 Have the best birthday ever ${name}!",

"🎁 Happiness and love to you ${name}! 💖",

"🎂 Wishing you a joyful birthday ${name}! 🎉",

"🥳 Party hard today ${name}! 🎊",

"🎉 Birthday vibes only ${name}! 🎂",

"🎂 May luck follow you always ${name}! 🍀",

"🎁 Enjoy every moment ${name}! 🎉",

"🎊 Smile big today ${name}! 😄",

"🎂 Hope your cake is huge ${name}! 🍰",

"🎉 Have fun and celebrate ${name}! 🥳",

"🎁 Best wishes for your future ${name}! 🌟",

"🎂 Shine brighter every year ${name}! ✨",

"🎉 Another year of greatness ${name}!",

"🎊 Stay happy forever ${name}! 💖",

"🎂 Celebrate your life ${name}! 🎉",

"🎁 Make amazing memories ${name}!",

"🎉 Keep smiling always ${name}! 😄",

"🎂 Happy Birthday Superstar ${name}! 🌟"

];

const randomWish = wishes[Math.floor(Math.random() * wishes.length)];

api.sendMessage(randomWish, event.threadID, event.messageID);

}
};
