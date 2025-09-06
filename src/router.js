class Gomoku_Router {
  static ENV_ENUM = {
    LOCAL: 1,
    GITHUB: 2,
  };
  static PAGES_ENUM = {
    HOME: "home",
    GAME: "game",
    INDEX: "index",
  };
  static router = {
    [Gomoku_Router.PAGES_ENUM.HOME]: `src/home/index.html`,
    [Gomoku_Router.PAGES_ENUM.GAME]: `src/game/index.html`,
    [Gomoku_Router.PAGES_ENUM.INDEX]: `index.html`,
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
  static goToPage(page, query = "") {
    const path = Gomoku_Router.router[page];
    if (!path) {
      throw new Error("Route not found:", page);
    }
    const host = window.location.origin;
    const base = Gomoku_Router.basePathByEnv.get(Gomoku_Config.ENV);
    let url = host + base + "/" + path;
    if (query) {
      url += "?" + query;
    }
    window.location.href = url;
  }

  static getBasePathLocal() {
    return "";
  }
  static getBasePathGithub() {
    const pathParts = window.location.pathname.split("/");
    return "/" + pathParts[1];
  }
  static basePathByEnv = new Map([
    [Gomoku_Router.ENV_ENUM.LOCAL, Gomoku_Router.getBasePathLocal()],
    [Gomoku_Router.ENV_ENUM.GITHUB, Gomoku_Router.getBasePathGithub()],
  ]);
}
