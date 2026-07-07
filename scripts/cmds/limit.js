module.exports = {
	config: {
		name: "limit",
		version: "1.0",
		author: "Rakib",
		role: 4,
		countDown: 5,
		shortDescription: "২০ মিনিটে কাস্টম কমান্ডের গ্রুপ-ভিত্তিক নিখুঁত লিমিট সিস্টেম",
		category: "System"
	},

	onLoad: function () {
		// রিস্টার্ট হলে গ্লোবাল অবজেক্ট ইনিশিয়ালাইজ করা হচ্ছে
		if (!global.__LIMIT_DATA__) {
			global.__LIMIT_DATA__ = {};
		}
		console.log(`[LIMIT] Group-wise System Initialized.`);
	},

	onStart: async function ({ api, event, args }) {
		const action = args[0]?.toLowerCase();
		const threadID = event.threadID; // বর্তমান গ্রুপের আইডি

		// গ্রুপ ডেটা যদি আগে থেকে না থাকে, তবে তৈরি করে নেবে
		if (!global.__LIMIT_DATA__[threadID]) {
			global.__LIMIT_DATA__[threadID] = {
				count: 0,
				startTime: Date.now(),
				maxLimit: 40,
				status: "on"
			};
		}

		const data = global.__LIMIT_DATA__[threadID];

		// প্রথমবার কমান্ড রান হলে বা রিস্টার্টের পর প্রথম মেসেজে হুকটি সেট হবে
		if (!global.__LIMIT_HOOK_INSTALLED__) {
			global.__LIMIT_HOOK_INSTALLED__ = true;
			const originalSendMessage = api.sendMessage;

			api.sendMessage = function (...args) {
				// আপনার দেওয়া টাইপ-চেকিং কন্ডিশন অনুযায়ী threadID বের করা হচ্ছে
				const msgThreadID = typeof args[1] === "string" 
					? args[1] 
					: args[1]?.threadID || args[0]?.threadID;

				if (!msgThreadID) {
					return originalSendMessage.apply(this, args);
				}

				// যদি ওই নির্দিষ্ট গ্রুপের কোনো ডেটা না থাকে, তবে তৈরি করবে
				if (!global.__LIMIT_DATA__[msgThreadID]) {
					global.__LIMIT_DATA__[msgThreadID] = {
						count: 0,
						startTime: Date.now(),
						maxLimit: 40,
						status: "on"
					};
				}

				const groupData = global.__LIMIT_DATA__[msgThreadID];

				// লিমিট অফ থাকলে স্বাভাবিকভাবে সব মেসেজ পাঠাবে
				if (groupData.status === "off") {
					return originalSendMessage.apply(this, args);
				}

				const currentTime = Date.now();
				const twentyMinutes = 20 * 60 * 1000; // ২০ মিনিট

				// ২০ মিনিট পার হলে কাউন্টার রিসেট হবে
				if (currentTime - groupData.startTime >= twentyMinutes) {
					groupData.startTime = currentTime;
					groupData.count = 0;
				}

				// সেট করা লিমিট শেষ হয়ে গেলে বট চুপ থাকবে
				if (groupData.count >= groupData.maxLimit) {
					const timeLeft = Math.ceil((twentyMinutes - (currentTime - groupData.startTime)) / 1000 / 60);
					console.log(`[LIMIT] Group [${msgThreadID}]: ${groupData.maxLimit}টি কমান্ডের সীমা শেষ। বট চুপ থাকবে আরও ${timeLeft} মিনিট।`);
					return; 
				}

				groupData.count++;
				return originalSendMessage.apply(this, args);
			};
		}

		// শুধু 'limit' কমান্ড দিলে বর্তমান স্ট্যাটাস ও লিমিট দেখাবে
		if (!action) {
			const statusDisplay = data.status === "on" ? "🟢 ON (সচল)" : "🔴 OFF (বন্ধ)";
			const twentyMinutes = 20 * 60 * 1000;
			const elapsed = Date.now() - data.startTime;
			const minutesElapsed = Math.floor(elapsed / 1000 / 60);
			
			let currentCount = data.count;
			if (elapsed >= twentyMinutes) {
				currentCount = 0;
			}

			return api.sendMessage(
`📊 [ Group Limit System Status ]

Status: ${statusDisplay}
Max Limit: ${data.maxLimit}টি (২০ মিনিটে)
Triggered: ${currentCount}/${data.maxLimit}
Time Elapsed: ${minutesElapsed} মিনিট

* লিমিট অন করতে: /limit on [সংখ্যা] (যেমন: /limit on 20)
* শুধু অন করতে (ডিফল্ট ৪০): /limit on
* লিমিট অফ করতে: /limit off`, 
				threadID, event.messageID
			);
		}

		// লিমিট অন এবং কাস্টম সংখ্যা সেট করার কমান্ড
		if (action === "on") {
			data.status = "on";
			data.count = 0; 
			data.startTime = Date.now();

			const customLimit = parseInt(args[1]);
			
			if (customLimit && !isNaN(customLimit) && customLimit > 0) {
				data.maxLimit = customLimit;
				return api.sendMessage(`✅ এই গ্রুপের জন্য Limit System চালু করা হয়েছে! এখন থেকে ২০ মিনিটে সর্বোচ্চ ${data.maxLimit}টি উত্তর দেওয়া হবে।`, threadID, event.messageID);
			} else {
				data.maxLimit = 40; // কোনো সংখ্যা না দিলে বা ভুল দিলে ডিফল্ট ৪০
				return api.sendMessage(`✅ এই গ্রুপের জন্য Limit System চালু করা হয়েছে! কোনো সংখ্যা উল্লেখ না করায় ডিফল্টভাবে ২০ মিনিটে সর্বোচ্চ ৪০টি উত্তর দেওয়া হবে।`, threadID, event.messageID);
			}
		}

		// লিমিট অফ করার কমান্ড
		if (action === "off") {
			data.status = "off";
			return api.sendMessage("❌ এই গ্রুপের জন্য Limit System বন্ধ করা হয়েছে! এখন বট আনলিমিটেড রিপ্লাই দেবে।", threadID, event.messageID);
		}

		return api.sendMessage("❌ ভুল কমান্ড! ব্যবহার করুন: /limit on [সংখ্যা], /limit off অথবা শুধু /limit", threadID, event.messageID);
	}
};
