const { findUid } = global.utils;
const moment = require("moment-timezone");
const { loadOwner } = require(process.cwd() + "/rakib/customId/ownerUid.js");

module.exports = {
	config: {
		name: "ownban",
		version: "3.0",
		author: "NTKhang + Rakib Edit",
		countDown: 5,
		role: 0,
		description: "Ban user from box chat",
		category: "box chat"
	},

	onStart: async function ({ message, event, args, threadsData, usersData, api }) {

		const { senderID, threadID } = event;

		// 🔒 Owner Load
		const ownerUID = await loadOwner();
		const isOwner = Array.isArray(ownerUID)
			? ownerUID.includes(String(senderID))
			: String(senderID) === String(ownerUID);

		const threadData = await threadsData.get(threadID);
		const members = threadData.members || {};

		let target;
		let reason;

		let dataBanned = await threadsData.get(threadID, "data.banned_ban", []);

		// =========================
		// 🔓 UNBAN
		// =========================
		if (args[0] === "unban") {

			if (!isNaN(args[1]))
				target = args[1];
			else if (Object.keys(event.mentions || {}).length)
				target = Object.keys(event.mentions)[0];
			else if (event.messageReply?.senderID)
				target = event.messageReply.senderID;

			if (!target)
				return message.reply("⚠️ | User not found");

			const index = dataBanned.findIndex(i => String(i.id) === String(target));

			if (index === -1)
				return message.reply("⚠️ | User is not banned");

			dataBanned.splice(index, 1);

			await threadsData.set(threadID, dataBanned, "data.banned_ban");

			const name = await usersData.getName(target);

			return message.reply(`✅ | Unbanned ${name}`);
		}

		// =========================
		// 📑 LIST
		// =========================
		if (args[0] === "list") {

			if (!dataBanned.length)
				return message.reply("📑 | No banned users");

			let msg = "📑 Banned users:\n\n";

			for (const user of dataBanned) {

				const name = await usersData.getName(user.id);

				msg += `${name}\nUID: ${user.id}\nReason: ${user.reason}\nTime: ${user.time}\n\n`;
			}

			return message.reply(msg);
		}

		// =========================
		// 🎯 TARGET DETECT
		// =========================
		if (event.messageReply?.senderID) {
			target = event.messageReply.senderID;
			reason = args.join(" ");
		}

		else if (Object.keys(event.mentions || {}).length) {
			target = Object.keys(event.mentions)[0];
			reason = args.join(" ").replace(event.mentions[target], "");
		}

		else if (!isNaN(args[0])) {
			target = args[0];
			reason = args.slice(1).join(" ");
		}

		else if (args[0]?.startsWith("https")) {
			target = await findUid(args[0]);
			reason = args.slice(1).join(" ");
		}

		if (!target)
			return message.reply("⚠️ | User not found");

		// 🚫 SELF BAN (only owner allowed)
		if (String(target) === String(senderID) && !isOwner)
			return message.reply("⚠️ | You can't ban yourself!");

		// 🔁 EXIST CHECK
		const banned = dataBanned.find(i => String(i.id) === String(target));

		if (banned)
			return message.reply("❌ | User already banned");

		const name = members[target]?.name || await usersData.getName(target);

		const time = moment().tz("Asia/Dhaka").format("HH:mm:ss DD/MM/YYYY");

		dataBanned.push({
			id: String(target),
			time,
			reason: reason || "No reason"
		});

		await threadsData.set(threadID, dataBanned, "data.banned_ban");

		message.reply(`✅ | ${name} has been banned`);

		// 🚫 INSTANT KICK
		try {
			await api.removeUserFromGroup(target, threadID);
		} catch (e) {
			console.error("Kick error:", e.message);
		}
	},

	// =========================
	// 🔄 AUTO KICK ON REJOIN
	// =========================
	onEvent: async function ({ event, api, threadsData }) {

		if (event.logMessageType !== "log:subscribe")
			return;

		const threadID = event.threadID;

		const dataBanned = await threadsData.get(threadID, "data.banned_ban", []);

		const usersAdded = event.logMessageData.addedParticipants;

		for (const user of usersAdded) {

			const banned = dataBanned.find(
				i => String(i.id) === String(user.userFbId)
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
