const fs = require("fs"); 
const path = require("path"); 
const dataFile = path.join(__dirname,"coinData.json");

function loadData(){ 
    if(!fs.existsSync(dataFile)) return {}; 
    return JSON.parse(fs.readFileSync(dataFile)); 
}

function saveData(data){ 
    fs.writeFileSync(dataFile,JSON.stringify(data,null,2)); 
}

module.exports = {
  config:{name:"treasure",author:"Rakib Islam",category:"game",description:"Treasure Hunt"},

  onStart: async({api,event,args})=>{
    if(!args[0]) 
      return api.sendMessage("❌ Please select an option: left or right", event.threadID, event.messageID);

    const choice = args[0].toLowerCase();
    if(!["left","right"].includes(choice)) 
      return api.sendMessage("❌ Invalid option! Choose left or right.", event.threadID, event.messageID);

    let data = loadData();
    if(!data[event.senderID]) data[event.senderID] = { coins: 0 };

    const treasures = ["💰 +2 Coins","💎 Gem","🍀 Lucky Charm","🪙 Old Coin","😢 Empty"];
    const treasure = treasures[Math.floor(Math.random()*treasures.length)];

    // ✅ Win = +2 coins
    if(treasure.includes("Coins")) data[event.senderID].coins += 2; 
    else if(treasure === "😢 Empty") data[event.senderID].coins = Math.max(0,data[event.senderID].coins - 1);

    saveData(data);

    const win = treasure !== "😢 Empty";
    const msg = win ? 
`╔════════════╗
🌟 𝗬𝗢𝗨 𝗪𝗢𝗡 🌟
╚════════════╝
🗝️ Treasure Found: ${treasure}
💳 Balance: ${data[event.senderID].coins}` :
`╔════════════╗
💥 𝗬𝗢𝗨 𝗟𝗢𝗦𝗧 💥
╚════════════╝
🗝️ Treasure Chest Empty!
💳 Balance: ${data[event.senderID].coins}`;

    return api.sendMessage(msg,event.threadID,event.messageID);
  }
};
