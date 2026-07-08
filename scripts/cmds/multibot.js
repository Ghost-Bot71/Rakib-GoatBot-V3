const { loadBox } = require("../../rakib/customId/ownBox");

const nicknameCount = {};
const replyMentionCount = {};
const joinTime = {};
const replyCache = {};
const editCount = {};
const editCache = {};

let multipleStatus = true;

module.exports = {
config: {
name: "multibot",
version: "1.0",
author: "Rakib",
role: 4,
category: "system",
shortDescription: "Multiple bot detector with OwnBox log and Auto-Kick"
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
• Join → Nickname change within 5s (3 detects)
• Reply → Same user mention within 2s (3 detects)
• Edit → Message edit within 2s (2 detects) ⚠️ Updated

Action: Auto-Kick`
);
},

onChat: async function ({ api, event }) {

	if (!multipleStatus) return;

	const {
		threadID,
		senderID,
		logMessageType,
		logMessageData,
		body,
		type 
	} = event;

	try {

		// 1. Join Track
		if (logMessageType === "log:subscribe") {
			const users = logMessageData?.addedParticipants || [];
			for (const user of users) {
				joinTime[user.userFbId] = Date.now();
			}
		}

		// 2. Nickname Change Detection
		if (logMessageType === "log:user-nickname") {
			const uid = logMessageData?.participant_id;

			if (
				uid &&
				joinTime[uid] &&
				Date.now() - joinTime[uid] <= 5000
			) {
				nicknameCount[uid] = (nicknameCount[uid] || 0) + 1;

				if (nicknameCount[uid] >= 3) {
					nicknameCount[uid] = 0; // রিসেট
					await handleDetected({
						api,
						threadID,
						uid,
						reason: "Nickname changed within 5 seconds",
						count: 3
					});
				}
			}
		}

		// 3. Reply -> Mention Detection
		if (event.messageReply) {
			const targetUser = event.messageReply.senderID;
			const mentions = event.mentions ? Object.keys(event.mentions) : [];

			if (mentions.includes(String(targetUser))) {
				const now = Date.now();
				
				if (replyCache[senderID] && (now - replyCache[senderID].time <= 2000)) {
					replyMentionCount[senderID] = (replyMentionCount[senderID] || 0) + 1;

					if (replyMentionCount[senderID] >= 3) {
						replyMentionCount[senderID] = 0; // রিসেট
						await handleDetected({
							api,
							threadID,
							uid: senderID,
							reason: "Spamming replies with mentions within 2 seconds",
							count: 3
						});
					}
				} else {
					replyMentionCount[senderID] = 1;
				}
				
				replyCache[senderID] = { time: now };
			}
		}

		// 4. Message Edit Detection (২ সেকেন্ডে ২ বার বা তার বেশি এডিট)
		if (type === "message_edit" || logMessageType === "log:message-edit") {
			const lastEditTime = editCache[senderID] || 0;
			const currentTime = Date.now();

			if (currentTime - lastEditTime <= 2000) {
				editCount[senderID] = (editCount[senderID] || 0) + 1;

				// ৩ এর জায়গায় ২ করে দেওয়া হয়েছে
				if (editCount[senderID] >= 2) {
					editCount[senderID] = 0; // রিসেট
					await handleDetected({
						api,
						threadID,
						uid: senderID,
						reason: "Message edited 2+ times within 2 seconds",
						count: 2
					});
				}
			} else {
				editCount[senderID] = 1;
			}
			
			editCache[senderID] = currentTime;
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
		
		const alertMessage = 
`⚠️ MULTIBOT DETECTED

User: ${name}
UID: ${uid}

Reason:
${reason}

Action: Removing from group...`;

		// গ্রুপে এলার্ট পাঠানো
		await api.sendMessage(alertMessage, threadID);

		// গ্রুপ থেকে কিক করা
		try {
			await api.removeUserFromGroup(uid, threadID);
		} catch (kickError) {
			console.log("[KICK ERROR] বোটের অ্যাডমিন পারমিশন নেই অথবা ওনারকে কিক দেওয়া সম্ভব নয়।");
		}

		// ওনার বক্সে লুপ আকারে নোটিফিকেশন পাঠানো
		const ownBox = await loadBox(); 
		if (ownBox && ownBox.length > 0) {
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
📊 Count: ${count} detects
🕒 Time: ${new Date().toLocaleString('en-US', { timeZone: 'Asia/Dhaka' })}`

			// ওনার বক্স লুপ প্যাথ
			for (const boxID of ownBox) {
				try {
					await api.sendMessage(logMessage, boxID);
				} catch (err) {
					console.log("[OWNBOX SEND ERROR]", boxID, err);
				}
			}
		}

	} catch (e) {
		console.log("[HANDLE DETECTED ERROR]", e);
	}
			}
