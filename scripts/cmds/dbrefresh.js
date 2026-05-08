const mongoose = require("mongoose");

module.exports = {
	config: {
		name: "dbrefresh",
		version: "1.0",
		author: "Rakib",
		countDown: 15,
		role: 2,

		description: {
			en: "Refresh mongodb, users and groups"
		},

		category: "system",

		guide: {
			en:
				"{pn} user → refresh all users\n" +
				"{pn} group → refresh all groups\n" +
				"{pn} all → refresh everything\n" +
				"{pn} reconnect → reconnect mongodb only"
		}
	},

	onStart: async function ({
		args,
		message,
		usersData,
		threadsData
	}) {

		const mongoUri =
			process.env.MONGO_URI ||
			global.GoatBot?.config?.database?.uriMongodb;

		if (!mongoUri)
			return message.reply("❌ | MongoDB URI not found");

		const type = (args[0] || "").toLowerCase();

		try {

			// reconnect mongodb
			if (mongoose.connection.readyState !== 0)
				await mongoose.connection.close();

			await mongoose.connect(mongoUri);

			// reconnect only
			if (type === "reconnect") {

				await mongoose.connection.db.admin().ping();

				return message.reply(
					"✅ | MongoDB reconnected successfully"
				);
			}

			// refresh all users
			if (type === "user") {

				const allUsers = await usersData.getAll();
				let success = 0;
				let failed = 0;

				await message.reply(
					`🔄 | Refreshing ${allUsers.length} users...`
				);

				for (const user of allUsers) {
					try {

						const uid =
							user.userID ||
							user.uid ||
							user._id;

						if (!uid)
							continue;

						await usersData.refreshInfo(uid);

						success++;

					}
					catch (e) {
						failed++;
					}
				}

				return message.reply(
					`✅ | User refresh completed\n\n👤 Success: ${success}\n❌ Failed: ${failed}`
				);
			}

			// refresh all groups
			if (type === "group" || type === "thread") {

				const allThreads = await threadsData.getAll();

				let success = 0;
				let failed = 0;

				await message.reply(
					`🔄 | Refreshing ${allThreads.length} groups...`
				);

				for (const thread of allThreads) {
					try {

						const tid =
							thread.threadID ||
							thread._id;

						if (!tid)
							continue;

						await threadsData.refreshInfo(tid);

						success++;

					}
					catch (e) {
						failed++;
					}
				}

				return message.reply(
					`✅ | Group refresh completed\n\n👥 Success: ${success}\n❌ Failed: ${failed}`
				);
			}

			// refresh all
			if (type === "all") {

				let userSuccess = 0;
				let threadSuccess = 0;

				const allUsers = await usersData.getAll();
				const allThreads = await threadsData.getAll();

				await message.reply(
					"🔄 | Refreshing everything..."
				);

				// users
				for (const user of allUsers) {
					try {

						const uid =
							user.userID ||
							user.uid ||
							user._id;

						if (!uid)
							continue;

						await usersData.refreshInfo(uid);

						userSuccess++;

					}
					catch (e) {}
				}

				// groups
				for (const thread of allThreads) {
					try {

						const tid =
							thread.threadID ||
							thread._id;

						if (!tid)
							continue;

						await threadsData.refreshInfo(tid);

						threadSuccess++;

					}
					catch (e) {}
				}

				return message.reply(
					`✅ | Full refresh completed\n\n👤 Users: ${userSuccess}\n👥 Groups: ${threadSuccess}`
				);
			}

			return message.reply(
				"⚠️ | Usage:\n" +
				".dbrefresh user\n" +
				".dbrefresh group\n" +
				".dbrefresh all\n" +
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
