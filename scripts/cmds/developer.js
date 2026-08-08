const { config } = global.GoatBot;
const { writeFileSync } = require("fs-extra");

module.exports = {
	config: {
		name: "developer",
		aliases: ["dev"],
		version: "1.1",
		author: "Rakib Islam",
		countDown: 5,
		role: 0,
		description: {
			en: "Add, remove, list developer role"
		},
		category: "owner",
		guide: {
			en:
			"{pn} add <uid | @tag>\n" +
			"{pn} remove <uid | @tag>\n" +
			"{pn} list"
		}
	},

	langs: {
		en: {
			added: "✓ | Added developer for %1 user(s):\n%2",
			alreadyDev: "⚠ | Already developer:\n%1",
			missingIdAdd: "⚠ | Enter UID or tag to add developer",
			removed: "✓ | Removed developer for %1 user(s):\n%2",
			notDev: "⚠ | Not developer:\n%1",
			missingIdRemove: "⚠ | Enter UID or tag to remove developer",
			listDev: "⚙ | Developers List:\n%1",
			adminOnly: "⚠ | Only bot admin can use this command"
		}
	},

	onStart: async function ({ message, args, usersData, event, getLang }) {

		if (!config.devUsers)
			config.devUsers = [];

		const isAdmin = config.adminBot.includes(event.senderID);

		switch (args[0]) {

			case "add":
			case "-a": {

				if (!isAdmin)
					return message.reply(getLang("adminOnly"));

				if (!args[1])
					return message.reply(getLang("missingIdAdd"));

				let uids = [];

				if (Object.keys(event.mentions).length > 0)
					uids = Object.keys(event.mentions);
				else if (event.messageReply)
					uids.push(event.messageReply.senderID);
				else
					uids = args.filter(arg => !isNaN(arg));

				const added = [];
				const already = [];

				for (const uid of uids) {
					if (config.devUsers.includes(uid))
						already.push(uid);
					else {
						config.devUsers.push(uid);
						added.push(uid);
					}
				}

				writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));

				const names = await Promise.all(
					added.map(uid => usersData.getName(uid).then(n => `• ${n} (${uid})`))
				);

				return message.reply(
					(added.length ? getLang("added", added.length, names.join("\n")) : "") +
					(already.length ? "\n" + getLang("alreadyDev", already.join("\n")) : "")
				);
			}

			case "remove":
			case "-r": {

				if (!isAdmin)
					return message.reply(getLang("adminOnly"));

				if (!args[1])
					return message.reply(getLang("missingIdRemove"));

				let uids = [];

				if (Object.keys(event.mentions).length > 0)
					uids = Object.keys(event.mentions);
				else if (event.messageReply)
					uids.push(event.messageReply.senderID);
				else
					uids = args.filter(arg => !isNaN(arg));

				const removed = [];
				const notDev = [];

				for (const uid of uids) {
					if (config.devUsers.includes(uid)) {
						config.devUsers.splice(config.devUsers.indexOf(uid), 1);
						removed.push(uid);
					} else {
						notDev.push(uid);
					}
				}

				writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));

				const names = await Promise.all(
					removed.map(uid => usersData.getName(uid).then(n => `• ${n} (${uid})`))
				);

				return message.reply(
					(removed.length ? getLang("removed", removed.length, names.join("\n")) : "") +
					(notDev.length ? "\n" + getLang("notDev", notDev.join("\n")) : "")
				);
			}

			case "list":
			case "-l": {

				if (!config.devUsers.length)
					return message.reply("No developers");

				const list = await Promise.all(
					config.devUsers.map(uid =>
						usersData.getName(uid).then(name => `• ${name} (${uid})`)
					)
				);

				return message.reply(getLang("listDev", list.join("\n")));
			}

			default:
				return message.SyntaxError();
		}
	}
};
