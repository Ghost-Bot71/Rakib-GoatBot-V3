const axios = require("axios");

const API_KEY = "rakib69";

const CHAT_API   = "https://rakib-api.vercel.app/api/simma-chat";
//fallback simma-ai api chilo. lagle pore add kormu.//
const LISTEN_API = "https://rakib-api.vercel.app/api/simma-listen";

const triggers = [
  "bbz",
  "bot",
  "tessa",
  "babe",
  "xanu",
  "janu",
  "bou",
  "bby",
  "জানু",
  "বউ",
  "বট",
  "baby"
];

module.exports.config = {
  name: "bot",
  aliases: triggers,
  version: "1.0",
  author: "Rakib",
  role: 0,
  category: "chat",
  guide: {
    en: "{pn} [message]"
  }
};

/* ================= FONT STYLE ================= */
function toBoldFont(text) {
  return text.replace(/[A-Za-z0-9]/g, (char) => {

    const chars = {
      A: "𝐀", B: "𝐁", C: "𝐂", D: "𝐃", E: "𝐄",
      F: "𝐅", G: "𝐆", H: "𝐇", I: "𝐈", J: "𝐉",
      K: "𝐊", L: "𝐋", M: "𝐌", N: "𝐍", O: "𝐎",
      P: "𝐏", Q: "𝐐", R: "𝐑", S: "𝐒", T: "𝐓",
      U: "𝐔", V: "𝐕", W: "𝐖", X: "𝐗", Y: "𝐘",
      Z: "𝐙",

      a: "𝐚", b: "𝐛", c: "𝐜", d: "𝐝", e: "𝐞",
      f: "𝐟", g: "𝐠", h: "𝐡", i: "𝐢", j: "𝐣",
      k: "𝐤", l: "𝐥", m: "𝐦", n: "𝐧", o: "𝐨",
      p: "𝐩", q: "𝐪", r: "𝐫", s: "𝐬", t: "𝐭",
      u: "𝐮", v: "𝐯", w: "𝐰", x: "𝐱", y: "𝐲",
      z: "𝐳",

      0: "𝟎", 1: "𝟏", 2: "𝟐", 3: "𝟑", 4: "𝟒",
      5: "𝟓", 6: "𝟔", 7: "𝟕", 8: "𝟖", 9: "𝟗"
    };

    return chars[char] || char;
  });
}
/* ================= API HELPER ================= */

async function getReplyFromAPI(url, text) {
  try {
    const res = await axios.get(url, {
      params: {
        text,
        apikey: API_KEY
      }
    });

    let reply =
      res.data?.reply ||
      res.data?.message ||
      res.data?.text ||
      res.data;

    if (!reply || typeof reply !== "string")
      return null;

    reply = reply.trim();

    if (
      reply.length < 2 ||
      reply.toLowerCase().includes("bujhte pari nai") ||
      reply.toLowerCase() === text.toLowerCase()
    ) {
      return null;
    }

    return toBoldFont(reply);

  } catch {
    return null;
  }
}

/* ================= MAIN CHAT ================= */

async function chat(text) {

  // 1️⃣ try simma-chat
  let reply = await getReplyFromAPI(CHAT_API, text);
  if (reply) return reply;

  // 2️⃣ fallback simma-ai
  reply = await getReplyFromAPI(AI_API, text);
  if (reply) return reply;

  // 3️⃣ fallback
  return toBoldFont(
    "eta teach kora nei, plz bby teach kore dau 🥺"
  );
}

/* ================= COMMAND START ================= */

module.exports.onStart = async ({
  api,
  event,
  args
}) => {

  const uid = event.senderID;

  const msg = args.join(" ").trim();

  const reply = msg
    ? await chat(msg)
    : toBoldFont("hmm bby 😽");

  api.sendMessage(
    reply,
    event.threadID,
    (err, info) => {

      if (!err) {
        global.GoatBot.onReply.set(
          info.messageID,
          {
            commandName: "bot",
            author: uid,
            text: reply
          }
        );
      }

    },
    event.messageID
  );
};

/* ================= REPLY CHAIN ================= */

module.exports.onReply = async ({
  api,
  event,
  Reply
}) => {

  try {

    // only same user
    if (event.senderID !== Reply.author)
      return;

    const userReply = event.body;

    if (!userReply) return;

    const botMessage = Reply.text;

    if (!botMessage) return;

    /* 🔥 AUTO TEACH */

    axios.get(LISTEN_API, {
      params: {
        question: botMessage,
        reply: userReply,
        isReply: true,
        apikey: API_KEY
      }
    }).catch(() => {});

    // continue chat
    const reply = await chat(userReply);

    api.sendMessage(
      reply,
      event.threadID,
      (err, info) => {

        if (!err) {
          global.GoatBot.onReply.set(
            info.messageID,
            {
              commandName: "bot",
              author: event.senderID,
              text: reply
            }
          );
        }

      },
      event.messageID
    );

  } catch (e) {
    console.error("Reply error:", e);
  }
};

/* ================= AUTO TRIGGER ================= */

module.exports.onChat = async ({
  api,
  event
}) => {

  try {

    const text = (event.body || "").trim();

    if (!text) return;

    const lower = text.toLowerCase();

    // exact trigger
    if (triggers.includes(lower)) {

      const reply = toBoldFont("hmm bby 😽");

      api.sendMessage(
        reply,
        event.threadID,
        (err, info) => {

          if (!err) {
            global.GoatBot.onReply.set(
              info.messageID,
              {
                commandName: "bot",
                author: event.senderID,
                text: reply
              }
            );
          }

        },
        event.messageID
      );

      return;
    }

    // trigger + message
    for (const t of triggers) {

      if (lower.startsWith(t + " ")) {

        const userText = text
          .slice(t.length)
          .trim();

        const reply = await chat(userText);

        api.sendMessage(
          reply,
          event.threadID,
          (err, info) => {

            if (!err) {
              global.GoatBot.onReply.set(
                info.messageID,
                {
                  commandName: "bot",
                  author: event.senderID,
                  text: reply
                }
              );
            }

          },
          event.messageID
        );

        return;
      }
    }

  } catch (e) {
    console.error("onChat error:", e);
  }
};
