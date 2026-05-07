const BOT_NAME = "❀❀❀☞ 𝐓𝐡𝐞 𝐑𝐨𝐛𝐨𝐭 𝐎𝐟 𝐓𝐞𝐬𝐬𝐚 𝐁𝐛𝐳 ☜❀❀❀";

module.exports = {
	config: {
		name: "botname",
		version: "1.0",
		author: "Rakib",
		role: 2,
		description: "Auto set bot nickname & protect it",
		category: "system"
	},

	onStart: async function () {},

	onEvent: async function ({ api, event, threadsData }) {
		const { threadID, logMessageType, logMessageData, author } = event;

		// bot uid
		const botID = api.getCurrentUserID();

		// ===== 1. Bot added in group =====
		if (logMessageType === "log:subscribe") {
			const added = logMessageData.addedParticipants;

			for (const user of added) {
				if (user.userFbId == botID) {
					try {
						await api.changeNickname(BOT_NAME, threadID, botID);
					} catch (e) {}
				}
			}
		}

		// ===== 2. Nickname change detect =====
		if (logMessageType === "log:user-nickname") {
			const { participant_id, nickname } = logMessageData;

			if (participant_id == botID) {
				try {
					const threadInfo = await api.getThreadInfo(threadID);

					// check admin
					const isAdmin = threadInfo.adminIDs.some(
						item => item.id == author
					);

					// যদি admin না হয় → আবার ঠিক করে দিবে
					if (!isAdmin && nickname !== BOT_NAME) {
						await api.changeNickname(BOT_NAME, threadID, botID);
					}
				} catch (e) {}
			}
		}

		// ===== 3. Daily check =====
		const lastCheck = await threadsData.get(threadID, "data.botNameCheck") || 0;
		const now = Date.now();

		// ২৪ ঘন্টা পর পর check
		if (now - lastCheck > 24 * 60 * 60 * 1000) {
			try {
				const threadInfo = await api.getThreadInfo(threadID);
				const botNick = threadInfo.nicknames[botID];

				if (botNick !== BOT_NAME) {
					await api.changeNickname(BOT_NAME, threadID, botID);
				}

				await threadsData.set(threadID, now, "data.botNameCheck");
			} catch (e) {}
		}
	}
};
