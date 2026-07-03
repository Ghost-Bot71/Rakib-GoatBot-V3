const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "findfile",
    version: "1.0",
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
      try {
        const files = fs.readdirSync(dir);
        for (const file of files) {
          const fullPath = path.join(dir, file);

          // Skip node_modules for speed
          if (fullPath.includes("node_modules")) continue;

          const stat = fs.statSync(fullPath);

          if (stat.isDirectory()) {
            scan(fullPath);
          } else if (file.endsWith(".js")) {
            const content = fs.readFileSync(fullPath, "utf8");
            const lines = content.split("\n");

            lines.forEach((line, index) => {
              if (line.includes(searchText)) {
                results.push({
                  file: fullPath.replace(rootDir + path.sep, ""),
                  line: index + 1
                });
              }
            });
          }
        }
      } catch (err) {
        // Handle read errors if any
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

    // প্রথম পেজের জন্য (০ থেকে ২০টি রেজাল্ট)
    let page = 1;
    let limit = 20;
    let totalPages = Math.ceil(results.length / limit);
    
    let msg = `🔎 Search result for: ${searchText}\n`;
    msg += `📊 Total found: ${results.length} | Page: ${page}/${totalPages}\n\n`;

    const chunk = results.slice(0, limit);
    chunk.forEach(r => {
      msg += `📄 ${r.file}\n📍 Line: ${r.line}\n\n`;
    });

    if (results.length > limit) {
      msg += `💬 Reply to this message with "next" to see more results.`;
    }

    api.sendMessage(msg, event.threadID, (err, info) => {
      if (err) return;
      
      // পরবর্তী পেজগুলো হ্যান্ডেল করার জন্য অন-রিপ্লাই সেটআপ
      if (results.length > limit) {
        global.GoatBot.onReply.push({
          name: this.config.name,
          messageID: info.messageID,
          author: event.senderID,
          results: results,
          searchText: searchText,
          page: page,
          limit: limit,
          totalPages: totalPages
        });
      }
    }, event.messageID);
  },

  onReply: async function ({ api, event, Reply }) {
    const { body, author, threadID, messageID } = event;
    
    // শুধু যে সার্চ করেছে সে-ই যেন নেক্সট পেজ দেখতে পারে
    if (author !== Reply.author) return; 

    if (body.toLowerCase() === "next") {
      let { results, searchText, page, limit, totalPages } = Reply;
      page++; // পরবর্তী পেজে যাওয়া

      let start = (page - 1) * limit;
      let end = start + limit;
      let chunk = results.slice(start, end);

      let msg = `🔎 Search result for: ${searchText}\n`;
      msg += `📊 Page: ${page}/${totalPages}\n\n`;

      chunk.forEach(r => {
        msg += `📄 ${r.file}\n📍 Line: ${r.line}\n\n`;
      });

      if (page < totalPages) {
        msg += `💬 Reply to this message with "next" to see more results.`;
      } else {
        msg += `✅ End of search results.`;
      }

      // আগের রিপ্লাই ডাটা রিমুভ করে নতুন পেজের জন্য পুশ করা
      api.sendMessage(msg, threadID, (err, info) => {
        if (err) return;
        
        // আগের অন-রিপ্লাই ডাটা ডিলিট করা
        const index = global.GoatBot.onReply.findIndex(item => item.messageID === Reply.messageID);
        if (index !== -1) global.GoatBot.onReply.splice(index, 1);

        // যদি আরও পেজ থাকে তবে নতুন করে অন-রিপ্লাই পুশ হবে
        if (page < totalPages) {
          global.GoatBot.onReply.push({
            name: this.config.name,
            messageID: info.messageID,
            author: Reply.author,
            results: results,
            searchText: searchText,
            page: page,
            limit: limit,
            totalPages: totalPages
          });
        }
      }, messageID);
    }
  }
};
