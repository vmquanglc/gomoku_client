// Giả lập API trả về danh sách trận đấu
function fakeApiCall() {
  return new Promise((resolve) => {
    setTimeout(() => {
      const fakeMatches = [
        { id: 1, status: "waiting", createdAt: "2025-09-06T10:00:00Z" },
        { id: 2, status: "ready", createdAt: "2025-09-06T11:00:00Z" },
        { id: 3, status: "waiting", createdAt: "2025-09-06T12:00:00Z" },
        { id: 4, status: "ready", createdAt: "2025-09-06T09:00:00Z" },
      ];
      resolve(fakeMatches);
    }, 1500);
  });
}

// Sắp xếp: waiting lên trên, cùng trạng thái -> mới nhất lên trước
function sortMatches() {
  state.matches = state.matches.sort((a, b) => {
    if (a.status === b.status) {
      return new Date(b.createdAt) - new Date(a.createdAt);
    }
    return a.status === "waiting" ? -1 : 1;
  });
}

// Render danh sách trận đấu
function renderMatches() {
  const matchListEl = document.getElementById("match-list");
  matchListEl.innerHTML = "";

  state.matches.forEach((match) => {
    const div = document.createElement("div");
    div.className = "match-item";

    // Ẩn button nếu trạng thái ready
    const buttonHtml =
      match.status === "ready"
        ? ""
        : `<button class="play" onclick="joinMatch(${match.id})">Vào chơi</button>`;

    div.innerHTML = `
      <div>
        <span><strong>ID:</strong> ${match.id}</span> &nbsp;
        <span class="status ${match.status}">
          ${match.status === "ready" ? "Đủ người chơi" : "Chưa đủ người"}
        </span>
      </div>
      ${buttonHtml}
    `;
    matchListEl.appendChild(div);
  });
}



// Join match
function joinMatch(id) {
  alert("Vào chơi trận đấu ID: " + id);
}

// Tạo trận đấu mới
function createMatch() {
  const newId = state.matches.length ? Math.max(...state.matches.map((m) => m.id)) + 1 : 1;
  state.matches.push({
    id: newId,
    status: "waiting",
    createdAt: new Date().toISOString(),
  });
  sortMatches();
  renderMatches();
  // Scroll xuống cuối danh sách
  document.getElementById("match-list").scrollTop =
    document.getElementById("match-list").scrollHeight;
}

// Vào nhanh theo ID
function quickJoin() {
  const idInput = document.getElementById("quick-id");
  const id = parseInt(idInput.value);
  if (!id || isNaN(id)) {
    alert("Vui lòng nhập ID hợp lệ");
    return;
  }

  const match = state.matches.find((m) => m.id === id);
  if (!match) {
    alert("Không tìm thấy trận đấu với ID này");
    return;
  }

  if (match.status === "ready") {
    alert("Trận đấu đã đủ người chơi");
    return;
  }

  joinMatch(id);
}
const popupConnectingServer = new PopupConnectingServer();
popupConnectingServer.show();

const state = new Proxy({
    connectedServer: false,
    matches: []
},{
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
    }
});

function initSocket(){
    const socket = io("http://localhost:3000");
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
}
// Khởi tạo
async function init() {
  // Gọi API
  state.matches = await fakeApiCall();
  sortMatches();
  renderMatches();
  initSocket();

  // Button Tạo trận đấu
  document.getElementById("create-game").addEventListener("click", createMatch);

  // Button Vào nhanh
  document.getElementById("quick-join").addEventListener("click", quickJoin);
}

// Chạy khi DOM load
window.addEventListener("DOMContentLoaded", init);
