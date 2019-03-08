function initLoadState() {
  var state = {};
  var game = window.game;

  state.preload = function() {
    console.log("Loading assets...");

    game.load.image("BlackBrickBlock", "/assets/images/brick_black.png");
    game.load.image("BreakBrickBlock", "/assets/images/brick_break.png");
    game.load.image("RedBrickBlock", "/assets/images/brick_red.png");
    game.load.image("Girder", "/assets/images/girder.png");
    game.load.image("Spike", "/assets/images/spike.png");
    game.load.image("Tool", "/assets/images/tool.png");
    game.load.image("Gus", "/assets/images/gus-static.png");

    console.log("Done loading");
  };

  state.create = function() {
    console.log("Starting world...");
    game.world.setBounds(-400, -300, 800, 600); // fullscreen???

    console.log("Going to create state...");
    // start game state
    const eventEmitter = window.eventEmitter;

    eventEmitter.on("found maps!", function(maps) {
      game.unparsedTileMap = maps[0] || {};
      console.log("about to log out the unparsed tile map");
      console.log(game.unparsedTileMap);
      game.parsedTileMap = maps[1];
      (function gotoStart() {
        if (game.state) game.state.start("create");
        else setTimeout(gotoStart, 100);
      })();
    });
    eventEmitter.emit("I need both the maps!");
  };

  return state;
}

module.exports = initLoadState;
