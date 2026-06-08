const fs = require("fs");
const path = require("path");

module.exports = {
config: {
name: "approvedgc",
aliases: ["apg"],
version: "1.0",
author: "Rakib",
countDown: 5,
role: 2,
category: "owner",
shortDescription: {
en: "Manage approved groups"
},
longDescription: {
en: "Approve, remove and manage bot groups"
},
guide: {
en:
"{pn} {pn} list {pn} pending {pn} stats {pn} <threadID> {pn} del <threadID>"
}
},

onLoad: async function () {
	const cacheDir = path.join(__dirname, "cache");

	if (!fs.existsSync(cacheDir))
		fs.mkdirSync(cacheDir, { recursive: true });

	const approvedPath = path.join(cacheDir, "approvedThreads.json");
	const pendingPath = path.join(cacheDir, "pendingThreads.json");

	if (!fs.existsSync(approvedPath))
		fs.writeFileSync(approvedPath, JSON.stringify([], null, 2));

	if (!fs.existsSync(pendingPath))
		fs.writeFileSync(pendingPath, JSON.stringify([], null, 2));
},

onStart: async function ({ api, event, args }) {
	const { threadID, messageID } = event;

	const approvedPath = path.join(__dirname, "cache", "approvedThreads.json");
	const pendingPath = path.join(__dirname, "cache", "pendingThreads.json");

	let approved = [];
	let pending = [];

	try {
		approved = JSON.parse(fs.readFileSync(approvedPath));
		pending = JSON.parse(fs.readFileSync(pendingPath));
	}
	catch {
		approved = [];
		pending = [];
	}

	const saveData = () => {
		fs.writeFileSync(approvedPath, JSON.stringify(approved, null, 2));
		fs.writeFileSync(pendingPath, JSON.stringify(pending, null, 2));
	};

	const sub = (args[0] || "").toLowerCase();

	// ================= LIST =================
	if (sub === "list") {
		if (approved.length === 0)
			return api.sendMessage(
				"📭 | No approved groups found.",
				threadID,
				messageID
			);

		let msg = `╭───『 ✅ APPROVED GROUPS 』───⭓\n`;
		msg += `│ Total: ${approved.length}\n`;
		msg += `├──────────────────⭓\n`;

		let num = 1;

		for (const id of approved) {
			try {
				const info = await api.getThreadInfo(id);

				msg += `\n${num++}. ${info.threadName || info.name || "Unknown Group"}\n`;
				msg += `🆔 ${id}\n`;
				msg += `👥 ${info.participantIDs?.length || 0} Members\n`;
			}
			catch {
				msg += `\n${num++}. Unknown Group\n`;
				msg += `🆔 ${id}\n`;
			}
		}

		msg += `\n╰──────────────────⭓`;

		return api.sendMessage(msg, threadID, messageID);
	}

	// ================= PENDING =================
	if (sub === "pending") {
		if (pending.length === 0)
			return api.sendMessage(
				"✅ | No pending groups.",
				threadID,
				messageID
			);

		let msg = `╭───『 ⏳ PENDING GROUPS 』───⭓\n`;
		msg += `│ Total: ${pending.length}\n`;
		msg += `├──────────────────⭓\n`;

		let num = 1;

		for (const id of pending) {
			try {
				const info = await api.getThreadInfo(id);

				msg += `\n${num++}. ${info.threadName || info.name || "Unknown Group"}\n`;
				msg += `🆔 ${id}\n`;
				msg += `👥 ${info.participantIDs?.length || 0} Members\n`;
			}
			catch {
				msg += `\n${num++}. Unknown Group\n`;
				msg += `🆔 ${id}\n`;
			}
		}

		msg += `\n╰──────────────────⭓`;

		return api.sendMessage(msg, threadID, messageID);
	}

	// ================= STATS =================
	if (sub === "stats") {
		const totalGroups = approved.length + pending.length;

		return api.sendMessage(

"╭───『 📊 APPROVAL STATS 』───⭓ │ ✅ Approved : ${approved.length} │ ⏳ Pending  : ${pending.length} │ 📦 Total    : ${totalGroups} ╰──────────────────⭓",
threadID,
messageID
);
}

	// ================= DELETE =================
	if (sub === "del") {
		const idBox = args[1] || threadID;

		if (isNaN(idBox))
			return api.sendMessage(
				"❌ | Invalid thread ID.",
				threadID,
				messageID
			);

		if (!approved.includes(idBox))
			return api.sendMessage(
				"⚠️ | This group is not approved.",
				threadID,
				messageID
			);

		approved.splice(approved.indexOf(idBox), 1);

		if (!pending.includes(idBox))
			pending.push(idBox);

		saveData();

		return api.sendMessage(

"╭───『 ❌ APPROVAL REMOVED 』───⭓ │ Group ID: │ ${idBox} ├──────────────────⭓ │ Moved to pending list. ╰──────────────────⭓",
threadID,
messageID
);
}

	// ================= APPROVE =================
	const idBox = args[0] || threadID;

	if (isNaN(idBox))
		return api.sendMessage(
			"❌ | Invalid thread ID.",
			threadID,
			messageID
		);

	if (approved.includes(idBox))
		return api.sendMessage(
			`⚠️ | Group ${idBox} is already approved.`,
			threadID,
			messageID
		);

	api.sendMessage(

"╭───『 ✅ GROUP APPROVED 』───⭓ │ Your group has been approved. │ You can now use all commands. ╰──────────────────⭓",
idBox,
(err) => {
if (err)
return api.sendMessage(
"❌ | Failed. Make sure the bot is inside that group.",
threadID,
messageID
);

			approved.push(idBox);

			if (pending.includes(idBox))
				pending.splice(pending.indexOf(idBox), 1);

			saveData();

			api.sendMessage(

"╭───『 ✅ SUCCESS 』───⭓ │ Approved Group: │ ${idBox} ╰──────────────────⭓",
threadID,
messageID
);
}
);
}
};
