const fs = require("fs-extra");
const path = require("path");
const GHOST = fs.readJsonSync(path.join(__dirname, "../../ghostConfig.json"));

function generatePassword(length = 12, opts = {}) {
  let chars = "";
  if (opts.upper !== false) chars += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  if (opts.lower !== false) chars += "abcdefghijklmnopqrstuvwxyz";
  if (opts.numbers !== false) chars += "0123456789";
  if (opts.symbols) chars += "!@#$%^&*()_+-=[]{}|;:,.<>?";
  if (!chars) chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let pwd = "";
  for (let i = 0; i < length; i++) pwd += chars[Math.floor(Math.random() * chars.length)];
  return pwd;
}

function checkStrength(pwd) {
  let score = 0;
  if (pwd.length >= 8) score++;
  if (pwd.length >= 12) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[a-z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  if (score <= 2) return { label: "দুর্বল 🔴", bar: "██░░░░░░░░" };
  if (score <= 4) return { label: "মাঝারি 🟡", bar: "█████░░░░░" };
  return { label: "শক্তিশালী 🟢", bar: "██████████" };
}

module.exports = {
  config: {
    name: "password",
    aliases: ["pass", "pwd", "genpass"],
    version: "1.0",
    author: "Rakib Islam",
    countDown: 3,
    role: 0,
    shortDescription: "Secure password তৈরি করো",
    longDescription: "যেকোনো ধরনের secure password generate করো",
    category: "utility",
    guide: "{pn} [length] [--symbols] [--numbers-only] [--letters-only]",
  },

  onStart: async function ({ args, message }) {
    let length = parseInt(args[0]) || 12;
    if (length < 4) length = 4;
    if (length > 64) length = 64;

    const hasSymbols = args.includes("--symbols") || args.includes("-s");
    const numbersOnly = args.includes("--numbers-only") || args.includes("-n");
    const lettersOnly = args.includes("--letters-only") || args.includes("-l");

    let opts = { upper: true, lower: true, numbers: true, symbols: hasSymbols };
    if (numbersOnly) opts = { upper: false, lower: false, numbers: true, symbols: false };
    if (lettersOnly) opts = { upper: true, lower: true, numbers: false, symbols: false };

    const pwd1 = generatePassword(length, opts);
    const pwd2 = generatePassword(length, opts);
    const pwd3 = generatePassword(length, opts);
    const strength = checkStrength(pwd1);

    return message.reply(
      `🔐 𝗣𝗮𝘀𝘀𝘄𝗼𝗿𝗱 𝗚𝗲𝗻𝗲𝗿𝗮𝘁𝗼𝗿\n` +
      `━━━━━━━━━━━━━━━━━\n\n` +
      `🔑 Option 1: ${pwd1}\n` +
      `🔑 Option 2: ${pwd2}\n` +
      `🔑 Option 3: ${pwd3}\n\n` +
      `📊 Strength: ${strength.label}\n` +
      `${strength.bar}\n\n` +
      `📏 Length: ${length} characters\n` +
      `🔠 Uppercase: ${opts.upper ? "✅" : "❌"}\n` +
      `🔡 Lowercase: ${opts.lower ? "✅" : "❌"}\n` +
      `🔢 Numbers: ${opts.numbers ? "✅" : "❌"}\n` +
      `🔣 Symbols: ${opts.symbols ? "✅" : "❌"}\n\n` +
      `━━━━━━━━━━━━━━━━━\n` +
      `💡 Tips:\n` +
      `.password 16 --symbols (symbols সহ)\n` +
      `.password 8 --numbers-only (শুধু numbers)\n\n` +
      `⚠️ কাউকে share করো না!\n` +
      `👻 Ghost Bot — ${GHOST.ownerName}`
    );
  }
};
