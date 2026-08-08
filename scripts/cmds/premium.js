const { config } = global.GoatBot;
const { writeFileSync } = require("fs-extra");

module.exports = {
	config: {
		name: "premium",
		aliases: ["prem"],
		version: "1.2",
		author: "Rakib Islam",
		countDown: 5,
		role: 0,
		description: {
			en: "Premium user system"
		},
		category: "owner",
		guide: {
			en:
			"{pn} add <uid | @tag> [time]\n" +
			"{pn} remove <uid | @tag>\n" +
			"{pn} list\n" +
			"{pn} check <uid | @tag>\n\n" +
			"Time example: 1d / 2h / 30m / permanent"
		}
	},

	langs: {
		en: {
			added: "✓ | Added premium for %1 user(s):\n%2",
			removed: "✓ | Removed premium for %1 user(s):\n%2",
			alreadyPremium: "⚠ | Already premium:\n%1",
			notPremium: "⚠ | Not premium:\n%1",
			listPremium: "★ | Premium Users:\n%1",
			premiumInfo: "✓ | Premium info:\nName: %1\nStatus: %2\nExpire: %3",
			missingId: "⚠ | Enter uid or tag",
			adminOnly: "⚠ | Only bot admin can use this command",
			permanent: "Permanent",
			expired: "Expired"
		}
	},

	onStart: async function ({ message, args, usersData, event, getLang }) {

		if (!config.premiumUsers)
			config.premiumUsers = [];

		const isAdmin = config.adminBot.includes(event.senderID);

		const parseTime = (timeStr) => {
			if (!timeStr || timeStr === "permanent") return null;

			const match = timeStr.match(/^(\d+)([dhm])$/);
			if (!match) return false;

			const value = parseInt(match[1]);
			const unit = match[2];

			const time = {
				m: 60000,
				h: 3600000,
				d: 86400000
			};

			return Date.now() + (value * time[unit]);
		};

		const getTimeRemaining = (expire) => {
			if (!expire) return getLang("permanent");

			const remaining = expire - Date.now();

			if (remaining <= 0) return getLang("expired");

			const d = Math.floor(remaining / 86400000);
			const h = Math.floor((remaining % 86400000) / 3600000);
			const m = Math.floor((remaining % 3600000) / 60000);

			if (d > 0) return `${d}d ${h}h`;
			if (h > 0) return `${h}h ${m}m`;
			return `${m}m`;
		};

		switch (args[0]) {

			case "add":
			case "-a": {

				if (!isAdmin)
					return message.reply(getLang("adminOnly"));

				if (!args[1])
					return message.reply(getLang("missingId"));

				let uids = [];

				if (Object.keys(event.mentions).length > 0)
					uids = Object.keys(event.mentions);
				else if (event.messageReply)
					uids.push(event.messageReply.senderID);
				else
					uids = args.filter(x => !isNaN(x));

				const timeArg = args[args.length - 1];
				const expireTime = parseTime(timeArg);

				const added = [];
				const already = [];

				for (const uid of uids) {
					if (config.premiumUsers.includes(uid))
						already.push(uid);
					else {
						config.premiumUsers.push(uid);
						await usersData.set(uid, expireTime, "data.premiumExpireTime");
						added.push(uid);
					}
				}

				writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));

				const names = await Promise.all(
					added.map(uid => usersData.getName(uid).then(n => `• ${n} (${uid})`))
				);

				return message.reply(
					(added.length ? getLang("added", added.length, names.join("\n")) : "") +
					(already.length ? "\n" + getLang("alreadyPremium", already.join("\n")) : "")
				);
			}

			case "remove":
			case "-r": {

				if (!isAdmin)
					return message.reply(getLang("adminOnly"));

				if (!args[1])
					return message.reply(getLang("missingId"));

				let uids = [];

				if (Object.keys(event.mentions).length > 0)
					uids = Object.keys(event.mentions);
				else if (event.messageReply)
					uids.push(event.messageReply.senderID);
				else
					uids = args.filter(x => !isNaN(x));

				const removed = [];
				const notPrem = [];

				for (const uid of uids) {

					if (config.premiumUsers.includes(uid)) {

						config.premiumUsers.splice(config.premiumUsers.indexOf(uid), 1);
						await usersData.set(uid, null, "data.premiumExpireTime");

						removed.push(uid);
					}
					else
						notPrem.push(uid);
				}

				writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));

				const names = await Promise.all(
					removed.map(uid => usersData.getName(uid).then(n => `• ${n} (${uid})`))
				);

				return message.reply(
					(removed.length ? getLang("removed", removed.length, names.join("\n")) : "") +
					(notPrem.length ? "\n" + getLang("notPremium", notPrem.join("\n")) : "")
				);
			}

			case "list":
			case "-l": {

				if (config.premiumUsers.length === 0)
					return message.reply("No premium users");

				const list = await Promise.all(
					config.premiumUsers.map(async uid => {

						const name = await usersData.getName(uid);
						const expire = await usersData.get(uid, "data.premiumExpireTime");

						return `• ${name} (${uid}) - ${getTimeRemaining(expire)}`;
					})
				);

				return message.reply(getLang("listPremium", list.join("\n")));
			}

			case "check":
			case "-c": {

				let uid;

				if (Object.keys(event.mentions).length > 0)
					uid = Object.keys(event.mentions)[0];
				else if (event.messageReply)
					uid = event.messageReply.senderID;
				else if (args[1])
					uid = args[1];
				else
					uid = event.senderID;

				const name = await usersData.getName(uid);

				const isPrem = config.premiumUsers.includes(uid);

				const expire = await usersData.get(uid, "data.premiumExpireTime");

				const status = isPrem ? "Premium" : "Not Premium";

				const time = isPrem ? getTimeRemaining(expire) : "N/A";

				return message.reply(
					getLang("premiumInfo", name, status, time)
				);
			}

			default:
				return message.SyntaxError();
		}
	}
};
