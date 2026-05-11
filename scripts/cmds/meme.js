const axios = require("axios");

module.exports = {
	config: {
		name: "meme",
		version: "1.0",
		author: "Rakib Hasan",
		countDown: 5,
		role: 0,
		shortDescription: {
			en: "Send random meme"
		},
		longDescription: {
			en: "Send a random meme image from json"
		},
		category: "fun",
		guide: {
			en: "{pn}"
		}
	},

	onStart: async function ({ message }) {
		try {
			const jsonURL = "https://raw.githubusercontent.com/bdrakib123/bot-api-base/main/json/meme.json";

			const response = await axios.get(jsonURL);
			const memes = response.data;

			if (!Array.isArray(memes) || memes.length === 0)
				return message.reply("❌ Meme list is empty.");

			const randomMeme = memes[Math.floor(Math.random() * memes.length)];

			const img = (await axios.get(randomMeme, {
				responseType: "stream"
			})).data;

			await message.reply({
				body: "😂 Random Meme",
				attachment: img
			});
		}
		catch (err) {
			console.error(err);
			message.reply("❌ Failed to load meme.");
		}
	}
};
