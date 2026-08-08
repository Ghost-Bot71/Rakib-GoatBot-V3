// Fixed Join Command for GoatBot
// Author: Rakib Islam (ACS RAKIB)
// Fully Fixed: Dynamic GC Name Fetcher (No more undefined names)

const axios = require("axios");
const fs = require("fs-extra");
const request = require("request");

module.exports = {
	config: {
		name: "join",
		version: "2.5",
		author: "Rakib Islam",
		countDown: 5,
		role: 2, // শুধুমাত্র বটের ওনার বা মেইন এডমিন এটি ব্যবহার করতে পারবে
		shortDescription: "Join the group that bot is in",
		longDescription: "View list of groups bot is in and join them via reply",
		category: "owner",
		guide: {
			en: "{p}{n}",
		},
	},

	onStart: async function ({ api, event }) {
		try {
			// ইনবক্স থেকে বটের সর্বোচ্চ ২০টি মেসেজ থ্রেড বা চ্যাট হিস্ট্রি রিকোয়েস্ট করা হচ্ছে
			const groupList = await api.getThreadList(20, null, ['INBOX']);
			
			// শুধুমাত্র গ্রুপ চ্যাটগুলোকে ফিল্টার করে আলাদা করা হচ্ছে
			const filteredList = groupList.filter(group => group.isGroup === true || group.isSubscribed === true);

			if (filteredList.length === 0) {
				return api.sendMessage('No active group chats found.', event.threadID);
			}

			await api.sendMessage('⏳ গ্রুপ চ্যাটের নাম এবং ডিটেইলস লোড হচ্ছে, দয়া করে একটু অপেক্ষা করুন...', event.threadID);

			const formattedList = [];
			let index = 1;

			// প্রতিটি গ্রুপের রিয়েল নাম বের করার জন্য লুপ চালানো হচ্ছে
			for (const group of filteredList) {
				let gName = group.threadName;
				
				// যদি ফেসবুক এপিআই সরাসরি নাম না দিয়ে null বা undefined বা ফাঁকা পাঠায়
				if (!gName || gName === "null" || gName === "undefined" || gName.trim() === "") {
					try {
						// সরাসরি চ্যাটের আইডি দিয়ে সার্ভার থেকে রিয়েল-টাইম তথ্য আনা হচ্ছে
						const tInfo = await api.getThreadInfo(group.threadID);
						gName = tInfo.threadName || `Unnamed Group Chat (${group.threadID})`;
					} catch(e) {
						// কোনো কারণে এপিআই ফেইল করলে ব্যাকআপ নাম জেনারেট হবে
						gName = `Group Chat (${group.threadID})`;
					}
				}
				
				// লিস্টের ফরম্যাট সাজানো হচ্ছে
				formattedList.push(`│${index}. 👥 ${gName}\n│𝐓𝐈𝐃: ${group.threadID}\n│𝐓𝐨𝐭𝐚𝐥 𝐦𝐞𝐦𝐛𝐞𝐫𝐬: ${group.participantIDs ? group.participantIDs.length : 'Unknown'}\n│`);
				index++;
			}

			const message = `╭─╮\n│𝐋𝐢𝐬𝐭 𝐨𝐟 𝐠𝐫𝐨𝐮𝐩 𝐜𝐡𝐚𝐭𝐬:\n${formattedList.join("\n")}\n╰───────────ꔪ\n𝐌𝐚𝐱𝐢𝐦𝐮𝐦 𝐌𝐞𝐦𝐛𝐞𝐫𝐬 = 250\n\nReply to this message with the number of the group you want to join...`;

			const sentMessage = await api.sendMessage(message, event.threadID);
			
			// রিপ্লাই ট্র্যাক করার জন্য ডেটা সেভ করা হচ্ছে
			global.GoatBot.onReply.set(sentMessage.messageID, {
				commandName: 'join',
				messageID: sentMessage.messageID,
				author: event.senderID,
				groupsData: filteredList
			});
			
		} catch (error) {
			console.error("Error listing group chats", error);
			api.sendMessage('An error occurred while fetching group list. Check console.', event.threadID);
		}
	},

	onReply: async function ({ api, event, Reply, args }) {
		const { author, groupsData } = Reply;

		// যে ওনার কমান্ডটি স্টার্ট করেছে, সে ছাড়া অন্য কেউ রিপ্লাই দিলে কাজ করবে না
		if (event.senderID !== author) {
			return;
		}

		const groupIndex = parseInt(args[0], 10);

		// ইনপুট ভ্যালিডেশন বা নাম্বার চেক
		if (isNaN(groupIndex) || groupIndex <= 0 || groupIndex > groupsData.length) {
			api.sendMessage('Invalid group number.\nPlease choose a valid number from the list.', event.threadID, event.messageID);
			return;
		}

		try {
			const selectedGroup = groupsData[groupIndex - 1];
			const groupID = selectedGroup.threadID;

			const memberList = await api.getThreadInfo(groupID);
			
			// ওনার অলরেডি গ্রুপে আছে কি না তা চেক করা হচ্ছে
			if (memberList.participantIDs.includes(event.senderID)) {
				api.sendMessage(`Can't add you, you are already in that group chat!`, event.threadID, event.messageID);
				return;
			}

			// মেসেঞ্জারের ২৫০ জন মেম্বার লিমিট চেক
			if (memberList.participantIDs.length >= 250) {
				api.sendMessage(`Can't add you, the group chat is already full (250+ members).`, event.threadID, event.messageID);
				return;
			}

			const finalName = memberList.threadName || `Group ${groupID}`;

			// ওনারকে গ্রুপে অ্যাড করার মূল মেথড
			await api.addUserToGroup(event.senderID, groupID);
			api.sendMessage(`✅ Success! You have been added to the group chat:\n👉 ${finalName}`, event.threadID, event.messageID);
			
		} catch (error) {
			console.error("Error joining group chat", error);
			api.sendMessage('Failed to add you to the group. Make sure the bot is still in that group and has permission to add members.', event.threadID, event.messageID);
		} finally {
			// কাজ শেষ হওয়ার পর রিপ্লাই মেমোরি ক্লিয়ার করা হচ্ছে
			global.GoatBot.onReply.delete(event.messageID);
		}
	},
};
													  
