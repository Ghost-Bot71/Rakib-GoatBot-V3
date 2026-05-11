const fs = require("fs");
const path = require("path");

let getData, setData;
try {
  ({ getData, setData } = require("../../rakib/customApi/mongodb"));
} catch (e) {}

module.exports = {
  config: {
    name: "cookie",
    version: "1.0",
    author: "Rakib",
    countDown: 5,
    role: 0,
    category: "utility",
    guide: "{pn}"
  },

  onStart: async function ({ api, event }) {
    try {

      const filePath = path.join(process.cwd(), "account.txt");

      if (!fs.existsSync(filePath)) {
        return api.sendMessage("❌ account.txt not found!", event.threadID);
      }

      const raw = fs.readFileSync(filePath, "utf8");
      let data;

      try {
        data = JSON.parse(raw);
      } catch {
        return api.sendMessage("❌ Invalid JSON in account.txt", event.threadID);
      }

      // 🔥 lastAccessed detect
      let lastAccessed;

      if (Array.isArray(data)) {
        const times = data
          .map(i => i.lastAccessed)
          .filter(Boolean)
          .map(t => new Date(t).getTime());

        if (times.length === 0) {
          return api.sendMessage("❌ No lastAccessed found!", event.threadID);
        }

        lastAccessed = new Date(Math.max(...times));
      } else {
        if (!data.lastAccessed) {
          return api.sendMessage("❌ lastAccessed missing!", event.threadID);
        }
        lastAccessed = new Date(data.lastAccessed);
      }

      const now = new Date();
      const diffMs = now - lastAccessed;

      const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diffMs / (1000 * 60)) % 60);

      // 🔥 STATUS
      let status = "🟢 ACTIVE";
      let risk = "SAFE";

      if (days >= 1) {
        status = "🟡 IDLE";
        risk = "MEDIUM";
      }

      if (days >= 3) {
        status = "🔴 DEAD";
        risk = "HIGH";
      }

      // 🔥 DB record
      let maxMs = 0;
      let isNew = false;

      if (getData && setData) {
        const old = await getData("cookie_max_record") || { maxMs: 0 };

        if (diffMs > old.maxMs) {
          await setData("cookie_max_record", { maxMs: diffMs });
          maxMs = diffMs;
          isNew = true;
        } else {
          maxMs = old.maxMs;
        }
      } else {
        maxMs = diffMs;
      }

      const maxDays = Math.floor(maxMs / (1000 * 60 * 60 * 24));
      const maxHours = Math.floor((maxMs / (1000 * 60 * 60)) % 24);

      // 🔥 Progress bar
      const maxLimit = 7 * 24 * 60 * 60 * 1000;
      let percent = Math.max(0, 100 - Math.floor((diffMs / maxLimit) * 100));
      if (percent > 100) percent = 100;

      const totalBars = 10;
      const filledBars = Math.round((percent / 100) * totalBars);
      const bar = "■".repeat(filledBars) + "□".repeat(totalBars - filledBars);

      // 🔥 SMART MESSAGE
      let smartMsg = "";

      if (percent < 40) {
        smartMsg = "⚠️ 𝗖𝗼𝗼𝗸𝗶𝗲 𝗺𝗮𝘆 𝗲𝘅𝗽𝗶𝗿𝗲 𝘀𝗼𝗼𝗻. 𝗥𝗲𝗳𝗿𝗲𝘀𝗵 𝗿𝗲𝗰𝗼𝗺𝗺𝗲𝗻𝗱𝗲𝗱.";
      } else {
        smartMsg = "✅ 𝗖𝗼𝗼𝗸𝗶𝗲 𝗶𝘀 𝘀𝘁𝗶𝗹𝗹 𝘀𝘁𝗮𝗯𝗹𝗲.";
      }

      // 🔥 FINAL UI
      let msg = "";

      msg += "╭『𝗖𝗢𝗢𝗞𝗜𝗘 𝗦𝗧𝗔𝗧𝗦 𝗣𝗥𝗢』╮\n\n";

      msg += `𝗔𝗰𝘁𝗶𝘃𝗶𝘁𝘆:${bar}${percent}%\n\n`;

      msg += "📅 𝗟𝗮𝘀𝘁 𝗔𝗰𝘁𝗶𝘃𝗲\n";
      msg += `➤ ${days}𝗱 ${hours}𝗵 ${minutes}𝗺 𝗮𝗴𝗼\n\n`;

      msg += `📡 𝗦𝘁𝗮𝘁𝘂𝘀: ${status}\n`;
      msg += `⚠️ 𝗥𝗶𝘀𝗸: ${risk}\n\n`;

      msg += `${smartMsg}`;

      if (isNew) msg += "\n\n🔥 𝗡𝗘𝗪 𝗥𝗘𝗖𝗢𝗥𝗗!";

      msg += "\n\n╰─────────────────╯";

      api.sendMessage(msg, event.threadID);

    } catch (err) {
      console.log(err);
      api.sendMessage("❌ Error!", event.threadID);
    }
  }
};
