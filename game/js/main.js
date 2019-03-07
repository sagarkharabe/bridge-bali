//var Phaser = require("phaser");

// startup options
var FULLSCREEN = false;
var WIDTH = FULLSCREEN ? window.innerWidth * window.devicePixelRatio : 800,
  HEIGHT = FULLSCREEN ? window.innerHeight * window.devicePixelRatio : 600;

function startGame(Phaser) {
  // initialize the game
  window.game = new Phaser.Game(
    WIDTH,
    HEIGHT,
    Phaser.AUTO,
    "game-container",
    undefined,
    undefined,
    false
  );
  var bootState = require("./states/boot");
  var gameState = require("./states/game");
  var loadState = require("./states/load");
  // add states
  game.state.add("boot", bootState());
  game.state.add("load", loadState());
  game.state.add("game", gameState());

  game.state.start("boot");
}

(function checkPhaserExists(phaser) {
  if (phaser) {
    console.log("Phaser runtime initialized, starting...");
    startGame(phaser);
  } else {
    setTimeout(function() {
      checkPhaserExists(window.Phaser);
    }, 100);
  }
})(window.Phaser);
