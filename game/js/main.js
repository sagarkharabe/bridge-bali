var bootState = require("./states/boot");
var gameState = require("./states/game");
var loadState = require("./states/load");

var Phaser = require("phaser");

// startup options
var FULLSCREEN = false;
var WIDTH = FULLSCREEN ? window.innerWidth * window.devicePixelRatio : 800,
  HEIGHT = FULLSCREEN ? window.innerHeight * window.devicePixelRatio : 600;

// initialize the game
window.game = new Phaser.Game(WIDTH, HEIGHT, Phaser.AUTO, "game-container");

// add states
game.state.add("boot", bootState());
game.state.add("load", loadState());
game.state.add("game", gameState());

game.state.start("boot");
