const axios = require("axios");
const Jimp = require("jimp");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
config: {
name: "write",
aliases: ["wr"],
version: "2.0",
author: "Rakib",
countDown: 5,
role: 0,
category: "image",
guide: "{pn} [color] - <text> (reply image)"
},

onStart: async function ({ api, event, args }) {

const { threadID, messageID } = event;

if (!event.messageReply || !event.messageReply.attachments || event.messageReply.attachments[0].type !== "photo") {
  return api.sendMessage("❌ Please reply to an image.", threadID, messageID);
}

const imageUrl = event.messageReply.attachments[0].url;

let input = args.join(" ").trim();
let color = "white";
let text = input;

const colorMap = {
  b: "#000000",
  w: "#ffffff",
  r: "#ff0000",
  bl: "#0000ff",
  g: "#00ff00",
  y: "#ffff00",
  o: "#ffa500",
  p: "#800080",
  pk: "#ff69b4"
};

if (input.includes(" - ")) {
  const parts = input.split(" - ");
  color = colorMap[parts[0].toLowerCase()] || "#ffffff";
  text = parts[1];
}

if (!text) return api.sendMessage("❌ Please provide text.", threadID, messageID);

const cacheDir = path.join(__dirname, "cache");
await fs.ensureDir(cacheDir);

const imgPath = path.join(cacheDir, `img_${Date.now()}.png`);
const outputPath = path.join(cacheDir, `write_${Date.now()}.png`);

try {

  const res = await axios({
    url: imageUrl,
    method: "GET",
    responseType: "arraybuffer"
  });

  await fs.writeFile(imgPath, res.data);

  const image = await Jimp.read(imgPath);

  const font = await Jimp.loadFont(Jimp.FONT_SANS_64_WHITE);

  image.print(
    font,
    0,
    image.bitmap.height - 100,
    {
      text: text,
      alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER
    },
    image.bitmap.width
  );

  await image.writeAsync(outputPath);

  api.sendMessage({
    attachment: fs.createReadStream(outputPath)
  }, threadID, () => {
    fs.unlinkSync(imgPath);
    fs.unlinkSync(outputPath);
  }, messageID);

} catch (err) {
  console.error(err);
  api.sendMessage("❌ Error writing text on image.", threadID, messageID);
}

}
};
