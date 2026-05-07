const fs = require("fs");
const path = require("path");
const { createFbCover } = require("../../rakib/customApi/fbcoverApi");

module.exports = {
  config: {
    name: "fbcover",
    version: "1.1",
    author: "Rakib Hasan",
    countDown: 5,
    role: 0,
    shortDescription: "Create Facebook cover",
    longDescription: "Generate custom Facebook cover",
    category: "image",
    guide: "{pn} name | subname | email | phone | team | uid | template"
  },

  onStart: async function ({ message, event }) {

    const input = event.body.slice(8).split("|").map(x => x.trim());

    if (input.length < 7) {
      return message.reply(
`❌ Usage:
fbcover name | subname | email | phone | team | uid | template

Example:
fbcover Hoon | Akaima | hoon@gmail.com | 01700000000 | MAKIMA-WORLD | 61581351693349 | 5`
      );
    }

    const [name, subname, email, phone, team, uid, template] = input;

    try {

      await message.reply("⏳ Creating Facebook cover...");

      const cacheFolder = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheFolder))
        fs.mkdirSync(cacheFolder, { recursive: true });

      const outputPath = path.join(cacheFolder, `fbcover_${Date.now()}.jpg`);

      const { createFbCover } = require("../../rakib/customApi/fbcoverApi");

      await createFbCover(
        { name, subname, email, phone, team, uid, template },
        outputPath
      );

      await message.reply({
        body: "🖼️ Your FB Cover is ready!",
        attachment: fs.createReadStream(outputPath)
      });

      fs.unlinkSync(outputPath);

    } catch (err) {
      console.log(err);
      message.reply("❌ Failed to create cover.");
    }
  }
};
