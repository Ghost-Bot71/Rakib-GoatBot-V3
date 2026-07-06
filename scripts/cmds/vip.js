module.exports = {
	config: {
		name: "vip",
		version: "1.0",
		author: "Rakib",
		role: 2,
		category: "config",
		shortDescription: "Temporary VIP manager",
		guide: {
			en: "{pn} add <uid>\n{pn} rm <uid>\n{pn} list"
		}
	},

	onStart: async function ({ args, message, usersData }) {
		if (!global.GoatBot.config.premiumUsers)
			global.GoatBot.config.premiumUsers = [];

		const vip = global.GoatBot.config.premiumUsers;

		switch ((args[0] || "").toLowerCase()) {

			case "add": {
				const uid = args[1];
				if (!uid)
					return message.reply("⚠️ | Please provide a UID.");

				if (vip.includes(uid))
					return message.reply("✅ | This user is already VIP.");

				vip.push(uid);

				let name = uid;
				try {
					const user = await usersData.get(uid);
					if (user?.name)
						name = user.name;
				} catch {}

				return message.reply(
`👑 VIP Added

Name: ${name}
UID: ${uid}

⚠️ Temporary VIP only.
It will reset after bot restart.`
				);
			}

			case "rm":
			case "remove": {
				const uid = args[1];
				if (!uid)
					return message.reply("⚠️ | Please provide a UID.");

				const index = vip.indexOf(uid);

				if (index === -1)
					return message.reply("❌ | User is not in VIP list.");

				vip.splice(index, 1);

				let name = uid;
				try {
					const user = await usersData.get(uid);
					if (user?.name)
						name = user.name;
				} catch {}

				return message.reply(
`✅ VIP Removed

Name: ${name}
UID: ${uid}`
				);
			}

			case "list": {
				if (!vip.length)
					return message.reply("📭 VIP list is empty.");

				let text = "👑 Temporary VIP Users\n\n";

				for (let i = 0; i < vip.length; i++) {
					let name = vip[i];
					try {
						const user = await usersData.get(vip[i]);
						if (user?.name)
							name = user.name;
					} catch {}

					text += `${i + 1}. ${name}\n${vip[i]}\n\n`;
				}

				text += "⚠️ These VIPs will be removed after bot restart.";

				return message.reply(text);
			}

			default:
				return message.reply(
`👑 VIP Manager

${global.GoatBot.config.prefix}vip add <uid>
${global.GoatBot.config.prefix}vip rm <uid>
${global.GoatBot.config.prefix}vip list`
				);
		}
	}
};
