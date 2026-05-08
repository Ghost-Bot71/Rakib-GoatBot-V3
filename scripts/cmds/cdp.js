const axios = require("axios");

module.exports = {
	config: {
		name: "cdps",
		aliases: ["coupledp"],
		version: "1.0",
		author: "Rakib Hasan",
		countDown: 5,
		role: 0,
		shortDescription: {
			en: "Send random couple dp"
		},
		longDescription: {
			en: "Send random couple dp pair"
		},
		category: "image",
		guide: {
			en: "{pn}"
		}
	},

	onStart: async function ({ message }) {
		try {
			const jsonURL = "https://raw.githubusercontent.com/bdrakib123/bot-api-base/main/cdp.json";

			const res = await axios.get(jsonURL);
			const data = res.data;

			if (!Array.isArray(data) || data.length === 0)
				return message.reply("❌ No data found in JSON.");

			const randomPair = data[Math.floor(Math.random() * data.length)];

			const attachments = await Promise.all([
				global.utils.getStreamFromURL(randomPair.img1),
				global.utils.getStreamFromURL(randomPair.img2)
			]);

			await message.reply({
				body: `💞 Couple DP #${randomPair.id}`,
				attachment: attachments
			});
		}
		catch (err) {
			console.log(err);
			message.reply("❌ Failed to fetch couple dp.");
		}
	}
};
