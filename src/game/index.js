const socket = io(Gomoku_Config.SERVER_URL);

function getOrCreateToken() {
  const urlParams = new URLSearchParams(window.location.search);
  let token = urlParams.get("token");
  if (!token) {
    token = Math.floor(100000 + Math.random() * 900000);
    window.location.search = `?token=${token}`;
  }
  return token;
}

const token = getOrCreateToken();

// DOM elements
const boardEl = document.getElementById("board");
const statusEl = document.getElementById("status");
const playerInfoEl = document.getElementById("playerInfo");
const timerEl = document.getElementById("timer");
const passBtn = document.getElementById("passBtn");
const resetBtn = document.getElementById("resetBtn");
document
  .getElementById("backToHome")
  .addEventListener("click", () =>
    Gomoku_Router.goToPage({ page: Gomoku_Constant.PAGES.HOME })
  );
const popupConnectingServer = new PopupShowInformation({
  message: Gomoku_i18n.ConnectingToServer,
});
const popupWaitingOtherPlayer = new PopupShowInformation({
  message: Gomoku_i18n.WaitingForOpponent,
});
popupWaitingOtherPlayer.show();

const popupShowOpponentPassTurn = new PopupShowInformation(
  {
    message: Gomoku_i18n.OpponentPassTurn,
  },
  { timeout: 2000 }
);

const popupWaitingResetRequest = new PopupShowInformation(
  {
    message: Gomoku_i18n.WaitingResetRequest,
  },
  { timeout: 2000 }
);

const popupYesNoResetRequest = new PopupYesNo(
  {
    message: Gomoku_i18n.AskToRestart,
  },
  {
    yesCallBack: () => {
      resetGame(true);
      popupYesNoResetRequest.close();
    },
    timeout: 3000,
  }
);

let mySymbol = null;
let currentPlayer = null;
let lastMoves = { X: null, O: null };
let timer = 60;
let timerInterval;

const state = new Proxy(
  {
    connectedServer: false,
    waitingOtherPlayer: true,
  },
  {
    set(target, property, value) {
      switch (property) {
        case "connectedServer":
          value ? popupConnectingServer.close() : popupConnectingServer.show();
          break;
        case "waitingOtherPlayer":
          value
            ? popupWaitingOtherPlayer.show()
            : popupWaitingOtherPlayer.close();
          break;
        default:
          break;
      }

      target[property] = value;
      return true; // must return true to indicate success
    },
  }
);

function initBoard() {
  boardEl.innerHTML = "";
  boardEl.style.display = "grid";
  boardEl.style.gridTemplateColumns = "repeat(18, 1fr)";
  for (let r = 0; r < 18; r++) {
    for (let c = 0; c < 18; c++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.dataset.row = r;
      cell.dataset.col = c;
      cell.addEventListener("click", () => makeMove(r, c));
      boardEl.appendChild(cell);
    }
  }
}

// Reset timer
function resetTimer() {
  clearInterval(timerInterval);
  timer = 60;
  timerEl.textContent = `${timer}`;
  timerInterval = setInterval(() => {
    timer--;
    timerEl.textContent = `${timer}`;
    if (timer <= 0) {
      clearInterval(timerInterval);
      passTurn();
    }
  }, 1000);
}

// Highlight bước cuối cùng
function highlightLastMove(symbol, row, col) {
  if (lastMoves[symbol]) {
    const prev = document.querySelector(
      `.cell[data-row="${lastMoves[symbol].row}"][data-col="${lastMoves[symbol].col}"]`
    );
    if (prev) prev.classList.remove("last-x", "last-o");
  }
  const cell = document.querySelector(
    `.cell[data-row="${row}"][data-col="${col}"]`
  );
  if (cell) {
    cell.classList.add(symbol === "X" ? "last-x" : "last-o");
    lastMoves[symbol] = { row, col };
  }
}

// Socket events
// Kết nối thành công
socket.on("connect", () => {
  state.connectedServer = true;
});

// Kết nối thất bại / lỗi
socket.on("connect_error", (err) => {
  state.connectedServer = false;
});

// Kết nối timeout (không phản hồi từ server)
socket.on("connect_timeout", (timeout) => {
  state.connectedServer = false;
});

socket.emit("joinRoom", token);

socket.on("joined", (data) => {
  mySymbol = data.symbol;
  playerInfoEl.textContent = `You ${mySymbol}`;
});

socket.on("checkWaitingOtherPlayer", ({ waiting }) => {
  state.waitingOtherPlayer = waiting;
});

socket.on("redirectHome", () => {
  Gomoku_Router.goToPage({ page: Gomoku_Constant.PAGES.HOME });
});

// Khi server reset trận đấu
socket.on("resetGame", ({ currentPlayer: cp }) => {
  initBoard();
  lastMoves = { X: null, O: null };
  currentPlayer = cp;
  statusEl.textContent = `Game started! Turn: ${currentPlayer}`;
  boardEl.dataset.gameOver = "false";
  resetTimer();
});

// Khi có nước đi mới
socket.on("updateBoard", ({ row, col, symbol, currentPlayer: cp }) => {
  const cell = document.querySelector(
    `.cell[data-row="${row}"][data-col="${col}"]`
  );
  if (cell) cell.textContent = symbol;

  highlightLastMove(symbol, row, col);
  currentPlayer = cp;
  statusEl.textContent = `Turn: ${currentPlayer}`;
  resetTimer();
});

socket.on("gameOver", ({ winner, cells }) => {
  statusEl.textContent = `${winner} Wins! 🎉`;
  clearInterval(timerInterval);

  // highlight ô thắng
  cells.forEach(({ row, col }) => {
    const cell = document.querySelector(
      `.cell[data-row="${row}"][data-col="${col}"]`
    );
    if (cell) cell.classList.add("win-cell");
  });

  // khóa bàn cờ
  boardEl.dataset.gameOver = "true";
});

// Khi đối thủ thoát
socket.on("opponentLeft", () => {
  statusEl.textContent = "❌ Opponent left. Game ended.";
  clearInterval(timerInterval);
  state.waitingOtherPlayer = true;
});

socket.on("passTurn", ({}) => {
  popupShowOpponentPassTurn.show();
});

socket.on("waitingResetResponse", ({}) => {
  popupWaitingResetRequest.show();
});

socket.on("confirmResetRequest", ({}) => {
  popupYesNoResetRequest.show();
});

// Gửi nước đi
function makeMove(row, col) {
  if (boardEl.dataset.gameOver === "true") return; // khóa bàn
  if (currentPlayer !== mySymbol) return;
  const cell = document.querySelector(
    `.cell[data-row="${row}"][data-col="${col}"]`
  );
  if (cell.textContent) return;
  socket.emit("makeMove", { row, col });
}

// Bỏ lượt
function passTurn() {
  if (currentPlayer === mySymbol) {
    boardEl.dataset.gameOver !== "true" && socket.emit("passTurn");
  }
}

// Reset game
function resetGame(yes) {
  debugger;
  socket.emit("resetRequest", { confirmReset: !!yes });
}

passBtn.addEventListener("click", passTurn);
resetBtn.addEventListener("click", () => resetGame(false));

// Init UI
initBoard();
