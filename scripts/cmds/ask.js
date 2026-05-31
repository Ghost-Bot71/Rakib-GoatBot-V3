const axios = require("axios");

module.exports = {
	config: {
		name: "ask",
		version: "1.0",
		author: "Rakib",
		countDown: 5,
		role: 0,
		shortDescription: "Ask AI",
		longDescription: "Chat with Gemini AI",
		category: "ai",
		guide: {
			en: "{pn} <question>"
		}
	},

	onStart: async function ({ message, args }) {
		const query = args.join(" ");

		if (!query) {
			return message.reply("❌ | Please enter a question.");
		}

		try {
			const wait = await message.reply("🔍 | Thinking...");

			const res = await axios.get(
				`https://rakib-api.vercel.app/api/gemini?query=${encodeURIComponent(query)}`
			);

			const reply =
				res.data.reply ||
				"No response received.";

			await message.unsend(wait.messageID);
			return message.reply(reply);

		} catch (err) {
			console.error(err);
			return message.reply("❌ | Failed to get response from AI.");
		}
	}
};
