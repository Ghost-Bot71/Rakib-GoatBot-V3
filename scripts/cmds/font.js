const { loadOwner } = require("../../rakib/customId/ownerUid");

module.exports = {
  config: {
    name: "font",
    version: "2.0",
    author: "Rakib",
    countDown: 5,
    role: 0,
    category: "utility",
    guide: {
      en: `font list
font <number> <text>

Example:
font 1 hello
font 2 Rakib`
    }
  },

  onStart: async function ({ api, event, message, args }) {
    try {
      // 🔒 Owner Check (dynamic)
      const ownerUID = await loadOwner();
      const senderID = String(event?.senderID || message?.senderID);
      
      const isOwner = Array.isArray(ownerUID)
        ? ownerUID.includes(senderID)
        : String(ownerUID) === senderID;

      if (!isOwner) {
        return (message?.reply || api.sendMessage)("❌ you'are not allowed this cmd", event.threadID, event.messageID);
      }

      if (!args[0]) {
        return message.reply(
`✨ FONT SYSTEM

font list
font <number> <text>

Example:
font 2 Rakib Hasan`
        );
      }

      const fonts = getFonts();

      /* ================= LIST ================= */
      if (args[0].toLowerCase() === "list") {
        let msg = "✨ AVAILABLE FONTS ✨\n\n";

        fonts.forEach((font, index) => {
          msg += `${index + 1}. ${font.preview}\n`;
        });

        msg += `\n📌 Example:\nfont 2 Rakib`;

        return message.reply(msg);
      }

      /* ================= CONVERT ================= */
      const fontNumber = parseInt(args[0]);

      if (
        isNaN(fontNumber) ||
        fontNumber < 1 ||
        fontNumber > fonts.length
      ) {
        return message.reply(`❌ Invalid Font Number\n\nUse: font list`);
      }

      const text = args.slice(1).join(" ");

      if (!text) {
        return message.reply("❌ Please provide text.");
      }

      const selectedFont = fonts[fontNumber - 1];
      return message.reply(selectedFont.convert(text));

    } catch (err) {
      console.error(err);
      return (message?.reply || api.sendMessage)("❌ An error occurred inside Font Command.", event.threadID, event.messageID);
    }
  }
};

/* ================= FONTS LIST ================= */
function getFonts() {
  return [
    { name: "Normal", preview: "Normal Text", convert: normalFont },
    { name: "Bold", preview: "𝐁𝐨𝐥𝐝 𝐓𝐞𝐱𝐭", convert: boldFont },
    { name: "Italic", preview: "𝘐𝘵𝘢𝘭𝘪𝘤 𝘛𝘦𝘹𝘵", convert: italicFont },
    { name: "Bold Italic", preview: "𝑩𝒐𝒍𝒅 𝑰𝒕𝒂𝒍𝒊𝒄", convert: boldItalicFont },
    { name: "Monospace", preview: "𝙼𝚘𝚗𝚘 𝚃𝚎𝚡𝚝", convert: monoFont },
    { name: "Script", preview: "𝒮𝒸𝓇𝒾𝓅𝓉 𝒯𝑒𝓍𝓉", convert: scriptFont },
    { name: "Bold Script", preview: "𝓑𝓸𝓵𝓭 𝓢𝓬𝓻𝓲𝓹𝓽", convert: boldScriptFont },
    { name: "Fraktur", preview: "𝔉𝔯𝔞𝔨𝔱𝔲𝔯", convert: frakturFont },
    { name: "Double Struck", preview: "Double Text", convert: doubleFont },
    { name: "Circled", preview: "Ⓒⓘⓡⓒⓛⓔⓓ", convert: circledFont },
    { name: "Squared", preview: "🅂🅀🅄🄰🅁🄴🄳", convert: squaredFont },
    { name: "Tiny", preview: "ᵀⁱⁿʸ ᵀᵉˣᵗ", convert: tinyFont },
    { name: "Full Width", preview: "Ｆｕｌｌ Ｗｉｄｔｈ", convert: fullWidthFont },
    { name: "Small Caps", preview: "Sᴍᴀʟʟ Cᴀᴘs", convert: smallCapsFont }
  ];
}

function convertText(text, chars) {
  return [...text]
    .map(char => chars[char] || char)
    .join("");
}
/* ================= FONT FUNCTIONS ================= */

function normalFont(text) {
  return text;
}

function boldFont(text) {
  return text.replace(/[A-Za-z0-9]/g, c => {
    const code = c.charCodeAt(0);
    if (code >= 65 && code <= 90) return String.fromCodePoint(0x1D400 + (code - 65));
    if (code >= 97 && code <= 122) return String.fromCodePoint(0x1D41A + (code - 97));
    if (code >= 48 && code <= 57) return String.fromCodePoint(0x1D7CE + (code - 48));
    return c;
  });
}

function italicFont(text) {
  return text.replace(/[A-Za-z]/g, c => {
    const code = c.charCodeAt(0);
    if (code >= 65 && code <= 90) return String.fromCodePoint(0x1D434 + (code - 65));
    if (code >= 97 && code <= 122) return String.fromCodePoint(0x1D44E + (code - 97));
    return c;
  });
}

function boldItalicFont(text) {
  return text.replace(/[A-Za-z]/g, c => {
    const code = c.charCodeAt(0);
    if (code >= 65 && code <= 90) return String.fromCodePoint(0x1D468 + (code - 65));
    if (code >= 97 && code <= 122) return String.fromCodePoint(0x1D482 + (code - 97));
    return c;
  });
}

function monoFont(text) {
  return text.replace(/[A-Za-z0-9]/g, c => {
    const code = c.charCodeAt(0);
    if (code >= 65 && code <= 90) return String.fromCodePoint(0x1D670 + (code - 65));
    if (code >= 97 && code <= 122) return String.fromCodePoint(0x1D68A + (code - 97));
    if (code >= 48 && code <= 57) return String.fromCodePoint(0x1D7F6 + (code - 48));
    return c;
  });
}

function scriptFont(text) {
  const map = {
    A:"𝒜",B:"ℬ",C:"𝒞",D:"𝒟",E:"ℰ",F:"ℱ",G:"𝒢",H:"ℋ",I:"ℐ",J:"𝒥",
    K:"𝒦",L:"ℒ",M:"ℳ",N:"𝒩",O:"𝒪",P:"𝒫",Q:"𝒬",R:"ℛ",S:"𝒮",T:"𝒯",
    U:"𝒰",V:"𝒱",W:"𝒲",X:"𝒳",Y:"𝒴",Z:"𝒵",
    a:"𝒶",b:"𝒷",c:"𝒸",d:"𝒹",e:"ℯ",f:"𝒻",g:"ℊ",h:"𝒽",i:"𝒾",j:"𝒿",
    k:"𝓀",l:"𝓁",m:"𝓂",n:"𝓃",o:"𝓸",p:"𝓅",q:"𝓆",r:"𝓇",s:"𝓈",t:"𝓉",
    u:"𝓊",v:"𝓋",w:"𝓌",x:"𝓍",y:"𝓎",z:"𝓏"
  };
  return convertText(text, map);
}

function boldScriptFont(text) {
  return text.replace(/[A-Za-z]/g, c => {
    const code = c.charCodeAt(0);
    if (code >= 65 && code <= 90) return String.fromCodePoint(0x1D4D0 + (code - 65));
    if (code >= 97 && code <= 122) return String.fromCodePoint(0x1D4EA + (code - 97));
    return c;
  });
}

function frakturFont(text) {
  const map = {
    A:"𝔄",B:"𝔅",C:"ℭ",D:"𝔇",E:"𝔈",F:"𝔉",G:"𝔊",H:"ℌ",I:"ℑ",J:"𝔍",
    K:"𝔎",L:"𝔏",M:"𝔐",N:"𝔑",O:"𝔒",P:"𝔓",Q:"𝔔",R:"ℜ",S:"𝔖",T:"𝔗",
    U:"𝔘",V:"𝔙",W:"𝔚",X:"𝔛",Y:"𝔜",Z:"ℨ",
    a:"𝔞",b:"𝔟",c:"𝔠",d:"𝔡",e:"𝔢",f:"𝔣",g:"𝔤",h:"𝔥",i:"𝔦",j:"𝔧",
    k:"𝔨",l:"𝔩",m:"𝔪",n:"𝔫",o:"𝔬",p:"𝔭",q:"𝔮",r:"𝔯",s:"𝔰",t:"𝔱",
    u:"𝔲",v:"𝔳",w:"𝔴",x:"𝔵",y:"𝔶",z:"𝔷"
  };
  return convertText(text, map);
}

function doubleFont(text) {
  const map = {
    A:"𝔸",B:"𝔹",C:"ℂ",D:"𝔻",E:"𝔼",F:"𝔽",G:"𝔾",H:"ℍ",I:"𝕀",J:"𝕁",
    K:"𝕂",L:"𝕃",M:"𝕄",N:"ℕ",O:"𝕆",P:"ℙ",Q:"ℚ",R:"ℝ",S:"𝕊",T:"𝕋",
    U:"𝕌",V:"𝕍",W:"𝕎",X:"𝕏",Y:"𝕐",Z:"ℤ",
    a:"𝕒",b:"𝕓",c:"𝕔",d:"𝕕",e:"𝕖",f:"𝕗",g:"𝕘",h:"𝕙",i:"𝕚",j:"𝕛",
    k:"𝕜",l:"𝕝",m:"𝕞",n:"𝕟",o:"𝕠",p:"𝕡",q:"𝕢",r:"𝕣",s:"𝕤",t:"𝕥",
    u:"𝕦",v:"𝕧",w:"𝕨",x:"𝕩",y:"𝕪",z:"𝕫",
    0:"𝟘",1:"𝟙",2:"𝟚",3:"𝟛",4:"𝟜",
    5:"𝟝",6:"𝟞",7:"𝟟",8:"𝟠",9:"𝟡"
  };
  return convertText(text, map);
}

function circledFont(text) {
  const map = {
    A:"Ⓐ",B:"Ⓑ",C:"Ⓒ",D:"Ⓓ",E:"Ⓔ",F:"Ⓕ",G:"Ⓖ",H:"Ⓗ",I:"Ⓘ",J:"Ⓙ",
    K:"Ⓚ",L:"Ⓛ",M:"Ⓜ",N:"Ⓝ",O:"Ⓞ",P:"Ⓟ",Q:"Ⓠ",R:"Ⓡ",S:"Ⓢ",T:"Ⓣ",
    U:"Ⓤ",V:"Ⓥ",W:"Ⓦ",X:"Ⓧ",Y:"Ⓨ",Z:"Ⓩ",
    a:"ⓐ",b:"ⓑ",c:"ⓒ",d:"ⓓ",e:"ⓔ",f:"ⓕ",g:"ⓖ",h:"ⓗ",i:"ⓘ",j:"ⓙ",
    k:"ⓚ",l:"ⓛ",m:"ⓜ",n:"ⓝ",o:"ⓞ",p:"ⓟ",q:"ⓠ",r:"ⓡ",s:"ⓢ",t:"ⓣ",
    u:"ⓤ",v:"ⓥ",w:"ⓦ",x:"ⓧ",y:"ⓨ",z:"ⓩ",
    0:"⓪",1:"①",2:"②",3:"③",4:"④",
    5:"⑤",6:"⑥",7:"⑦",8:"⑧",9:"⑨"
  };
  return convertText(text, map);
}

function squaredFont(text) {
  const map = {
    A:"🄰",B:"🄱",C:"🄲",D:"🄳",E:"🄴",F:"🄵",G:"🄶",H:"🄷",I:"🄸",J:"🄹",
    K:"🄺",L:"🄻",M:"🄼",N:"🄽",O:"🄾",P:"🄿",Q:"🅀",R:"🅁",S:"🅂",T:"🅃",
    U:"🅄",V:"🅅",W:"🅆",X:"🅇",Y:"🅈",Z:"🅉"
  };
  return convertText(text.toUpperCase(), map);
}

function tinyFont(text) {
  const map = {
    a:"ᵃ",b:"ᵇ",c:"ᶜ",d:"ᵈ",e:"ᵉ",f:"ᶠ",g:"ᵍ",h:"ʰ",i:"ᶦ",j:"ʲ",
    k:"ᵏ",l:"ˡ",m:"ᵐ",n:"ⁿ",o:"ᵒ",p:"ᵖ",q:"ᑫ",r:"ʳ",s:"ˢ",t:"ᵗ",
    u:"ᵘ",v:"ᵛ",w:"ʷ",x:"ˣ",y:"ʸ",z:"ᶻ",
    0:"⁰",1:"¹",2:"²",3:"³",4:"⁴",
    5:"⁵",6:"⁶",7:"⁷",8:"⁸",9:"⁹"
  };
  return convertText(text.toLowerCase(), map);
}
function fullWidthFont(text) {
  return text.replace(/[A-Za-z0-9]/g, c => {
    return String.fromCharCode(c.charCodeAt(0) + 65248);
  });
}

function smallCapsFont(text) {
  const map = {
    a:"ᴀ", b:"ʙ", c:"ᴄ", d:"ᴅ", e:"ᴇ",
    f:"ꜰ", g:"ɢ", h:"ʜ", i:"ɪ", j:"ᴊ",
    k:"ᴋ", l:"ʟ", m:"ᴍ", n:"ɴ", o:"ᴏ",
    p:"ᴘ", q:"ǫ", r:"ʀ", s:"ꜱ", t:"ᴛ",
    u:"ᴜ", v:"ᴠ", w:"ᴡ", x:"x", y:"ʏ", z:"ᴢ"
  };

  return text.replace(/[a-z]/gi, c =>
    map[c.toLowerCase()] || c
  );
        }
