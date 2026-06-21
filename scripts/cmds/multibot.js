const { loadBox } = require("../../rakib/customId/ownBox");

// cache
const joinTime = {};
const lastMessage = {};
let multipleStatus = true;

module.exports = {
	config: {
		name: "multibot",
		version: "1.2",
		author: "Rakib",
		role: 2,
		category: "system",
		shortDescription: "Anti multiple bot system"
	},

	onStart: async function ({ message, args }) {

		if (args[0]?.toLowerCase() === "on") {
			multipleStatus = true;
			return message.reply("✅ Multiple Bot Protection Enabled");
		}

		if (args[0]?.toLowerCase() === "off") {
			multipleStatus = false;
			return message.reply("❌ Multiple Bot Protection Disabled");
		}

		return message.reply(
`📊 MULTIPLE BOT STATUS

Status: ${multipleStatus ? "✅ ENABLED" : "❌ DISABLED"}

Usage:
multiple on
multiple off`
		);
	},

	onChat: async function ({ api, event }) {

		if (!multipleStatus) return;

		const {
			threadID,
			senderID,
			logMessageType,
			logMessageData,
			body
		} = event;

		try {

			// User join track
			if (logMessageType === "log:subscribe") {
				const addedUsers = logMessageData?.addedParticipants || [];

				for (const user of addedUsers) {
					joinTime[user.userFbId] = Date.now();
				}
			}

			// Fast nickname change
			if (logMessageType === "log:user-nickname") {

				const uid = logMessageData?.participant_id;

				if (
					uid &&
					joinTime[uid] &&
					Date.now() - joinTime[uid] <= 10000
				) {
					await handleBotDetected({
						api,
						threadID,
						uid,
						reason: "nickname changed quickly after joining"
					});
				}
			}

			// Media + text
			if (
				event.attachments?.length > 0 &&
				body &&
				body.trim().length > 0
			) {
				await handleBotDetected({
					api,
					threadID,
					uid: senderID,
					reason: "media + text message"
				});
			}

			// Fast reply + mention
			if (body) {

				const now = Date.now();

				if (
					lastMessage[senderID] &&
					now - lastMessage[senderID] <= 1000 &&
					event.mentions &&
					Object.keys(event.mentions).length > 0
				) {
					await handleBotDetected({
						api,
						threadID,
						uid: senderID,
						reason: "fast mention reply"
					});
				}

				lastMessage[senderID] = now;
			}

		}
		catch (err) {
			console.log("[MULTIPLE BOT]", err);
		}
	}
};

async function handleBotDetected({
	api,
	threadID,
	uid,
	reason
}) {
	try {

		const threadInfo = await api.getThreadInfo(threadID);
		const botID = api.getCurrentUserID();

		const ADMIN_LOG_THREAD = await loadBox();

		const userName = await getUserName(api, uid);

		await api.sendMessage({
			body:
`⚠️ MULTIPLE BOT DETECTED

User: ${userName}
Reason: ${reason}

⏳ 20 সেকেন্ডের মধ্যে remove না করলে action নেওয়া হবে.`,
			mentions: [{
				id: uid,
				tag: userName
			}]
		}, threadID);

		setTimeout(async () => {
			try {

				const updatedInfo = await api.getThreadInfo(threadID);

				const stillExists =
					updatedInfo.participantIDs.includes(uid);

				if (!stillExists)
					return;

				const botIsAdmin =
					updatedInfo.adminIDs.some(
						item => item.id == botID
					);

				if (botIsAdmin) {

					await api.removeUserFromGroup(
						uid,
						threadID
					);

					await api.sendMessage(
						`✅ Removed: ${userName}`,
						threadID
					);

				}
				else {

					await api.sendMessage(
						"❌ Multiple bot detected, leaving group.",
						threadID
					);

					if (ADMIN_LOG_THREAD) {
						await api.sendMessage(
`⚠️ MULTIPLE BOT DETECTED

Group: ${updatedInfo.threadName}
ThreadID: ${threadID}`,
							ADMIN_LOG_THREAD
						);
					}

					await api.removeUserFromGroup(
						botID,
						threadID
					);

				}

			}
			catch (err) {
				console.log("[MULTIPLE BOT DELAY]", err);
			}
		}, 20000);

	}
	catch (err) {
		console.log("[MULTIPLE BOT HANDLER]", err);
	}
}

async function getUserName(api, uid) {
	try {
		const user = await api.getUserInfo(uid);
		return user[uid]?.name || "Unknown User";
	}
	catch {
		return "Unknown User";
	}
}
