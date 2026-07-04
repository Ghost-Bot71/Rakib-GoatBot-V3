# ☢ 𝐆𝐎𝐀𝐓 𖣘 𝐁𝐎𝐓 ⚠ 𝐑𝐀𝐊𝐈𝐁

<p align="center">
  <img src="https://i.imgur.com/zf6PcY7.jpeg" alt="Bot Preview" width="400" style="border-radius:20px; box-shadow:0 0 35px rgba(0,255,255,0.8); background: linear-gradient(135deg,#00ffff33,#ff00ff33); padding:15px; border:1px solid rgba(255,255,255,0.2);">
</p>
---

📌 About This Bot

Goat Bot is a Messenger Multi-Device automation bot with advanced features. It can download photos, videos, stickers, movies, adult content, and perform many automated tasks.


---
## 🧩 File Overview

| File/Folder | Purpose | Run/Use |
|-------------|---------|---------|
| `index.js` | Main bot file | `node index.js` |
| `package.json` | Dependencies & scripts info | `npm install` |
| `account.txt` | Bot login session/token | Auto-used |
| `config.json` | Bot configuration: prefix, owner, etc. | Auto-used |
| `configCommands.json` | Command-specific configs | Auto-used |
| `modules/` | All bot commands (JS files) | Auto-loaded |
| `bot/` | Core bot system | Auto-used |
| `dashboard/` | Dashboard files | Auto-used |
| `database/` | Data storage | Auto-used |
| `fb-chat-api/` | Messenger API | Auto-used |
| `func/` | Functions handler | Auto-used |
| `languages/` | Multi-language system | Auto-loaded |
| `logger/` | Logging system | Auto-used |
| `scripts/` | Extra scripts | Optional |
| `Goat.js` | Goat Bot main engine | Auto-used |
| `update.js` | Auto-update script | Manual/Auto |
| `updater.js` | Update checker | Auto-used |
| `utils.js` | Utility functions | Auto-used |
| `versions.json` | Version management | Auto-used |
| `README.md` | Documentation | ❌ Not for running |
| `CHANGELOG.md` | Version log | ❌ Not for running |


---

🚀 How To Run Locally

    name: Run Bot

    on:
      workflow_dispatch:
        push:
    branches:
      - main
      - master
    schedule:
    - cron: "*/30 * * * *"

    jobs:
    run-bot:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - name: Install Dependencies
        run: npm install

      - name: Start Bot
        env:
          TZ: Asia/Dhaka
        run: |
          node index.js


---

🛠 How To Start Goat Bot

npm install
node index.js

If you want to use PM2:

npm install -g pm2
pm2 start index.js --name "GoatBot"


---

📝 Notes

This version is fully adapted for Goat Bot.

This README is optimized for your current project structure.



---

If you want to add badges, extra sections, screenshots, or auto-install commands, just tell me! 🚀
