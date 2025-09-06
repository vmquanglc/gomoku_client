const env = 2;



const ENV_ENUM = {
    LOCAL: 1,
    GITHUB: 2
}
const router  = new Map();
router.set(ENV_ENUM.LOCAL,{
    home: `/src/home/index.html`,
    game: `/src/game/index.html`,
    index: `/index.html`,
});
router.set(ENV_ENUM.GITHUB,{
    home: `/gomoku_client/src/home/index.html`,
    game: `/gomoku_client/src/game/index.html`,
    index: `/index.html`,
});
function moveToIndex(){
    window.location.href = window.location.origin + router.get(env).index; 
}
function moveToHome(){
    window.location.href = window.location.origin + router.get(env).home; 
}
function moveToGame(){
    window.location.href = window.location.origin + router.get(env).game; 
}