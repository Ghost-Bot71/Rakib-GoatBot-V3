module.exports = {
	config: {
		name: "listbox",
		aliases: ["gclist"],
		author: "Rakib Islam",
		version: "2.0",
		cooldowns: 5,
		role: 2,
		shortDescription: {
			en: "List all group chats the bot is in."
		},
		longDescription: {
			en: "Use this command to list all group chats the bot is currently in."
		},
		category: "owner",
		guide: {
			en: "{p}{n} "
		}
	},
	onStart: async function ({ api, event }) {
		try {
			const groupList = await api.getThreadList(100, null, ['INBOX']);


			const filteredList = groupList.filter(group => group.threadName !== null);

			if (filteredList.length === 0) {

				await api.sendMessage('No group chats found.', event.threadID);
			} else {
				const formattedList = filteredList.map((group, index) =>
					`│${index + 1}. ${group.threadName}\n│𝚃𝙸𝙳: ${group.threadID}`
				);
				const message = `╭─────❃\n│𝗟𝗜𝗦𝗧 𝗢𝗙 𝗚𝗥𝗢𝗨𝗣 𝗖𝗛𝗔𝗧𝗦:\n${formattedList.map(line => `${line}`).join("\n")}\n╰────────────✦`;
				await api.sendMessage(message, event.threadID, event.messageID);
			}
		} catch (error) {
			console.error("Error listing group chats", error);
		}
	},
};
