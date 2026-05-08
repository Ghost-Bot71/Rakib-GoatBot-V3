const mongoose = require("mongoose");
const { loadOwner } = require("../../rakib/customId/ownerUid");

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

module.exports = {
	config: {
		name: "dbrefresh",
		version: "2.0",
		author: "Rakib",
		countDown: 30,
		role: 0,

		description: {
			en: "Safely refresh mongodb, users and groups"
		},

		category: "system",

		guide: {
			en:
				"{pn} user → refresh all users safely\n" +
				"{pn} group → refresh all groups safely\n" +
				"{pn} all → refresh everything safely\n" +
				"{pn} reconnect → reconnect mongodb only"
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

			// OWNER CHECK
			const ownerUIDs = loadOwner();

			if (
				!Array.isArray(ownerUIDs) ||
				!ownerUIDs.includes(event.senderID)
			) {
				return message.reply(
					"❌ | Only bot owner can use this command"
				);
			}

			const mongoUri =
				process.env.MONGO_URI ||
				global.GoatBot?.config?.database?.uriMongodb;

			if (!mongoUri) {
				return message.reply(
					"❌ | MongoDB URI not found"
				);
			}

			const type = (args[0] || "").toLowerCase();

			// VALID TYPES
			const validTypes = [
				"user",
				"group",
				"thread",
				"all",
				"reconnect"
			];

			if (!validTypes.includes(type)) {
				return message.reply(
					"⚠️ | Usage:\n" +
					".dbrefresh user\n" +
					".dbrefresh group\n" +
					".dbrefresh all\n" +
					".dbrefresh reconnect"
				);
			}

			// SAFE RECONNECT ONLY
			if (type === "reconnect") {

				try {

					if (mongoose.connection.readyState !== 0) {
						await mongoose.connection.close();
						await delay(3000);
					}

					await mongoose.connect(mongoUri, {
						maxPoolSize: 10,
						serverSelectionTimeoutMS: 30000,
						socketTimeoutMS: 45000
					});

					await mongoose.connection.db.admin().ping();

					return message.reply(
						"✅ | MongoDB reconnected successfully"
					);

				}
				catch (err) {

					console.error(err);

					return message.reply(
						"❌ | MongoDB reconnect failed\n\n" +
						err.message
					);
				}
			}

			// ---------------- USER REFRESH ----------------

			if (type === "user") {

				const allUsers = await usersData.getAll();

				if (!Array.isArray(allUsers) || !allUsers.length) {
					return message.reply(
						"⚠️ | No users found"
					);
				}

				let success = 0;
				let failed = 0;
				let skipped = 0;

				await message.reply(
					`🔄 | Starting safe user refresh...\n\n👤 Total Users: ${allUsers.length}\n⏳ This may take a long time`
				);

				for (let i = 0; i < allUsers.length; i++) {

					const user = allUsers[i];

					try {

						const uid =
							user.userID ||
							user.uid;

						// INVALID UID
						if (
							!uid ||
							isNaN(uid)
						) {
							skipped++;
							continue;
						}

						// SAFE REFRESH
						await usersData.refreshInfo(uid);

						success++;

					}
					catch (err) {

						failed++;

						console.error(
							`User refresh failed:`,
							err.message
						);
					}

					// SAFE DELAY
					await delay(800);

					// MEMORY CLEAN
					if (global.gc) {
						global.gc();
					}

					// PROGRESS EVERY 100
					if ((i + 1) % 100 === 0) {

						try {
							await message.reply(
								`📊 | User Refresh Progress\n\n` +
								`Processed: ${i + 1}/${allUsers.length}\n` +
								`✅ Success: ${success}\n` +
								`❌ Failed: ${failed}\n` +
								`⚠️ Skipped: ${skipped}`
							);
						}
						catch (_) {}
					}
				}

				return message.reply(
					`✅ | User refresh completed\n\n` +
					`👤 Total: ${allUsers.length}\n` +
					`✅ Success: ${success}\n` +
					`❌ Failed: ${failed}\n` +
					`⚠️ Skipped: ${skipped}`
				);
			}

			// ---------------- GROUP REFRESH ----------------

			if (
				type === "group" ||
				type === "thread"
			) {

				const allThreads = await threadsData.getAll();

				if (!Array.isArray(allThreads) || !allThreads.length) {
					return message.reply(
						"⚠️ | No groups found"
					);
				}

				let success = 0;
				let failed = 0;
				let skipped = 0;

				await message.reply(
					`🔄 | Starting safe group refresh...\n\n👥 Total Groups: ${allThreads.length}\n⏳ This may take a long time`
				);

				for (let i = 0; i < allThreads.length; i++) {

					const thread = allThreads[i];

					try {

						const tid =
							thread.threadID;

						// INVALID TID
						if (
							!tid ||
							isNaN(tid)
						) {
							skipped++;
							continue;
						}

						// SAFE REFRESH
						await threadsData.refreshInfo(tid);

						success++;

					}
					catch (err) {

						failed++;

						console.error(
							`Group refresh failed:`,
							err.message
						);
					}

					// SAFE DELAY
					await delay(1200);

					// MEMORY CLEAN
					if (global.gc) {
						global.gc();
					}

					// PROGRESS EVERY 50
					if ((i + 1) % 50 === 0) {

						try {
							await message.reply(
								`📊 | Group Refresh Progress\n\n` +
								`Processed: ${i + 1}/${allThreads.length}\n` +
								`✅ Success: ${success}\n` +
								`❌ Failed: ${failed}\n` +
								`⚠️ Skipped: ${skipped}`
							);
						}
						catch (_) {}
					}
				}

				return message.reply(
					`✅ | Group refresh completed\n\n` +
					`👥 Total: ${allThreads.length}\n` +
					`✅ Success: ${success}\n` +
					`❌ Failed: ${failed}\n` +
					`⚠️ Skipped: ${skipped}`
				);
			}

			// ---------------- FULL REFRESH ----------------

			if (type === "all") {

				const allUsers = await usersData.getAll();
				const allThreads = await threadsData.getAll();

				await message.reply(
					`🔄 | Starting FULL SAFE refresh...\n\n` +
					`👤 Users: ${allUsers.length}\n` +
					`👥 Groups: ${allThreads.length}\n\n` +
					`⏳ This may take several hours`
				);

				let userSuccess = 0;
				let userFailed = 0;
				let groupSuccess = 0;
				let groupFailed = 0;

				// USERS
				for (let i = 0; i < allUsers.length; i++) {

					const user = allUsers[i];

					try {

						const uid =
							user.userID ||
							user.uid;

						if (
							uid &&
							!isNaN(uid)
						) {

							await usersData.refreshInfo(uid);

							userSuccess++;
						}
					}
					catch (err) {

						userFailed++;

						console.error(
							`User refresh failed:`,
							err.message
						);
					}

					await delay(3000);

					if (global.gc) {
						global.gc();
					}
				}

				// EXTRA COOL DOWN
				await delay(10000);

				// GROUPS
				for (let i = 0; i < allThreads.length; i++) {

					const thread = allThreads[i];

					try {

						const tid =
							thread.threadID;

						if (
							tid &&
							!isNaN(tid)
						) {

							await threadsData.refreshInfo(tid);

							groupSuccess++;
						}
					}
					catch (err) {

						groupFailed++;

						console.error(
							`Group refresh failed:`,
							err.message
						);
					}

					await delay(1200);

					if (global.gc) {
						global.gc();
					}
				}

				return message.reply(
					`✅ | Full refresh completed\n\n` +
					`👤 Users Success: ${userSuccess}\n` +
					`❌ Users Failed: ${userFailed}\n\n` +
					`👥 Groups Success: ${groupSuccess}\n` +
					`❌ Groups Failed: ${groupFailed}`
				);
			}

		}
		catch (err) {

			console.error(err);

			return message.reply(
				"❌ | Refresh failed\n\n" +
				err.message
			);
		}
	}
};
