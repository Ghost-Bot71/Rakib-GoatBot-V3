const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const VOICES = {
  en:  { se: "Salli",    gtl: "en",    label: "🇬🇧 English"    },
  bn:  { se: "Joanna",   gtl: "bn",    label: "🇧🇩 Bengali"    },
  ja:  { se: "Mizuki",   gtl: "ja",    label: "🇯🇵 Japanese"   },
  ko:  { se: "Seoyeon",  gtl: "ko",    label: "🇰🇷 Korean"     },
  hi:  { se: "Aditi",    gtl: "hi",    label: "🇮🇳 Hindi"      },
  zh:  { se: "Zhiyu",    gtl: "zh-CN", label: "🇨🇳 Chinese"    },
  es:  { se: "Penelope", gtl: "es",    label: "🇪🇸 Spanish"    },
  fr:  { se: "Celine",   gtl: "fr",    label: "🇫🇷 French"     },
  de:  { se: "Marlene",  gtl: "de",    label: "🇩🇪 German"     },
  ar:  { se: "Zeina",    gtl: "ar",    label: "🇸🇦 Arabic"     },
  ru:  { se: "Tatyana",  gtl: "ru",    label: "🇷🇺 Russian"    },
  pt:  { se: "Vitoria",  gtl: "pt",    label: "🇧🇷 Portuguese" },
  it:  { se: "Carla",    gtl: "it",    label: "🇮🇹 Italian"    },
  tr:  { se: "Filiz",    gtl: "tr",    label: "🇹🇷 Turkish"    },
  nl:  { se: "Lotte",    gtl: "nl",    label: "🇳🇱 Dutch"      },
  id:  { se: "Salli",    gtl: "id",    label: "🇮🇩 Indonesian" },
  th:  { se: "Salli",    gtl: "th",    label: "🇹🇭 Thai"       },
  vi:  { se: "Salli",    gtl: "vi",    label: "🇻🇳 Vietnamese"  },
  ur:  { se: "Aditi",    gtl: "ur",    label: "🇵🇰 Urdu"       },
  ms:  { se: "Salli",    gtl: "ms",    label: "🇲🇾 Malay"      },
};

const LANG_NAMES = {
  english: "en", bangla: "bn", bengali: "bn", বাংলা: "bn", বাঙলা: "bn",
  japanese: "ja", japan: "ja", anime: "ja",
  korean: "ko", korea: "ko",
  hindi: "hi", india: "hi",
  chinese: "zh", china: "zh",
  spanish: "es", spain: "es",
  french: "fr", france: "fr",
  german: "de", germany: "de",
  arabic: "ar", arab: "ar",
  russian: "ru", russia: "ru",
  portuguese: "pt", brazil: "pt",
  italian: "it", italy: "it",
  turkish: "tr", turkey: "tr",
  dutch: "nl",
  indonesian: "id", indonesia: "id",
  thai: "th", thailand: "th",
  vietnamese: "vi", vietnam: "vi",
  urdu: "ur", pakistan: "ur",
  malay: "ms", malaysia: "ms",
};

async function tryStreamElements(text, voice) {
  const url = `https://api.streamelements.com/kappa/v2/speech?voice=${voice}&text=${encodeURIComponent(text)}`;
  const res = await axios.get(url, {
    responseType: "arraybuffer",
    timeout: 12000,
    headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" }
  });
  return Buffer.from(res.data);
}

async function tryGoogleTTS(text, lang) {
  const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=${lang}&client=tw-ob&ttsspeed=0.87`;
  const res = await axios.get(url, {
    responseType: "arraybuffer",
    timeout: 12000,
    headers: {
      "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Mobile Safari/537.36",
      "Referer": "https://translate.google.com/"
    }
  });
  return Buffer.from(res.data);
}

async function tryTikTokTTS(text, lang) {
  const voiceMap = { en: "en_us_002", ja: "jp_001", ko: "kr_002", fr: "fr_001", de: "de_001", es: "es_002", pt: "pt_001", id: "id_001" };
  const v = voiceMap[lang] || "en_us_002";
  const res = await axios.post("https://tiktok-tts.weilbyte.net/api/generate", { text, voice: v }, {
    responseType: "arraybuffer", timeout: 10000
  });
  return Buffer.from(res.data);
}

module.exports = {
  config: {
    name: "anivoice",
    aliases: ["anitts", "anisay", "animesay", "voicegirl", "av"],
    version: "4.0",
    author: "Rakib Islam",
    countDown: 5,
    role: 0,
    shortDescription: "🎙️ Anime girl voice — 20 languages",
    longDescription: "Real anime girl TTS voice in 20+ languages. Uses StreamElements + Google TTS + TikTok TTS as fallback.",
    category: "anime",
    guide: {
      en: [
        "{pn} [lang] [text]",
        "Example: {pn} en Hello I am an anime girl",
        "Example: {pn} ja こんにちは",
        "Example: {pn} bn আমি একটি অ্যানিমে মেয়ে",
        "Example: {pn} ko 안녕하세요",
        "{pn} list — সব language দেখুন"
      ].join("\n")
    }
  },

  onStart: async function ({ api, event, args, message }) {
    const cacheDir = path.join(__dirname, "cache");
    await fs.ensureDir(cacheDir);

    if (!args[0] || args[0].toLowerCase() === "list") {
      const list = Object.entries(VOICES)
        .map(([code, v], i) => `${String(i + 1).padStart(2, "0")}▸ .av ${code} [text] — ${v.label}`)
        .join("\n");
      return message.reply(
        `🎙️ 𝗔𝗡𝗜𝗠𝗘 𝗚𝗜𝗥𝗟 𝗩𝗢𝗜𝗖𝗘 — 𝗔𝗟𝗟 𝗟𝗔𝗡𝗚𝗨𝗔𝗚𝗘𝗦\n` +
        `━━━━━━━━━━━━━━━━━━━\n${list}\n` +
        `━━━━━━━━━━━━━━━━━━━\n` +
        `📌 Usage: .anivoice [lang] [text]\n` +
        `📌 Example: .anivoice ja こんにちは\n` +
        `📌 Example: .anivoice bn আমি বট Ghost Bot`
      );
    }

    const rawLang = args[0].toLowerCase().trim();
    const langCode = VOICES[rawLang] ? rawLang : (LANG_NAMES[rawLang] || null);
    const textParts = args.slice(1).join(" ").trim();

    if (!langCode || !VOICES[langCode]) {
      return message.reply(
        `❌ Language বুঝতে পারিনি: "${args[0]}"\n\n` +
        `✅ Code দিয়ে try করো:\n.av bn [text] — Bangla\n.av en [text] — English\n.av ja [text] — Japanese\n\nসব দেখতে: .av list`
      );
    }
    if (!textParts) {
      return message.reply(`❌ Text দিন!\nExample: .anivoice ${langCode} Hello`);
    }
    if (textParts.length > 200) {
      return message.reply("❌ Text অনেক বড়! সর্বোচ্চ 200 character দিন।");
    }

    const { se, gtl, label } = VOICES[langCode];
    api.setMessageReaction("🎙️", event.messageID, () => {}, true);

    const outPath = path.join(cacheDir, `av_${Date.now()}.mp3`);
    let audioBuffer = null;
    let usedSource = "";

    try {
      audioBuffer = await tryStreamElements(textParts, se);
      usedSource = "StreamElements";
    } catch (_) {
      try {
        audioBuffer = await tryGoogleTTS(textParts, gtl);
        usedSource = "Google TTS";
      } catch (_2) {
        try {
          audioBuffer = await tryTikTokTTS(textParts, langCode);
          usedSource = "TikTok TTS";
        } catch (_3) {
          api.setMessageReaction("❌", event.messageID, () => {}, true);
          return message.reply("❌ Voice service সাময়িকভাবে unavailable। কিছুক্ষণ পর আবার try করুন।");
        }
      }
    }

    await fs.writeFile(outPath, audioBuffer);

    const preview = textParts.length > 60 ? textParts.slice(0, 60) + "..." : textParts;
    await api.sendMessage(
      {
        body: `🎙️ Anime Girl Voice\n🌍 Language: ${label}\n💬 Text: "${preview}"`,
        attachment: fs.createReadStream(outPath)
      },
      event.threadID,
      () => { try { fs.unlinkSync(outPath); } catch {} },
      event.messageID
    );
    api.setMessageReaction("✅", event.messageID, () => {}, true);
  }
};
