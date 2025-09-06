const env = 'github';
const router  = new Map();
router.set('local',{
    home: `/src/home/index.html`,
    game: `/src/game/index.html`,
    index: `/index.html`,
});
router.set('github',{
    home: `/gomoku_client/src/home/index.html`,
    game: `/gomoku_client/src/game/index.html`,
    index: `/index.html`,
})