const ENV = 2;

const ENV_ENUM = {
  LOCAL: 1,
  GITHUB: 2,
};
const PAGES_ENUM = {
    HOME: 'home',
    GAME: 'game',
    INDEX: 'index'
}
const router = {
  [PAGES_ENUM.HOME]: `src/home/index.html`,
  [PAGES_ENUM.GAME]: `src/game/index.html`,
  [PAGES_ENUM.INDEX]: `index.html`,
}
function getQueryParams() {
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
function goToPage(page, query = "") {
  const path = router[page];
  if (!path) {
    throw new Error("Route not found:", page);
  }
  const host = window.location.origin;
  const base = basePathByEnv.get(ENV);
  let url = host + base + "/" + path;
  if (query) {
    url += "?" + query;
  }
  window.location.href = url;
}

function getBasePathLocal(){
    return "";
}
function getBasePathGithub(){
    const pathParts = window.location.pathname.split("/");
    return "/" + pathParts[1];
}
const basePathByEnv = new Map([
    [ENV_ENUM.LOCAL , getBasePathLocal()],
    [ENV_ENUM.GITHUB , getBasePathGithub()]
]);
