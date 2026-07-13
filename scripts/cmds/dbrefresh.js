const mongoose = require("mongoose");

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

module.exports = {
	config: {
		name: "dbrefresh",
		version: "2.0",
		author: "Rakib",
		countDown: 10,
		role: 4,

		description: {
			en: "Manual refresh user or current thread"
		},

		category: "system",

		guide: {
			en:
				"{pn} user <uid> → refresh specific user\n" +
				"{pn} user (reply) → refresh replied user\n" +
				"{pn} thread → refresh current group\n" +
				"{pn} reconnect → reconnect mongodb"
		}
	},

	onStart: async function ({
		args,
		message,
		event,
		usersData,
		threadsData
	}) {

		try {
			const mongoUri =
				process.env.MONGO_URI ||
				global.GoatBot?.config?.database?.uriMongodb;

			if (!mongoUri) {
				return message.reply("❌ | MongoDB URI not found");
			}

			const type = (args[0] || "").toLowerCase();

			// ================= RECONNECT =================
			if (type === "reconnect") {

				try {

					if (mongoose.connection.readyState !== 0) {
						await mongoose.connection.close();
						await delay(2000);
					}

					await mongoose.connect(mongoUri, {
						maxPoolSize: 10,
						serverSelectionTimeoutMS: 30000,
						socketTimeoutMS: 45000
					});

					await mongoose.connection.db.admin().ping();

					return message.reply("✅ | MongoDB reconnected successfully");

				} catch (err) {
					console.error(err);
					return message.reply("❌ | Reconnect failed\n" + err.message);
				}
			}

			// ================= USER REFRESH =================
			if (type === "user") {

				let uid = args[1];

				// 📌 Reply support
				if (!uid && event.messageReply) {
					uid = event.messageReply.senderID;
				}

				if (!uid || isNaN(uid)) {
					return message.reply(
						"⚠️ | Usage:\n" +
						".dbrefresh user <uid>\n" +
						"or reply to a user"
					);
				}

				await message.reply("🔄 | Refreshing user...");

				try {

					await usersData.refreshInfo(uid);

					if (global.gc) global.gc();

					return message.reply(
						`✅ | User refreshed successfully\nUID: ${uid}`
					);

				} catch (err) {
					console.error(err);
					return message.reply(
						`❌ | User refresh failed\n${err.message}`
					);
				}
			}

			// ================= THREAD REFRESH =================
			if (type === "thread") {

				const threadID = event.threadID;

				if (!threadID || isNaN(threadID)) {
					return message.reply("❌ | Invalid thread ID");
				}

				await message.reply("🔄 | Refreshing this group...");

				try {

					await threadsData.refreshInfo(threadID);

					if (global.gc) global.gc();

					return message.reply(
						`✅ | Thread refreshed successfully\nTID: ${threadID}`
					);

				} catch (err) {
					console.error(err);
					return message.reply(
						`❌ | Thread refresh failed\n${err.message}`
					);
				}
			}

			// ================= INVALID =================
			return message.reply(
				"⚠️ | Usage:\n" +
				".dbrefresh user <uid>\n" +
				".dbrefresh user (reply)\n" +
				".dbrefresh thread\n" +
				".dbrefresh reconnect"
			);

		}
		catch (err) {

			console.error(err);

			return message.reply(
				"❌ | Refresh failed\n\n" + err.message
			);
		}
	}
};
