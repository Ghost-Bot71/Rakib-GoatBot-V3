module.exports = {
	config: {
		name: "setname",
		version: "1.0",
		author: "Rakib",
		countDown: 5,
		role: 0,
		shortDescription: {
			en: "Set nickname"
		},
		description: {
			en: "Change nickname of yourself, mentioned or replied user"
		},
		category: "box chat"
	},

	onStart: async function ({ args, event, api, message }) {
		try {
			if (!event.isGroup)
				return message.reply("❌ এটা কোনো গ্রুপ চ্যাট না।");

			let uid;
			let nickname;

			// 1️⃣ Reply দিলে
			if (event.messageReply) {
				uid = event.messageReply.senderID;
				nickname = args.join(" ").trim();
			}

			// 2️⃣ Mention দিলে
			else if (Object.keys(event.mentions).length > 0) {
				uid = Object.keys(event.mentions)[0];

				const mentionName = event.mentions[uid];
				nickname = args.join(" ").replace(mentionName, "").trim();
			}

			// 3️⃣ না হলে নিজের
			else {
				uid = event.senderID;
				nickname = args.join(" ").trim();
			}

			if (!nickname)
				return message.reply(
					"⚠️ একটি nickname দিন।\nউদাহরণ:\nsetname Rakib\nsetname @user Boss"
				);

			await api.changeNickname(nickname, event.threadID, uid);

			return message.reply(`✅ Nickname সেট করা হয়েছে:\n${nickname}`);
		}
		catch (e) {
			return message.reply("⚠️ Nickname পরিবর্তন করা যায়নি!");
		}
	}
};
