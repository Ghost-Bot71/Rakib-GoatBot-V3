/**
 * help.js — Ghost Net Help Menu
 * Anime image: Sung Jinwoo, Naruto, Sasuke, Madara, Obito — rotating every call
 * Images fetched live from Jikan (MAL API) — 100% free, no key
 */
const axios = require("axios");
const { commands, aliases } = global.GoatBot;
const { getPrefix } = global.utils;

const OWNER_UID = "61582040799720";
const OWNER_FB  = `fb.com/profile.php?id=${OWNER_UID}`;

const ICONS = {
  "info": "💡", "fun": "🎪", "game": "🎮", "system": "⚙️", "prank": "🃏",
  "image": "🖼️", "anime": "🌸", "media": "🎬", "admin": "👑", "box chat": "💬",
  "owner": "🎀", "music": "🎵", "free fire": "🔫", "utility": "🛠️",
  "ai": "🤖", "love": "💕", "custom": "💎", "ghost net": "👻",
  "18+": "🔞", "without prefix": "🚫", "rank": "🏆", "noprefix": "🚫",
  "marry": "💍", "information": "📋", "image generator": "🎨",
  "image generator 2": "🖌️", "economy": "💰", "convert": "🔄",
  "tools": "🔧", "chat": "💬", "group": "👥", "no prefix": "🚫",
  "বাংলা": "🇧🇩", "utility-bd": "🔧", "game-bd": "🕹️",
  "social": "🤝", "info-bd": "📚", "text-tools": "✍️"
};

const PAGE2_CATS = ["বাংলা", "utility-bd", "game-bd", "social", "info-bd", "text-tools"];

// ═══════════════════════════════════════════════════════════
// ANIME CHARACTER POOL — rotates Jinwoo → Naruto → Sasuke → Madara → Obito
// Uses Jikan v4 (MAL API, free, no key) for fresh images every time.
// Direct fallback URLs in case API is slow.
// ═══════════════════════════════════════════════════════════
const ANIME_POOL = [
  {
    name: "💜 Sung Jinwoo",
    label: "𝗦𝘂𝗻𝗴 𝗝𝗶𝗻𝘄𝗼𝗼 — 𝗦𝗼𝗹𝗼 𝗟𝗲𝘃𝗲𝗹𝗶𝗻𝗴",
    jikanId: 193459,        // MAL character ID for Sung Jin-Woo
    fallback: "https://cdn.myanimelist.net/images/characters/14/516668.jpg"
  },
  {
    name: "🌀 Naruto",
    label: "𝗡𝗮𝗿𝘂𝘁𝗼 𝗨𝘇𝘂𝗺𝗮𝗸𝗶 — 𝗡𝗮𝗿𝘂𝘁𝗼",
    jikanId: 17,            // confirmed MAL ID
    fallback: "https://cdn.myanimelist.net/images/characters/2/284121.jpg"
  },
  {
    name: "⚡ Sasuke",
    label: "𝗦𝗮𝘀𝘂𝗸𝗲 𝗨𝗰𝗵𝗶𝗵𝗮 — 𝗡𝗮𝗿𝘂𝘁𝗼",
    jikanId: 13,            // confirmed MAL ID
    fallback: "https://cdn.myanimelist.net/images/characters/9/131317.jpg"
  },
  {
    name: "🔥 Madara",
    label: "𝗠𝗮𝗱𝗮𝗿𝗮 𝗨𝗰𝗵𝗶𝗵𝗮 — 𝗡𝗮𝗿𝘂𝘁𝗼",
    jikanId: 17082,
    fallback: "https://cdn.myanimelist.net/images/characters/7/284947.jpg"
  },
  {
    name: "👁️ Obito",
    label: "𝗢𝗯𝗶𝘁𝗼 𝗨𝗰𝗵𝗶𝗵𝗮 — 𝗡𝗮𝗿𝘂𝘁𝗼",
    jikanId: 13069,
    fallback: "https://cdn.myanimelist.net/images/characters/11/303952.jpg"
  }
];

// Rotate index based on current time (changes every 3 minutes)
let _lastCharIdx = -1;
function nextCharacter() {
  _lastCharIdx = (_lastCharIdx + 1) % ANIME_POOL.length;
  return ANIME_POOL[_lastCharIdx];
}

async function getAnimeImageUrl(char) {
  try {
    const res = await axios.get(
      `https://api.jikan.moe/v4/characters/${char.jikanId}/pictures`,
      { timeout: 6000 }
    );
    const pics = res.data?.data;
    if (pics && pics.length > 0) {
      // Pick a random picture from the character's gallery
      const pick = pics[Math.floor(Math.random() * Math.min(pics.length, 5))];
      return pick?.jpg?.large_image_url || pick?.jpg?.image_url || char.fallback;
    }
  } catch {}
  return char.fallback;
}

module.exports = {
  config: {
    name: "help",
    version: "5.0",
    author: "Rakib Islam",
    countDown: 3,
    role: 0,
    shortDescription: { en: "𝗛𝗲𝗹𝗽 𝗠𝗲𝗻𝘂 — 𝗔𝗻𝗶𝗺𝗲 𝗘𝗱𝗶𝘁𝗶𝗼𝗻 🌸" },
    longDescription: { en: "Ghost Net all-in-one command list with rotating anime character cards" },
    category: "info",
    guide: { en: "{p}help [command | 1 | 2]" },
    priority: 1
  },

  onStart: async function ({ message, args, event, role }) {
    const prefix = getPrefix(event.threadID);

    // Show specific command info
    if (args.length && isNaN(args[0]) && !["all", "list", "cat"].includes(args[0].toLowerCase())) {
      const q = args[0].toLowerCase();
      const cmd = commands.get(q) || commands.get(aliases.get(q));
      if (cmd) return showCmd(message, cmd, prefix);
      return message.reply(`❌ 𝗖𝗼𝗺𝗺𝗮𝗻𝗱 "${args[0]}" 𝗽𝗮𝗼𝘄𝗮 𝘆𝗮𝘆𝗻𝗶!\n💡 𝗦𝗯 𝗰𝗼𝗺𝗺𝗮𝗻𝗱𝘀: ${prefix}help`);
    }

    const pageNum = args[0] === "2" ? 2 : 1;

    const cats = {};
    for (const [name, cmd] of commands) {
      if (cmd.config.role > 1 && role < cmd.config.role) continue;
      const c = (cmd.config.category || "uncategorized").toLowerCase();
      // Hide 18+ category from non-admins (role < 2)
      if (c === "18+" && role < 2) continue;
      (cats[c] = cats[c] || []).push(name);
    }

    let filteredCats = {};
    if (pageNum === 2) {
      for (const c of PAGE2_CATS) {
        if (cats[c]) filteredCats[c] = cats[c];
      }
    } else {
      for (const [c, v] of Object.entries(cats)) {
        if (!PAGE2_CATS.includes(c)) filteredCats[c] = v;
      }
    }

    const p2count = PAGE2_CATS.reduce((s, c) => s + (cats[c] || []).length, 0);
    const totalCmds = commands.size;

    // Pick rotating anime character
    const char = nextCharacter();
    const imageUrl = await getAnimeImageUrl(char);

    let msg = "";

    if (pageNum === 1) {
      msg += `╔══════════════════════╗\n`;
      msg += `║   👻 𝗚𝗛𝗢𝗦𝗧 𝗡𝗘𝗧 𝗛𝗘𝗟𝗣   ║\n`;
      msg += `╚══════════════════════╝\n\n`;
      msg += `  ✦ 𝗣𝗿𝗲𝗳𝗶𝘅    ›  ${prefix}\n`;
      msg += `  ✦ 𝗖𝗼𝗺𝗺𝗮𝗻𝗱𝘀  ›  ${totalCmds} টি\n`;
      msg += `  ✦ 𝗣𝗮𝗴𝗲      ›  1 / 2\n`;
      msg += `  ✦ 𝗕𝗗 𝗖𝗺𝗱𝘀   ›  ${prefix}help 2\n`;
      msg += `\n`;
      msg += `┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄\n`;
      msg += `  ${char.label}\n`;
      msg += `┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄\n`;
    } else {
      msg += `╔══════════════════════╗\n`;
      msg += `║  🇧🇩 𝗕𝗗 𝗖𝗼𝗺𝗺𝗮𝗻𝗱𝘀    ║\n`;
      msg += `╚══════════════════════╝\n\n`;
      msg += `  ✦ 𝗣𝗿𝗲𝗳𝗶𝘅   ›  ${prefix}\n`;
      msg += `  ✦ 𝗕𝗗 𝗖𝗺𝗱𝘀 ›  ${p2count} টি\n`;
      msg += `  ✦ 𝗣𝗮𝗴𝗲    ›  2 / 2\n`;
      msg += `  ✦ 𝗠𝗮𝗶𝗻    ›  ${prefix}help 1\n`;
      msg += `\n`;
      msg += `┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄\n`;
      msg += `  ${char.label}\n`;
      msg += `┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄\n`;
    }

    const sortedCats = Object.keys(filteredCats).sort();
    for (const c of sortedCats) {
      const icon = ICONS[c] || "🌟";
      const list = filteredCats[c].sort();
      msg += `\n${icon} 𝗖𝗔𝗧: ${c.toUpperCase()}\n`;
      msg += `${"─".repeat(22)}\n`;
      for (let i = 0; i < list.length; i += 3) {
        const row = list.slice(i, i + 3);
        msg += `${row.map(r => `› ${r}`).join("  ")}\n`;
      }
    }

    msg += `\n┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄\n`;
    msg += `💡 ${prefix}help <command> — command info\n`;
    msg += `👤 𝗢𝘄𝗻𝗲𝗿: Rakib Islam\n`;
    msg += `🔗 ${OWNER_FB}`;

    try {
      const imgStream = await global.utils.getStreamFromURL(imageUrl);
      return message.reply({ body: msg, attachment: imgStream });
    } catch {
      return message.reply(msg);
    }
  }
};

function showCmd(message, cmd, prefix) {
  const c = cmd.config;
  const guide = typeof c.guide === "string" ? c.guide : (c.guide?.en || "—");
  const sd = typeof c.shortDescription === "string" ? c.shortDescription : (c.shortDescription?.en || "—");
  const al = (c.aliases || []).join(", ") || "—";
  const roles = ["👤 𝗨𝘀𝗲𝗿", "🔧 𝗠𝗼𝗱", "👑 𝗔𝗱𝗺𝗶𝗻", "💎 𝗢𝘄𝗻𝗲𝗿"];

  return message.reply(
`╔════════════════════╗
║   🎀 𝗖𝗼𝗺𝗺𝗮𝗻𝗱 𝗜𝗻𝗳𝗼  ║
╚════════════════════╝

  🍭 𝗡𝗮𝗺𝗲     ›  ${c.name}
  🔖 𝗔𝗹𝗶𝗮𝘀𝗲𝘀  ›  ${al}
  📂 𝗖𝗮𝘁𝗲𝗴𝗼𝗿𝘆 ›  ${c.category || "—"}
  ✏️  𝗔𝘂𝘁𝗵𝗼𝗿   ›  ${c.author || "—"}
  🔐 𝗥𝗼𝗹𝗲     ›  ${roles[c.role || 0]}
  ⏳ 𝗖𝗼𝗼𝗹𝗱𝗼𝘄𝗻 ›  ${c.countDown || 0}s

┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄

  📝 ${sd}

  💡 𝗨𝘀𝗮𝗴𝗲:
  ${guide.replace(/\{p\}|\{pn\}/g, prefix + c.name + " ")}

┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄
👻 𝗚𝗵𝗼𝘀𝘁 𝗡𝗲𝘁 𝗘𝗱𝗶𝘁𝗶𝗼𝗻`
  );
}
