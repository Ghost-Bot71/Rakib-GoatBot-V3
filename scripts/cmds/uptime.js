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
      en: "God level system monitor"
    }
  },

  onStart: async function ({ api, event, usersData, threadsData }) {
    try {

      const allUsers = await usersData.getAll();
      const allThreads = await threadsData.getAll();

      const formatTime = (sec) => {
        const d = Math.floor(sec / 86400);
        const h = Math.floor((sec % 86400) / 3600);
        const m = Math.floor((sec % 3600) / 60);
        const s = Math.floor(sec % 60);
        return `${d}d ${h}h ${m}m ${s}s`;
      };

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

      // STEP MESSAGE (animation feel)
      api.sendMessage("⚡ Initializing system scan...", event.threadID, (err, info) => {
        if (err) return;

        setTimeout(() => {
          api.editMessage("🧠 Scanning CPU cores...", info.messageID);
        }, 300);

        setTimeout(() => {
          api.editMessage("💾 Analyzing memory...", info.messageID);
        }, 700);

        setTimeout(() => {
          api.editMessage("📡 Measuring latency...", info.messageID);
        }, 1100);

        setTimeout(() => {

          const latency = Date.now() - startTime;

          const endSnap = snapshotCPU();

          // CPU TOTAL
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

          // MEMORY WARNING
          let memWarn = "🟢 Stable";
          if (rss > 300) memWarn = "🟡 High Usage";
          if (rss > 500) memWarn = "🔴 Possible Leak";

          // SYSTEM RAM
          const totalRAM = os.totalmem() / 1024 / 1024 / 1024;
          const usedRAM = totalRAM - (os.freemem() / 1024 / 1024 / 1024);

          // INFO
          const cpuModel = os.cpus()[0].model;
          const uptimeBot = formatTime(process.uptime());
          const uptimeSys = formatTime(os.uptime());

          const platform = os.platform();
          const node = process.version;

          // LATENCY SPLIT (approx)
          const apiLatency = Math.max(latency - 50, 0); // rough idea
          const botLatency = latency - apiLatency;

          // STATUS
          const cpuStatus =
            cpuUsage < 30 ? "🟢 Chill" :
            cpuUsage < 70 ? "🟡 Busy" :
            "🔴 Overload";

          const msg = `
╔════════════════════════╗
  🌸 BOT UPTIME AND DASHBOARD
╚════════════════════════╝

⏳ BOT: ${uptimeBot}
🖥️ SYS: ${uptimeSys}

━━━━━━━━━━━━━━━━━━━━

⚡ LATENCY ENGINE
Total: ${latency} ms
API: ${apiLatency} ms
Bot: ${botLatency} ms

━━━━━━━━━━━━━━━━━━━━

🧠 CPU MATRIX
${cpuModel}
Usage: ${cpuUsage.toFixed(1)}% ${cpuStatus}
[${bar(cpuUsage)}]

Per Core:
${perCore.join(" | ")}

━━━━━━━━━━━━━━━━━━━━

💾 MEMORY SYSTEM
Heap: ${heap.toFixed(1)} MB
RSS : ${rss.toFixed(1)} MB → ${memWarn}

System: ${usedRAM.toFixed(2)} / ${totalRAM.toFixed(2)} GB

━━━━━━━━━━━━━━━━━━━━

👥 USERS: ${allUsers.length}
👥 GROUPS: ${allThreads.length}

━━━━━━━━━━━━━━━━━━━━

🧬 SYSTEM
OS: ${platform}
Node: ${node}

╔════════════════════════╗
   ⚙️ POWERED BY HOON
╚════════════════════════╝`;

          api.editMessage(msg, info.messageID);

        }, 1500);
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
