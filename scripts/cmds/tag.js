module.exports = {
  config: {
    name: "tag",
    version: "4.1",
    author: "Rakib Hasan",
    countDown: 3,
    role: 0,
    shortDescription: {
      en: "Smart tag with fuzzy similarity + clean suggestions"
    },
    longDescription: {
      en: "Mention members using typo tolerance, first/last name support & suggestion system (no % shown)"
    },
    category: "utility",
    guide: {
      en: "{pn} <name>"
    }
  },

  onStart: async function ({ message, event, args, threadsData }) {

    if (!args[0]) {
      return message.reply("❌ ব্যবহার: tag <name>");
    }

    const rawKeyword = args.join(" ");
    const keyword = normalizeText(rawKeyword);
    const threadID = event.threadID;

    const threadInfo = await threadsData.get(threadID);
    const members = threadInfo.members || [];

    const matched = [];
    const suggestions = [];

    for (const member of members) {
      const fullName = member.name || "";
      const normalizedFull = normalizeText(fullName);

      const nameParts = fullName.trim().split(/\s+/);
      const firstName = nameParts[0] || "";
      const lastName = nameParts[nameParts.length - 1] || "";

      const normalizedFirst = normalizeText(firstName);
      const normalizedLast = normalizeText(lastName);

      let similarityFull = getSimilarity(keyword, normalizedFull);
      let similarityFirst = getSimilarity(keyword, normalizedFirst);
      let similarityLast = getSimilarity(keyword, normalizedLast);

      let similarity = Math.max(similarityFull, similarityFirst, similarityLast);

      // Exact match priority
      if (
        keyword === normalizedFull ||
        keyword === normalizedFirst ||
        keyword === normalizedLast
      ) {
        similarity = 1;
      }

      if (similarity >= 0.7) {
        matched.push({
          id: member.userID,
          name: fullName,
          similarity
        });
      }
      else if (similarity >= 0.5) {
        suggestions.push({
          name: fullName,
          similarity
        });
      }
    }

    // Sort by highest similarity
    matched.sort((a, b) => b.similarity - a.similarity);
    suggestions.sort((a, b) => b.similarity - a.similarity);

    // If no strong match
    if (matched.length === 0) {

      if (suggestions.length > 0) {
        let suggestMsg = `❓ "${rawKeyword}" এর সাথে মিল পাওয়া যায়নি।\n`;
        suggestMsg += `🔎 Did you mean:\n\n`;

        for (let i = 0; i < Math.min(5, suggestions.length); i++) {
          suggestMsg += `• ${suggestions[i].name}\n`;
        }

        return message.reply(suggestMsg);
      }

      return message.reply(`❌ "${rawKeyword}" এর সাথে মিল পাওয়া যায়নি।`);
    }

    const mentions = matched.map(user => ({
      id: user.id,
      tag: user.name
    }));

    let msg = `🔔 Tag result for "${rawKeyword}":\n\n`;

    for (const user of matched) {
      msg += `• ${user.name}\n`;
    }

    message.reply({
      body: msg,
      mentions
    });
  }
};

/* ================= UTILITIES ================= */

function normalizeText(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

function getSimilarity(a, b) {
  if (!a || !b) return 0;

  const distance = levenshtein(a, b);
  const maxLen = Math.max(a.length, b.length);

  return maxLen === 0 ? 1 : 1 - distance / maxLen;
}

function levenshtein(a, b) {
  const matrix = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[b.length][a.length];
  }
