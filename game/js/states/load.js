//const { COLOR } = require("../const/colors");
function initLoadState() {
  var state = {};

  state.preload = function() {
    console.log("Loading assets...");

    game.load.image(
      "BrickBlack",
      "/Users/mac/Desktop/capstone/public/assests/images/brick_black.png"
    );
    game.load.image("BrickBreak", "public/assets/images/brick_break.png");
    game.load.image("BrickRed", "public/assets/images/brick_red.png");
    game.load.image("Girder", "public/assets/images/girder.png");
    game.load.image("Tool", "public/assets/images/tool.png");
    game.load.spritesheet("Gus", "public/assets/images/gus.png", 32, 32);

    console.log("Done loading");
  };

  state.create = function() {
    // set background color
    game.stage.setBackgroundColor("#4428BC");

    // start game state
    game.state.start("game");
  };

  return state;
}
