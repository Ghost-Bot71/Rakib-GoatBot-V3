// ♟️ Chess — Image Board সহ দাবা খেলা
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// .chess          → বাংলায় গাইড
// .chess start    → নতুন game
// .chess move e2 e4 → চাল দাও
// .chess board    → board দেখো
// .chess resign   → হার মানো

"use strict";

const fs   = require("fs");
const path = require("path");

const CACHE_DIR = path.join(__dirname, "cache");
if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });

// ═══════════════════════════════════════════════════════════
//  IMAGE DRAWING  (jimp lazy-required inside function)
// ═══════════════════════════════════════════════════════════

function px(data, W, x, y, r, g, b, a = 255) {
  if (x < 0 || x >= W || y < 0) return;
  const i = (y * W + x) * 4;
  data[i] = r; data[i+1] = g; data[i+2] = b; data[i+3] = a;
}

function rect(data, W, x, y, w, h, r, g, b) {
  for (let dy = 0; dy < h; dy++)
    for (let dx = 0; dx < w; dx++)
      px(data, W, x+dx, y+dy, r, g, b);
}

function fillCirc(data, W, cx, cy, rad, r, g, b) {
  for (let dy = -rad; dy <= rad; dy++)
    for (let dx = -rad; dx <= rad; dx++)
      if (dx*dx + dy*dy <= rad*rad)
        px(data, W, cx+dx, cy+dy, r, g, b);
}

function ringCirc(data, W, cx, cy, rad, thick, r, g, b) {
  for (let t = 0; t < thick; t++) {
    const rr = rad - t; if (rr <= 0) break;
    let x = rr, y = 0, err = 0;
    while (x >= y) {
      for (const [px2, py2] of [[x,y],[-x,y],[x,-y],[-x,-y],[y,x],[-y,x],[y,-x],[-y,-x]])
        px(data, W, cx+px2, cy+py2, r, g, b);
      if (err <= 0) { y++; err += 2*y+1; }
      else          { x--; err -= 2*x+1; }
    }
  }
}

// Piece abbreviation symbols
const P_SYM = { K:"K", Q:"Q", R:"R", B:"B", N:"N", P:"P" };

async function makeBoardImage(board) {
  const { Jimp, loadFont } = require("jimp");

  const MAR  = 36;           // margin for labels
  const CELL = 72;           // pixels per square
  const SZ   = MAR + 8*CELL + MAR;  // 648

  const img = new Jimp({ width: SZ, height: SZ, color: 0x2c1810ff });
  const D   = img.bitmap.data;
  const W   = SZ;

  // Light/dark square colors
  const L = [0xf0,0xd9,0xb5], Dk = [0xb5,0x88,0x63];

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const sq = (row + col) % 2 === 0 ? Dk : L;
      rect(D, W, MAR+col*CELL, MAR+row*CELL, CELL, CELL, sq[0],sq[1],sq[2]);
    }
  }

  // Load fonts
  let font16w = null, font32w = null;
  try {
    const pnpm = path.join(__dirname, "../../node_modules/.pnpm");
    const dir  = fs.readdirSync(pnpm).find(d => d.startsWith("@jimp+plugin-print@"));
    if (dir) {
      const base = path.join(pnpm, dir, "node_modules/@jimp/plugin-print/dist/fonts/open-sans");
      font16w = await loadFont(path.join(base, "open-sans-16-white/open-sans-16-white.fnt"));
      font32w = await loadFont(path.join(base, "open-sans-32-white/open-sans-32-white.fnt"));
    }
  } catch (_) {}

  // Rank labels (1-8) on left
  if (font16w) {
    for (let row = 0; row < 8; row++) {
      const rank = String(8 - row);
      const py   = MAR + row*CELL + CELL/2 - 8;
      try { await img.print({ font: font16w, x: 10, y: Math.round(py), text: rank }); } catch (_) {}
    }
    // File labels (a-h) at bottom
    for (let col = 0; col < 8; col++) {
      const file = String.fromCharCode(97 + col);
      const px2  = MAR + col*CELL + CELL/2 - 5;
      const py2  = MAR + 8*CELL + 10;
      try { await img.print({ font: font16w, x: Math.round(px2), y: Math.round(py2), text: file }); } catch (_) {}
    }
  }

  // Pieces
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[7 - row][col]; // flip: row 0 of board = rank 1 = bottom
      if (!piece) continue;

      const cx = MAR + col*CELL + CELL/2;
      const cy = MAR + row*CELL + CELL/2;

      const isW = piece[0] === "w";
      const pType = piece[1];

      // Shadow
      fillCirc(D, W, cx+2, cy+2, 26, 0x00,0x00,0x00);

      if (isW) {
        // White piece: ivory fill, dark border
        fillCirc(D, W, cx, cy, 26, 0xff,0xf5,0xe8);
        ringCirc(D, W, cx, cy, 27, 3, 0x99,0x77,0x44);
      } else {
        // Black piece: dark fill, lighter border
        fillCirc(D, W, cx, cy, 26, 0x25,0x25,0x3a);
        ringCirc(D, W, cx, cy, 27, 3, 0x88,0x66,0x44);
      }

      // Piece letter
      const letter = P_SYM[pType] || pType;
      if (font32w) {
        const lx = cx - 10, ly = cy - 16;
        try {
          await img.print({ font: font32w, x: Math.round(lx), y: Math.round(ly), text: letter });
          // Tint letter to correct color
          const lr = isW ? 0x33 : 0xe8;
          const lg = isW ? 0x33 : 0xe0;
          const lb = isW ? 0x33 : 0xd0;
          for (let dy = -2; dy < 38; dy++) {
            for (let dx = -2; dx < 26; dx++) {
              const idx = ((Math.round(ly)+dy)*W + (Math.round(lx)+dx)) * 4;
              if (idx < 0 || idx >= D.length) continue;
              if (D[idx+3] > 80) {
                D[idx] = lr; D[idx+1] = lg; D[idx+2] = lb;
              }
            }
          }
        } catch (_) {}
      }
    }
  }

  return img.getBuffer("image/png");
}

// ═══════════════════════════════════════════════════════════
//  CHESS LOGIC
// ═══════════════════════════════════════════════════════════

const INIT_BOARD = () => [
  ["bR","bN","bB","bQ","bK","bB","bN","bR"],
  ["bP","bP","bP","bP","bP","bP","bP","bP"],
  [null,null,null,null,null,null,null,null],
  [null,null,null,null,null,null,null,null],
  [null,null,null,null,null,null,null,null],
  [null,null,null,null,null,null,null,null],
  ["wP","wP","wP","wP","wP","wP","wP","wP"],
  ["wR","wN","wB","wQ","wK","wB","wN","wR"],
];

const col  = p => p ? p[0] : null;
const type = p => p ? p[1] : null;
const ok   = (r,c) => r>=0 && r<8 && c>=0 && c<8;

function rawMoves(board, from, ep) {
  const p = board[from.row][from.col]; if (!p) return [];
  const c = col(p), t = type(p), moves = [];
  const add = (r,c2) => {
    if (!ok(r,c2)) return false;
    const tgt = board[r][c2];
    if (col(tgt) === c) return false;
    moves.push({row:r,col:c2});
    return !tgt;
  };
  const slide = (dr,dc) => { let r=from.row+dr,c2=from.col+dc; while(ok(r,c2)){if(!add(r,c2))break;r+=dr;c2+=dc;} };

  if (t==="P") {
    const dir=c==="w"?1:-1, sr=c==="w"?1:6;
    const r1=from.row+dir;
    if (ok(r1,from.col) && !board[r1][from.col]) {
      moves.push({row:r1,col:from.col});
      const r2=from.row+2*dir;
      if (from.row===sr && !board[r2][from.col]) moves.push({row:r2,col:from.col});
    }
    for (const dc of [-1,1]) {
      if (!ok(r1,from.col+dc)) continue;
      const tgt=board[r1][from.col+dc];
      if (tgt && col(tgt)!==c) moves.push({row:r1,col:from.col+dc});
      if (ep && ep.row===r1 && ep.col===from.col+dc) moves.push({row:r1,col:from.col+dc,ep:true});
    }
  }
  if (t==="N") for (const [dr,dc] of [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]]) add(from.row+dr,from.col+dc);
  if (t==="B"||t==="Q") for (const [dr,dc] of [[-1,-1],[-1,1],[1,-1],[1,1]]) slide(dr,dc);
  if (t==="R"||t==="Q") for (const [dr,dc] of [[-1,0],[1,0],[0,-1],[0,1]]) slide(dr,dc);
  if (t==="K") for (const [dr,dc] of [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]]) add(from.row+dr,from.col+dc);
  return moves;
}

function applyMove(board, from, to, promo="Q") {
  const nb = board.map(r=>[...r]);
  const p  = nb[from.row][from.col];
  nb[to.row][to.col] = p;
  nb[from.row][from.col] = null;
  if (to.ep) nb[from.row][to.col] = null;
  if (type(p)==="P" && (to.row===7||to.row===0)) nb[to.row][to.col]=col(p)+promo;
  return nb;
}

function inCheck(board, c, ep) {
  let kr=-1,kc=-1;
  for (let r=0;r<8;r++) for (let cc=0;cc<8;cc++) if(board[r][cc]===c+"K"){kr=r;kc=cc;}
  if (kr<0) return false;
  const opp=c==="w"?"b":"w";
  for (let r=0;r<8;r++) for (let cc=0;cc<8;cc++) {
    if (col(board[r][cc])!==opp) continue;
    if (rawMoves(board,{row:r,col:cc},ep).some(m=>m.row===kr&&m.col===kc)) return true;
  }
  return false;
}

function legalMoves(board, from, ep) {
  const c = col(board[from.row][from.col]);
  return rawMoves(board, from, ep).filter(to => !inCheck(applyMove(board,from,to), c, null));
}

function allLegal(board, c, ep) {
  const ms=[];
  for (let r=0;r<8;r++) for (let cc=0;cc<8;cc++) {
    if (col(board[r][cc])!==c) continue;
    for (const to of legalMoves(board,{row:r,col:cc},ep)) ms.push({from:{row:r,col:cc},to});
  }
  return ms;
}

const PV = {P:1,N:3,B:3,R:5,Q:9,K:0};
function evaluate(board) {
  let s=0;
  for (let r=0;r<8;r++) for (let c2=0;c2<8;c2++) {
    const p=board[r][c2]; if(!p) continue;
    s += p[0]==="b" ? PV[p[1]] : -PV[p[1]];
  }
  return s;
}

function botBest(board, ep) {
  const ms = allLegal(board,"b",ep);
  if (!ms.length) return null;
  let best=null, bestS=-Infinity;
  for (const m of ms) {
    const s = evaluate(applyMove(board,m.from,m.to));
    if (s > bestS) { bestS=s; best=m; }
  }
  return best;
}

function sqName(r,c) { return String.fromCharCode(97+c)+(r+1); }
function parseSquare(s) {
  if (!s||s.length<2) return null;
  const c=s.charCodeAt(0)-97, r=parseInt(s[1])-1;
  if (c<0||c>7||r<0||r>7) return null;
  return {row:r,col:c};
}

// Active games keyed by threadID
const chessGames = new Map();

// ── Reply with board image ────────────────────────────────────────────────────

async function replyBoard(message, board, body, threadID, senderID) {
  let attachment;
  try {
    const buf  = await makeBoardImage(board);
    const file = path.join(CACHE_DIR, `chess-${Date.now()}.png`);
    fs.writeFileSync(file, buf);
    attachment = fs.createReadStream(file);
    attachment.on("close", () => { try { fs.unlinkSync(file); } catch (_) {} });
  } catch (_) {}

  const payload = attachment ? { body, attachment } : body;

  return message.reply(payload, (err, info) => {
    if (!info || !threadID) return;
    global.GoatBot.onReply.set(info.messageID, {
      commandName: "chess",
      threadID: info.threadID,
      author: senderID
    });
  });
}

// ═════════════════════════════════════════════════════════════════════════════

const GUIDE =
  "♟️ দাবা (Chess) — বাংলায় গাইড\n" +
  "━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n" +
  "📌 কমান্ড:\n" +
  "  .chess start       → নতুন game শুরু\n" +
  "  .chess move e2 e4  → চাল দাও\n" +
  "  .chess board       → board দেখো\n" +
  "  .chess resign      → হার মানো\n\n" +
  "━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
  "♟️ গুটির নাম ও চলার নিয়ম:\n\n" +
  "  K = King   (রাজা)   → সব দিকে ১ ঘর\n" +
  "  Q = Queen  (মন্ত্রী) → সব দিকে যেকোনো দূরত্বে\n" +
  "  R = Rook   (নৌকা)  → সোজা (↑↓←→) যেকোনো দূরত্বে\n" +
  "  B = Bishop (হাতি)  → তেরছায় যেকোনো দূরত্বে\n" +
  "  N = Knight (ঘোড়া)  → L-আকারে (২+১), বাধা টপকায়!\n" +
  "  P = Pawn   (সৈনিক) → সামনে ১ঘর (প্রথমবার ২ঘর)\n" +
  "                       শত্রু নিতে তেরছায়\n" +
  "                       শেষ সারিতে → Queen হয়!\n\n" +
  "━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
  "🏁 গেম শেষ কীভাবে:\n" +
  "  ✅ Checkmate → রাজা আটকে গেছে — তুমি জিতলে!\n" +
  "  🤝 Stalemate → Draw\n" +
  "  🚩 Resign   → হার মানো\n\n" +
  "💡 তুমি = ♙ White  |  Bot = ♟ Black\n" +
  "   ঘর = a-h (column) + 1-8 (row)\n" +
  "   Example: .chess move e2 e4\n" +
  "━━━━━━━━━━━━━━━━━━━━━━━━━━";

module.exports = {
  config: {
    name: "chess",
    version: "2.0",
    author: "Rakib Islam",
    role: 0,
    countDown: 3,
    shortDescription: "♟️ দাবা (Chess) — Image Board সহ!",
    longDescription: "Chess game vs Bot। Image board দেখাবে। .chess দিলে বাংলায় গাইড।",
    category: "game",
    guide: {
      en:
        "{pn}              → বাংলায় গাইড\n" +
        "{pn} start        → নতুন game\n" +
        "{pn} move e2 e4   → চাল দাও\n" +
        "{pn} board        → board দেখো\n" +
        "{pn} resign       → হার মানো"
    }
  },

  onStart: async function ({ message, args, event, usersData }) {
    const { threadID, senderID } = event;
    const cmd = (args[0] || "").toLowerCase();

    if (!cmd || cmd === "help" || cmd === "guide")
      return message.reply(GUIDE);

    // ── start ─────────────────────────────────────────────────────────────────
    if (cmd === "start" || cmd === "new") {
      chessGames.delete(threadID);
      chessGames.set(threadID, {
        board: INIT_BOARD(), turn: "w", ep: null,
        started: Date.now(), playerID: senderID
      });
      const name = (await usersData.get(senderID).catch(()=>null))?.name || "Player";
      return replyBoard(
        message, chessGames.get(threadID).board,
        `♟️ Chess শুরু!\n${name} (♙ White) vs 🤖 Bot (♟ Black)\n\n♙ তোমার পালা! → .chess move e2 e4`,
        threadID, senderID
      );
    }

    // ── move ──────────────────────────────────────────────────────────────────
    if (cmd === "move" || cmd === "m") {
      const game = chessGames.get(threadID);
      if (!game) return message.reply("❌ কোনো active game নেই।\n.chess start দিয়ে শুরু করো!");
      if (senderID !== game.playerID) return message.reply("❌ এটা তোমার game না!");
      if (game.turn !== "w") return message.reply("⏳ Bot চাল দিচ্ছে...");

      const from = parseSquare(args[1]);
      const to   = parseSquare(args[2]);
      if (!from || !to)
        return message.reply("❌ সঠিক ঘর লেখো। Example: .chess move e2 e4");

      const piece = game.board[from.row][from.col];
      if (!piece || col(piece) !== "w")
        return message.reply("❌ ওখানে তোমার কোনো গুটি নেই!");

      const legal = legalMoves(game.board, from, game.ep);
      const matchTo = legal.find(m => m.row===to.row && m.col===to.col);
      if (!matchTo) {
        const hints = legal.length
          ? legal.map(m=>sqName(m.row,m.col)).join(", ")
          : "কোথাও না";
        return message.reply(
          `❌ এই চাল allowed না!\n${args[1]} থেকে যাওয়া যায়: ${hints}`
        );
      }

      // Apply player move
      let newEp = null;
      if (type(piece)==="P" && Math.abs(to.row-from.row)===2)
        newEp = {row:(from.row+to.row)/2, col:from.col};
      game.board = applyMove(game.board, from, matchTo);
      game.ep = newEp; game.turn = "b";

      // Check if bot is in checkmate/stalemate
      if (allLegal(game.board,"b",game.ep).length===0) {
        if (inCheck(game.board,"b",game.ep)) {
          chessGames.delete(threadID);
          const name = (await usersData.get(senderID).catch(()=>null))?.name || "Player";
          return replyBoard(message, game.board,
            `✅ CHECKMATE! 🏆 ${name} জিতেছে!`, null, null);
        } else {
          chessGames.delete(threadID);
          return replyBoard(message, game.board, `🤝 STALEMATE! Draw!`, null, null);
        }
      }

      // Bot move
      const bm = botBest(game.board, game.ep);
      if (!bm) {
        chessGames.delete(threadID);
        return replyBoard(message, game.board, `🏆 Bot এর কোনো চাল নেই! তুমি জিতলে!`, null, null);
      }

      const captured = game.board[bm.to.row][bm.to.col];
      let bEp = null;
      const bp2 = game.board[bm.from.row][bm.from.col];
      if (bp2 && type(bp2)==="P" && Math.abs(bm.to.row-bm.from.row)===2)
        bEp = {row:(bm.from.row+bm.to.row)/2, col:bm.from.col};

      game.board = applyMove(game.board, bm.from, bm.to);
      game.ep = bEp; game.turn = "w";

      const fl = sqName(bm.from.row, bm.from.col);
      const tl = sqName(bm.to.row,   bm.to.col);
      const cap = captured ? ` (${captured[1]} নিয়েছে!)` : "";
      const botNote = `🤖 Bot: ${fl}→${tl}${cap}`;

      if (allLegal(game.board,"w",game.ep).length===0) {
        if (inCheck(game.board,"w",game.ep)) {
          chessGames.delete(threadID);
          return replyBoard(message, game.board, `😈 CHECKMATE! Bot জিতেছে!\n${botNote}`, null, null);
        } else {
          chessGames.delete(threadID);
          return replyBoard(message, game.board, `🤝 STALEMATE! Draw!\n${botNote}`, null, null);
        }
      }

      const chk = inCheck(game.board,"w",game.ep) ? "\n⚠️ তোমার King Check এ!" : "";
      return replyBoard(message, game.board,
        `${botNote}${chk}\n♙ তোমার পালা! → .chess move <from> <to>`,
        threadID, senderID);
    }

    // ── board ─────────────────────────────────────────────────────────────────
    if (cmd === "board" || cmd === "show") {
      const game = chessGames.get(threadID);
      if (!game) return message.reply("❌ কোনো active game নেই। .chess start দিয়ে শুরু করো!");
      const turn = game.turn==="w" ? "♙ তোমার পালা (White)" : "🤖 Bot এর পালা (Black)";
      return replyBoard(message, game.board, turn, threadID, senderID);
    }

    // ── resign ────────────────────────────────────────────────────────────────
    if (cmd === "resign" || cmd === "quit" || cmd === "ff") {
      if (!chessGames.has(threadID))
        return message.reply("❌ কোনো active game নেই।");
      chessGames.delete(threadID);
      return message.reply("🏳️ তুমি হার মেনে নিলে। 🤖 Bot জিতেছে!\n.chess start দিয়ে আবার খেলো।");
    }

    return message.reply(GUIDE);
  },

  onReply: async function ({ message, event }) {
    const { threadID, senderID } = event;
    const game = chessGames.get(threadID);
    if (!game || senderID !== game.playerID) return;
    return replyBoard(message, game.board,
      `${game.turn==="w" ? "♙ তোমার পালা!" : "🤖 Bot ভাবছে..."}\n→ .chess move e2 e4`,
      threadID, senderID);
  }
};
