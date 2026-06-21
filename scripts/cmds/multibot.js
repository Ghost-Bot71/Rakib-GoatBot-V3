const { loadBox } = require("../../rakib/customId/ownBox");

const nicknameCount = {};
const replyMentionCount = {};
const joinTime = {};
const replyCache = {};

let multipleStatus = true;

module.exports = {
config: {
name: "multibot",
version: "2.5",
author: "Rakib",
role: 2,
category: "system",
shortDescription: "Multiple bot detector with OwnBox log"
},

onStart: async function ({ message, args }) {

	const action = args[0]?.toLowerCase();

	if (action === "on") {
		multipleStatus = true;
		return message.reply("✅ MultiBot Protection Enabled");
	}

	if (action === "off") {
		multipleStatus = false;
		return message.reply("❌ MultiBot Protection Disabled");
	}

	return message.reply(
`📊 MULTIBOT STATUS

Status: ${multipleStatus ? "✅ ENABLED" : "❌ DISABLED"}

Rules:
• Join → Nickname change within 5s
• Reply → Same user mention within 2s

Warning = 3 detects`
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

		// Join Track
		if (logMessageType === "log:subscribe") {
			const users = logMessageData?.addedParticipants || [];
			for (const user of users) {
				joinTime[user.userFbId] = Date.now();
			}
		}

		// Nickname Change Detection
		if (logMessageType === "log:user-nickname") {
			const uid = logMessageData?.participant_id;

			if (
				uid &&
				joinTime[uid] &&
				Date.now() - joinTime[uid] <= 5000
			) {
				nicknameCount[uid] = (nicknameCount[uid] || 0) + 1;

				if (nicknameCount[uid] >= 3) {
					await handleDetected({
						api,
						threadID,
						uid,
						reason: "Nickname changed within 5 seconds",
						count: nicknameCount[uid]
					});
				}
			}
		}

		// Save Reply Info
		if (event.messageReply) {
			replyCache[senderID] = {
				target: event.messageReply.senderID,
				time: Date.now()
			};
		}

		// Reply -> Mention Detection
		if (
			body &&
			event.mentions &&
			Object.keys(event.mentions).length > 0 &&
			replyCache[senderID]
		) {
			const cache = replyCache[senderID];
			const diff = Date.now() - cache.time;

			if (diff <= 2000) {
				const mentionIDs = Object.keys(event.mentions);

				if (mentionIDs.includes(String(cache.target))) {
					replyMentionCount[senderID] = (replyMentionCount[senderID] || 0) + 1;

					if (replyMentionCount[senderID] >= 3) {
						await handleDetected({
							api,
							threadID,
							uid: senderID,
							reason: "Reply + Same User Mention within 2 seconds",
							count: replyMentionCount[senderID]
						});
					}
				}
			}
		}

	}
	catch (err) {
		console.log("[MULTIBOT ERROR]", err);
	}
}
};

async function handleDetected({ api, threadID, uid, reason, count }) {
	try {
		const info = await api.getUserInfo(uid);
		const name = info?.[uid]?.name || "Unknown User";
		
		// গ্রুপ বা চ্যাটবক্সে পাঠানোর মেসেজ ফরম্যাট
		const alertMessage = 
`⚠️ MULTIBOT WARNING

User: ${name}
UID: ${uid}

Reason:
${reason}

Detect Count: ${count}/3`;

		// ১. গ্রুপে ওয়ার্নিং মেসেজ পাঠানো হলো
		await api.sendMessage(alertMessage, threadID);

		// ২. OwnBox বা ওনার বক্সে ডিটেইলস পাঠানো হলো
		const boxId = loadBox(); 
		if (boxId) {
			// থ্রেড (গ্রুপ) এর নাম জানার চেষ্টা
			let threadName = "Unknown Group/Thread";
			try {
				const threadInfo = await api.getThreadInfo(threadID);
				threadName = threadInfo.threadName || `Thread ID: ${threadID}`;
			} catch(e) {
				threadName = `Thread ID: ${threadID}`;
			}

			const logMessage = 
`🔔 [MULTIBOT DETECTED LOG]

📍 Location: ${threadName}
👤 User: ${name} (${uid})
📝 Reason: ${reason}
📊 Count: ${count}/3
🕒 Time: ${new Date().toLocaleString('en-US', { timeZone: 'Asia/Dhaka' })}`

			await api.sendMessage(logMessage, boxId);
		}

	} catch (e) {
		console.log("[HANDLE DETECTED ERROR]", e);
	}
}
