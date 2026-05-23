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
      en: "Premium system stats"
    },
    longDescription: {
      en: "Real-time bot, CPU, RAM, latency with clean premium UI"
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
          let perCore = [];

          endSnap.forEach((core, i) => {
            const idleDiff = core.idle - startSnap[i].idle;
            const totalDiff = core.total - startSnap[i].total;
            const usage = 100 - (100 * idleDiff / totalDiff);
            totalUsage += usage;
            perCore.push(`C${i + 1}: ${usage.toFixed(0)}%`);
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

          const platform = os.platform();
          const node = process.version;

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
│ ⨳ bot    :: ${uptimeBot}
│ ⨳ system :: ${uptimeSys}
╰━━━━━━━━━━━━━━━━━━⬣

╭─❖ 𝐍𝐄𝐓𝐖𝐎𝐑𝐊.𝐏𝐈𝐍𝐆
│ ⨳ latency :: ${latency}ms  ${pingStatus}
│ ⨳ api     :: ${apiLatency}ms
│ ⨳ bot     :: ${botLatency}ms
╰━━━━━━━━━━━━━━━━━━⬣

╭─❖ 𝐂𝐏𝐔.𝐌𝐀𝐓𝐑𝐈𝐗
│ ⨳ model :: ${cpuModel}
│ ⨳ cores :: ${cpuCores}
│ ⨳ usage :: ${cpuUsage.toFixed(1)}%  ${cpuStatus}
│ ⨳ load  :: ${bar(cpuUsage)}

│ ⨳ cores →
│ ${perCore.join(" ⫶ ")}
╰━━━━━━━━━━━━━━━━━━⬣

╭─❖ 𝐌𝐄𝐌𝐎𝐑𝐘.𝐍𝐎𝐃𝐄
│ ⨳ heap :: ${heap.toFixed(1)} MB
│ ⨳ rss  :: ${rss.toFixed(1)} MB  ${memWarn}

╭─❖ 𝐌𝐄𝐌𝐎𝐑𝐘.𝐒𝐘𝐒𝐓𝐄𝐌
│ ⨳ usage :: ${usedRAM.toFixed(2)} / ${totalRAM.toFixed(2)} GB
│ ⨳ load  :: ${bar((usedRAM / totalRAM) * 100)}
╰━━━━━━━━━━━━━━━━━━⬣

╭─❖ 𝐍𝐄𝐓𝐖𝐎𝐑𝐊.𝐃𝐀𝐓𝐀
│ ⨳ users  :: ${allUsers.length}
│ ⨳ groups :: ${allThreads.length}
╰━━━━━━━━━━━━━━━━━━⬣

╭─❖ 𝐒𝐘𝐒𝐓𝐄𝐌.𝐈𝐍𝐅𝐎
│ ⨳ os   :: ${platform}
│ ⨳ node :: ${node}
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
