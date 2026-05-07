module.exports = {
  config: {
    name: "antiout",
    version: "2.0",
    author: "Rakib",
    countDown: 5,
    role: 0,
    shortDescription: "Enable or disable antiout",
    longDescription: "Auto add user if they leave by themselves",
    category: "boxchat",
    guide: "{pn} {{[on | off]}}",
    envConfig: {
      deltaNext: 5
    }
  },

  onStart: async function ({ message, event, threadsData, args }) {
    let antiout = await threadsData.get(event.threadID, "settings.antiout");

    if (antiout === undefined) {
      await threadsData.set(event.threadID, true, "settings.antiout");
      antiout = true;
    }

    if (!["on", "off"].includes(args[0])) {
      return message.reply("Please use 'on' or 'off'");
    }

    await threadsData.set(event.threadID, args[0] === "on", "settings.antiout");

    return message.reply(
      `Antiout ${args[0] === "on" ? "enabled ✅" : "disabled ❌"}`
    );
  },

  onEvent: async function ({ api, event, threadsData }) {
    const antiout = await threadsData.get(event.threadID, "settings.antiout");

    if (!antiout) return;

    if (event.logMessageType !== "log:unsubscribe") return;

    const leftUser = event.logMessageData.leftParticipantFbId;
    const author = event.author;

    // ✅ Only re-add if user left by themselves
    if (leftUser == author) {
      try {
        await api.addUserToGroup(leftUser, event.threadID);
        console.log(`User ${leftUser} re-added (self leave)`);
      } catch (err) {
        console.log(`Failed to re-add ${leftUser}`, err);
      }
    } else {
      // ❌ If kicked, do nothing
      console.log(`User ${leftUser} was kicked, not re-adding.`);
    }
  }
};
