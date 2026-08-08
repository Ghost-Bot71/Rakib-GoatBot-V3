module.exports = {
  config: {
    name: "all",
    version: "2.0",
    author: "Rakib Islam",
    countDown: 5,
    role: 1,
    description: {
      en: "Tag all members in group with a message"
    },
    category: "box chat",
    guide: {
      en: "{pn} [message] — Tag everyone with your message"
    }
  },

  onStart: async function ({ message, event, args, api }) {
    const { participantIDs, threadID } = event;
    if (!participantIDs || participantIDs.length === 0) {
      return message.reply("❌ Group member list পাওয়া যায়নি।");
    }

    const text = args.join(" ").trim();
    const mentions = [];
    let body = "";

    const botID = api.getCurrentUserID();

    for (const uid of participantIDs) {
      if (uid === botID) continue;
      let name = `@${uid}`;
      try {
        const info = await api.getUserInfo(uid);
        name = `@${info[uid]?.name || uid}`;
      } catch {}
      const tag = name;
      body += tag + " ";
      mentions.push({ tag, id: uid });
    }

    if (text) {
      body = `📢 ${text}\n\n` + body;
    } else {
      body = `📢 সবার দৃষ্টি আকর্ষণ করা হচ্ছে!\n\n` + body;
    }

    message.reply({ body: body.trim(), mentions });
  }
};
