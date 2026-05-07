const fs = require("fs");
const { loadImage, createCanvas } = require("canvas");

const AIMove = { current: null };

function createBoard() {
  return Array.from({ length: 3 }, () => Array(3).fill(0));
}

function startBoard(isX) {
  return {
    board: createBoard(),
    isX,
    gameOn: true
  };
}

async function displayBoard(data) {
  const path = `${__dirname}/cache/ttt-${Date.now()}.png`;
  const canvas = createCanvas(1200, 1200);
  const ctx = canvas.getContext("2d");

  const bg = await loadImage("https://drive.google.com/uc?export=download&id=1VKcobV7gy61CBGQkT_oLi7MWyabBsX5w");
  const O = await loadImage("https://drive.google.com/uc?export=download&id=15bKGBC6vpjhl7WXO8bdtNEiZiHbgfa7c");
  const X = await loadImage("https://drive.google.com/uc?export=download&id=1widguWSE69VIAl81Fx7Vxt6Fg-mvm3oA");

  ctx.drawImage(bg, 0, 0, 1200, 1200);

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const piece = data.board[i][j];
      const x = 54 + 366 * j;
      const y = 54 + 366 * i;

      if (piece === 1) ctx.drawImage(X, x, y, 360, 360);
      if (piece === 2) ctx.drawImage(O, x, y, 360, 360);
    }
  }

  fs.writeFileSync(path, canvas.toBuffer("image/png"));
  return fs.createReadStream(path);
}

function getAvailable(board) {
  const moves = [];
  for (let i = 0; i < 3; i++)
    for (let j = 0; j < 3; j++)
      if (board[i][j] === 0) moves.push([i, j]);
  return moves;
}

function placeMove(board, move, player) {
  board[move[0]][move[1]] = player;
}

function checkWin(board, player) {
  for (let i = 0; i < 3; i++) {
    if (board[i].every(v => v === player)) return true;
    if (board.every(row => row[i] === player)) return true;
  }
  if ([0,1,2].every(i => board[i][i] === player)) return true;
  if ([0,1,2].every(i => board[i][2-i] === player)) return true;
  return false;
}

function checkDraw(board) {
  return getAvailable(board).length === 0 &&
    !checkWin(board,1) &&
    !checkWin(board,2);
}

function minimax(board, depth, isAI) {
  if (checkWin(board,1)) return 10 - depth;
  if (checkWin(board,2)) return depth - 10;
  if (checkDraw(board)) return 0;

  if (isAI) {
    let best = -Infinity;
    for (const move of getAvailable(board)) {
      placeMove(board, move, 1);
      const score = minimax(board, depth+1, false);
      placeMove(board, move, 0);
      best = Math.max(best, score);
      if (depth === 0 && score === best)
        AIMove.current = move;
    }
    return best;
  } else {
    let best = Infinity;
    for (const move of getAvailable(board)) {
      placeMove(board, move, 2);
      const score = minimax(board, depth+1, true);
      placeMove(board, move, 0);
      best = Math.min(best, score);
    }
    return best;
  }
}

module.exports = {
  config: {
    name: "ttt",
    version: "4.0",
    author: "Rakib",
    role: 0,
    shortDescription: "TicTacToe Pro",
    category: "game"
  },

  onStart: async function ({ message, args, event }) {
    const { threadID, senderID } = event;

    global.GoatBot.tictactoe ??= new Map();
    global.GoatBot.tictactoeMultiplayer ??= new Map();

    if (args[0] === "delete") {
      global.GoatBot.tictactoe.delete(threadID);
      global.GoatBot.tictactoeMultiplayer.delete(threadID);
      return message.reply("Game deleted.");
    }

    if (global.GoatBot.tictactoe.has(threadID))
      return message.reply("Game already running!");

    const data = startBoard(true);
    global.GoatBot.tictactoe.set(threadID, {
      ...data,
      player: senderID
    });

    const img = await displayBoard(data);

    return message.reply(
      { body: "TicTacToe started! Reply 1-9", attachment: img },
      (err, info) => {
        global.GoatBot.onReply.set(info.messageID, {
          commandName: "ttt",
          player: senderID
        });
      }
    );
  },

  onReply: async function ({ message, event, Reply }) {
    const { threadID, senderID, body } = event;

    if (Reply.player !== senderID)
      return message.reply("You are not the player of this game!");

    const data = global.GoatBot.tictactoe.get(threadID);
    if (!data) return;

    const num = parseInt(body);
    if (isNaN(num) || num < 1 || num > 9)
      return message.reply("Choose 1-9");

    const row = Math.floor((num-1)/3);
    const col = (num-1)%3;

    if (data.board[row][col] !== 0)
      return message.reply("Cell taken!");

    placeMove(data.board,[row,col],2);

    if (checkWin(data.board,2)) {
      global.GoatBot.tictactoe.delete(threadID);
      const img = await displayBoard(data);
      return message.reply({ body:"You Win!", attachment:img });
    }

    AIMove.current = null;
    minimax(data.board,0,true);

    if (AIMove.current)
      placeMove(data.board,AIMove.current,1);

    if (checkWin(data.board,1)) {
      global.GoatBot.tictactoe.delete(threadID);
      const img = await displayBoard(data);
      return message.reply({ body:"AI Wins!", attachment:img });
    }

    if (checkDraw(data.board)) {
      global.GoatBot.tictactoe.delete(threadID);
      const img = await displayBoard(data);
      return message.reply({ body:"Draw!", attachment:img });
    }

    const img = await displayBoard(data);

    return message.reply(
      { body:"Your move!", attachment:img },
      (err, info) => {
        global.GoatBot.onReply.set(info.messageID, {
          commandName:"ttt",
          player: senderID
        });
      }
    );
  }
};
