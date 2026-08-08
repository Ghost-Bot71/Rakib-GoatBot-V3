"use strict";
const os   = require("os");
const fs   = require("fs");
const path = require("path");
const { PassThrough } = require("stream");

// ── Colour palette ──────────────────────────────────────────────────────────
const BG  = [10, 10, 30, 255];          // dark navy
const FG  = [0, 230, 200, 255];         // cyan
const FG2 = [120, 80, 255, 255];        // purple
const HL  = [255, 215, 0, 255];         // gold
const DK  = [20, 20, 50, 255];          // panel bg
const BAR_BG = [30, 30, 60, 255];

// ── Pixel helpers ───────────────────────────────────────────────────────────
function setPixel(D, W, x, y, r, g, b, a = 255) {
  if (x < 0 || y < 0 || x >= W) return;
  const i = (y * W + x) * 4;
  D[i] = r; D[i+1] = g; D[i+2] = b; D[i+3] = a;
}

function fillRect(D, W, x, y, w, h, [r,g,b,a=255]) {
  for (let py=y; py<y+h; py++)
    for (let px=x; px<x+w; px++)
      setPixel(D, W, px, py, r, g, b, a);
}

function border(D, W, x, y, w, h, [r,g,b], thick=1) {
  for (let t=0;t<thick;t++) {
    for (let px=x+t;px<x+w-t;px++) {
      setPixel(D,W,px,y+t,r,g,b);
      setPixel(D,W,px,y+h-1-t,r,g,b);
    }
    for (let py=y+t;py<y+h-t;py++) {
      setPixel(D,W,x+t,py,r,g,b);
      setPixel(D,W,x+w-1-t,py,r,g,b);
    }
  }
}

function progressBar(D, W, x, y, barW, barH, pct, col, frame) {
  fillRect(D, W, x, y, barW, barH, BAR_BG);
  const fill = Math.round(barW * pct / 100);
  // Animated fill with pulse
  const pulse = Math.abs(Math.sin(frame * 0.8)) * 40;
  const [r,g,b] = col;
  fillRect(D, W, x, y, fill, barH, [
    Math.min(255, r + pulse),
    Math.min(255, g + pulse),
    Math.min(255, b + pulse)
  ]);
  border(D, W, x, y, barW, barH, [60,60,100], 1);
}

// Draw a simple pixel-art character (5x7 bitmap font subset)
const CHARS = {
  ' ':[0,0,0,0,0,0,0],
  '0':[14,17,17,17,17,17,14],'1':[4,12,4,4,4,4,14],'2':[14,17,2,4,8,16,31],
  '3':[14,17,1,6,1,17,14],'4':[2,6,10,18,31,2,2],'5':[31,16,30,1,1,17,14],
  '6':[6,8,16,30,17,17,14],'7':[31,1,2,4,8,8,8],'8':[14,17,17,14,17,17,14],
  '9':[14,17,17,15,1,2,12],'%':[24,25,2,4,8,19,3],
  'h':[16,16,28,18,18,18,18],'m':[0,0,26,21,21,21,21],'s':[0,0,14,16,14,1,30],
  'M':[17,27,21,21,17,17,17],'B':[28,18,18,28,18,18,28],
  'K':[18,20,24,16,24,20,18],'G':[14,17,16,23,17,17,14],
  '/':[ 1,2,2,4,8,8,16],'.':[0,0,0,0,0,12,12],
  ':':[0,12,12,0,12,12,0],'!':[4,4,4,4,4,0,4],
  '-':[0,0,0,14,0,0,0],'+':[0,4,4,31,4,4,0],
};

function drawChar(D,W,cx,cy,[r,g,b],char,scale=1) {
  const rows = CHARS[char] || CHARS[' '];
  rows.forEach((row,ry) => {
    for (let bit=4;bit>=0;bit--) {
      if (row & (1<<bit)) {
        for (let sy=0;sy<scale;sy++)
          for (let sx=0;sx<scale;sx++)
            setPixel(D,W, cx+(4-bit)*scale+sx, cy+ry*scale+sy, r,g,b);
      }
    }
  });
  return 5*scale+2;
}

function drawText(D,W,x,y,col,text,scale=1) {
  let cx=x;
  for (const c of text) cx += drawChar(D,W,cx,y,col,c,scale);
  return cx;
}

// ── Build animated GIF ───────────────────────────────────────────────────────
async function buildPanelGif(stats) {
  try {
    const GIFEncoder = require("gif-encoder-2");
    const { Jimp } = require("jimp");

    const W = 500, H = 300, FRAMES = 8;
    const enc = new GIFEncoder(W, H);
    enc.setDelay(350);
    enc.setRepeat(0);
    enc.start();

    for (let f = 0; f < FRAMES; f++) {
      const img = new Jimp({ width: W, height: H });
      const D   = img.bitmap.data;

      // ── Background ──────────────────────────────────────────────────────
      for (let i = 0; i < W*H*4; i += 4) {
        D[i]=BG[0]; D[i+1]=BG[1]; D[i+2]=BG[2]; D[i+3]=255;
      }

      // ── Outer border (animated glow) ────────────────────────────────────
      const glow = Math.round(Math.abs(Math.sin(f * 0.8)) * 60);
      border(D, W, 0, 0, W, H, [FG[0], Math.min(255,FG[1]+glow), FG[2]], 2);

      // ── Header bar ─────────────────────────────────────────────────────
      fillRect(D, W, 2, 2, W-4, 38, DK);
      border(D, W, 2, 2, W-4, 38, HL, 1);
      // "GHOST BOT" title dots (pixel text too small, use block pattern)
      const titleX = 15, titleY = 12;
      // Decorative squares for title
      for (let i=0;i<12;i++) fillRect(D,W,titleX+i*12,titleY+2,8,8,[HL[0],HL[1],HL[2]]);
      fillRect(D, W, 300, 8, 90, 24, [0,150,80]);
      border(D, W, 300, 8, 90, 24, FG, 1);
      drawText(D,W,308,13,FG, "ONLINE", 2);

      // ── Status indicator (blink) ────────────────────────────────────────
      const blink = f % 2 === 0 ? [0,255,100] : [0,150,60];
      fillRect(D, W, 400+Math.round(Math.sin(f)*3), 14, 14, 14, blink);

      // ── Section: Uptime ────────────────────────────────────────────────
      fillRect(D, W, 10, 48, 230, 26, DK);
      border(D, W, 10, 48, 230, 26, FG2, 1);
      drawText(D,W,14,53,FG2,"UPTIME:", 2);
      drawText(D,W,100,53,FG, stats.uptime, 2);

      // ── Section: Node.js ───────────────────────────────────────────────
      fillRect(D, W, 250, 48, 240, 26, DK);
      border(D, W, 250, 48, 240, 26, FG2, 1);
      drawText(D,W,254,53,FG2,"NODE:", 2);
      drawText(D,W,316,53,FG, stats.node, 2);

      // ── RAM bar ─────────────────────────────────────────────────────────
      const ramY = 90;
      fillRect(D, W, 10, ramY, 480, 52, DK);
      border(D, W, 10, ramY, 480, 52, FG, 1);
      drawText(D,W,14,ramY+5,HL,"RAM", 2);
      progressBar(D, W, 14, ramY+22, 460, 14, stats.memPct, [0,200,150], f);
      drawText(D,W,14,ramY+38,[200,200,200], stats.memText, 2);
      drawText(D,W,380,ramY+38,HL, stats.memPct+"%", 2);

      // ── CPU bar ─────────────────────────────────────────────────────────
      const cpuY = 152;
      fillRect(D, W, 10, cpuY, 480, 52, DK);
      border(D, W, 10, cpuY, 480, 52, FG2, 1);
      drawText(D,W,14,cpuY+5,HL,"CPU", 2);
      progressBar(D, W, 14, cpuY+22, 460, 14, stats.cpuPct, [150,80,255], f);
      drawText(D,W,14,cpuY+38,[200,200,200], "LOAD "+stats.cpuLoad, 2);
      drawText(D,W,380,cpuY+38,FG2, stats.cpuPct+"%", 2);

      // ── Commands & Platform ─────────────────────────────────────────────
      fillRect(D, W, 10, 214, 235, 26, DK);
      border(D, W, 10, 214, 235, 26, HL, 1);
      drawText(D,W,14,219,HL,"CMD:", 2);
      drawText(D,W,60,219,FG, stats.cmds, 2);

      fillRect(D, W, 255, 214, 235, 26, DK);
      border(D, W, 255, 214, 235, 26, HL, 1);
      drawText(D,W,259,219,HL,"PID:", 2);
      drawText(D,W,305,219,FG, String(process.pid), 2);

      // ── Footer ──────────────────────────────────────────────────────────
      fillRect(D, W, 2, H-36, W-4, 34, DK);
      border(D, W, 2, H-36, W-4, 34, HL, 1);
      const scan = Math.round(((f / FRAMES) * (W-20)));
      fillRect(D, W, 10, H-26, scan, 14, [HL[0],HL[1],0]);
      drawText(D,W,14,H-24,[0,0,0],"Ghost Net", 2);

      enc.addFrame(D);
    }

    enc.finish();
    const buf = enc.out.getData();
    const st  = new PassThrough();
    st.end(buf);
    return st;
  } catch {
    return null;
  }
}

// ── Module export ────────────────────────────────────────────────────────────
module.exports = {
  config: {
    name: "cpanel",
    aliases: ["panel", "botstatus", "status"],
    version: "6.0",
    author: "Rakib Islam",
    countDown: 10,
    role: 2,
    shortDescription: "🖥️ Bot Control Panel — Animated GIF Monitor",
    category: "admin",
    guide: { en: "{pn}" }
  },

  onStart: async function ({ message, event }) {
    await message.reaction("⏳", event.messageID);

    const upSec  = Math.floor(process.uptime());
    const h = Math.floor(upSec/3600), m = Math.floor((upSec%3600)/60), s = upSec%60;
    const usedMB = Math.round((os.totalmem()-os.freemem())/1048576);
    const totalMB = Math.round(os.totalmem()/1048576);
    const memPct  = Math.round((usedMB/totalMB)*100);
    const cpuLoad = os.loadavg()[0].toFixed(2);
    const cpuPct  = Math.min(Math.round(parseFloat(cpuLoad)*10), 100);
    const bar = p => "█".repeat(Math.floor(p/10)) + "░".repeat(10-Math.floor(p/10));

    let totalCmds = 0;
    try { totalCmds = fs.readdirSync(path.join(__dirname)).filter(f=>f.endsWith(".js")).length; } catch {}

    const body =
      `\n🖥️  ╔══════════════════════════════╗\n` +
      `🖥️  ║  ⚡ 𝗕𝗢𝗧 𝗖𝗢𝗡𝗧𝗥𝗢𝗟 𝗣𝗔𝗡𝗘𝗟 ⚡   ║\n` +
      `🖥️  ╚══════════════════════════════╝\n\n` +
      `🟢 Status    : ONLINE\n` +
      `⏱️  Uptime    : ${h}h ${m}m ${s}s\n` +
      `📦 Commands  : ${totalCmds}+\n` +
      `🖥️  Node.js   : ${process.version}\n` +
      `🌐 Platform  : ${os.type()} (${os.arch()})\n` +
      `🔧 PID       : ${process.pid}\n\n` +
      `💾 RAM Usage:\n` +
      `   [${bar(memPct)}] ${memPct}%\n` +
      `   ${usedMB}MB / ${totalMB}MB\n\n` +
      `⚡ CPU Load:\n` +
      `   [${bar(cpuPct)}] ${cpuPct}%\n` +
      `   Avg: ${cpuLoad}\n\n` +
      `👑 Admin: Rakib Islam | Ghost Bot v6.0`;

    const stats = {
      uptime:  `${h}h${m}m${s}s`,
      node:    process.version.replace("v",""),
      memPct,
      memText: `${usedMB}/${totalMB}MB`,
      cpuLoad,
      cpuPct,
      cmds:    String(totalCmds)
    };

    const gif = await buildPanelGif(stats);
    await message.reaction("✅", event.messageID);

    if (gif) {
      return message.reply({ body, attachment: gif });
    }
    return message.reply(body);
  }
};
