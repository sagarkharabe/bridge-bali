var STATE_GAME = {};

STATE_GAME.preload = function() {};

STATE_GAME.create = function() {
  console.log("game");
  game.add.sprite(32, 32, "Gus");
};
