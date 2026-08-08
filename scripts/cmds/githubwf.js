module.exports = {
  config: {
    name: "githubwf",
    version: "2.0",
    author: "Rakib Islam",
    aliases: ["ghworkflow", "githubrun", "gaction"],
    countDown: 5,
    role: 2,
    shortDescription: "Generate GitHub Actions workflow for this bot",
    longDescription: "Generates a ready-to-use GitHub Actions YAML workflow file for running Ghost Bot 24/7",
    category: "admin",
    guide: { en: "{pn} — Get GitHub workflow YAML" }
  },

  onStart: async function ({ message }) {
    const yaml = [
      "# Ghost Bot — GitHub Actions Workflow",
      "# Owner: Rakib Islam | Ghost Net Edition",
      "# Add FBSTATE & HF_TOKEN to GitHub Secrets",
      "",
      "name: Ghost Bot Runner",
      "",
      "on:",
      "  schedule:",
      "    - cron: '*/5 * * * *'",
      "  workflow_dispatch:",
      "  push:",
      "    branches: [main, master]",
      "",
      "jobs:",
      "  ghost-bot:",
      "    name: Run Ghost Bot",
      "    runs-on: ubuntu-latest",
      "    timeout-minutes: 5",
      "",
      "    steps:",
      "      - name: Checkout Code",
      "        uses: actions/checkout@v4",
      "",
      "      - name: Setup Node.js",
      "        uses: actions/setup-node@v4",
      "        with:",
      "          node-version: '20'",
      "          cache: 'npm'",
      "",
      "      - name: Install Dependencies",
      "        run: npm install --legacy-peer-deps",
      "",
      "      - name: Create account.txt",
      "        run: echo '$FBSTATE' > account.txt",
      "        env:",
      "          FBSTATE: $GITHUB_FBSTATE",
      "",
      "      - name: Run Ghost Bot",
      "        run: timeout 250 node index.js || true",
      "        env:",
      "          HF_TOKEN: $GITHUB_HF_TOKEN",
      "          SESSION_SECRET: $GITHUB_SESSION_SECRET"
    ].join("\n");

    const info = [
      "📋 GitHub Actions Workflow — Ghost Bot",
      "═".repeat(34),
      "",
      "Save as: .github/workflows/bot.yml",
      "",
      yaml,
      "",
      "═".repeat(34),
      "🔑 GitHub Secrets to add:",
      "   FBSTATE = your FB cookies JSON",
      "   HF_TOKEN = HuggingFace API token",
      "   SESSION_SECRET = random secret string",
      "",
      "👻 Made by Rakib Islam — Ghost Net"
    ].join("\n");

    message.reply(info);
  }
};
