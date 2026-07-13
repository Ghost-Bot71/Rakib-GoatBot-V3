const moment = require("moment-timezone");

module.exports = {
	config: {
		name: "gban",
		version: "2.0",
		author: "Rakib",
		role: 4,
		shortDescription: "Owner remote ban system",
		category: "owner"
	},

	onStart: async function ({ api, event, args, threadsData }) {
		const action = args[0];
		const uid = args[1];
		const tid = args[2];
		const reason = args.slice(3).join(" ") || "No reason";

		if (!action || !uid || !tid)
			return api.sendMessage(
				"⚠️ Usage:\n.gban <ban/unban> <uid> <tid> <reason>",
				event.threadID
			);

		const dataBanned = await threadsData.get(tid, "data.banned_ban", []);

		// =========================
		// 🔴 BAN
		// =========================
		if (action === "ban") {

			const exist = dataBanned.find(u => String(u.id) === String(uid));

			if (exist)
				return api.sendMessage("⚠️ User already banned", event.threadID);

			dataBanned.push({
				id: String(uid),
				time: moment().tz("Asia/Dhaka").format("HH:mm:ss DD/MM/YYYY"),
				reason
			});

			await threadsData.set(tid, dataBanned, "data.banned_ban");

			// remove safely
			try {
				await api.removeUserFromGroup(uid, tid);
			} catch (e) {
				console.error("Remove error:", e.message);
			}

			return api.sendMessage(
				`✅ Banned\nUID: ${uid}\nTID: ${tid}\nReason: ${reason}`,
				event.threadID
			);
		}

		// =========================
		// 🟢 UNBAN
		// =========================
		if (action === "unban") {

			const index = dataBanned.findIndex(u => String(u.id) === String(uid));

			if (index === -1)
				return api.sendMessage("⚠️ User not banned", event.threadID);

			dataBanned.splice(index, 1);

			await threadsData.set(tid, dataBanned, "data.banned_ban");

			return api.sendMessage(
				`✅ Unbanned\nUID: ${uid}\nTID: ${tid}`,
				event.threadID
			);
		}

		return api.sendMessage("⚠️ Action must be ban/unban", event.threadID);
	},

	// =========================
	// 🔄 AUTO KICK ON JOIN
	// =========================
	onEvent: async function ({ event, api, threadsData }) {

		if (event.logMessageType !== "log:subscribe")
			return;

		const threadID = event.threadID;

		const dataBanned = await threadsData.get(threadID, "data.banned_ban", []);

		const usersAdded = event.logMessageData.addedParticipants;

		for (const user of usersAdded) {

			const banned = dataBanned.find(
				u => String(u.id) === String(user.userFbId)
			);

			if (banned) {
				try {
					await api.removeUserFromGroup(user.userFbId, threadID);
				} catch (e) {
					console.error("Auto kick error:", e.message);
				}
			}
		}
	}
};
