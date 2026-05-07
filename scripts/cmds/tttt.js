module.exports = {
  config: {
    name: "tttt",
    aliases: ["tictactoe"],
    version: "3.0",
    author: "Rakib",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Play tic-tac-toe with bot"
    },
    longDescription: {
      en: "Single player tic-tac-toe game against bot"
    },
    category: "game",
    guide: "{pn}"
  },

  onStart: async function ({ event, message, usersData }) {

    if (!global.game) global.game = {};

    if (global.game[event.threadID] && global.game[event.threadID].on)
      return message.reply("A game is already running.");

    const playerName = await usersData.getName(event.senderID);

    global.game[event.threadID] = {
      on: true,
      board: ["🔲","🔲","🔲","🔲","🔲","🔲","🔲","🔲","🔲"],
      player: event.senderID,
      playerName,
      turn: event.senderID,
      bid: null
    };

    message.send(formatBoard(global.game[event.threadID].board), (err, info) => {
      global.game[event.threadID].bid = info.messageID;
    });
  },

  onChat: async function ({ event, message }) {

    if (!global.game || !global.game[event.threadID]) return;

    const game = global.game[event.threadID];
    if (!game.on) return;

    if (event.type !== "message_reply") return;
    if (event.messageReply.messageID !== game.bid) return;

    if (event.senderID !== game.player)
      return message.reply("This is not your game.");

    const move = parseInt(event.body);
    if (!move || move < 1 || move > 9)
      return message.reply("Reply with a number from 1-9.");

    if (game.board[move - 1] !== "🔲")
      return message.reply("That position is already taken.");

    // PLAYER MOVE (❌)
    game.board[move - 1] = "❌";

    if (checkWinner(game.board, "❌")) {
      game.on = false;
      return message.send(formatBoard(game.board) + "\n\n🎉 You Win!");
    }

    if (isDraw(game.board)) {
      game.on = false;
      return message.send(formatBoard(game.board) + "\n\n🤝 Match Draw!");
    }

    // BOT MOVE (⭕)
    const botMove = getBotMove(game.board);
    game.board[botMove] = "⭕";

    if (checkWinner(game.board, "⭕")) {
      game.on = false;
      return message.send(formatBoard(game.board) + "\n\n🤖 Bot Wins!");
    }

    if (isDraw(game.board)) {
      game.on = false;
      return message.send(formatBoard(game.board) + "\n\n🤝 Match Draw!");
    }

    message.send(formatBoard(game.board), (err, info) => {
      game.bid = info.messageID;
    });
  }
};

// ===== FORMAT BOARD =====
function formatBoard(board) {
  return `${board[0]}${board[1]}${board[2]}
${board[3]}${board[4]}${board[5]}
${board[6]}${board[7]}${board[8]}

Reply with number (1-9)
1️⃣2️⃣3️⃣
4️⃣5️⃣6️⃣
7️⃣8️⃣9️⃣`;
}

// ===== WIN CHECK =====
function checkWinner(b, symbol) {
  const wins = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];
  return wins.some(combo =>
    b[combo[0]] === symbol &&
    b[combo[1]] === symbol &&
    b[combo[2]] === symbol
  );
}

// ===== DRAW CHECK =====
function isDraw(board) {
  return board.every(cell => cell !== "🔲");
}

// ===== SIMPLE BOT AI =====
function getBotMove(board) {
  const empty = board
    .map((val, index) => val === "🔲" ? index : null)
    .filter(val => val !== null);

  return empty[Math.floor(Math.random() * empty.length)];
      }
