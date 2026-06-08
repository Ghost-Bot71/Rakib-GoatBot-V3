const fs = require("fs");
const path = require("path");

const folderPath = path.join(__dirname, "assist_json");
const approvedPath = path.join(folderPath, "approved_main.json");
const pendingPath = path.join(folderPath, "pending_main.json");

// Auto Create Folder & JSON Files
if (!fs.existsSync(folderPath))
	fs.mkdirSync(folderPath, { recursive: true });

if (!fs.existsSync(approvedPath))
	fs.writeFileSync(approvedPath, JSON.stringify([], null, 2));

if (!fs.existsSync(pendingPath))
	fs.writeFileSync(pendingPath, JSON.stringify([], null, 2));

function readJSON(file) {
	try {
		return JSON.parse(fs.readFileSync(file, "utf8"));
	}
	catch {
		return [];
	}
}

function writeJSON(file, data) {
	fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf8");
}

module.exports = {
	config: {
		name: "main",
		version: "1.0",
		author: "Rakib",
		countDown: 5,
		category: "admin",
		role: 2
	},

	onStart: async function ({ api, args, message, event }) {
		const threadID = String(event.threadID);

		const approvedIDsPath = approvedPath;
		const pendingIDsPath = pendingPath;

		let approvedIDs = readJSON(approvedIDsPath);
		let pendingIDs = readJSON(pendingIDsPath);

		// APPROVE
		if (args[0] === "approve" && args[1]) {
			const id = String(args[1]);
			const adminMsg = args.slice(2).join(" ") || "No message from admin.";

			if (approvedIDs.includes(id))
				return message.reply(
					"╔════ஜ۩۞۩ஜ════╗\n\n✅ This thread is already approved.\n\n╚════ஜ۩۞۩ஜ════╝"
				);

			approvedIDs.push(id);
			writeJSON(approvedIDsPath, approvedIDs);

			pendingIDs = pendingIDs.filter(x => x !== id);
			writeJSON(pendingIDsPath, pendingIDs);

			try {
				api.sendMessage(
`╔════ஜ۩۞۩ஜ════╗

📌 REQUEST APPROVED

Main Commands Unlocked

Your request has been approved by Bot Admin.

All locked commands are now available.

💬 Message:
${adminMsg}

╚════ஜ۩۞۩ஜ════╝`,
					id
				);
			}
			catch (e) {}

			return message.reply(
				`✅ Successfully approved thread:\n${id}`
			);
		}

		// REMOVE
		else if (args[0] === "remove" && args[1]) {
			const id = String(args[1]);
			const reason =
				args.slice(2).join(" ") || "No reason provided.";

			if (!approvedIDs.includes(id))
				return message.reply(
					"❌ This thread is not approved."
				);

			approvedIDs = approvedIDs.filter(x => x !== id);
			writeJSON(approvedIDsPath, approvedIDs);

			try {
				api.sendMessage(
`⚠️ MAIN ACCESS REMOVED

Your thread has been removed from the approved list.

Reason:
${reason}`,
					id
				);
			}
			catch (e) {}

			return message.reply(
				`✅ Removed thread:\n${id}`
			);
		}

		// DISAPPROVED
		else if (
			args[0] === "disapproved" &&
			args[1]
		) {
			const id = String(args[1]);
			const reason =
				args.slice(2).join(" ") || "No reason provided.";

			if (!pendingIDs.includes(id))
				return message.reply(
					"❌ This thread is not in pending list."
				);

			pendingIDs = pendingIDs.filter(x => x !== id);
			writeJSON(pendingIDsPath, pendingIDs);

			try {
				api.sendMessage(
`⚠️ REQUEST REJECTED

Your request to use Main Commands has been rejected.

Reason:
${reason}`,
					id
				);
			}
			catch (e) {}

			return message.reply(
				`✅ Disapproved thread:\n${id}`
			);
		}

		// CHECK
		else if (args[0] === "check") {
			if (approvedIDs.includes(threadID))
				return message.reply(
					"✅ Main Commands are ENABLED in this thread."
				);

			return message.reply(
				"❌ Main Commands are DISABLED in this thread."
			);
		}

		// LIST
		else if (args[0] === "list") {
			if (approvedIDs.length === 0)
				return message.reply(
					"❌ No approved threads found."
				);

			let msg =
				"╔════ APPROVED THREADS ════╗\n\n";

			approvedIDs.forEach((id, i) => {
				msg += `${i + 1}. ${id}\n`;
			});

			msg += `\n╚════ Total: ${approvedIDs.length} ════╝`;

			return message.reply(msg);
		}

		// PENDING
		else if (args[0] === "pending") {
			if (pendingIDs.length === 0)
				return message.reply(
					"❌ No pending threads found."
				);

			let msg =
				"╔════ PENDING THREADS ════╗\n\n";

			pendingIDs.forEach((id, i) => {
				msg += `${i + 1}. ${id}\n`;
			});

			msg += `\n╚════ Total: ${pendingIDs.length} ════╝`;

			return message.reply(msg);
		}

		// STATS
		else if (args[0] === "stats") {
			return message.reply(
`╔════ MAIN SYSTEM ════╗

✅ Approved : ${approvedIDs.length}
⏳ Pending  : ${pendingIDs.length}
📊 Total    : ${approvedIDs.length + pendingIDs.length}

╚════════════════════╝`
			);
		}

		// HELP
		else {
			return message.reply(
`╔════ MAIN COMMANDS ════╗

main approve <tid> [msg]
main remove <tid> [reason]
main disapproved <tid> [reason]

main check
main list
main pending
main stats

╚════════════════════╝`
			);
		}
	}
};
