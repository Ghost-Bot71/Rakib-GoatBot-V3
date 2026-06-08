module.exports = {
config: {
name: "count",
aliases: ["c"],
version: "2.0",
author: "NTKhang & Rakib",
countDown: 5,
role: 0,
description: {
vi: "Xem số lượng tin nhắn của tất cả thành viên hoặc bản thân",
en: "View the number of messages of all members or yourself"
},
category: "box chat",
guide: {
vi: "   {pn}: dùng để xem số lượng tin nhắn của bạn"
+ "\n   {pn} @tag: dùng để xem số lượng tin nhắn của những người được tag"
+ "\n   {pn} reply: reply to someone's message to view their count"
+ "\n   {pn} [số]: xem thông tin của người đứng hạng đó (ví dụ: {pn} 1)"
+ "\n   {pn} all: dùng để xem số lượng tin nhắn của tất cả thành viên",
en: "   {pn}: used to view your message count"
+ "\n   {pn} @tag: used to view message count of tagged users"
+ "\n   {pn} reply: reply to someone's message to view their count"
+ "\n   {pn} [number]: view stats of a specific rank (e.g., {pn} 1)"
+ "\n   {pn} all: used to view message count of all members"
}
},

langs: {  
	endMessage: "\n💡 𝐌e𝐦𝐛𝐞𝐫𝐬 𝐧𝐨𝐭 𝐨𝐧 𝐭𝐡𝐞 𝐥𝐢𝐬𝐭 𝐡𝐚𝐯𝐞𝐧'𝐭 𝐬𝐞𝐧𝐭 𝐚𝐧𝐲 𝐦𝐞𝐬𝐬𝐚𝐠𝐞𝐬 𝐲𝐞𝐭.",  
	page: "\n📖 𝐏𝐚𝐠𝐞 [%1/%2]",  
	reply: "💬 𝐑𝐞𝐩𝐥𝐲 𝐭𝐨 𝐭𝐡𝐢𝐬 𝐦𝐞𝐬𝐬𝐚𝐠𝐞 𝐰𝐢𝐭𝐡 𝐚 𝐩𝐚𝐠𝐞 𝐧𝐮𝐦𝐛𝐞𝐫 𝐭𝐨 𝐯𝐢𝐞𝐰 𝐦𝐨𝐫𝐞",  
	result: "👤 %1 \n  ↳ 🏅 𝐑𝐚𝐧𝐤: %2 | 💬 𝐌𝐞𝐬𝐬𝐚𝐠𝐞𝐬: %3",  
	invalidPage: "❌ 𝐈𝐧𝐯𝐚𝐥𝐢𝐝 𝐩𝐚𝐠𝐞 𝐧𝐮𝐦𝐛𝐞𝐫! 𝐏𝐥ease 𝐭𝐫𝐲 𝐚𝐠𝐚𝐢𝐧."  
},  

onStart: async function ({ args, threadsData, message, event, api, commandName, getLang }) {  
	const { threadID, senderID, type, messageReply } = event;  
	const threadData = await threadsData.get(threadID);  
	const { members } = threadData;  
	const usersInGroup = (await api.getThreadInfo(threadID)).participantIDs;  
	let arraySort = [];  
	let totalGroupMessages = 0;

	for (const user of members) {  
		if (!usersInGroup.includes(user.userID))  
			continue;  
		const charac = "️️️️️️️️️️️️️️️️️";  
		arraySort.push({  
			name: user.name.includes(charac) ? `Uid: ${user.userID}` : user.name,  
			count: user.count,  
			uid: user.userID  
		});  
		totalGroupMessages += user.count;  
	}  
	let stt = 1;  
	arraySort.sort((a, b) => b.count - a.count);  
	arraySort.map(item => item.stt = stt++);  

	// Handle Reply Feature
	if (type === "message_reply") {
		const targetID = messageReply.senderID;
		const findUser = arraySort.find(item => item.uid == targetID);
		if (findUser) {
			let msg = `❀━━━{  𝐔𝐒𝐄Ｒ 𝐑𝐀𝐍𝐊Ｉ𝐍𝐆  }━━━❀\n👤 ${findUser.name} \n  ↳ 🏅 𝐑𝐚𝐧𝐤: ${findUser.stt} | 💬 𝐌𝐞𝐬𝐬𝐚𝐠𝐞𝐬: ${findUser.count}\n❀━━━━━━━━━━━━━━━━━━━❀`;
			return message.reply(msg);
		} else {
			return message.reply("❌ 𝐔𝐬𝐞𝐫 𝐝𝐚𝐭𝐚 𝐧𝐨𝐭 𝐟𝐨𝐮𝐧𝐝!");
		}
	}

	if (args[0]) {  
		// নির্দিষ্ট র‍্যাঙ্ক খোঁজার ফিচার (যেমন: count 1, count 10)
		if (!isNaN(args[0])) {
			const rankIndex = parseInt(args[0]);
			if (rankIndex < 1 || rankIndex > arraySort.length) {
				return message.reply(`❌ এই গ্রুপে মোট ${arraySort.length} জন সক্রিয় মেম্বার আছেন। অনুগ্রহ করে ১ থেকে ${arraySort.length}-এর মধ্যে যেকোনো সংখ্যা দিন!`);
			}
			const findUser = arraySort[rankIndex - 1];
			let msg = `❀━━━{  𝐑𝐀𝐍𝐊 ${rankIndex} 𝐒𝐓𝐀𝐓𝐒  }━━━❀\n👤 ${findUser.name} \n  ↳ 🏅 𝐑𝐚𝐧𝐤: ${findUser.stt} | 💬 𝐌𝐞𝐬𝐬𝐚𝐠𝐞𝐬: ${findUser.count}\n❀━━━━━━━━━━━━━━━━━━━❀`;
			return message.reply(msg);
		}

		if (args[0].toLowerCase() == "all") {  
			let page = parseInt(args[1]);  
			if (isNaN(page)) page = 1;  
			
			const splitPage = global.utils.splitPage(arraySort, 50);
			if (page < 1 || page > splitPage.totalPage) {
				return message.reply(getLang("invalidPage"));
			}
			
			let currentPageData = splitPage.allPage[page - 1];  
			let thisPageMessages = 0;
			let listMsg = "";

			for (const item of currentPageData) {  
				if (item.count > 0) {
					let medal = item.stt == 1 ? "🥇" : item.stt == 2 ? "🥈" : item.stt == 3 ? "🥉" : `🔹 [${item.stt}]`;
					listMsg += `${medal} ${item.name}: ${item.count}\n`;
					thisPageMessages += item.count;  
				}
			}  

			let msg = `❀━━━{  𝐌𝐄𝐒𝐒𝐀𝐆𝐄 𝐑𝐀𝐍𝐊  }━━━❀\n`
				+ `𝐓𝐨𝐭𝐚𝐥 𝐦𝐞𝐬𝐬𝐚𝐠𝐞: ${totalGroupMessages}\n`
				+ `𝐓𝐡𝐢𝐬 𝐩𝐚𝐠𝐞: ${thisPageMessages}\n`
				+ `❀━━━━━━━━━━━━━━━━━━━❀\n`
				+ listMsg
				+ `❀━━━━━━━━━━━━━━━━━━━❀`
				+ getLang("page", page, splitPage.totalPage)  
				+ `\n${getLang("reply")}`  
				+ `${getLang("endMessage")}`;  

			return message.reply(msg, (err, info) => {  
				if (err) return message.err(err);  
				global.GoatBot.onReply.set(info.messageID, {  
					commandName,  
					messageID: info.messageID,  
					splitPage,  
					totalGroupMessages, 
					author: senderID  
				});  
			});  
		}  
		else if (Object.keys(event.mentions).length > 0) {  
			let msg = "❀━━━{  𝐌𝐄𝐍𝐓𝐈𝐎𝐍 𝐒𝐓𝐀𝐓𝐒  }━━━❀";  
			for (const id in event.mentions) {  
				const findUser = arraySort.find(item => item.uid == id);  
				if(findUser) {
					msg += `\n${getLang("result", findUser.name, findUser.stt, findUser.count)}`;  
				}
			}  
			msg += "\n❀━━━━━━━━━━━━━━━━━━━❀";
			message.reply(msg);  
		}  
	}  
	else {  
		const findUser = arraySort.find(item => item.uid == senderID);  
		if (findUser) {
			// ল্যাঙ্গুয়েজ ফাইল বাইপাস করে সরাসরি মেসেজ ডিজাইন করে দেওয়া হলো
			let msg = `❀━━━{  𝐘𝐎𝐔𝐑 𝐑𝐀𝐍𝐊𝐈𝐍𝐆  }━━━❀\n👤 ${findUser.name} \n  ↳ 🏅 𝐑𝐚𝐧𝐤: ${findUser.stt} | 💬 𝐌𝐞𝐬𝐬𝐚𝐠𝐞𝐬: ${findUser.count}\n❀━━━━━━━━━━━━━━━━━━━❀`;
			return message.reply(msg);  
		} else {
			return message.reply("❌ 𝐘𝐨𝐮𝐫 𝐝𝐚𝐭𝐚 𝐧𝐨𝐭 𝐟𝐨𝐮𝐧𝐝!");
		}
	}  
},  

onReply: ({ message, event, Reply, commandName, getLang }) => {  
	const { senderID, body } = event;  
	const { author, splitPage, totalGroupMessages } = Reply;  
	if (author != senderID) return;  
	
	const page = parseInt(body);  
	if (isNaN(page) || page < 1 || page > splitPage.totalPage)  
		return message.reply(getLang("invalidPage"));  
		
	const arraySort = splitPage.allPage[page - 1];  
	let thisPageMessages = 0;
	let listMsg = "";
	
	for (const item of arraySort) {  
		if (item.count > 0) {
			let medal = item.stt == 1 ? "🥇" : item.stt == 2 ? "🥈" : item.stt == 3 ? "🥉" : `🔹 [${item.stt}]`;
			listMsg += `${medal} ${item.name}: ${item.count}\n`;
			thisPageMessages += item.count;
		}
	}  

	let msg = `❀━━━{  𝐌𝐄𝐒𝐒𝐀𝐆𝐄 𝐑𝐀𝐍𝐊  }━━━❀\n`
		+ `𝐓𝐨𝐭𝐚𝐥 𝐦𝐞𝐬𝐬𝐚𝐠𝐞: ${totalGroupMessages}\n`
		+ `𝐓𝐡𝐢𝐬 𝐩𝐚𝐠𝐞: ${thisPageMessages}\n`
		+ `❀━━━━━━━━━━━━━━━━━━━❀\n`
		+ listMsg
		+ `❀━━━━━━━━━━━━━━━━━━━❀`
		+ getLang("page", page, splitPage.totalPage)  
		+ "\n" + getLang("reply")  
		+ getLang("endMessage");  
		
	message.reply(msg, (err, info) => {  
		if (err) return message.err(err);  
		message.unsend(Reply.messageID);  
		global.GoatBot.onReply.set(info.messageID, {  
			commandName,  
			messageID: info.messageID,  
			splitPage,  
			totalGroupMessages,
			author: senderID  
		});  
	});  
},  

onChat: async ({ usersData, threadsData, event }) => {  
	const { senderID, threadID } = event;  
	const members = await threadsData.get(threadID, "members");  
	const findMember = members.find(user => user.userID == senderID);  
	if (!findMember) {  
		members.push({  
			userID: senderID,  
			name: await usersData.getName(senderID),  
			nickname: null,  
			inGroup: true,  
			count: 1  
		});  
	}  
	else  
		findMember.count += 1;  
	await threadsData.set(threadID, members, "members");  
}
};
