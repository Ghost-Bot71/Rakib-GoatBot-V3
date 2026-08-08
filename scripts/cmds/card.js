const fs = require("fs-extra");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");

const CARD_DATA_PATH = path.join(__dirname, "cardData.json");

function loadCardData() {
  if (!fs.existsSync(CARD_DATA_PATH)) fs.writeJsonSync(CARD_DATA_PATH, {});
  return fs.readJsonSync(CARD_DATA_PATH);
}

function saveCardData(data) {
  fs.writeJsonSync(CARD_DATA_PATH, data, { spaces: 2 });
}

function generateCardNumber() {
  const groups = Array.from({ length: 4 }, () =>
    Math.floor(1000 + Math.random() * 9000)
  );
  return groups.join(" ");
}

function generateCVV() {
  return String(Math.floor(100 + Math.random() * 900));
}

function getExpiry() {
  const now = new Date();
  const yr = (now.getFullYear() + 4).toString().slice(-2);
  const mn = String(now.getMonth() + 1).padStart(2, "0");
  return `${mn}/${yr}`;
}

function getCardType(uid) {
  const n = parseInt(uid.toString().slice(-1));
  if (n <= 3) return { type: "VISA", color: ["#1a237e", "#283593"], logo: "💳 VISA" };
  if (n <= 6) return { type: "MASTERCARD", color: ["#b71c1c", "#c62828"], logo: "💳 MC" };
  return { type: "BANK CARD", color: ["#1b5e20", "#2e7d32"], logo: "🏦 BANK" };
}

async function drawCard(uid, name, balance, cardNumber, cvv, expiry, cardType) {
  const W = 760, H = 440;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");

  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, cardType.color[0]);
  grad.addColorStop(1, cardType.color[1]);
  ctx.fillStyle = grad;
  roundRect(ctx, 0, 0, W, H, 30);
  ctx.fill();

  ctx.fillStyle = "rgba(255,255,255,0.07)";
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.arc(W - 80 + i * 30, H / 2, 180 + i * 40, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = "rgba(255,255,255,0.12)";
  ctx.beginPath();
  ctx.arc(600, 80, 160, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(680, 350, 100, 0, Math.PI * 2);
  ctx.fill();

  const chipGrad = ctx.createLinearGradient(60, 150, 130, 220);
  chipGrad.addColorStop(0, "#ffd700");
  chipGrad.addColorStop(1, "#b8860b");
  ctx.fillStyle = chipGrad;
  roundRect(ctx, 60, 150, 70, 55, 8);
  ctx.fill();
  ctx.strokeStyle = "#c8a000";
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(60, 172); ctx.lineTo(130, 172); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(60, 187); ctx.lineTo(130, 187); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(60, 202); ctx.lineTo(130, 202); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(88, 150); ctx.lineTo(88, 205); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(103, 150); ctx.lineTo(103, 205); ctx.stroke();

  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.font = "bold 32px Arial";
  ctx.fillText(cardType.logo, 60, 80);

  ctx.fillStyle = "rgba(255,255,255,0.95)";
  ctx.font = "bold 28px 'Courier New'";
  ctx.letterSpacing = "3px";
  ctx.fillText(cardNumber, 60, 290);

  ctx.fillStyle = "rgba(255,255,255,0.6)";
  ctx.font = "14px Arial";
  ctx.fillText("CARD HOLDER", 60, 340);
  ctx.fillText("EXPIRES", 420, 340);
  ctx.fillText("CVV", 600, 340);

  ctx.fillStyle = "rgba(255,255,255,0.95)";
  ctx.font = "bold 20px Arial";
  const shortName = name.length > 20 ? name.slice(0, 20).toUpperCase() : name.toUpperCase();
  ctx.fillText(shortName, 60, 370);
  ctx.fillText(expiry, 420, 370);
  ctx.fillText(cvv, 600, 370);

  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.font = "13px Arial";
  ctx.fillText("💰 Balance: $" + Number(balance).toLocaleString(), 60, 420);

  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.font = "bold 22px Arial";
  ctx.textAlign = "right";
  ctx.fillText("GHOST BOT", W - 40, H - 20);
  ctx.textAlign = "left";

  return canvas.toBuffer("image/png");
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

module.exports = {
  config: {
    name: "card",
    aliases: ["mycard", "visa", "mastercard", "bankcard"],
    version: "2.0",
    author: "Rakib Islam",
    countDown: 10,
    role: 0,
    shortDescription: "💳 Virtual Bank Card — Visa / Mastercard / Bank",
    longDescription: "Generate your virtual bank card. Admin can set/add money for anyone.",
    category: "💰 Economy",
    guide: {
      en: [
        "{pn} — Show your card",
        "{pn} @mention — Show someone's card",
        "━━━━━━━━━━━━━━━━",
        "👑 ADMIN ONLY:",
        "{pn} setmoney @user [amount] — Set exact balance",
        "{pn} addmoney @user [amount] — Add money to balance",
        "{pn} resetcard @user — Reset someone's card",
        "{pn} setall [amount] — Set everyone's balance",
        "{pn} addall [amount] — Add money to everyone"
      ].join("\n")
    }
  },

  onStart: async function ({ api, event, args, usersData, message }) {
    const { senderID, threadID, messageID, mentions } = event;
    const isAdmin = global.GoatBot.config.adminBot.includes(senderID);
    const cacheDir = path.join(__dirname, "cache");
    await fs.ensureDir(cacheDir);

    const cardData = loadCardData();
    const cmd = args[0]?.toLowerCase();

    const ensureCard = async (uid) => {
      if (!cardData[uid]) {
        let name = "Ghost User";
        try { name = await usersData.getName(uid); } catch {}
        const ct = getCardType(uid);
        cardData[uid] = {
          cardNumber: generateCardNumber(),
          cvv: generateCVV(),
          expiry: getExpiry(),
          type: ct.type,
          balance: 0
        };
        saveCardData(cardData);
      }
      return cardData[uid];
    };

    if (cmd === "setmoney" || cmd === "addmoney") {
      if (!isAdmin) return message.reply("❌ শুধু Admin এই command ব্যবহার করতে পারবে!");
      const targetID = Object.keys(mentions)[0] ||
        (event.messageReply?.senderID) || args[1];
      if (!targetID) return message.reply("❌ User mention করুন বা UID দিন।");
      const amount = parseInt(args[Object.keys(mentions).length ? 1 : 2]);
      if (isNaN(amount) || amount < 0) return message.reply("❌ Valid amount দিন।");
      await ensureCard(targetID);
      let name = "User";
      try { name = await usersData.getName(targetID); } catch {}
      if (cmd === "setmoney") {
        cardData[targetID].balance = amount;
        await usersData.set(targetID, { money: amount });
      } else {
        cardData[targetID].balance = (cardData[targetID].balance || 0) + amount;
        const cur = await usersData.get(targetID, "money");
        await usersData.set(targetID, { money: (cur || 0) + amount });
      }
      saveCardData(cardData);
      return message.reply(
        `✅ ${cmd === "setmoney" ? "Set" : "Added"} $${amount.toLocaleString()} ${cmd === "addmoney" ? "to" : "for"} ${name}\n` +
        `💰 New Balance: $${cardData[targetID].balance.toLocaleString()}`
      );
    }

    if (cmd === "resetcard") {
      if (!isAdmin) return message.reply("❌ শুধু Admin এই command ব্যবহার করতে পারবে!");
      const targetID = Object.keys(mentions)[0] || event.messageReply?.senderID;
      if (!targetID) return message.reply("❌ User mention করুন।");
      let name = "User";
      try { name = await usersData.getName(targetID); } catch {}
      const ct = getCardType(targetID);
      cardData[targetID] = {
        cardNumber: generateCardNumber(),
        cvv: generateCVV(),
        expiry: getExpiry(),
        type: ct.type,
        balance: 0
      };
      saveCardData(cardData);
      await usersData.set(targetID, { money: 0 });
      return message.reply(`✅ ${name} এর card reset করা হয়েছে।`);
    }

    if (cmd === "setall" || cmd === "addall") {
      if (!isAdmin) return message.reply("❌ শুধু Admin এই command ব্যবহার করতে পারবে!");
      const amount = parseInt(args[1]);
      if (isNaN(amount) || amount < 0) return message.reply("❌ Valid amount দিন।");
      const allUsers = await usersData.getAll();
      let count = 0;
      for (const u of allUsers) {
        const uid = u.userID;
        await ensureCard(uid);
        if (cmd === "setall") {
          cardData[uid].balance = amount;
          await usersData.set(uid, { money: amount });
        } else {
          cardData[uid].balance = (cardData[uid].balance || 0) + amount;
          const cur = await usersData.get(uid, "money");
          await usersData.set(uid, { money: (cur || 0) + amount });
        }
        count++;
      }
      saveCardData(cardData);
      return message.reply(
        `✅ ${cmd === "setall" ? "Set" : "Added"} $${amount.toLocaleString()} for ALL ${count} users!\n` +
        `👑 Admin: Done!`
      );
    }

    let targetID = Object.keys(mentions)[0] || event.messageReply?.senderID || senderID;
    const card = await ensureCard(targetID);

    let name = "Ghost User";
    try { name = await usersData.getName(targetID); } catch {}

    const walletMoney = await usersData.get(targetID, "money").catch(() => 0);
    card.balance = walletMoney || card.balance || 0;
    saveCardData(cardData);

    const ct = getCardType(targetID);
    api.setMessageReaction("💳", messageID, () => {}, true);

    const imgBuffer = await drawCard(
      targetID, name, card.balance,
      card.cardNumber, card.cvv, card.expiry, ct
    );

    const imgPath = path.join(cacheDir, `card_${targetID}.png`);
    fs.writeFileSync(imgPath, imgBuffer);

    await api.sendMessage(
      {
        body:
          `💳 𝗩𝗜𝗥𝗧𝗨𝗔𝗟 𝗕𝗔𝗡𝗞 𝗖𝗔𝗥𝗗\n` +
          `━━━━━━━━━━━━━━━━\n` +
          `👤 Name: ${name}\n` +
          `💳 Type: ${card.type}\n` +
          `💰 Balance: $${Number(card.balance).toLocaleString()}\n` +
          `🔢 Card: ${card.cardNumber}\n` +
          `📅 Expires: ${card.expiry}\n` +
          `━━━━━━━━━━━━━━━━\n` +
          `🔐 CVV hidden for security`,
        attachment: fs.createReadStream(imgPath)
      },
      threadID,
      () => { try { fs.unlinkSync(imgPath); } catch {} },
      messageID
    );
    api.setMessageReaction("✅", messageID, () => {}, true);
  }
};
