module.exports = {
  config: {
    name: "font",
    version: "1.0",
    author: "Rakib",
    countDown: 5,
    role: 0,
    category: "utility",
    guide: {
      en:
`font list
font <number> <text>

Example:
font 1 hello
font 2 Rakib`
    }
  },

  onStart: async function ({ message, args }) {

    if (!args[0]) {
      return message.reply(
        "❌ | Use:\nfont list\nfont <number> <text>"
      );
    }

    const fonts = getFonts();

    /* ================= LIST ================= */

    if (args[0].toLowerCase() === "list") {

  let msg = `✨ you'r font list\n\n`;

  fonts.forEach((font, index) => {

    const styledName = font.convert(font.name);

    msg += `${index + 1}. ${styledName}\n`;

  });

  return message.reply(msg.trim());
}

    /* ================= CONVERT ================= */

    const fontNumber = parseInt(args[0]);

    if (
      isNaN(fontNumber) ||
      fontNumber < 1 ||
      fontNumber > fonts.length
    ) {
      return message.reply(
        "❌ | Invalid font number."
      );
    }

    const text = args.slice(1).join(" ");

    if (!text) {
      return message.reply(
        "❌ | Please provide text."
      );
    }

    const selectedFont = fonts[fontNumber - 1];

    const result = selectedFont.convert(text);

    return message.reply(result);

  }
};

/* ================= FONTS ================= */

function getFonts() {

  return [

    {
      name: "Bold",
      convert: boldFont
    },

    {
      name: "Italic",
      convert: italicFont
    },

    {
      name: "Mono",
      convert: monoFont
    },

    {
      name: "Script",
      convert: scriptFont
    },

    {
      name: "Bubble",
      convert: bubbleFont
    },

    {
      name: "Tiny",
      convert: tinyFont
    },

    {
      name: "Fullwidth",
      convert: fullWidthFont
    },

    {
      name: "Squared",
      convert: squaredFont
    },

    {
      name: "Circled",
      convert: circledFont
    }

  ];

}

/* ================= FONT FUNCTIONS ================= */

function boldFont(text) {

  const chars = {
    A:"𝐀",B:"𝐁",C:"𝐂",D:"𝐃",E:"𝐄",
    F:"𝐅",G:"𝐆",H:"𝐇",I:"𝐈",J:"𝐉",
    K:"𝐊",L:"𝐋",M:"𝐌",N:"𝐍",O:"𝐎",
    P:"𝐏",Q:"𝐐",R:"𝐑",S:"𝐒",T:"𝐓",
    U:"𝐔",V:"𝐕",W:"𝐖",X:"𝐗",Y:"𝐘",
    Z:"𝐙",

    a:"𝐚",b:"𝐛",c:"𝐜",d:"𝐝",e:"𝐞",
    f:"𝐟",g:"𝐠",h:"𝐡",i:"𝐢",j:"𝐣",
    k:"𝐤",l:"𝐥",m:"𝐦",n:"𝐧",o:"𝐨",
    p:"𝐩",q:"𝐪",r:"𝐫",s:"𝐬",t:"𝐭",
    u:"𝐮",v:"𝐯",w:"𝐰",x:"𝐱",y:"𝐲",
    z:"𝐳",

    0:"𝟎",1:"𝟏",2:"𝟐",3:"𝟑",4:"𝟒",
    5:"𝟓",6:"𝟔",7:"𝟕",8:"𝟖",9:"𝟗"
  };

  return convertText(text, chars);
}

function italicFont(text) {

  const chars = {
    A:"𝘈",B:"𝘉",C:"𝘊",D:"𝘋",E:"𝘌",
    F:"𝘍",G:"𝘎",H:"𝘏",I:"𝘐",J:"𝘑",
    K:"𝘒",L:"𝘓",M:"𝘔",N:"𝘕",O:"𝘖",
    P:"𝘗",Q:"𝘘",R:"𝘙",S:"𝘚",T:"𝘛",
    U:"𝘜",V:"𝘝",W:"𝘞",X:"𝘟",Y:"𝘠",
    Z:"𝘡",

    a:"𝘢",b:"𝘣",c:"𝘤",d:"𝘥",e:"𝘦",
    f:"𝘧",g:"𝘨",h:"𝘩",i:"𝘪",j:"𝘫",
    k:"𝘬",l:"𝘭",m:"𝘮",n:"𝘯",o:"𝘰",
    p:"𝘱",q:"𝘲",r:"𝘳",s:"𝘴",t:"𝘵",
    u:"𝘶",v:"𝘷",w:"𝘸",x:"𝘹",y:"𝘺",
    z:"𝘻"
  };

  return convertText(text, chars);
}

function monoFont(text) {

  const chars = {
    A:"𝙰",B:"𝙱",C:"𝙲",D:"𝙳",E:"𝙴",
    F:"𝙵",G:"𝙶",H:"𝙷",I:"𝙸",J:"𝙹",
    K:"𝙺",L:"𝙻",M:"𝙼",N:"𝙽",O:"𝙾",
    P:"𝙿",Q:"𝚀",R:"𝚁",S:"𝚂",T:"𝚃",
    U:"𝚄",V:"𝚅",W:"𝚆",X:"𝚇",Y:"𝚈",
    Z:"𝚉",

    a:"𝚊",b:"𝚋",c:"𝚌",d:"𝚍",e:"𝚎",
    f:"𝚏",g:"𝚐",h:"𝚑",i:"𝚒",j:"𝚓",
    k:"𝚔",l:"𝚕",m:"𝚖",n:"𝚗",o:"𝚘",
    p:"𝚙",q:"𝚚",r:"𝚛",s:"𝚜",t:"𝚝",
    u:"𝚞",v:"𝚟",w:"𝚠",x:"𝚡",y:"𝚢",
    z:"𝚣"
  };

  return convertText(text, chars);
}

function scriptFont(text) {

  const chars = {
    A:"𝒜",B:"𝐵",C:"𝒞",D:"𝒟",E:"𝐸",
    F:"𝐹",G:"𝒢",H:"𝐻",I:"𝐼",J:"𝒥",
    K:"𝒦",L:"𝐿",M:"𝑀",N:"𝒩",O:"𝒪",
    P:"𝒫",Q:"𝒬",R:"𝑅",S:"𝒮",T:"𝒯",
    U:"𝒰",V:"𝒱",W:"𝒲",X:"𝒳",Y:"𝒴",
    Z:"𝒵",

    a:"𝒶",b:"𝒷",c:"𝒸",d:"𝒹",e:"𝑒",
    f:"𝒻",g:"𝑔",h:"𝒽",i:"𝒾",j:"𝒿",
    k:"𝓀",l:"𝓁",m:"𝓂",n:"𝓃",o:"𝑜",
    p:"𝓅",q:"𝓆",r:"𝓇",s:"𝓈",t:"𝓉",
    u:"𝓊",v:"𝓋",w:"𝓌",x:"𝓍",y:"𝓎",
    z:"𝓏"
  };

  return convertText(text, chars);
}

function bubbleFont(text) {
  return text.replace(/[A-Za-z]/g, c =>
    String.fromCodePoint(
      c <= "Z"
        ? 0x1F150 + (c.charCodeAt(0) - 65)
        : 0x1F150 + (c.charCodeAt(0) - 97)
    )
  );
}

function tinyFont(text) {

  const chars = {
    a:"ᵃ",b:"ᵇ",c:"ᶜ",d:"ᵈ",e:"ᵉ",
    f:"ᶠ",g:"ᵍ",h:"ʰ",i:"ᶦ",j:"ʲ",
    k:"ᵏ",l:"ˡ",m:"ᵐ",n:"ⁿ",o:"ᵒ",
    p:"ᵖ",q:"ᑫ",r:"ʳ",s:"ˢ",t:"ᵗ",
    u:"ᵘ",v:"ᵛ",w:"ʷ",x:"ˣ",y:"ʸ",
    z:"ᶻ"
  };

  return convertText(text.toLowerCase(), chars);
}

function fullWidthFont(text) {

  return text.replace(/[A-Za-z0-9]/g, c =>
    String.fromCharCode(c.charCodeAt(0) + 0xFEE0)
  );
}

function squaredFont(text) {

  const chars = {
    A:"🄰",B:"🄱",C:"🄲",D:"🄳",E:"🄴",
    F:"🄵",G:"🄶",H:"🄷",I:"🄸",J:"🄹",
    K:"🄺",L:"🄻",M:"🄼",N:"🄽",O:"🄾",
    P:"🄿",Q:"🅀",R:"🅁",S:"🅂",T:"🅃",
    U:"🅄",V:"🅅",W:"🅆",X:"🅇",Y:"🅈",
    Z:"🅉"
  };

  return convertText(text.toUpperCase(), chars);
}

function circledFont(text) {

  const chars = {
    A:"Ⓐ",B:"Ⓑ",C:"Ⓒ",D:"Ⓓ",E:"Ⓔ",
    F:"Ⓕ",G:"Ⓖ",H:"Ⓗ",I:"Ⓘ",J:"Ⓙ",
    K:"Ⓚ",L:"Ⓛ",M:"Ⓜ",N:"Ⓝ",O:"Ⓞ",
    P:"Ⓟ",Q:"Ⓠ",R:"Ⓡ",S:"Ⓢ",T:"Ⓣ",
    U:"Ⓤ",V:"Ⓥ",W:"Ⓦ",X:"Ⓧ",Y:"Ⓨ",
    Z:"Ⓩ",

    a:"ⓐ",b:"ⓑ",c:"ⓒ",d:"ⓓ",e:"ⓔ",
    f:"ⓕ",g:"ⓖ",h:"ⓗ",i:"ⓘ",j:"ⓙ",
    k:"ⓚ",l:"ⓛ",m:"ⓜ",n:"ⓝ",o:"ⓞ",
    p:"ⓟ",q:"ⓠ",r:"ⓡ",s:"ⓢ",t:"ⓣ",
    u:"ⓤ",v:"ⓥ",w:"ⓦ",x:"ⓧ",y:"ⓨ",
    z:"ⓩ"
  };

  return convertText(text, chars);
}

/* ================= COMMON ================= */

function convertText(text, chars) {

  return text.replace(/[A-Za-z0-9]/g, char => {
    return chars[char] || char;
  });

    }
