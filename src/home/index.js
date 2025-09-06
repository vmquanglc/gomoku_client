// Render danh sách trận đấu
function renderMatches() {
  const matchListEl = document.getElementById("match-list");
  matchListEl.innerHTML = "";

  state.matches.forEach((match) => {
    const div = document.createElement("div");
    div.className = "match-item";

    // Ẩn button nếu trạng thái ready
    const buttonHtml =
      match.status
        ? ""
        : `<button class="play" onclick="joinMatch(${match.id})">Play</button>`;

    div.innerHTML = `
      <div>
        <span><strong>ID:</strong> ${match.id}</span> &nbsp;
        <span class="status ${match.status? 'waiting' : 'ready'}">
          ${match.status ? "Full" : "Ready to play"}
        </span>
      </div>
      ${buttonHtml}
    `;
    matchListEl.appendChild(div);
  });
}

// Join match
function joinMatch(id) {
  Gomoku_Router.goToPage(
    Gomoku_Router.PAGES_ENUM.GAME,
    id ? `token=${id}` : ""
  );
}

function isValidUrl(str) {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}
// Vào nhanh theo ID
function quickJoin() {
  debugger;
  const _value = document.getElementById("quick-id").value;
  const [isUrl, isNumber] = [isValidUrl(_value), Number(_value) != NaN];
  if (!isUrl && !isNumber) {
    alert("Giá trị không hợp lệ!");
  }
  if (isUrl) {
    window.location.href = _value;
    return;
  }
  if (isNumber) {
    joinMatch(encodeURIComponent(_value));
    return;
  }
}
const popupConnectingServer = new PopupConnectingServer();

const state = new Proxy(
  {
    connectedServer: false,
    matches: [],
  },
  {
    set(target, property, value) {
      switch (property) {
        case "connectedServer":
          value ? popupConnectingServer.close() : popupConnectingServer.show();
          break;
        default:
          break;
      }

      target[property] = value;
      return true;
    },
  }
);

function initSocket() {
  const socket = io(Gomoku_Config.SERVER_URL, {
    query: { page: Gomoku_Router.PAGES_ENUM.HOME },
  });
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

  // Lắng nghe danh sách rooms từ server
  socket.on("roomsUpdate", (rooms) => {
      state.matches = rooms?.map(_ => _) ?? [];
      renderMatches();
  });
}
// Khởi tạo
async function init() {
  renderMatches();
  initSocket();

  // Button Tạo trận đấu
  document
    .getElementById("create-game")
    .addEventListener("click", () => joinMatch());

  // Button Vào nhanh
  document.getElementById("quick-join").addEventListener("click", quickJoin);
}

// Chạy khi DOM load
window.addEventListener("DOMContentLoaded", init);
