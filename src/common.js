class Gomoku_i18n {
  static WaitingForOpponent = `Waiting for Opponent....`;
  static ConnectingToServer = "Connecting to server...";
  static OpponentPassTurn = "The Opponent has passed turn, your turn now.";
  static WaitingResetRequest = "Waiting for opponent reset Response";
  static AskToRestart = "The Opponent want to restart the game?";
  static ResponseToNoRestart = "The Opponent has rejected your restart request";
}
class Gomoku_Constant {
  static PAGES = {
    HOME: "home",
    GAME: "game",
    INDEX: "index",
  };
  static RoomStatus = {
    Full: 2,
    ReadyToPlay: 3
  };
}
class Gomoku_Router {
  static router = {
    [Gomoku_Constant.PAGES.HOME]: `src/home/index.html`,
    [Gomoku_Constant.PAGES.GAME]: `src/game/index.html`,
    [Gomoku_Constant.PAGES.INDEX]: `index.html`,
  };
  static getQueryParams() {
    const params = {};
    window.location.search
      .substring(1)
      .split("&")
      .forEach((pair) => {
        if (pair) {
          const [key, value] = pair.split("=");
          params[decodeURIComponent(key)] = decodeURIComponent(value || "");
        }
      });
    return params;
  }
  static goToPage({ page, query = "", newTab = false }) {
    const path = Gomoku_Router.router[page];
    if (!path) {
      throw new Error("Route not found:", page);
    }
    const host = window.location.origin;
    const base = Gomoku_Router.getBasePath();
    debugger
    let url = host + base + "/" + path;
    if (query) {
      url += "?" + query;
    }
    if (newTab) {
      window.open(url, "_blank", "noopener,noreferrer");
      return;
    }
    window.location.href = url;
  }
  static getBasePath() {
    const pathParts = window.location.pathname.split("/");
    if(window.location.hostname.includes('github')){
      return "/" + pathParts[1];
    }
    return "";
  }
}
