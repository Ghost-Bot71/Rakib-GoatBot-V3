module.exports = {
	config: {
		name: "leaveall",
		author: "Rakib",
		version: "2.0",
		countDown: 10,
		role: 4,
		category: "Admin",
		shortDescription: {
			en: "leave all group (owner only)"
		}
	},

	onStart: async function ({ api, event }) {
		let list;

		try {
			list = await api.getThreadList(100, null, ["INBOX"]);
		} catch (err) {
			return api.sendMessage(
				"❌ Failed to fetch thread list!",
				event.threadID,
				event.messageID
			);
		}

		const botID = api.getCurrentUserID();
		let count = 0;

		const delay = ms => new Promise(r => setTimeout(r, ms));

		for (const item of list) {
			if (item.isGroup && item.threadID !== event.threadID) {
				try {
					await api.removeUserFromGroup(botID, item.threadID);
					count++;
					await delay(500);
				} catch (e) {
					console.error("Leave error:", e.message);
				}
			}
		}

		return api.sendMessage(
			`✅ বট সফলভাবে ${count} টি গ্রুপ থেকে লিভ করেছে।`,
			event.threadID,
			event.messageID
		);
	}
};
