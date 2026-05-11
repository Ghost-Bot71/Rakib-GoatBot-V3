const https = require("https");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "cat",
    version: "1.1",
    author: "Rakib",
    countDown: 5,
    role: 0,

    shortDescription: {
      en: "Random cat image"
    },

    longDescription: {
      en: "Send a random cat image"
    },

    category: "fun",

    guide: {
      en: "{pn}"
    }
  },

  onStart: async function ({ message }) {
    try {
      const cacheDir = path.join(__dirname, "cache");

      // cache folder create
      await fs.ensureDir(cacheDir);

      const filePath = path.join(cacheDir, `cat_${Date.now()}.jpg`);

      const file = fs.createWriteStream(filePath);

      https.get("https://cataas.com/cat", (response) => {

        // error check
        if (response.statusCode !== 200) {
          return message.reply("❌ Could not fetch cat image.");
        }

        response.pipe(file);

        file.on("finish", async () => {
          file.close();

          await message.reply({
            body: "🐱 Here's a random cat for you!",
            attachment: fs.createReadStream(filePath)
          });

          // delete cache file
          fs.unlinkSync(filePath);
        });

      }).on("error", async () => {
        return message.reply("❌ Failed to fetch cat image.");
      });

    } catch (err) {
      console.log(err);
      return message.reply("❌ An error occurred.");
    }
  }
};
