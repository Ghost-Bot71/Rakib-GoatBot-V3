module.exports = {
	config: {
		name: "onjoin",
		version: "4.0",
		author: "Rakib",
		countDown: 5,
		role: 4,
		shortDescription: "Add owner to a group by TID",
		category: "admin",
		guide: {
			en: "{p}onjoin <threadID>"
		}
	},

	onStart: async function ({ api, event, args }) {
		const threadID = args[0];

		if (!threadID || isNaN(threadID)) {
			return api.sendMessage(
				"⚠️ Usage:\nonjoin <threadID>",
				event.threadID,
				event.messageID
			);
		}

		try {
			await api.addUserToGroup(String(event.senderID), String(threadID));

			return api.sendMessage(
				`✅ Successfully added you to the group\n\n🆔 ThreadID: ${threadID}`,
				event.threadID,
				event.messageID
			);

		} catch (error) {
			console.error("JOIN ERROR:", error);

			return api.sendMessage(
				"❌ Failed to add you to the group.\n\nPossible reasons:\n• Bot is not in that group\n• Invalid Thread ID\n• You are already in that group\n• You are not friend with the bot",
				event.threadID,
				event.messageID
			);
		}
	}
};
