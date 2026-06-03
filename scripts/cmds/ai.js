const axios = require("axios");

module.exports = {
	config: {
		name: "ai",
		version: "1.0",
		author: "Rakib",
		countDown: 5,
		role: 0,
		shortDescription: "Generate AI Image",
		longDescription: "Generate image using Pollinations AI",
		category: "ai",
		guide: {
			en: "{pn} <prompt>"
		}
	},

	onStart: async function ({ message, args }) {
		try {
			const prompt = args.join(" ");

			if (!prompt)
				return message.reply("Please provide a prompt.");

			const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}`;

			const response = await axios.get(imageUrl, {
				responseType: "stream"
			});

			return message.reply({
				body: `🖼️ Generated Image\n📝 Prompt: ${prompt}`,
				attachment: response.data
			});

		} catch (err) {
			console.error(err);
			return message.reply("❌ Failed to generate image.");
		}
	}
};
