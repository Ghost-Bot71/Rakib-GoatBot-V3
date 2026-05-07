const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "findfile",
    version: "4.0",
    author: "Rakib",
    countDown: 5,
    role: 2,
    category: "owner",
    guide: "{pn} <text>"
  },

  onStart: async function ({ api, event, args }) {

    if (!args[0]) {
      return api.sendMessage(
        "❌ | Please enter text to search.\nExample:\nfindfile rakibApi",
        event.threadID,
        event.messageID
      );
    }

    const searchText = args.join(" ");
    const rootDir = process.cwd();
    let results = [];

    function scan(dir) {
      const files = fs.readdirSync(dir);

      for (const file of files) {
        const fullPath = path.join(dir, file);

        // Skip node_modules for speed
        if (fullPath.includes("node_modules")) continue;

        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          scan(fullPath);
        } 
        
        else if (file.endsWith(".js")) {
          const content = fs.readFileSync(fullPath, "utf8");
          const lines = content.split("\n");

          lines.forEach((line, index) => {
            if (line.includes(searchText)) {
              results.push({
                file: fullPath.replace(rootDir + "/", ""),
                line: index + 1
              });
            }
          });
        }
      }
    }

    scan(rootDir);

    if (results.length === 0) {
      return api.sendMessage(
        `❌ | "${searchText}" not found in any file.`,
        event.threadID,
        event.messageID
      );
    }

    let msg = `🔎 Search result for: ${searchText}\n\n`;

    results.slice(0, 20).forEach(r => {
      msg += `📄 ${r.file}\n📍 Line: ${r.line}\n\n`;
    });

    if (results.length > 20) {
      msg += `⚠️ Showing first 20 results out of ${results.length}`;
    }

    api.sendMessage(msg, event.threadID, event.messageID);
  }
};
