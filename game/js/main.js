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
    console.log("Checking existence of previous games...");
    var oldGameStillRunning = window.game ? window.game.isBooted : false;
    console.log(phaser.GAMES, window.game);
    for (var game in phaser.GAMES) {
      if (phaser.GAMES[game] !== null) oldGameStillRunning = true;
    }

    if (oldGameStillRunning) {
      console.log("Waiting for cleanup to finish...");
      setTimeout(function() {
        checkPhaserExists(window.Phaser);
      }, 300);
      return;
    }

    console.log("Phaser runtime initialized, starting...");
    startGame(phaser);
  } else {
    setTimeout(function() {
      checkPhaserExists(window.Phaser);
    }, 100);
  }
})(window.Phaser);
