const fs = require("fs");

module.exports = {
  config: {
    name: "findpair",
    version: "1.0",
    author: "Rakib",
    countDown: 5,
    role: 0,
    category: "utility",
    guide: "{pn}"
  },

  onStart: async function ({ api, event }) {

    const searchLine = 'const { getAvatarUrl } = require("../../rakib/customApi/getAvatarUrl")';

    const files = fs.readdirSync(__dirname);
    let matchedFiles = [];

    for (const file of files) {
      if (file.endsWith(".js")) {
        const filePath = __dirname + "/" + file;
        const content = fs.readFileSync(filePath, "utf8");

        if (content.includes(searchLine)) {
          matchedFiles.push(file.replace(".js", ""));
        }
      }
    }

    if (matchedFiles.length === 0) {
      return api.sendMessage(
        "❌ | No files found.",
        event.threadID,
        event.messageID
      );
    }

    return api.sendMessage(
      "📂 Files using getAvatarUrl:\n\n" + matchedFiles.join("\n"),
      event.threadID,
      event.messageID
    );
  }
};
