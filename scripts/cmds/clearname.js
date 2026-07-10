module.exports = {
	config: {
		name: "clearname",
		version: "1.0",
		author: "Rakib",
		countDown: 5,
		role: 0,
		shortDescription: {
			en: "Clear nickname"
		},
		description: {
			en: "Remove nickname of yourself, mentioned or replied user"
		},
		category: "box chat"
	},

	onStart: async function ({ args, event, api, message }) {
		try {
			if (!event.isGroup)
				return message.reply("❌ এটা কোনো গ্রুপ চ্যাট না।");

			let uid;

			// 1️⃣ Reply দিলে
			if (event.messageReply) {
				uid = event.messageReply.senderID;
			}

			// 2️⃣ Mention দিলে
			else if (Object.keys(event.mentions).length > 0) {
				uid = Object.keys(event.mentions)[0];
			}

			// 3️⃣ না হলে নিজের
			else {
				uid = event.senderID;
			}

			// Nickname clear করার জন্য খালি স্ট্রিং "" পাঠাতে হয়
			await api.changeNickname("", event.threadID, uid);

			return message.reply("✅ Nickname সফলভাবে মুছে ফেলা হয়েছে!");
		}
		catch (e) {
			return message.reply("⚠️ Nickname মুছে ফেলা যায়নি!");
		}
	}
};
