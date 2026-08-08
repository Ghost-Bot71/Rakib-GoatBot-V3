"use strict";
const os   = require("os");
const { PassThrough } = require("stream");

// Pixel helpers
function setPixel(D, W, x, y, r, g, b, a=255) {
  if (x<0||y<0||x>=W) return;
  const i=(y*W+x)*4;
  D[i]=r;D[i+1]=g;D[i+2]=b;D[i+3]=a;
}
function fillRect(D,W,x,y,w,h,[r,g,b,a=255]) {
  for(let py=y;py<y+h;py++)for(let px=x;px<x+w;px++)setPixel(D,W,px,py,r,g,b,a);
}
function border(D,W,x,y,w,h,[r,g,b],thick=1) {
  for(let t=0;t<thick;t++){
    for(let px=x+t;px<x+w-t;px++){setPixel(D,W,px,y+t,r,g,b);setPixel(D,W,px,y+h-1-t,r,g,b);}
    for(let py=y+t;py<y+h-t;py++){setPixel(D,W,x+t,py,r,g,b);setPixel(D,W,x+w-1-t,py,r,g,b);}
  }
}

// Animated network graph (ping-like waveform)
function drawWave(D,W,x,y,w,h,frame,col) {
  fillRect(D,W,x,y,w,h,[15,10,30]);
  border(D,W,x,y,w,h,col,1);
  for(let i=0;i<w-2;i++){
    const wave = Math.sin((i/w)*Math.PI*6 + frame*0.9) * (h/2-2) * 0.8;
    const py = Math.round(y + h/2 + wave);
    for(let t=-1;t<=1;t++){
      const glow = t===0?255:120;
      setPixel(D,W,x+1+i,py+t,Math.min(255,col[0]*glow/255),Math.min(255,col[1]*glow/255),col[2]);
    }
  }
}

// Radial "radar" sweep
function drawRadar(D,W,cx,cy,rad,frame,col) {
  // Circle
  for(let a=0;a<360;a+=1){
    const ar=a*Math.PI/180;
    const px=Math.round(cx+rad*Math.cos(ar)), py=Math.round(cy+rad*Math.sin(ar));
    setPixel(D,W,px,py,col[0],col[1],col[2],80);
  }
  // Cross hairs
  for(let r2=0;r2<rad;r2+=4){
    const ar=frame*(Math.PI/180)*15;
    setPixel(D,W,Math.round(cx+r2*Math.cos(ar)),Math.round(cy+r2*Math.sin(ar)),col[0],col[1],col[2],200);
  }
  // Dots
  for(let d=0;d<3;d++){
    const da=(d/3)*Math.PI*2+frame*0.4;
    const dr=rad*0.6;
    const br = d===Math.round(frame)%3?255:100;
    fillRect(D,W,Math.round(cx+dr*Math.cos(da))-2,Math.round(cy+dr*Math.sin(da))-2,4,4,[col[0]*br/255,col[1]*br/255,col[2]*br/255]);
  }
}

const PURPLE=[160,80,255], PINK=[255,80,180], CYAN=[0,220,200], GOLD=[255,200,0];
const BG=[8,5,20], DK=[18,12,40], WHITE=[220,220,255];

// Pixel-art digit renderer (3x5 tiny)
const TINY={
  '0':[[1,1,1],[1,0,1],[1,0,1],[1,0,1],[1,1,1]],
  '1':[[0,1,0],[1,1,0],[0,1,0],[0,1,0],[1,1,1]],
  '2':[[1,1,1],[0,0,1],[1,1,1],[1,0,0],[1,1,1]],
  '3':[[1,1,1],[0,0,1],[1,1,1],[0,0,1],[1,1,1]],
  '4':[[1,0,1],[1,0,1],[1,1,1],[0,0,1],[0,0,1]],
  '5':[[1,1,1],[1,0,0],[1,1,1],[0,0,1],[1,1,1]],
  '6':[[1,1,1],[1,0,0],[1,1,1],[1,0,1],[1,1,1]],
  '7':[[1,1,1],[0,0,1],[0,1,0],[0,1,0],[0,1,0]],
  '8':[[1,1,1],[1,0,1],[1,1,1],[1,0,1],[1,1,1]],
  '9':[[1,1,1],[1,0,1],[1,1,1],[0,0,1],[1,1,1]],
  'h':[[0,0],[1,0],[1,1],[1,1],[1,1]],
  'm':[[0,0,0],[1,1,0],[1,1,1],[1,0,1],[1,0,1]],
  's':[[1,1],[1,0],[1,1],[0,1],[1,1]],
  '%':[[1,0,1],[1,0,1],[0,1,0],[1,0,1],[1,0,1]],
  ' ':[[0,0],[0,0],[0,0],[0,0],[0,0]],
};
function drawTiny(D,W,x,y,[r,g,b],str,scale=2){
  let cx=x;
  for(const c of str){
    const rows=TINY[c]||TINY[' '];
    rows.forEach((row,ry)=>{
      row.forEach((on,rx)=>{
        if(on) for(let sy=0;sy<scale;sy++) for(let sx=0;sx<scale;sx++)
          setPixel(D,W,cx+rx*scale+sx,y+ry*scale+sy,r,g,b);
      });
    });
    cx+=(rows[0]?.length||2)*scale+scale;
  }
}

async function buildRemoteGif(info) {
  try {
    const GIFEncoder = require("gif-encoder-2");
    const { Jimp } = require("jimp");
    const W=500, H=300, FRAMES=10;
    const enc = new GIFEncoder(W,H);
    enc.setDelay(250);
    enc.setRepeat(0);
    enc.start();

    for(let f=0;f<FRAMES;f++){
      const img = new Jimp({width:W,height:H});
      const D = img.bitmap.data;
      // Background fill
      for(let i=0;i<W*H*4;i+=4){D[i]=BG[0];D[i+1]=BG[1];D[i+2]=BG[2];D[i+3]=255;}

      // Outer glow border (purple pulse)
      const glow=Math.round(Math.abs(Math.sin(f*0.7))*80);
      border(D,W,0,0,W,H,[PURPLE[0],Math.min(255,PURPLE[1]+glow),PURPLE[2]],2);

      // Header
      fillRect(D,W,2,2,W-4,36,DK);
      border(D,W,2,2,W-4,36,PINK,1);
      // Title squares
      for(let i=0;i<10;i++) fillRect(D,W,15+i*20,10,12,12,[PINK[0],PINK[1],PINK[2],(i*25+f*30)%255]);
      // "ONLINE" indicator
      const onCol = f%2===0?CYAN:[0,150,130];
      fillRect(D,W,380,8,100,22,[0,30,20]);
      border(D,W,380,8,100,22,onCol,1);
      drawTiny(D,W,385,11,onCol,"ONLINE",2);

      // Radar (left panel)
      const radarCX=75, radarCY=170, radarR=60;
      fillRect(D,W,radarCX-radarR-5,radarCY-radarR-5,radarR*2+10,radarR*2+10,DK);
      border(D,W,radarCX-radarR-5,radarCY-radarR-5,radarR*2+10,radarR*2+10,PURPLE,1);
      drawRadar(D,W,radarCX,radarCY,radarR,f,PURPLE);

      // Network wave (right panel)
      drawWave(D,W,155,50,335,50,f,CYAN);
      // CPU wave
      drawWave(D,W,155,115,335,45,f*1.3,PURPLE);
      // RAM wave
      drawWave(D,W,155,175,335,45,f*0.7,PINK);

      // Stats labels
      drawTiny(D,W,155,55,CYAN,"NET",2);
      drawTiny(D,W,155,120,PURPLE,"CPU",2);
      drawTiny(D,W,155,180,PINK,"RAM",2);

      // Uptime counter
      fillRect(D,W,155,232,335,36,DK);
      border(D,W,155,232,335,36,GOLD,1);
      drawTiny(D,W,160,237,GOLD,info.uptime+"%",2);
      drawTiny(D,W,280,237,WHITE,"PID "+info.pid,2);

      // Scanline overlay
      const scanY=(f/FRAMES)*H;
      for(let px=0;px<W;px++){
        const idx=(Math.round(scanY)*W+px)*4;
        if(D[idx+3]>0){D[idx]=Math.min(255,D[idx]+30);D[idx+1]=Math.min(255,D[idx+1]+30);}
      }

      enc.addFrame(D);
    }

    enc.finish();
    const buf=enc.out.getData();
    const st=new PassThrough();
    st.end(buf);
    return st;
  } catch { return null; }
}

module.exports = {
  config: {
    name: "rpanel",
    version: "4.0",
    author: "Rakib Islam",
    aliases: ["remotepanel", "rempanel"],
    countDown: 10,
    role: 2,
    shortDescription: "📡 Remote Panel — Animated Radar GIF",
    longDescription: "Remote system monitor with animated radar GIF card",
    category: "admin",
    guide: { en: "{pn}" }
  },

  onStart: async function ({ message, event }) {
    await message.reaction("⏳", event.messageID);

    const nets     = os.networkInterfaces();
    const netNames = Object.keys(nets).slice(0,3).join(", ") || "localhost";
    const cpus     = os.cpus();
    const cpuModel = (cpus[0]?.model||"Unknown").substring(0,30);
    const cpuCount = cpus.length;
    const upSec    = Math.floor(process.uptime());
    const h=Math.floor(upSec/3600), m=Math.floor((upSec%3600)/60), s=upSec%60;

    const body =
      `📡 𝗚𝗛𝗢𝗦𝗧 𝗥𝗘𝗠𝗢𝗧𝗘 𝗣𝗔𝗡𝗘𝗟\n` +
      `${"▬".repeat(28)}\n\n` +
      `🖥️ System:\n` +
      `   OS    : ${os.type()} ${os.arch()}\n` +
      `   Host  : ${os.hostname()}\n` +
      `   Kernel: ${os.release()}\n\n` +
      `⚙️ CPU:\n` +
      `   Model : ${cpuModel}\n` +
      `   Cores : ${cpuCount}\n` +
      `   Speed : ${cpus[0]?.speed||0}MHz\n\n` +
      `🌐 Network:\n` +
      `   IFs   : ${netNames}\n\n` +
      `💻 Process:\n` +
      `   PID   : ${process.pid}\n` +
      `   Node  : ${process.version}\n` +
      `   Uptime: ${h}h ${m}m ${s}s\n\n` +
      `${"▬".repeat(28)}\n` +
      `👻 Ghost Net Remote v4.0`;

    const info = {
      uptime: `${h}h${m}m${s}s`,
      pid:    String(process.pid)
    };

    const gif = await buildRemoteGif(info);
    await message.reaction("✅", event.messageID);

    if (gif) return message.reply({ body, attachment: gif });
    return message.reply(body);
  }
};
