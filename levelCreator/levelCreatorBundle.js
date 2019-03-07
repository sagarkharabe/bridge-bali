(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
var COLORS = {};

COLORS.DEFAULT_SKY = "#4428BC";
module.exports = COLORS;

},{}],2:[function(require,module,exports){
module.exports = {
  1: "Gus",
  2: "Tool",
  3: "RedBrickBlock",
  4: "BlackBrickBlock",
  5: "BreakBrickBlock",
  6: "Spike"
};

},{}],3:[function(require,module,exports){
var loadState = require("./states/load");
var createState = require("./states/create");

// startup options
var FULLSCREEN = false;
var WIDTH = FULLSCREEN ? window.innerWidth * window.devicePixelRatio : 800,
  HEIGHT = FULLSCREEN ? window.innerHeight * window.devicePixelRatio : 600;

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

  // add states
  game.state.add("load", loadState());
  game.state.add("create", createState());

  game.state.start("load");
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

},{"./states/create":4,"./states/load":5}],4:[function(require,module,exports){
const COLORS = require("../../game/js/const/colors");
const NUM_TO_TILES = require("../../game/js/const/tilemap");

function tileToNum(tile) {
  for (let n in NUM_TO_TILES) if (NUM_TO_TILES[n] === tile) return +n;

  throw new Error("Tile not found!");
}
function initCreateState() {
  const state = {};

  const eventEmitter = window.eventEmitter;

  /* unparsedTileMap[x][y] = {sprite: sprite, tile: tile}
   * e.g. { 50: { 25: [ sprite: sprite, tile: 'RedBrick' ] } }
   *
   * formatted like this so that each addition to it is O(1) rather than O(n)
   * O(n) would suck with mouse drag.
   */
  const unparsedTileMap = {};

  state.preload = function() {
    eventEmitter.emit("loaded", () => {});
  };

  state.create = function() {
    const game = window.game;

    game.stage.setBackgroundColor(COLORS.DEFAULT_SKY);

    eventEmitter.on("change active tool", tool => {
      game.activeTool = tool;
    });

    eventEmitter.on("request tile map", function() {
      console.log("recieved request. processing...");
      const parsedTileMap = [];

      for (let x in unparsedTileMap) {
        if (!unparsedTileMap.hasOwnProperty(x)) continue;

        for (let y in unparsedTileMap[x]) {
          if (!unparsedTileMap[x].hasOwnProperty(x)) continue;
          if (unparsedTileMap[x][y] && unparsedTileMap[x][y]["tile"]) {
            parsedTileMap.push({
              x: x,
              y: y,
              t: tileToNum(unparsedTileMap[x][y]["tile"])
            });
          }
        }
      }
      console.log("sending...");
      eventEmitter.emit("send tile map", parsedTileMap);
    });
  };

  state.update = function() {
    function parseCoordinate(n) {
      return Math.floor(n / 32) * 32;
    }

    if (game.input.activePointer.isDown) {
      const x = parseCoordinate(game.input.mousePointer.x) - 400;
      const y = parseCoordinate(game.input.mousePointer.y) - 300;
      let placedTool;
      if (game.activeTool) placedTool = game.add.sprite(x, y, game.activeTool);

      if (
        unparsedTileMap[x] &&
        unparsedTileMap[x][y] &&
        unparsedTileMap[x][y]["sprite"]
      )
        unparsedTileMap[x][y]["sprite"].kill();

      if (!unparsedTileMap[x]) unparsedTileMap[x] = {};
      unparsedTileMap[x][y] = {
        sprite: placedTool,
        tile: game.activeTool
      };
      console.dir(unparsedTileMap);
    }
  };

  return state;
}

module.exports = initCreateState;

},{"../../game/js/const/colors":1,"../../game/js/const/tilemap":2}],5:[function(require,module,exports){
function initLoadState() {
  var state = {};
  var game = window.game;

  state.preload = function() {
    console.log("Loading assets...");

    game.load.image("BrickBlackBlock", "/assets/images/brick_black.png");
    game.load.image("BrickBreakBlock", "/assets/images/brick_break.png");
    game.load.image("BrickRedBlock", "/assets/images/brick_red.png");
    game.load.image("Girder", "/assets/images/girder.png");
    game.load.image("Tool", "/assets/images/tool.png");
    game.load.spritesheet("Gus", "/assets/images/gus.png", 32, 32);

    console.log("Done loading");
  };

  state.create = function() {
    console.log("Starting world...");
    game.world.setBounds(-400, -300, 800, 600); // fullscreen???
    console.log(game);

    console.log("Going to create state...");
    // start game state
    game.state.start("create");
  };

  return state;
}

module.exports = initLoadState;

},{}]},{},[3]);
