module.exports = {
	config: {
		name: "onlyadminbox",
		aliases: ["onlyadbox", "adboxonly", "adminboxonly"],
		version: "1.5",
		author: "Rakib Islam",
		countDown: 5,
		role: 1, // এটি শুধুমাত্র গ্রুপের বা বটের অ্যাডমিনরা অন/অফ করতে পারবে
		description: {
			vi: "bật/tắt chế độ chỉ quản trị của viên nhóm mới có thể sử dụng bot",
			en: "turn on/off only admin box can use bot (Bot Admin Bypassed)"
		},
		category: "box chat",
		guide: {
			vi: "   {pn} [on | off]: bật/tắt chế độ chỉ quản trị viên nhóm mới có thể sử dụng bot"
				+ "\n   {pn} noti [on | off]: bật/tắt thông báo khi người dùng không phải là quản trị viên nhóm sử dụng bot",
			en: "   {pn} [on | off]: turn on/off the mode only admin of group can use bot"
				+ "\n   {pn} noti [on | off]: turn on/off the notification when user is not admin of group use bot"
		}
	},

	langs: {
		vi: {
			turnedOn: "Đã bật chế độ chỉ quản trị viên nhóm mới có thể sử dụng bot",
			turnedOff: "Đã tắt chế độ chỉ quản trị viên nhóm mới có thể sử dụng bot",
			turnedOnNoti: "Đã bật thông báo khi người dùng không phải là quản trị viên nhóm sử dụng bot",
			turnedOffNoti: "Đã tắt thông báo khi người dùng không phải là quản trị viên nhóm sử dụng bot",
			syntaxError: "Sai cú pháp, chỉ có thể dùng {pn} on hoặc {pn} off"
		},
		en: {
			turnedOn: "Turned on the mode only admin of group can use bot (Bot Admins are bypassed! ✅)",
			turnedOff: "Turned off the mode only admin of group can use bot",
			turnedOnNoti: "Turned on the notification when user is not admin of group use bot",
			turnedOffNoti: "Turned off the notification when user is not admin of group use bot",
			syntaxError: "Syntax error, only use {pn} on or {pn} off"
		}
	},

	onStart: async function ({ args, message, event, threadsData, getLang, role }) {
		// 👑 স্পেশাল ফিক্স: বটের নিজের অ্যাডমিন বা ওনার (Role 1 বা 2) হলে গ্রুপ অ্যাডমিন মুড অন থাকলেও তারা সবসময় এলাউড
		// তাই বটের অ্যাডমিন যদি নিজে এই কমান্ডটি অফ করতে চায়, তাকে গ্রুপ এডমিন হওয়ার প্রয়োজন নেই।
		
		let isSetNoti = false;
		let value;
		let keySetData = "data.onlyAdminBox";
		let indexGetVal = 0;

		if (args[0] == "noti") {
			isSetNoti = true;
			indexGetVal = 1;
			keySetData = "data.hideNotiMessageOnlyAdminBox";
		}

		if (args[indexGetVal] == "on")
			value = true;
		else if (args[indexGetVal] == "off")
			value = false;
		else
			return message.reply(getLang("syntaxError"));

		await threadsData.set(event.threadID, isSetNoti ? !value : value, keySetData);

		if (isSetNoti)
			return message.reply(value ? getLang("turnedOnNoti") : getLang("turnedOffNoti"));
		else
			return message.reply(value ? getLang("turnedOn") : getLang("turnedOff"));
	}
};
			
