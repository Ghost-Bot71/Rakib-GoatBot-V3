"use strict";
const { PassThrough } = require("stream");
const path = require("path");
const fs   = require("fs-extra");

function fmtFull(n) { return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","); }
function fmt(n) {
  if (n>=1e9) return (n/1e9).toFixed(2)+"B";
  if (n>=1e6) return (n/1e6).toFixed(2)+"M";
  if (n>=1e3) return (n/1e3).toFixed(1)+"K";
  return n.toString();
}

// ── Pixel helpers ─────────────────────────────────────────────────────────────
function px(D,W,x,y,r,g,b,a=255) {
  if(x<0||y<0||x>=W) return;
  const i=(y*W+x)*4;
  D[i]=r;D[i+1]=g;D[i+2]=b;D[i+3]=a;
}
function rect(D,W,x,y,w,h,[r,g,b,a=255]) {
  for(let py=y;py<y+h;py++) for(let pxv=x;pxv<x+w;pxv++) px(D,W,pxv,py,r,g,b,a);
}
function border(D,W,x,y,w,h,[r,g,b],t=1) {
  for(let i=0;i<t;i++){
    for(let p=x+i;p<x+w-i;p++){px(D,W,p,y+i,r,g,b);px(D,W,p,y+h-1-i,r,g,b);}
    for(let p=y+i;p<y+h-i;p++){px(D,W,x+i,p,r,g,b);px(D,W,x+w-1-i,p,r,g,b);}
  }
}
function hGrad(D,W,x,y,w,h,r1,g1,b1,r2,g2,b2) {
  for(let py=y;py<y+h;py++) for(let pxv=x;pxv<x+w;pxv++){
    const t=(pxv-x)/w;
    rect(D,W,pxv,py,1,1,[Math.round(r1+(r2-r1)*t),Math.round(g1+(g2-g1)*t),Math.round(b1+(b2-b1)*t)]);
  }
}
function vGrad(D,W,x,y,w,h,r1,g1,b1,r2,g2,b2) {
  for(let py=y;py<y+h;py++) for(let pxv=x;pxv<x+w;pxv++){
    const t=(py-y)/h;
    px(D,W,pxv,py,Math.round(r1+(r2-r1)*t),Math.round(g1+(g2-g1)*t),Math.round(b1+(b2-b1)*t));
  }
}

const GOLD=[218,165,32], CYAN=[0,220,200], BG=[8,8,22], DK=[18,16,40], WHITE=[220,220,220];
const RANK_COLS=[[255,200,0],[180,180,190],[205,127,50],[100,160,255],[100,160,255]];

// ── Mini bitmap font (5×7 uppercase + digits) ─────────────────────────────────
const BFONT = {
  '0':[14,17,19,21,25,17,14],'1':[4,12,4,4,4,4,14],'2':[14,17,1,6,8,16,31],
  '3':[14,17,1,6,1,17,14],'4':[2,6,10,18,31,2,2],'5':[31,16,30,1,1,17,14],
  '6':[6,8,30,17,17,17,14],'7':[31,1,2,4,8,8,8],'8':[14,17,17,14,17,17,14],
  '9':[14,17,17,15,1,2,12],'A':[4,10,17,31,17,17,17],'B':[30,17,17,30,17,17,30],
  'C':[14,17,16,16,16,17,14],'D':[30,9,9,9,9,9,30],'E':[31,16,16,28,16,16,31],
  'F':[31,16,16,28,16,16,16],'G':[14,17,16,23,17,17,14],'H':[17,17,17,31,17,17,17],
  'I':[14,4,4,4,4,4,14],'J':[7,2,2,2,2,18,12],'K':[17,18,20,24,20,18,17],
  'L':[16,16,16,16,16,16,31],'M':[17,27,21,17,17,17,17],'N':[17,25,21,19,17,17,17],
  'O':[14,17,17,17,17,17,14],'P':[30,17,17,30,16,16,16],'Q':[14,17,17,17,21,18,13],
  'R':[30,17,17,30,20,18,17],'S':[14,17,16,14,1,17,14],'T':[31,4,4,4,4,4,4],
  'U':[17,17,17,17,17,17,14],'V':[17,17,17,17,17,10,4],'W':[17,17,17,21,21,21,10],
  'X':[17,17,10,4,10,17,17],'Y':[17,17,10,4,4,4,4],'Z':[31,1,2,4,8,16,31],
  '.':[0,0,0,0,0,6,6],',':[0,0,0,0,6,6,4],'!':[4,4,4,4,4,0,4],
  '#':[10,10,31,10,31,10,10],'=':[0,0,31,0,31,0,0],' ':[0,0,0,0,0,0,0],
  '+':[0,4,4,31,4,4,0],'-':[0,0,0,31,0,0,0],'/': [1,2,2,4,8,8,16],
  '(':[6,8,16,16,16,8,6],')':[12,2,1,1,1,2,12],'@':[14,17,17,23,21,22,13],
  '%':[24,25,2,4,8,19,3],'B':[30,17,17,30,17,17,30],'K':[17,18,20,24,20,18,17],
  'M':[17,27,21,17,17,17,17]
};

function drawStr(D,W,x,y,[r,g,b],text,scale=1) {
  let cx=x;
  for(const c of text.toUpperCase()){
    const rows=BFONT[c]||BFONT[' '];
    rows.forEach((row,ry)=>{
      for(let bit=4;bit>=0;bit--){
        if(row&(1<<bit)){
          for(let sy=0;sy<scale;sy++) for(let sx=0;sx<scale;sx++)
            px(D,W,cx+(4-bit)*scale+sx,y+ry*scale+sy,r,g,b);
        }
      }
    });
    cx+=5*scale+scale;
  }
  return cx;
}

// ── Build leaderboard image ───────────────────────────────────────────────────
async function buildLeaderboard(users, page, totalPages, start, totalMoney) {
  try {
    const { Jimp } = require("jimp");
    const W = 560, ROW_H = 28, TOP = 110, FOOTER = 50;
    const H = TOP + users.length * ROW_H + FOOTER + 10;

    const img = new Jimp({ width: W, height: H });
    const D = img.bitmap.data;

    // Background gradient
    vGrad(D,W,0,0,W,H, 8,8,22, 15,10,35);

    // ── Header gradient bar ─────────────────────────────────────────────────
    hGrad(D,W,0,0,W,TOP, 30,20,80, 80,10,50);
    border(D,W,0,0,W,TOP,GOLD,2);

    // Trophy icon (pixel art)
    const tX=22,tY=15;
    rect(D,W,tX,tY,24,4,[[218,165,32]]); // top of cup
    rect(D,W,tX+2,tY+4,20,14,GOLD);      // cup body
    rect(D,W,tX+4,tY+18,16,4,GOLD);      // stem
    rect(D,W,tX,tY+22,28,4,GOLD);        // base
    rect(D,W,tX-4,tY+4,4,10,GOLD);       // left handle
    rect(D,W,tX+24,tY+4,4,10,GOLD);      // right handle

    drawStr(D,W,60,12,GOLD,"TOP BALANCE LEADERBOARD",2);
    drawStr(D,W,60,30,WHITE,"GHOST NET ECONOMY",2);
    drawStr(D,W,60,48,[180,180,180],"PAGE "+page+"/"+totalPages,1);
    drawStr(D,W,180,48,[180,180,180],"TOTAL: "+fmt(totalMoney),1);

    // Column headers
    rect(D,W,0,TOP-24,W,24,[25,20,55]);
    border(D,W,0,TOP-24,W,24,CYAN,1);
    drawStr(D,W, 8,TOP-19,CYAN,"RANK",1);
    drawStr(D,W,75,TOP-19,CYAN,"NAME",1);
    drawStr(D,W,360,TOP-19,CYAN,"BALANCE",1);
    drawStr(D,W,480,TOP-19,CYAN,"SHORT",1);

    // ── Rows ───────────────────────────────────────────────────────────────
    users.forEach((u, i) => {
      const rank = start + i + 1;
      const ry = TOP + i * ROW_H;
      const col = rank<=3 ? RANK_COLS[rank-1] : (i%2===0?[20,18,45]:[24,20,50]);

      // Row background
      rect(D,W,0,ry,W,ROW_H-1, rank<=3?[30,25,10]:[i%2===0?[20,18,45]:null]||[20,18,45]);

      // Rank bar accent (left stripe)
      const accentCol = rank<=3?RANK_COLS[rank-1]:[60,60,120];
      rect(D,W,0,ry,4,ROW_H-1,accentCol);

      // Rank number
      drawStr(D,W,8,ry+8, rank<=3?RANK_COLS[rank-1]:WHITE, "#"+rank, 1);

      // Name (truncated)
      const name = (u.name||"Unknown").slice(0,18).toUpperCase();
      drawStr(D,W,75,ry+8, rank<=3?RANK_COLS[rank-1]:WHITE, name, 1);

      // Balance full
      drawStr(D,W,355,ry+8, GOLD, fmtFull(u.money||0).slice(0,12), 1);

      // Balance short
      drawStr(D,W,480,ry+8, CYAN, fmt(u.money||0), 1);

      // Row separator
      rect(D,W,0,ry+ROW_H-1,W,1,[30,28,60]);
    });

    // ── Footer ─────────────────────────────────────────────────────────────
    const fy = TOP + users.length*ROW_H + 10;
    hGrad(D,W,0,fy,W,FOOTER-10, 30,20,80, 80,10,50);
    border(D,W,0,fy,W,FOOTER-10,GOLD,1);
    drawStr(D,W,10,fy+5,GOLD,"GHOST BOT",1);
    drawStr(D,W,150,fy+5,[180,180,180],"RAKIB ISLAM",1);
    drawStr(D,W,360,fy+5,CYAN,".TOPBAL "+(page+1<totalPages?" NEXT PAGE":"LAST PAGE"),1);

    // ── Save + stream ───────────────────────────────────────────────────────
    const CACHE = path.join(__dirname,"cache");
    await fs.ensureDir(CACHE);
    const out = path.join(CACHE,"topbal_"+Date.now()+".png");
    await img.write(out);
    return out;
  } catch { return null; }
}

// ── Module ────────────────────────────────────────────────────────────────────
module.exports = {
  config: {
    name: "topbal",
    aliases: ["richlist","toprich","balboard","topbalance"],
    version: "4.0",
    author: "Rakib Islam",
    countDown: 10,
    role: 0,
    shortDescription: "🏆 Top Balance Leaderboard — Card Image",
    longDescription: "Stylish leaderboard card image. .topbal 2 for next page.",
    category: "economy",
    guide: { en: "{pn} — Top 1-30\n{pn} 2 — Next page\n{pn} me — Your rank" }
  },

  onStart: async function ({ message, event, usersData, args }) {
    const { senderID } = event;

    // ── .topbal me ─────────────────────────────────────────────────────────
    if (args[0] === "me") {
      try {
        const allData = await usersData.getAll();
        const sorted = allData.sort((a,b)=>(b.money||0)-(a.money||0));
        const myRank = sorted.findIndex(u=>u.userID==senderID)+1;
        const myData = sorted[myRank-1];
        return message.reply(
          `📊 তোমার Rank:\n` +
          `━━━━━━━━━━━━━━━━━━\n` +
          `👤 ${myData?.name||"Unknown"}\n` +
          `🏅 Rank : #${myRank} / ${sorted.length}\n` +
          `💰 Balance: ৳${fmtFull(myData?.money||0)}\n` +
          `━━━━━━━━━━━━━━━━━━`
        );
      } catch { return message.reply("❌ Rank দেখতে সমস্যা।"); }
    }

    // ── Pagination ──────────────────────────────────────────────────────────
    let page = 1;
    if (args[0]==="next") {
      const st=global._topbalPage||{};
      page=(st[senderID]||1)+1;
    } else if (args[0]&&!isNaN(args[0])) {
      page=parseInt(args[0]);
    }
    if (!global._topbalPage) global._topbalPage={};
    global._topbalPage[senderID]=page;

    const perPage=30, start=(page-1)*perPage;

    try {
      await message.reaction("⏳", event.messageID);
      const allData = await usersData.getAll();
      if (!allData?.length) return message.reply("❌ এখনো কোনো user data নেই।");

      const sorted = allData
        .filter(u=>u&&typeof u.money!=="undefined")
        .sort((a,b)=>(b.money||0)-(a.money||0));

      const totalPages=Math.ceil(sorted.length/perPage);
      if (page>totalPages) return message.reply(`❌ Page ${page} নেই! মোট ${totalPages} page।`);

      const slice = sorted.slice(start, start+perPage);
      const totalMoney = sorted.reduce((s,u)=>s+(u.money||0),0);

      // ── Text fallback ──────────────────────────────────────────────────
      const lines = slice.map((u,i)=>{
        const rank=start+i+1;
        const medal=rank<=3?["🥇","🥈","🥉"][rank-1]:`${rank}.`;
        return `${medal} ${(u.name||"?").slice(0,20)} — ৳${fmt(u.money||0)}`;
      }).join("\n");

      const header =
        `🏆 ══ 𝗧𝗢𝗣 𝗕𝗔𝗟𝗔𝗡𝗖𝗘 ══ 🏆\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `📑 Page ${page}/${totalPages}  |  #${start+1}–#${Math.min(start+perPage,sorted.length)}\n` +
        `💎 Total Economy: ৳${fmt(totalMoney)}\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      const footer =
        `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        (page<totalPages?`📌 Next: .topbal ${page+1}\n`:`📌 শেষ page!\n`) +
        `👤 Your rank: .topbal me\n🤖 Ghost Net`;

      const body = header+lines+footer;

      // ── Generate card image ─────────────────────────────────────────────
      const imgPath = await buildLeaderboard(slice, page, totalPages, start, totalMoney);
      await message.reaction("✅", event.messageID);

      if (imgPath && fs.existsSync(imgPath)) {
        const stream = fs.createReadStream(imgPath);
        stream.on("close", ()=>{ try{fs.unlinkSync(imgPath);}catch{} });
        return message.reply({ body, attachment: stream });
      }
      return message.reply(body);

    } catch { return message.reply("❌ Leaderboard দেখতে সমস্যা।"); }
  }
};
