module.exports = {
	config: {
		name: "thdlist",
		aliases: ["threadlist"],
		version: "1.1",
		author: "Rakib",
		role: 2,
		category: "owner",
		shortDescription: {
			en: "Show all active thread list"
		}
	},

	onStart: async function ({ threadsData, message, role }) {
		if (role < 2)
			return message.reply("❌ You don't have permission");

		const allThreads = await threadsData.getAll();

		const activeThreads = allThreads.filter(thread =>
			thread.members?.some(m =>
				m.userID == global.GoatBot.botID && m.inGroup
			)
		);

		if (!activeThreads.length)
			return message.reply("❌ No active groups found.");

		let msg = `📋 Active Groups List (${activeThreads.length})\n\n`;

		activeThreads.forEach((thread, index) => {
			msg += `${index + 1}. ${thread.threadName || "Unnamed Group"}\n`;
		});

		message.reply(msg, (err, info) => {
			global.GoatBot.onReply.set(info.messageID, {
				commandName: "thdlist",
				messageID: info.messageID,
				author: message.senderID,
				threads: activeThreads
			});
		});
	},

	onReply: async function ({ message, Reply }) {
		if (message.senderID != Reply.author) return;

		const num = parseInt(message.body);
		if (isNaN(num) || num < 1 || num > Reply.threads.length)
			return;

		const tid = Reply.threads[num - 1].threadID;

		return message.reply(`${tid}`);
	}
};
