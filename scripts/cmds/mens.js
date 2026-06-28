const { loadOwner } = require("../../rakib/customId/ownerUid");

module.exports = {
  config: {
    name: "mens",
    aliases: ["ments"],
    version: "1.0",
    author: "Rakib",
    countDown: 3,
    role: 0, 
    shortDescription: "Mention the replied user",
    longDescription: "Tag the user from a replied message and add optional text.",
    category: "group",
    guide: {
      en: "{pn} [optional text] (reply to a message)",
    },
  },

  onStart: async function({ api, event, args }) {
    const { messageReply, threadID, senderID } = event;

    // 🔒 Owner Check
    const ownerUID = await loadOwner();
    const isOwner = Array.isArray(ownerUID)
        ? ownerUID.includes(String(senderID))
        : String(senderID) === String(ownerUID);

    if (!isOwner) {
        return api.sendMessage("❌ Owner only command.", threadID);
    }

    if (!messageReply) 
      return api.sendMessage("⚠️ Reply to a message to tag that user!", threadID);

    try {
      const targetID = messageReply.senderID;
      const userInfo = await api.getUserInfo(targetID);
      const name = userInfo[targetID]?.name || "Unknown User";
      const extraText = args.join(" ") || "";

      await api.sendMessage({
        body: `@${name} ${extraText}`,
        mentions: [{ id: targetID, tag: name }],
      }, threadID);

    } catch (error) {
      console.error(error);
      api.sendMessage("❌ Failed to tag user!", threadID);
    }
  },
};
