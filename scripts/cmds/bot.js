const axios = require("axios");

const API_KEY = "rakib69";

const CHAT_API   = "https://rakib-api.vercel.app/api/simma-chat";
const AI_API     = "https://rakib-api.vercel.app/api/simma-ct";
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

module.exports.onChat = async ({ api, event }) => {
  try {
    const text = (event.body || "").trim();
    if (!text) return;

    const lower = text.toLowerCase();

    // 👉 all random replies
    const replies = [
"beshi bot bot korle leave nibo kintu😒😒",
"shunbo na😼 tumi amake prem korai dao nai🥺 pocha tumi🥺",
"ami abal der sathe kotha boli na, ok😒",
"eto deko na, prem e pore jabo to🙈",
"Bolo babu, tumi ki amake valobasho? 🙈💋",
"bar bar dakle matha gorom hoye jay kintu😑",
"hya bolo😒, tomar jonno ki korte pari😐😑?",
"eto dakchis keno? gali shunbi naki? 🤬",
"I love you janu🥰",
"are bolo amar jaan, kemon acho?😚",
"bot bole osomman korcho,😰😿",
"hop beda😾, boss bol boss😼",
"chup thak, nai to tor daat venge dibo kintu",
"bot na, janu bol janu 😘",
"bar bar disturb korchis keno😾, amar janur sathe byasto achi😋",
"khaista eto dakis keno🤬",
"amake dakle, ami kintu kiss kore dibo😘",
"amare eto dakis na ami moja korar mood e nai ekhon😒",
"hya janu, eidik e aso kiss dei🤭 😘",
"dure ja, tor kono kaj nai, sudhu bot bot koris 😉😋🤣",
"tor kotha tor bari keu shune na, to ami keno shunbo?🤔😂",
"amake deko na, ami byasto achi",
"ki holo, mistake korchis naki🤣",
"bolo ki bolba, sobar samne bolba naki?🤭🤏",
"kalke dekha koris to ektu 😈",
"ha bolo, shunchi ami 😏",
"ar koto bar dakbi, shunchi to",
"hum bolo ki bolbe😒",
"bolo ki korte pari tomar jonno",
"ami to ondho, kichu dekhi na🐸 😎",
"bot na janu, bol 😌",
"bolo janu 🌚",
"tor ki chokhe pore na ami byasto achi😒",
"hum jaan tomar oi khane ummah😑😘",
"ah shona amar tomar olite golite ummah😇😘",
"jang hanga korba😒😬",
"hum jaan tomar oikhane ummmah😷😘",
"assalamu alaikum bolen apnar jonno ki korte pari..!🥰",
"amake eto na deke boss **hoon** ke ekta gf de 🙄",
"amake eto na dekcho keno valo talo basho naki🤭🙈",
"🌻🌺💚-assalamu alaikum wa rahmatullah-💚🌺🌻",
"ami ekhon boss **hoon** er sathe busy achi amake dakben na-😕😏 dhonnobad-🤝🌻",
"amake na deke amar boss **HOON** ke ekta gf dao-😽🫶🌺",
"jhang thumale ailapyu pepi-💝😽",
"uff bujhlam na eto dakchen keno-😤😡😈",
"jaan tomar nani're amar hate tule diba-🙊🙆‍♂",
"ajke amar mon valo nei tai amare dakben na-😪🤧",
"jhang 🫵thumale yami raite palupasi ummmmah-🌺🤤💦",
"chuna o chuna amar boss **HOON** er hobo bou re keu dekso khuje pacchi na😪🤧😭",
"shopno tomare niye dekhte chai tumi jodi amar hoye theko-💝🌺🌻",
"jaan hanga korba-🙊😝🌻",
"jaan meye hole chipay aso youtube theke onek valobasha shikhechi tomar jonno-🙊🙈😽",
"iss eto dako keno lojja lage to-🙈🖤🌼",
"amar boss **HOON** er pokkho theke tomare eto eto valobasha-🥰😽🫶 amar boss **HOON** er jonno doa korben-💝💚🌺🌻",
"- valobasha namok ablami korte mon chaile amar boss **HOON** er inbox e chole jao-🙊🥱👅 🌻FACEBOOK ID LINK🌻:- https://www.facebook.com/hoon6t9",
"jaan tumi sudhu amar ami tomare 365 din valobashi-💝🌺😽",
"jaan bal falaiba-🙂🥱🙆‍♂",
"-anti-🙆-apnar meye-👰‍♀️-rate amare video call dite bole🫣-🥵🤤💦",
"oii-🥺🥹-ek chamoch valobasha diba-🤏🏻🙂",
"-apnar sundori bandhobi ke fitra hisebe amar boss **HOON** ke dan korun-🥱🐰🍒",
"-o mim o mim-😇-tumi keno churi korla sadiar forsha howar cream-🌚🤧",
"-onumoti dilam-propose kor boss **Hoon** ke-🐸😾🔪",
"-gays-🤗-jouboner kosom diye amare blackmail kora hocche-🥲🤦‍♂️🤧",
"-oii anti-🙆‍♂️-tomar meye chokh mare-🥺🥴🐸",
"takai acho keno chumu diba-🙄🐸😘",
"ajke propose kore dekho raji hoye jamu-😌🤗😇",
"-amar golpo te tomar nani sera-🙊🙆‍♂️🤗",
"ki bepar apni shoshur bari jacchen na keno-🤔🥱🌻",
"din sheshe porer bow sundor-☹️🤧",
"-tabiz koira hoileo frame ekkan kormui tate ja hoi hok-🤧🥱🌻",
"-chotobela vebechilam biye korle automatic baccha hoy-🥱-oma ekhon dekhi kahini onnorokom-😦🙂🌻",
"-aj ekta bin nei bole facebook er nagin gulo re amar boss **HOON** dhorte partese na-🐸🥲",
"-chumu thakte tora biri khas keno bujha amare-😑😒🐸⚒️",
"—je chere geche-😔-take vule jao-🙂-amar boss **hoon** er sathe prem kore take dekhie dao-🙈🐸🤗",
"—hajaro luchcha luchchir bhire-🙊🥵amar boss **HOON** ek nispap valo manush-🥱🤗🙆‍♂️",
"-ruper ohongkar koro na-🙂❤️chokchoke surjo tao din sheshe ondhokare porinoto hoy-🤗💜",
"sundor maiya manei-🥱amar boss **HOON** er bou-😽🫶ar baki gulo amar beyain-🙈🐸🤗",
"eto ohongkar kore lav nei-🌸mrityuta nishchit sudhu shomoyta onishchit-🖤🙂",
"-din din kichu manusher kache opriyo hoye jaitesi-🙂😿🌸",
"hudai amare shoytane lare-😝😑☹️",
"-I LOVE YOU-😽-ahare vabcho tomare propose korchi-🥴-thappar diya kidney lock kore dib-😒-vul pora ber kore dibo-🤭🐸",
"-ami ekta dudher shishu-😇-YOU🐸💦",
"-koto din hoye gelo bichanay muti na-😿-miss you nengta kal-🥺🤧",
"-balika-do you-biya me-😽-ami tomake ammu hoite shahajjo korbo-🙈🥱",
"-ei antir meye-🫢🙈-ummmmmmmah-😽🫶-asolei to shad-🥵💦-eto shad keno-🤔-sei shad-😋",
"-iss keu jodi bolto-🙂-amar sudhu tomakei lagbe-💜🌸",
"-oi bedi tomar basay na amar boss **HOON** meye dekhte gese-🙃-nasta anaros ar dudh diso-🙄🤦‍♂️-boin koilei to hoy boyfriend ase-🥺🤦‍♂-amar boss **HOON** ke jane marar ki dorkar-🙄🤧",
"-ekdin she thik e fire takabe-😇-ar muchki hese bolbe or moto ar keu valobasheni-🙂😅",
"-hudai group e asi-🥺🐸-keu inbox e knock diye bole na jaan tomare ami onek valobashi-🥺🤧",
"ki re group e dekhi ektao bedi nai-🤦‍🥱💦",
"-desher shob kichui churi hocche-🙄-sudhu amar boss **HOON** er monta chara-🥴😑😏",
"-🫵tomare prochur vallage-😽-shomoy moto propose kormu bujhso-🔨😼-seat khali raikho- 🥱🐸🥵",
"-aj theke ar kauke patta dimu na-😏-karon ami forsha howar cream kinsi-🙂🐸"
];
    // 👉 random picker
    const getRandomReply = () =>
      replies[Math.floor(Math.random() * replies.length)];

    // exact trigger
    if (triggers.includes(lower)) {
      const reply = toBoldFont(getRandomReply());

      api.sendMessage(
        reply,
        event.threadID,
        (err, info) => {
          if (!err) {
            global.GoatBot.onReply.set(info.messageID, {
              commandName: "bot",
              author: event.senderID,
              text: reply
            });
          }
        },
        event.messageID
      );

      return;
    }

    // trigger + message
    for (const t of triggers) {
      if (lower.startsWith(t + " ")) {
        const userText = text.slice(t.length).trim();
        const reply = await chat(userText);

        api.sendMessage(
          reply,
          event.threadID,
          (err, info) => {
            if (!err) {
              global.GoatBot.onReply.set(info.messageID, {
                commandName: "bot",
                author: event.senderID,
                text: reply
              });
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
