(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
var COLORS = {};

COLORS.DEFAULT_SKY = "#4428BC";
module.exports = COLORS;

},{}],2:[function(require,module,exports){
module.exports = {
  EPSILON: 0.000001,
  TAU: Math.PI * 2
};

},{}],3:[function(require,module,exports){
module.exports = {
  1: "Gus",
  2: "Tool",
  3: "RedBrickBlock",
  4: "BlackBrickBlock",
  5: "BreakBrickBlock",
  6: "Spike"
};

},{}],4:[function(require,module,exports){
var TAU = require("../const").TAU;

function Dolly(camera) {
  this.movementFactor = 2;
  this.rotationFactor = 4;

  this.camera = camera;
  this.position = camera.displayObject.position;
  this.rotation = camera.displayObject.rotation;
  this.scale = camera.scale;

  this.lockTarget = null;
  this.targetPos = null;
  this.targetAng = null;
  this.targetScale = null;
}

function midpoint(p1, p2) {
  var x = p1.x + (p2.x - p1.x) * game.time.physicsElapsed;
  var y = p1.y + (p2.y - p1.y) * game.time.physicsElapsed;

  return new Phaser.Point(x, y);
}

Dolly.prototype.update = function() {
  if (this.lockTarget) {
    this.targetPos = this.lockTarget.position;
    this.targetAng = this.lockTarget.rotation;
  }

  if (this.targetPos !== null) {
    this.position = midpoint(this.position, this.targetPos);
  }

  if (this.targetAng !== null) {
    while (this.targetAng - this.rotation > Math.PI) this.rotation += TAU;
    while (this.rotation - this.targetAng > Math.PI) this.rotation -= TAU;

    this.rotation +=
      (this.targetAng - this.rotation) *
      game.time.physicsElapsed *
      this.rotationFactor;
  }

  this.camera.displayObject.pivot.x = this.position.x;
  this.camera.displayObject.pivot.y = this.position.y;
  this.camera.displayObject.rotation = TAU - this.rotation;
};

Dolly.prototype.lockTo = function(dispObj) {
  this.lockTarget = dispObj;
};

Dolly.prototype.unlock = function() {
  this.lockTarget = null;
};

Dolly.prototype.screenspaceToWorldspace = function(point) {
  var cosine = Math.cos(TAU - this.rotation),
    sine = Math.sin(TAU - this.rotation);
  var topleft = {
    x:
      this.position.x -
      (cosine * game.camera.width) / 2 -
      (sine * game.camera.height) / 2,
    y:
      this.position.y -
      (cosine * game.camera.height) / 2 +
      (sine * game.camera.width) / 2
  };

  return new Phaser.Point(
    point.x * cosine + point.y * sine + topleft.x,
    point.y * cosine - point.x * sine + topleft.y
  );
};
module.exports = Dolly;

},{"../const":2}],5:[function(require,module,exports){
function Cursors(upkey, leftkey, downkey, rightkey) {
  this.up = upkey;
  this.left = leftkey;
  this.down = downkey;
  this.right = rightkey;
}

Cursors.prototype.isDown = function() {
  return (
    this.up.isDown || this.left.isDown || this.down.isDown || this.right.isDown
  );
};

Cursors.prototype.getVector = function() {
  var xMovement = Number(this.left.isDown) - Number(this.right.isDown);
  var yMovement = Number(this.up.isDown) - Number(this.down.isDown);

  return new Phaser.Point(xMovement, yMovement);
};

module.exports = Cursors;

},{}],6:[function(require,module,exports){
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

},{"./states/create":7,"./states/load":8}],7:[function(require,module,exports){
"use strict";
const COLORS = require("../../game/js/const/colors");
const NUM_TO_TILES = require("../../game/js/const/tilemap");

var Dolly = require("../../game/js/objects/dolly");
var Cursors = require("../controls/cursors");
let gusSpawn,
  upKey,
  downKey,
  leftKey,
  rightKey,
  rotateCounterKey,
  routateClockwiseKey,
  grid,
  selector;
let wasdCursors, arrowCursors;
let lastRotTime = 0;

function tileToNum(tile) {
  for (let n in NUM_TO_TILES) if (NUM_TO_TILES[n] === tile) return +n;

  throw new Error("Tile not found!");
}

function parseCoordinate(n) {
  return Math.floor(n / 32) * 32;
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
  let unparsedTileMap;

  state.preload = function() {
    eventEmitter.emit("loaded", () => {});
    unparsedTileMap = game.unparsedTileMap;
    game.parsedTileMap.forEach(function(obj) {
      var unparTiMa = unparsedTileMap[obj.x][obj.y];
      var sprite = game.add.sprite(obj.x, obj.y, unparTiMa.tile);
      if (unparTiMa.tile === "Gus") {
        gusSpawn = sprite;
      }
      sprite.anchor.setTo(0.5, 0.5);
      unparTiMa.sprite = sprite;
      if (unparTiMa !== undefined) unparTiMa.sprite.angle = obj.r;
    });
    game.activeTool = "RedBrickBlock";
    selector = game.add.sprite("0", "0", "Select");
    selector.anchor.setTo(0.5, 0.5);
  };

  state.create = function() {
    const game = window.game;
    gusSpawn = gusSpawn || game.add.sprite("0", "0", "Gus");
    gusSpawn.anchor.setTo(0.5, 0.5);
    game.stage.setBackgroundColor(COLORS.DEFAULT_SKY);

    game.dolly = new Dolly(game.camera);
    game.dolly.targetPos = new Phaser.Point(0, 0);

    grid = game.add.graphics();
    grid.lineStyle(2, 0x000, 0.2);
    for (
      var y =
        parseCoordinate(game.dolly.position.y - game.camera.width / 2) - 16;
      y < game.dolly.position.y + game.camera.width / 2 + 16;
      y += 32
    ) {
      grid.moveTo(game.dolly.position.x - game.camera.width / 2 - 32, y);
      grid.lineTo(game.dolly.position.x + game.camera.width / 2 + 32, y);
    }

    for (
      var x =
        parseCoordinate(game.dolly.position.x - game.camera.width / 2) - 16;
      x < game.dolly.position.x + game.camera.width / 2 + 16;
      x += 32
    ) {
      grid.moveTo(x, game.dolly.position.y - game.camera.width / 2 - 32);
      grid.lineTo(x, game.dolly.position.y + game.camera.width / 2 + 32);
    }

    // Set Keyboard input
    wasdCursors = new Cursors(
      game.input.keyboard.addKey(Phaser.KeyCode.W),
      game.input.keyboard.addKey(Phaser.KeyCode.A),
      game.input.keyboard.addKey(Phaser.KeyCode.S),
      game.input.keyboard.addKey(Phaser.KeyCode.D)
    );
    arrowCursors = new Cursors(
      game.input.keyboard.addKey(Phaser.KeyCode.UP),
      game.input.keyboard.addKey(Phaser.KeyCode.LEFT),
      game.input.keyboard.addKey(Phaser.KeyCode.DOWN),
      game.input.keyboard.addKey(Phaser.KeyCode.RIGHT)
    );
    rotateCounterKey = game.input.keyboard.addKey(Phaser.KeyCode.Q);
    routateClockwiseKey = game.input.keyboard.addKey(Phaser.KeyCode.E);

    game.dolly = new Dolly(game.camera);
    game.dolly.targetPos = new Phaser.Point(0, 0);

    eventEmitter.on("change active tool", tool => {
      game.activeTool = tool;
    });

    var handleTileMapRequest = function() {
      const parsedTileMap = [];

      if (!unparsedTileMap[gusSpawn.x]) {
        unparsedTileMap[gusSpawn.x] = {};
      }
      unparsedTileMap[gusSpawn.x][gusSpawn.y] = {
        tile: "Gus",
        sprite: gusSpawn
      };

      for (let x in unparsedTileMap) {
        if (!unparsedTileMap.hasOwnProperty(x)) continue;

        for (let y in unparsedTileMap[x]) {
          if (!unparsedTileMap[x].hasOwnProperty(y)) continue;
          if (unparsedTileMap[x][y] && unparsedTileMap[x][y]["tile"]) {
            if (unparsedTileMap[x][y]["tile"] === "Gus") {
              if (x != gusSpawn.x || y != gusSpawn.y) {
                continue;
              }
            }
            parsedTileMap.push({
              x: x,
              y: y,
              t: tileToNum(unparsedTileMap[x][y]["tile"]),
              r: unparsedTileMap[x][y].sprite.angle
                ? unparsedTileMap[x][y].sprite.angle
                : undefined
            });
          }
        }
      }
      /*if (gusSpawn) parsedTileMap.push({
			  x: gusSpawn.x,
			  y: gusSpawn.y,
			  t: tileToNum('Gus')
			  });*/
      eventEmitter.emit("send tile map", [parsedTileMap, unparsedTileMap]);
    };

    eventEmitter.on("request tile map", handleTileMapRequest);

    eventEmitter.on("request screenshot", function() {
      var screenshot = game.canvas.toDataURL();
      eventEmitter.emit("send screenshot", screenshot);
    });

    eventEmitter.on("stop input capture", function() {
      game.input.enabled = false;
      game.input.reset();
    });

    eventEmitter.on("start input capture", function() {
      game.input.enabled = true;
      game.input.reset();
    });
  };

  state.update = function() {
    const cosine = Math.cos(game.dolly.rotation),
      sine = Math.sin(game.dolly.rotation);

    const mousePoint = new Phaser.Point(
      game.input.mousePointer.x + (16 * cosine + sine),
      game.input.mousePointer.y + (16 * cosine - sine)
    );
    const convertedMousePoint = game.dolly.screenspaceToWorldspace(mousePoint);
    selector.x = parseCoordinate(convertedMousePoint.x);
    selector.y = parseCoordinate(convertedMousePoint.y);

    grid.position.x = parseCoordinate(game.dolly.position.x);
    grid.position.y = parseCoordinate(game.dolly.position.y);

    if (game.input.activePointer.isDown) {
      const clickPoint = new Phaser.Point(
        game.input.mousePointer.x + (16 * cosine + sine),
        game.input.mousePointer.y + (16 * cosine - sine)
      );
      const targetPoint = game.dolly.screenspaceToWorldspace(clickPoint);
      const x = parseCoordinate(targetPoint.x);
      const y = parseCoordinate(targetPoint.y);
      let placedTool;

      if (game.activeTool) {
        placedTool = game.add.sprite(x, y, game.activeTool);
        placedTool.anchor.setTo(0.5, 0.5);
      }

      if (game.activeTool === "Spike") {
        let orientations = {
          0: 0,
          90: 0,
          180: 0,
          270: 0
        };

        // find all adjacent blocks, checking in arcs of 90 degrees
        for (var orient = 0; orient < 360; orient += 90) {
          var orientRadians = (orient / 180) * Math.PI;
          var adjPoint = {
            x: x - Math.round(Math.sin(orientRadians)) * 32,
            y: y + Math.round(Math.cos(orientRadians)) * 32
          };

          if (unparsedTileMap && unparsedTileMap[adjPoint.x]) {
            var adjacentBlock = unparsedTileMap[adjPoint.x][adjPoint.y];

            if (adjacentBlock === undefined) continue;

            // check what kind of block it is, and weight it based on the angles
            if (
              adjacentBlock.tile === "RedBrickBlock" ||
              adjacentBlock.tile === "BlackBrickBlock"
            ) {
              orientations[orient] += 7;
            } else if (adjacentBlock.tile === "Spike") {
              orientations[adjacentBlock.sprite.angle] += 2;
            }
          }
        }

        // weight our rotation selection to our current rotation
        var curRot = game.dolly.targetAng % (Math.PI * 2);
        if (curRot < 0) curRot += Math.PI * 2;
        var maxOrient = (180 * curRot) / Math.PI;

        // find the maximum orientation
        for (var ang in orientations) {
          if (orientations[ang] > orientations[maxOrient]) {
            maxOrient = ang;
          }
        }

        // set angle
        placedTool.angle = maxOrient;
      }

      if (game.activeTool === "Gus") {
        if (gusSpawn) gusSpawn.kill();
        gusSpawn = placedTool;
        return;
      }

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
        // r: game.activeTool === 'Spike' ? placedTool.angle : undefined
      };
    }

    function move(xDiff, yDiff) {
      const clickPoint = new Phaser.Point(
        game.camera.width / 2 - xDiff,
        game.camera.height / 2 - yDiff
      );
      game.dolly.targetPos = game.dolly.screenspaceToWorldspace(clickPoint);
    }

    function rotate(dir) {
      if (Date.now() - lastRotTime > 500) {
        if (!game.dolly.targetAng) game.dolly.targetAng = 0;
        game.dolly.targetAng += (dir * Math.PI) / 2;
        lastRotTime = Date.now();
      }
    }

    const moveAmount = 64;

    var vec;
    if (arrowCursors.isDown()) {
      vec = arrowCursors.getVector();
      move(vec.x * moveAmount, vec.y * moveAmount);
    } else if (wasdCursors.isDown()) {
      vec = wasdCursors.getVector();
      move(vec.x * moveAmount, vec.y * moveAmount);
    }

    if (rotateCounterKey.isDown) rotate(1);
    if (routateClockwiseKey.isDown) rotate(-1);

    game.dolly.update();
  };

  return state;
}

module.exports = initCreateState;

},{"../../game/js/const/colors":1,"../../game/js/const/tilemap":3,"../../game/js/objects/dolly":4,"../controls/cursors":5}],8:[function(require,module,exports){
function initLoadState() {
  var state = {};
  var game = window.game;

  state.preload = function() {
    console.log("Loading assets...");

    game.load.image("BlackBrickBlock", "game/assets/images/brick_black.png");
    game.load.image("BreakBrickBlock", "game/assets/images/brick_break.png");
    game.load.image("RedBrickBlock", "game/assets/images/brick_red.png");
    game.load.image("Girder", "game/assets/images/girder.png");
    game.load.image("Spike", "game/assets/images/spike.png");
    game.load.image("Tool", "game/assets/images/tool.png");
    game.load.image("Gus", "game/assets/images/gus-static.png");
    game.load.image("Select", "game/assets/images/selectedBlockOutline.png");

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

},{}]},{},[6]);
