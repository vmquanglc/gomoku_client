const popupConnectServer = new PopupConnectServer();
const state = new Proxy(
  { connectedServer: false },
  {
    set(target, key, value) {
      if (key === "connectedServer") {
        value ? popupConnectServer.close() : popupConnectServer.show()
      }
      target[key] = value;
      return true;
    },
  }
);

const socket = io("http://localhost:1995");
socket.on("connect", () => {
  state.connectedServer = true;
});
socket.on("connect_error", (err) => {
  state.connectedServer = false;
});
socket.on("disconnect", (reason) => {});