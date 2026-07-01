module.exports = {
	config: {
		name: "mention",
		aliases: ["mens"],
		version: "1.1",
		author: "Rakib",
		countDown: 5,
		role: 0,
		shortDescription: {
			en: "Mention replied user or everyone"
		},
		longDescription: {
			en: "Reply to a user to mention them, or use 'mention everyone' to tag all members."
		},
		category: "utility",
		guide: {
			en: "{pn} (reply)\n{pn} everyone"
		}
	},

	onStart: async function ({ message, event, args, api, usersData }) {

		// Mention Everyone
		if (args[0] && args[0].toLowerCase() === "everyone") {
			try {
				const threadInfo = await api.getThreadInfo(event.threadID);

				const mentions = [];
				let body = "📢 @Everyone\n\n";

				for (const user of threadInfo.userInfo) {
					if (user.id == api.getCurrentUserID()) continue;

					mentions.push({
						id: user.id,
						tag: user.name
					});

					body += `@${user.name}\n`;
				}

				return message.reply({
					body,
					mentions
				});
			}
			catch (e) {
				return message.reply("❌ সবাইকে মেনশন করা যায়নি।");
			}
		}

		// Mention Reply User
		if (event.type === "message_reply") {
			const uid = event.messageReply.senderID;

			const userData = await usersData.get(uid);
			const name = userData?.name || event.messageReply.senderName || "User";

			return message.reply({
				body: `🎯 @${name}`,
				mentions: [{
					id: uid,
					tag: name
				}]
			});
		}

		return message.reply("❌ কারো মেসেজে রিপ্লাই দাও অথবা 'mention everyone' লিখো।");
	}
};
