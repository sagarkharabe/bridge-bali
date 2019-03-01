//const { COLOR } = require("../const/colors");
function initLoadState() {
  var state = {};
  state.preload = function() {
    game.load.image("BrickBlack", "game/images/brick_black.png");
    game.load.image("BrickBreak", "game/images/brick_break.png");
    game.load.image("BrickRed", "game/images/brick_red.png");
    game.load.image("Girder", "game/images/girder.png");
    game.load.image("Tool", "game/images/tool.png");
    game.load.spritesheet("Gus", "game/images/gus.png", 32, 32);
  };

  state.create = function() {
    game.stage.setBackgroundColor(COLOR.BACKGROUND_SKY);
    game.state.start("game");
  };
  return state;
}
