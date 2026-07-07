const os = require("os");

module.exports = {
  config: {
    name: "uptime",
    aliases: ["upt", "up"],
    version: "1.0",
    author: "Rakib",
    role: 0,
    category: "system",
    shortDescription: {
      en: "Premium system stats with host info"
    },
    longDescription: {
      en: "Real-time bot, CPU, RAM, latency and hosting provider with clean premium UI"
    },
    guide: {
      en: "{pn}"
    }
  },

  onStart: async function ({ api, event, usersData, threadsData }) {
    try {

      // USERS & THREADS
      const allUsers = await usersData.getAll();
      const allThreads = await threadsData.getAll();

      // TIME FORMAT
      const formatTime = (sec) => {
        const d = Math.floor(sec / 86400);
        const h = Math.floor((sec % 86400) / 3600);
        const m = Math.floor((sec % 3600) / 60);
        const s = Math.floor(sec % 60);
        return `${d}d ${h}h ${m}m ${s}s`;
      };

      // BAR
      const bar = (percent) => {
        const total = 10;
        const filled = Math.round((percent / 100) * total);
        return "█".repeat(filled) + "░".repeat(total - filled);
      };

      // CPU SNAPSHOT
      const snapshotCPU = () => {
        return os.cpus().map(core => {
          const total = Object.values(core.times).reduce((a, b) => a + b, 0);
          return {
            idle: core.times.idle,
            total
          };
        });
      };

      const startSnap = snapshotCPU();
      const startTime = Date.now();

      api.sendMessage("⚡ Loading system stats...", event.threadID, (err, info) => {
        if (err) return;

        setTimeout(() => {

          const latency = Date.now() - startTime;
          const endSnap = snapshotCPU();

          // CPU CALC
          let totalUsage = 0;

          endSnap.forEach((core, i) => {
            const idleDiff = core.idle - startSnap[i].idle;
            const totalDiff = core.total - startSnap[i].total;
            const usage = 100 - (100 * idleDiff / totalDiff);
            totalUsage += usage;
          });

          const cpuUsage = totalUsage / endSnap.length;

          // MEMORY
          const mem = process.memoryUsage();
          const heap = mem.heapUsed / 1024 / 1024;
          const rss = mem.rss / 1024 / 1024;

          let memWarn = "🟢 Smooth";
          if (rss > 300) memWarn = "🟡 Medium";
          if (rss > 500) memWarn = "🔴 Heavy";

          // SYSTEM RAM
          const totalRAM = os.totalmem() / 1024 / 1024 / 1024;
          const usedRAM = totalRAM - (os.freemem() / 1024 / 1024 / 1024);

          // INFO
          const cpuModel = os.cpus()[0].model;
          const cpuCores = os.cpus().length;

          const uptimeBot = formatTime(process.uptime());
          const uptimeSys = formatTime(os.uptime());

          // HOSTING DETECTOR
          const env = process.env;
          let host = "Unknown Host";

          if (env.RENDER || env.RENDER_EXTERNAL_URL) {
            host = "🟦 Render";
          } else if (env.RAILWAY_ENVIRONMENT || env.RAILWAY_PROJECT_ID) {
            host = "🚂 Railway";
          } else if (env.GITHUB_ACTIONS === "true") {
            host = "⚙️ GitHub Actions";
          } else if (env.REPL_ID || env.REPLIT_DB_URL) {
            host = "🟧 Replit";
          } else if (env.HEROKU_APP_NAME || env.DYNO) {
            host = "🟪 Heroku";
          } else if (env.KOYEB_SERVICE_ID) {
            host = "🟨 Koyeb";
          } else if (env.VERCEL) {
            host = "▲ Vercel";
          } else if (env.NETLIFY) {
            host = "🌐 Netlify";
          } else if (env.FLY_APP_NAME) {
            host = "🪰 Fly.io";
          } else if (env.GLITCH_PROJECT_NAME) {
            host = "✨ Glitch";
          } else if (env.CODESPACE_NAME) {
            host = "💻 GitHub Codespaces";
          } else if (
            env.HOME === "/root" ||
            env.USER === "root" ||
            env.SSH_CONNECTION ||
            env.SSH_CLIENT
          ) {
            host = "🖥️ VPS / Dedicated Server";
          }

          const platform = os.platform();
          const node = process.version;
          const arch = process.arch;

          // LATENCY SPLIT (approx)
          const apiLatency = Math.max(latency - 50, 0);
          const botLatency = latency - apiLatency;

          // STATUS
          const pingStatus =
            latency < 150 ? "🟢 Fast" :
            latency < 300 ? "🟢 Good" :
            latency < 600 ? "🟡 Stable" :
            "🔴 Slow";

          const cpuStatus =
            cpuUsage < 30 ? "🟢 Chill" :
            cpuUsage < 70 ? "🟡 Busy" :
            "🔴 High";

          const msg = `
╔═━━━❰  💠 𝐔𝐏𝐓𝐈𝐌𝐄  💠  ❱━━━═╗

╭─❖ 𝐒𝐘𝐒𝐓𝐄𝐌.𝐑𝐔𝐍𝐓𝐈𝐌𝐄
│ ⨳ 𝐛𝐨𝐭    :: ${uptimeBot}
│ ⨳ 𝐬𝐲𝐬𝐭𝐞𝐦 :: ${uptimeSys}
╰━━━━━━━━━━━━━━━━━━⬣

╭─❖ 𝐍𝐄𝐓𝐖𝐎𝐑𝐊.𝐏𝐈𝐍𝐆
│ ⨳ 𝐥𝐚𝐭𝐞𝐧𝐜𝐲  :: ${latency}ms  ${pingStatus}
│ ⨳ 𝐚𝐩𝐢     :: ${apiLatency}ms
│ ⨳ 𝐛𝐨𝐭     :: ${botLatency}ms
╰━━━━━━━━━━━━━━━━━━⬣

╭─❖ 𝐂𝐏𝐔.𝐌𝐀𝐓𝐑𝐈𝐗
│ ⨳ 𝐦𝐨𝐝𝐞𝐥 :: ${cpuModel}
│ ⨳ 𝐜𝐨𝐫𝐞𝐬 :: ${cpuCores}
│ ⨳ 𝐮𝐬𝐚𝐠𝐞 :: ${cpuUsage.toFixed(1)}%  ${cpuStatus}
│ ⨳ 𝐥𝐨𝐚𝐝  :: ${bar(cpuUsage)}
╰━━━━━━━━━━━━━━━━━━⬣

╭─❖ 𝐌𝐄𝐌𝐎𝐑𝐘.𝐍𝐂𝐋𝐀𝐒𝐒𝐄
│ ⨳ 𝐡𝐞𝐚𝐩 :: ${heap.toFixed(1)} MB
│ ⨳ 𝐫𝐬𝐬  :: ${rss.toFixed(1)} MB  ${memWarn}
╰━━━━━━━━━━━━━━━━━━⬣

╭─❖ 𝐌𝐄𝐌𝐎𝐑𝐘.𝐒𝐘𝐒𝐓𝐄𝐌
│ ⨳ 𝐮𝐬𝐚𝐠𝐞 :: ${usedRAM.toFixed(2)} / ${totalRAM.toFixed(2)} GB
│ ⨳ 𝐥𝐨𝐚𝐝  :: ${bar((usedRAM / totalRAM) * 100)}
╰━━━━━━━━━━━━━━━━━━⬣

╭─❖ 𝐍𝐄𝐓𝐖𝐎𝐑𝐊.𝐃𝐀𝐓𝐀
│ ⨳ 𝐮𝐬𝐞𝐫𝐬  :: ${allUsers.length}
│ ⨳ 𝐠𝐫𝐨𝐮𝐩𝐬 :: ${allThreads.length}
╰━━━━━━━━━━━━━━━━━━⬣

╭─❖ 𝐒𝐘𝐒𝐓𝐄𝐌.𝐈𝐍𝐅𝐎
│ ⨳ 𝐡𝐨𝐬𝐭 :: ${host}
│ ⨳ 𝐨𝐬   :: ${platform}
│ ⨳ 𝐚𝐫𝐜𝐡 :: ${arch}
│ ⨳ 𝐧𝐨𝐝𝐞 :: ${node}
╰━━━━━━━━━━━━━━━━━━⬣

╚═━━━❰❀ 𝐓𝐄𝐒𝐒𝐀  𝐁𝐎𝐓 ❀❱━━━═╝
`;

          api.editMessage(msg, info.messageID);

        }, 800);
      });

    } catch (err) {
      console.error(err);
      api.sendMessage(
        `❌ Error:\n${err.message}`,
        event.threadID,
        event.messageID
      );
    }
  }
};
