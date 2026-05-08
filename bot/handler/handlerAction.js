const createFuncMessage = global.utils.message;
const handlerCheckDB = require("./handlerCheckData.js");

module.exports = (
	api,
	threadModel,
	userModel,
	dashBoardModel,
	globalModel,
	usersData,
	threadsData,
	dashBoardData,
	globalData
) => {

	const handlerEvents = require(
		process.env.NODE_ENV == "development"
			? "./handlerEvents.dev.js"
			: "./handlerEvents.js"
	)(
		api,
		threadModel,
		userModel,
		dashBoardModel,
		globalModel,
		usersData,
		threadsData,
		dashBoardData,
		globalData
	);

	return async function (event) {

		// Anti Inbox
		if (
			global.GoatBot.config.antiInbox == true &&
			(
				event.senderID == event.threadID ||
				event.userID == event.senderID ||
				event.isGroup == false
			)
		)
			return;

		const message = createFuncMessage(api, event);

		// Check database
		await handlerCheckDB(usersData, threadsData, event);

		// Load handlers
		const handlerChat = await handlerEvents(event, message);

		if (!handlerChat)
			return;

		const {
			onAnyEvent,
			onFirstChat,
			onStart,
			onChat,
			onReply,
			onEvent,
			handlerEvent,
			onReaction,
			typ,
			presence,
			read_receipt
		} = handlerChat;

		// Run every event
		onAnyEvent();

		switch (event.type) {

			// =========================
			// MESSAGE EVENTS
			// =========================
			case "message":
			case "message_reply":
			case "message_unsend": {
				onFirstChat();
				onChat();
				onStart();
				onReply();
				break;
			}

			// =========================
			// GROUP EVENTS
			// =========================
			case "event": {
				handlerEvent();
				onEvent();
				break;
			}

			// =========================
			// REACTION SYSTEM
			// =========================
			case "message_reaction": {

				onReaction();

				try {

					const reactorID =
						event.senderID || event.userID;

					const reaction = event.reaction;

					const messageData = event.messageReply;

					// Safety check
					if (!messageData)
						break;

					const targetID = messageData.senderID;

					if (!targetID)
						break;

					// Prevent self reaction action
					if (targetID == reactorID)
						break;

					const isAdmin =
						global.GoatBot.config.adminBot.includes(reactorID);

					const isTargetAdmin =
						global.GoatBot.config.adminBot.includes(targetID);

					// =========================
					// 🙂 UNSEND BOT MESSAGE
					// =========================
					if (reaction == "🙂") {

						if (
							targetID == api.getCurrentUserID() &&
							messageData.messageID
						) {

							message.unsend(
								messageData.messageID
							);
						}
					}

					// =========================
					// 👎 ADMIN KICK USER
					// =========================
					if (reaction == "👎" && isAdmin) {

						// Prevent kicking admin
						if (isTargetAdmin)
							break;

						api.removeUserFromGroup(
							targetID,
							event.threadID,
							err => {
								if (err)
									console.log("[Kick Error]", err);
							}
						);
					}

				}
				catch (e) {
					console.log("[Reaction Error]", e);
				}

				break;
			}

			// =========================
			// TYPING EVENT
			// =========================
			case "typ": {
				typ();
				break;
			}

			// =========================
			// PRESENCE EVENT
			// =========================
			case "presence": {
				presence();
				break;
			}

			// =========================
			// READ RECEIPT EVENT
			// =========================
			case "read_receipt": {
				read_receipt();
				break;
			}

			// =========================
			// DEFAULT
			// =========================
			default:
				break;
		}
	};
};
