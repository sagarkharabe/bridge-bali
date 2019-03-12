// startup options
var FULLSCREEN = false;
var WIDTH = FULLSCREEN ? window.innerWidth * window.devicePixelRatio : 800,
  HEIGHT = FULLSCREEN ? window.innerHeight * window.devicePixelRatio : 600;
if (!window.PIXI) window.PIXI = require("pixi");

function startGame(phaser) {
  // initialize the game
  window.game = new phaser.Game(
    WIDTH,
    HEIGHT,
    Phaser.AUTO,
    "level-creator-container",
    undefined,
    undefined,
    false
  );
  var loadState = require("./states/load");
  var createState = require("./states/create");

  // necessary for screenshots when using WebGL renderer
  game.preserveDrawingBuffer = true;
  // add states
  game.state.add("load", loadState());
  game.state.add("create", createState());

  game.state.start("load");
}

(function checkPhaserExists(phaser) {
  if (phaser && (window.game === null || window.game === undefined)) {
    console.log("Phaser runtime initialized, starting...");
    startGame(phaser);
  } else {
    setTimeout(function() {
      checkPhaserExists(window.Phaser);
    }, 100);
  }
})(window.Phaser);
