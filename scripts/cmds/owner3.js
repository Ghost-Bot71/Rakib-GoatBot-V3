"use strict";
const axios = require("axios");
const { PassThrough } = require("stream");

const OWNER = {
  name: "Rakib Islam",
  address: "Saidpur, Nilphamari, Bangladesh",
  age: "Secret 🔒",
  job: "Student & Developer",
  hobby: "Gaming & Travelling 🎮✈️",
  fb: "facebook.com/profile.php?id=61575436812912"
};

const GIF = "https://media.tenor.com/QBbEUPiCkfoAAAAC/matrix-code.gif";

module.exports = {
  config: {
    name: "owner3",
    aliases: ["matrix", "devcard"],
    version: "1.0", author: "Rakib Islam",
    countDown: 5, role: 0,
    shortDescription: "💚 Owner Profile — Matrix Terminal",
    category: "info",
    guide: { en: "{pn}" }
  },
  onStart: async function ({ message, event }) {
    await message.reaction("⏳", event.messageID);
    const ts = new Date().toISOString().replace("T", " ").slice(0, 19);
    const card =
      `\n💚 ┌────────────────────────────┐\n` +
      `💚 │  > MATRIX_SYS v3.0 BOOT    │\n` +
      `💚 │  > AGENT_FILE DECRYPTED ✓  │\n` +
      `💚 └────────────────────────────┘\n\n` +
      `$ cat /etc/agent.conf\n` +
      `  NAME     = "${OWNER.name}"\n` +
      `  LOCATION = "${OWNER.address}"\n` +
      `  AGE      = "${OWNER.age}"\n` +
      `  STATUS   = "${OWNER.job}"\n` +
      `  HOBBY    = "${OWNER.hobby}"\n` +
      `  LINK     = "${OWNER.fb}"\n\n` +
      `$ uptime: ${ts} UTC\n` +
      `> SYSTEM_OK — AGENT AUTHENTICATED ✓\n` +
      `💚 ████████████████████ 100%`;
    try {
      const res = await axios.get(GIF, { responseType: "arraybuffer", timeout: 8000 });
      const st = new PassThrough(); st.end(Buffer.from(res.data));
      await message.reaction("✅", event.messageID);
      return message.reply({ body: card, attachment: st });
    } catch {
      await message.reaction("✅", event.messageID);
      return message.reply(card);
    }
  }
};
