module.exports = {
	config: {
		name: "botoff",
		version: "1.0",
		author: "Rakib",
		role: 4,
		countDown: 5,
		shortDescription: "নির্দিষ্ট সময়ের জন্য বট অফ করে রাখা",
		category: "System"
	},

	// বট রিস্টার্ট বা স্টার্ট হলে হুকটি ব্যাকগ্রাউন্ডে সেট করার জন্য
	onLoad: function ({ api }) {
		if (global.__BOT_OFF_HOOK_INSTALLED__) return;

		global.__BOT_OFF_HOOK_INSTALLED__ = true;
		global.__BOT_MUTED_UNTIL__ = 0; // ডিফল্টভাবে কোনো মিউট টাইম থাকবে না

		const originalSendMessage = api.sendMessage;

		api.sendMessage = function (...args) {
			const currentTime = Date.now();

			// যদি বর্তমান সময় মিউট করে রাখা সময়ের চেয়ে কম হয়, তবে বট কোনো মেসেজ পাঠাবে না
			if (currentTime < global.__BOT_MUTED_UNTIL__) {
				const timeLeft = Math.ceil((global.__BOT_MUTED_UNTIL__ - currentTime) / 1000 / 60);
				console.log(`[BOT-OFF] বট বর্তমানে অফ আছে। আর ${timeLeft} মিনিট পর চালু হবে।`);
				return; // চুপ থাকবে
			}

			// স্বাভাবিক সময়ে মেসেজ পাঠানোর জন্য
			return originalSendMessage.apply(this, args);
		};

		console.log("[BOT-OFF] Bot Off System Activated!");
	},

	onStart: async function ({ message, args }) {
		const minutes = parseInt(args[0]);

		// যদি শুধু 'botoff' কমান্ড দেয় বা সংখ্যা না লেখে
		if (!minutes || isNaN(minutes) || minutes <= 0) {
			const currentTime = Date.now();
			if (currentTime < global.__BOT_MUTED_UNTIL__) {
				const timeLeft = Math.ceil((global.__BOT_MUTED_UNTIL__ - currentTime) / 1000 / 60);
				return message.reply(`🔴 বট বর্তমানে অফ আছে। আর ${timeLeft} মিনিট পর অটোমেটিক অন হবে।`);
			}
			return message.reply("❌ দয়া করে সঠিক সময় উল্লেখ করুন। উদাহরণ: /botoff 10 (১০ মিনিটের জন্য অফ করতে)");
		}

		// কত সময়ের জন্য অফ থাকবে তা মিলিসেকেন্ডে হিসাব করা
		const muteDuration = minutes * 60 * 1000;
		global.__BOT_MUTED_UNTIL__ = Date.now() + muteDuration;

		return message.reply(`🤫 বট সফলভাবে ${minutes} মিনিটের জন্য অফ করা হয়েছে! এই সময়ের মধ্যে বট কোনো কমান্ডের উত্তর দেবে না।`);
	}
};
