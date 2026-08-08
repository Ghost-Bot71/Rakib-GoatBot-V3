"use strict";
const axios = require("axios");
const { PassThrough } = require("stream");

const SYMBOLS = ["🍒","🍋","🍊","🔔","⭐","💎","7️⃣","🎯"];

function fmt(n) {
  if (n>=1e9) return (n/1e9).toFixed(1)+"B";
  if (n>=1e6) return (n/1e6).toFixed(1)+"M";
  if (n>=1e3) return (n/1e3).toFixed(0)+"K";
  return n.toString();
}

function parseAmt(str) {
  if (!str) return NaN;
  str = str.toLowerCase().replace(/,/g,"");
  if (str.endsWith("b")) return parseFloat(str)*1e9;
  if (str.endsWith("m")) return parseFloat(str)*1e6;
  if (str.endsWith("k")) return parseFloat(str)*1e3;
  return parseFloat(str);
}

function spinResult() {
  const s = () => SYMBOLS[Math.floor(Math.random()*SYMBOLS.length)];
  const win = Math.random() < 0.50;
  if (!win) {
    let a,b,c; do{a=s();b=s();c=s();}while(a===b||b===c||a===c);
    return [a,b,c,0,"😢 No Match"];
  }
  const r = Math.random();
  if (r < 0.05) return ["7️⃣","7️⃣","7️⃣",20,"🎊 JACKPOT! 20x"];
  if (r < 0.12) return ["💎","💎","💎",10,"💎 Triple Diamond! 10x"];
  if (r < 0.25) { const x=s(); return [x,x,x,5,`🎯 Triple! 5x`]; }
  const x=s(),pos=Math.floor(Math.random()*3); let o; do{o=s();}while(o===x);
  const a=pos===0?[o,x,x]:pos===1?[x,o,x]:[x,x,o];
  return [...a,2,"✅ Double! 2x"];
}

const GIF = "https://media.tenor.com/IgGxBTDLWGsAAAAC/slot-machine-casino.gif";

module.exports = {
  config: {
    name: "slot", aliases: ["slots"],
    version: "4.0", author: "Rakib Islam",
    countDown: 5, role: 0,
    shortDescription: "🎰 Slot Machine — 50/50",
    category: "game",
    guide: { en: "{pn} <amount> | .slot 50K | .slot 1M" }
  },
  onStart: async function ({ message, event, usersData, args }) {
    const { senderID } = event;
    const bet = Math.round(parseAmt(args[0]));

    if (!bet || isNaN(bet) || bet <= 0) {
      try {
        const r = await axios.get(GIF, { responseType:"arraybuffer", timeout:6000 });
        const st = new PassThrough(); st.end(Buffer.from(r.data));
        return message.reply({ body:"🎰 .slot <amount>\nExample: .slot 50K | .slot 1M\n\n7️⃣7️⃣7️⃣=20x 💎💎💎=10x ⭐⭐⭐=5x ✅✅=2x", attachment:st });
      } catch { return message.reply("🎰 .slot <amount>  |  Example: .slot 50K"); }
    }

    if (bet < 1000)  return message.reply("❌ Min bet: 1K");
    if (bet > 1e9) return message.reply("❌ Max bet: 1B");

    try {
      let ud = await usersData.get(senderID);
      let bal = ud?.money ?? 0;
      if (bal <= 0) { bal=5_000_000; await usersData.addMoney(senderID,bal); }
      if (bal < bet) return message.reply(`❌ Balance কম! তোমার: ${fmt(bal)} | Bet: ${fmt(bet)}`);

      const [s1,s2,s3,mult,res] = spinResult();
      let newBal;
      if (mult>0) { await usersData.addMoney(senderID,bet*mult-bet); newBal=bal-bet+bet*mult; }
      else { await usersData.subtractMoney(senderID,bet); newBal=bal-bet; }

      const body =
        `🎰 ${s1} │ ${s2} │ ${s3}\n` +
        `${res}\n` +
        `💰 ${fmt(bet)} → ${mult>0?`+${fmt(bet*(mult-1))}`:`-${fmt(bet)}`}\n` +
        `📊 Bal: ${fmt(Math.max(0,newBal))}`;

      try {
        const r = await axios.get(GIF, { responseType:"arraybuffer", timeout:6000 });
        const st = new PassThrough(); st.end(Buffer.from(r.data));
        return message.reply({ body, attachment:st });
      } catch { return message.reply(body); }
    } catch { return message.reply("❌ Error, try again."); }
  }
};
