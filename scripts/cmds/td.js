const axios = require("axios");

const TRUTH_URL = "https://raw.githubusercontent.com/bdrakib123/bot-api-base/main/games/truths.json";
const DARE_URL = "https://raw.githubusercontent.com/bdrakib123/bot-api-base/main/games/dares.json";

module.exports = {
	config: {
		name: "td",
		version: "1.0",
		author: "Rakib",
		countDown: 5,
		role: 0,
		shortDescription: {
			en: "Truth or Dare"
		},
		longDescription: {
			en: "Get random truth or dare questions"
		},
		category: "games",
		guide: {
			en: "{pn} t\n{pn} d"
		}
	},

	onStart: async function ({ message, args }) {
		if (!args[0]) {
			return message.reply(
				"🎲 | Usage:\n\n• td t → Truth\n• td d → Dare"
			);
		}

		try {
			const type = args[0].toLowerCase();

			if (type === "t") {
				const { data } = await axios.get(TRUTH_URL);

				const truths = Array.isArray(data)
					? data
					: data.truths || data.data || [];

				if (!truths.length)
					return message.reply("❌ | No truth questions found.");

				const truth =
					truths[Math.floor(Math.random() * truths.length)];

				return message.reply(
					`🤔 𝗧𝗥𝗨𝗧𝗛\n\n${typeof truth === "string" ? truth : truth.question || JSON.stringify(truth)}`
				);
			}

			if (type === "d") {
				const { data } = await axios.get(DARE_URL);

				const dares = Array.isArray(data)
					? data
					: data.dares || data.data || [];

				if (!dares.length)
					return message.reply("❌ | No dare questions found.");

				const dare =
					dares[Math.floor(Math.random() * dares.length)];

				return message.reply(
					`😈 𝗗𝗔𝗥𝗘\n\n${typeof dare === "string" ? dare : dare.question || JSON.stringify(dare)}`
				);
			}

			return message.reply(
				"❌ | Invalid option.\n\n• td t → Truth\n• td d → Dare"
			);
		}
		catch (error) {
			console.error(error);
			return message.reply(
				`❌ | Error:\n${error.message}`
			);
		}
	}
};
