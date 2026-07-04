function sleep(time) {
	return new Promise((resolve) => setTimeout(resolve, time));
}

module.exports = {
	config: {
		name: "filteruser",
		version: "1.7",
		aliases: ["filter", "flt"],
		author: "NTKhang & Rakib",
		countDown: 5,
		role: 1,
		description: {
			vi: "lọc thành viên nhóm theo số tin nhắn hoặc bị khóa acc",
			en: "filter group members by number of messages or locked account"
		},
		category: "box chat",
		guide: {
			vi: "   {pn} [<số tin nhắn> | die]",
			en: "   {pn} [<number of messages> | die]"
		}
	},

	langs: {
		vi: {
			confirm: "⚠️ | Bạn có chắc chắn muốn xóa thành viên nhóm có số tin nhắn nhỏ hơn %1 không?\nThả cảm xúc bất kì vào tin nhắn này để xác nhận",
			kickByBlock: "✅ | Đã xóa thành công %1 thành viên bị khóa acc",
			kickByMsg: "✅ | Đã xóa thành công %1 thành viên có số tin nhắn nhỏ hơn %2",
			kickError: "❌ | Đã xảy ra lỗi không thể kick %1 thành viên:\n%2",
			noBlock: "✅ | Không có thành viên nào bị khóa acc",
			noMsg: "✅ | Không có thành viên nào có số tin nhắn nhỏ hơn %1"
		},
		en: {
			confirm: "⚠️ | Are you sure you want to delete group members with less than %1 messages?\nReact to this message to confirm",
			kickByBlock: "✅ | Successfully removed %1 members unavailable account",
			kickByMsg: "✅ | Successfully removed %1 members with less than %2 messages",
			kickError: "❌ | An error occurred and could not kick %1 members:\n%2",
			noBlock: "✅ | There are no members who are locked acc",
			noMsg: "✅ | There are no members with less than %1 messages"
		}
	},

	onStart: async function ({ api, args, threadsData, message, event, commandName, getLang }) {
		// Fetch fresh thread info to check admin status properly
		const threadInfo = await api.getThreadInfo(event.threadID);
		const botID = api.getCurrentUserID();
		
		// Custom Banglish Admin Warning
		if (!threadInfo.adminIDs.some(admin => admin.id == botID)) {
			return message.reply("⚠️ 𝘽𝙤𝙩 𝙠𝙚 𝙖𝙙𝙢𝙞𝙣 𝙗𝙖𝙣𝙖𝙣! 𝙂𝙧𝙤𝙪𝙥 𝙚𝙧 𝙢𝙚𝙢𝙗𝙚𝙧 𝙛𝙞𝙡𝙩𝙚𝙧 𝙠𝙤𝙧𝙩𝙚 𝙝𝙤𝙡𝙚 𝙗𝙤𝙩 𝙠𝙚 𝙖𝙙min 𝙙𝙚𝙤𝙮𝙖 𝙡𝙖𝙜𝙗𝙚. 𝙋𝙡𝙚𝙖𝙨𝙚 𝙖𝙙𝙙 𝙗𝙤𝙩 𝙖𝙨 𝙖𝙣 𝙖𝙙𝙢𝙞𝙣.");
		}

		if (!isNaN(args[0])) {
			message.reply(getLang("confirm", args[0]), (err, info) => {
				global.GoatBot.onReaction.set(info.messageID, {
					author: event.senderID,
					messageID: info.messageID,
					minimum: Number(args[0]),
					commandName
				});
			});
		}
		else if (args[0] == "die") {
			const membersBlocked = threadInfo.userInfo.filter(user => user.type !== "User");
			const errors = [];
			const success = [];
			
			for (const user of membersBlocked) {
				// Don't kick if the user is a group admin or the bot itself
				if (!threadInfo.adminIDs.some(admin => admin.id == user.id) && user.id != botID) {
					try {
						await api.removeUserFromGroup(user.id, event.threadID);
						success.push(user.id);
					}
					catch (e) {
						errors.push(user.name || user.id);
					}
					await sleep(700);
				}
			}

			let msg = "";
			if (success.length > 0)
				msg += `${getLang("kickByBlock", success.length)}\n`;
			if (errors.length > 0)
				msg += `${getLang("kickError", errors.length, errors.join("\n"))}\n`;
			if (msg == "")
				msg += getLang("noBlock");
			message.reply(msg);
		}
		else {
			message.SyntaxError();
		}
	},

	onReaction: async function ({ api, Reaction, event, threadsData, message, getLang }) {
		const { minimum = 1, author } = Reaction;
		if (event.userID != author) return;

		const threadInfo = await api.getThreadInfo(event.threadID);
		const botID = api.getCurrentUserID();
		
		// Safety check if bot lost admin role during reaction wait
		if (!threadInfo.adminIDs.some(admin => admin.id == botID)) {
			return message.reply("⚠️ 𝘽𝙤𝙩 𝙚𝙧 𝙖𝙙𝙢𝙞𝙣 𝙥𝙤𝙫𝙚𝙧 𝙘𝙝𝙚𝙡𝙚 𝙜𝙚𝙘𝙝𝙚, 𝙖𝙙𝙢𝙞𝙣 𝙙𝙞𝙮𝙚 𝙖𝙗𝙖𝙧 𝙩𝙧𝙮 𝙠𝙤𝙧𝙪𝙣.");
		}

		const threadData = await threadsData.get(event.threadID);
		
		// Filter low message members safely
		const membersCountLess = threadData.members.filter(member =>
			member.count < minimum
			&& member.inGroup == true
			&& member.userID != botID
			&& !threadInfo.adminIDs.some(admin => admin.id == member.userID)
		);

		const errors = [];
		const success = [];
		
		for (const member of membersCountLess) {
			try {
				await api.removeUserFromGroup(member.userID, event.threadID);
				success.push(member.userID);
			}
			catch (e) {
				errors.push(member.name || member.userID);
			}
			await sleep(700);
		}

		let msg = "";
		if (success.length > 0)
			msg += `${getLang("kickByMsg", success.length, minimum)}\n`;
		if (errors.length > 0)
			msg += `${getLang("kickError", errors.length, errors.join("\n"))}\n`;
		if (msg == "")
			msg += getLang("noMsg", minimum);
			
		message.reply(msg);
	}
};
