const fs = require("fs-extra");
const path = require("path");
const https = require("https");

module.exports = {
  config: {
    name: "catmeme",
    version: "1.1",
    author: "Rakib",
    countDown: 5,
    role: 0,

    shortDescription: {
      en: "Generate a cat meme"
    },

    longDescription: {
      en: "Generate cute cat meme with custom text"
    },

    category: "fun",

    guide: {
      en: "{pn} your text"
    }
  },

  onStart: async function ({ message, args }) {
    try {
      if (!args[0]) {
        return message.reply(
          "❌ | Please provide text.\nExample:\ncatmeme I love cats"
        );
      }

      const text = args.join(" ");
      const encodedText = encodeURIComponent(text);

      // cache folder
      const cacheDir = path.join(__dirname, "cache");
      await fs.ensureDir(cacheDir);

      const filePath = path.join(
        cacheDir,
        `catmeme_${Date.now()}.jpg`
      );

      // better url with size
      const imageUrl = `https://cataas.com/cat/says/${encodedText}?fontSize=40&fontColor=white&type=square`;

      // download image
      await new Promise((resolve, reject) => {
        const file = fs.createWriteStream(filePath);

        https.get(imageUrl, (res) => {
          if (res.statusCode !== 200) {
            reject(new Error("Failed to fetch image"));
            return;
          }

          res.pipe(file);

          file.on("finish", () => {
            file.close(resolve);
          });
        }).on("error", (err) => {
          fs.unlink(filePath).catch(() => {});
          reject(err);
        });
      });

      // send image
      await message.reply({
        body: `🐱 | Here's your cat meme!\n📝 Text: ${text}`,
        attachment: fs.createReadStream(filePath)
      });

      // delete file after send
      fs.unlink(filePath).catch(() => {});

    } catch (err) {
      console.error(err);
      return message.reply("⚠️ | Failed to generate cat meme.");
    }
  }
};
