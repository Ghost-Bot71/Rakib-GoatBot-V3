const { loadOwner } = require("../../rakib/customId/ownerUid");

module.exports = {
	config: {
		name: "leaveall",
		author: "Rakib",
		version: "2.0",
		countDown: 10,
		role: 0,
		category: "Admin",
		shortDescription: {
			en: "leave all group (owner only)"
		}
	},

	onStart: async function ({ api, event }) {

		// 🔒 Owner Check (dynamic + safe)
		const ownerUID = await loadOwner();
		const isOwner = Array.isArray(ownerUID)
			? ownerUID.includes(String(event.senderID))
			: String(event.senderID) === String(ownerUID);

		if (!isOwner) {
			return api.sendMessage(
				"❌ এই কমান্ডটা শুধু বট ওনার ব্যবহার করতে পারবে।",
				event.threadID,
				event.messageID
			);
		}

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
