const { loadOwner } = require("../../rakib/customId/ownerUid");

module.exports = {
  config: {
    name: "acpt",
    aliases: ["acpuid"],
    version: "2.0",
    author: "Rakib",
    countDown: 8,
    role: 0,
    shortDescription: "Send friend request (Owner only)",
    longDescription: "Send friend request by reply or UID (Owner only)",
    category: "Utility",
  },

  onStart: async function ({ event, api, args }) {

    // 🔒 Owner Check (multi + single support)
    const ownerUID = await loadOwner();
    const isOwner = Array.isArray(ownerUID)
      ? ownerUID.includes(String(event.senderID))
      : String(event.senderID) === String(ownerUID);

    if (!isOwner) {
      return api.sendMessage(
        "❌ এই কমান্ডটি শুধু Bot Owner ব্যবহার করতে পারবেন।",
        event.threadID,
        event.messageID
      );
    }

    let targetUID;

    // 📌 reply হলে
    if (event.type === "message_reply") {
      targetUID = event.messageReply.senderID;
    }

    // 📌 UID দিলে
    else if (args[0]) {
      targetUID = args[0];
    }

    if (!targetUID) {
      return api.sendMessage(
        "⚠️ ব্যবহার:\n• কারো মেসেজে রিপ্লাই দিয়ে acpt\n• অথবা acpt <UID>",
        event.threadID,
        event.messageID
      );
    }

    const form = {
      av: api.getCurrentUserID(),
      fb_api_caller_class: "RelayModern",
      fb_api_req_friendly_name: "FriendingCometFriendRequestSendMutation",
      doc_id: "3147613905362928",
      variables: JSON.stringify({
        input: {
          source: "profile_button",
          friend_requester_id: targetUID,
          actor_id: api.getCurrentUserID(),
          client_mutation_id: Math.round(Math.random() * 19).toString()
        },
        scale: 3
      })
    };

    try {
      const res = await api.httpPost(
        "https://www.facebook.com/api/graphql/",
        form
      );

      const parsed = JSON.parse(res);

      if (parsed.errors) {
        return api.sendMessage(
          "❌ Friend request পাঠানো যায়নি!",
          event.threadID,
          event.messageID
        );
      }

      api.sendMessage(
        `✅ Friend request successfully sent!\n\nUID: ${targetUID}`,
        event.threadID,
        event.messageID
      );

    } catch (error) {
      console.error(error);

      api.sendMessage(
        "❌ Server Error! আবার চেষ্টা করুন।",
        event.threadID,
        event.messageID
      );
    }
  }
};
