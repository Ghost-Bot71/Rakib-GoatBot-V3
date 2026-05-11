const mongoose = require("mongoose");
const os = require("os");

const HEARTBEAT_INTERVAL = 30000; // 30 sec
const TIMEOUT_LIMIT = 45000; // 45 sec

const myInstanceId = `${os.hostname()}-${process.pid}`;

const instanceSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: "main"
  },
  activeInstanceId: String,
  updatedAt: Date
});

const Instance =
  mongoose.models.instancelock ||
  mongoose.model("instancelock", instanceSchema);

module.exports = {
  config: {
    name: "autolock",
    version: "1.0",
    author: "Rakib",
    countDown: 5,
    role: 2,

    shortDescription: {
      en: "Prevent duplicate bot instances"
    },

    description: {
      en: "Keeps only one bot instance active"
    },

    category: "system",

    guide: {
      en: "Auto runs on load"
    }
  },

  onStart: async function () {
    try {
      const now = new Date();

      // Atomic lock system
      const lock = await Instance.findOneAndUpdate(
        {
          _id: "main",
          $or: [
            {
              updatedAt: {
                $lt: new Date(Date.now() - TIMEOUT_LIMIT)
              }
            },
            {
              activeInstanceId: myInstanceId
            },
            {
              activeInstanceId: {
                $exists: false
              }
            }
          ]
        },
        {
          activeInstanceId: myInstanceId,
          updatedAt: now
        },
        {
          upsert: true,
          new: true
        }
      );

      // If another instance is active
      if (lock.activeInstanceId !== myInstanceId) {
        console.log(
          `🛑 Another active instance detected (${lock.activeInstanceId})`
        );

        return process.exit(0);
      }

      console.log(`✅ Active instance: ${myInstanceId}`);

      // Heartbeat
      setInterval(async () => {
        try {
          await Instance.updateOne(
            {
              _id: "main",
              activeInstanceId: myInstanceId
            },
            {
              updatedAt: new Date()
            }
          );
        } catch (err) {
          console.error("❌ Heartbeat failed:", err.message);
        }
      }, HEARTBEAT_INTERVAL);

      // Cleanup on exit
      const cleanup = async () => {
        try {
          await Instance.deleteOne({
            _id: "main",
            activeInstanceId: myInstanceId
          });

          console.log("🗑️ Instance lock removed");
        } catch (e) {}

        process.exit(0);
      };

      process.on("SIGINT", cleanup);
      process.on("SIGTERM", cleanup);

    } catch (err) {
      console.error("❌ AutoLock Error:", err);
      process.exit(1);
    }
  }
};
