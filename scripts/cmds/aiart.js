const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "aiart",
    aliases: ["art", "imagine", "draw", "genimage"],
    version: "2.0",
    author: "Rakib Islam",
    countDown: 15,
    role: 0,
    shortDescription: "Generate AI images using Pollinations (free, no key)",
    longDescription: "Generate stunning AI images from text prompts using Pollinations.ai — 100% free, no API key required. Supports multiple models: flux, turbo, ghibli, realistic.",
    category: "AI-IMAGE",
    guide: {
      en: [
        "{pn} <prompt> — Generate image (default: flux model)",
        "{pn} --model flux <prompt> — Ultra HD realistic image",
        "{pn} --model turbo <prompt> — Faster generation",
        "{pn} --model ghibli <prompt> — Studio Ghibli anime style",
        "{pn} --4k <prompt> — 1024x1024 high resolution",
        "",
        "Examples:",
        "{pn} a ghost warrior standing in neon rain cyberpunk city",
        "{pn} --model ghibli Rakib walking in a magical forest",
        "{pn} --4k sunset over mountains with aurora borealis"
      ].join("\n")
    }
  },

  onStart: async function ({ api, event, args }) {
    if (!args.length) {
      return api.sendMessage(
        "🎨 Ghost Art Generator\n\n" +
        "Usage: .aiart <prompt>\n\n" +
        "Models:\n" +
        "• flux — Realistic HD (default)\n" +
        "• turbo — Fast generation\n" +
        "• ghibli — Anime / Studio Ghibli style\n\n" +
        "Flags:\n" +
        "• --4k — 1024×1024 resolution\n" +
        "• --model <name> — choose model\n\n" +
        "Example: .aiart a dragon in a cyberpunk city",
        event.threadID, event.messageID
      );
    }

    // Parse flags
    let modelName = "flux";
    let width = 768;
    let height = 768;
    const flags = [];

    const cleaned = [];
    for (let i = 0; i < args.length; i++) {
      if (args[i] === "--model" && args[i + 1]) {
        modelName = args[i + 1].toLowerCase();
        i++;
      } else if (args[i] === "--4k") {
        width = 1024;
        height = 1024;
      } else if (args[i] === "--hd") {
        width = 896;
        height = 896;
      } else if (args[i] === "--portrait") {
        width = 512;
        height = 768;
      } else if (args[i] === "--wide") {
        width = 1024;
        height = 576;
      } else {
        cleaned.push(args[i]);
      }
    }

    // Model aliases
    const modelMap = {
      "flux": "flux",
      "turbo": "flux-turbo",
      "ghibli": "flux",
      "anime": "flux",
      "realistic": "flux-realism",
      "pro": "flux-pro",
      "3d": "flux-3d",
      "default": "flux"
    };

    const model = modelMap[modelName] || "flux";
    let prompt = cleaned.join(" ").trim();
    if (!prompt) return api.sendMessage("❌ Please provide a prompt!\nExample: .aiart a cat warrior", event.threadID, event.messageID);

    // Add style hint for ghibli/anime
    if (modelName === "ghibli") prompt = `Studio Ghibli anime style, ${prompt}, beautiful scenery, soft colors, hand-drawn animation`;
    if (modelName === "anime") prompt = `anime art style, ${prompt}, detailed, vibrant colors`;

    const waitMsg = await api.sendMessage(
      `🎨 Generating image...\n📝 Prompt: ${prompt.slice(0, 80)}${prompt.length > 80 ? "..." : ""}\n🤖 Model: ${modelName}\n📐 Size: ${width}×${height}\n\n⏳ Please wait...`,
      event.threadID
    );

    try {
      const encodedPrompt = encodeURIComponent(prompt);
      const seed = Math.floor(Math.random() * 999999);

      const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?model=${model}&width=${width}&height=${height}&seed=${seed}&nologo=true&enhance=true`;

      const response = await axios.get(url, {
        responseType: "arraybuffer",
        timeout: 60000,
        headers: { "User-Agent": "GhostBot/2.0" }
      });

      const imgPath = path.join(__dirname, "cache", `aiart_${event.senderID}_${Date.now()}.jpg`);
      fs.ensureDirSync(path.join(__dirname, "cache"));
      fs.writeFileSync(imgPath, Buffer.from(response.data));

      await api.sendMessage(
        {
          body: `✅ Ghost Art Generated!\n\n📝 "${prompt.slice(0, 100)}${prompt.length > 100 ? "..." : ""}"\n🤖 Model: ${modelName} (${model})\n📐 ${width}×${height} px\n🌱 Seed: ${seed}\n\n🔁 Use the same seed to regenerate:\n.aiart <prompt> (seed is random each time)`,
          attachment: fs.createReadStream(imgPath)
        },
        event.threadID,
        () => {
          try { fs.unlinkSync(imgPath); } catch {}
        },
        waitMsg.messageID
      );

    } catch (err) {
      console.error("[aiart] Error:", err.message);
      api.sendMessage(
        "❌ Image generation failed!\n\n" +
        "Possible reasons:\n" +
        "• Pollinations server is busy\n" +
        "• Prompt contains blocked words\n" +
        "• Network timeout\n\n" +
        "Try again in a few seconds 🔄",
        event.threadID,
        waitMsg.messageID
      );
    }
  }
};
