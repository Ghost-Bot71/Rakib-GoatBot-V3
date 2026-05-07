const axios = require("axios");
const fs = require("fs");

module.exports = {
config: {
name: "removebg",
aliases: ["rmbg", "rbg"],
version: "3.0",
author: "Rakib",
countDown: 10,
role: 0,
category: "media",
guide: "{pn} [reply image]"
},

onStart: async function ({ message, event }) {

try {

if (event.type !== "message_reply") {
return message.reply("❌ Reply to an image.");
}

if (!event.messageReply.attachments || event.messageReply.attachments[0].type !== "photo") {
return message.reply("❌ No image found.");
}

const imageUrl = event.messageReply.attachments[0].url;

await message.reply("⏳ Removing background...");

const response = await axios({
method: "POST",
url: "https://api.remove.bg/v1.0/removebg",
responseType: "arraybuffer",
headers: {
"X-Api-Key": "GkKJJxnWon9WbH7uMq5vRicW"
},
data: {
image_url: imageUrl,
size: "auto"
}
});

const filePath = __dirname + "/removebg.png";
fs.writeFileSync(filePath, response.data);

await message.reply({
body: "✅ Background removed successfully",
attachment: fs.createReadStream(filePath)
});

setTimeout(() => {
if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
}, 5000);

} catch (err) {
console.error(err);
message.reply("❌ Failed to remove background.");
}

}
};
