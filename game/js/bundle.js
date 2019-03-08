(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
var COLLISION_GROUPS = {};
COLLISION_GROUPS.BLOCK_SOLID = true;
COLLISION_GROUPS.BLOCK_BREAK = true;
COLLISION_GROUPS.BLOCK_ROTATE = true;
COLLISION_GROUPS.PLAYER_SOLID = true;
COLLISION_GROUPS.PLAYER_SENSOR = true;
COLLISION_GROUPS.ITEM = true;
COLLISION_GROUPS.SPIKES = true;
COLLISION_GROUPS.GHOST_BLOCK_BREAK = true;
COLLISION_GROUPS.GHOST_PLAYER_SOLID = true;
COLLISION_GROUPS.GHOST_PLAYER_SENSOR = true;
module.exports = COLLISION_GROUPS;

},{}],2:[function(require,module,exports){
var COLORS = {};

COLORS.DEFAULT_SKY = "#4428BC";
module.exports = COLORS;

},{}],3:[function(require,module,exports){
module.exports = {
  EPSILON: 0.000001,
  TAU: Math.PI * 2
};

},{}],4:[function(require,module,exports){
module.exports = {
  1: "Gus",
  2: "Tool",
  3: "RedBrickBlock",
  4: "BlackBrickBlock",
  5: "BreakBrickBlock",
  6: "Spike"
};

},{}],5:[function(require,module,exports){
var tilemap = require("../const/tilemap");
var objects = require("../objects");
var game = window.game;
var blockIds = {};

function addBlockId(id, loadFunction) {
  if (blockIds[id] !== undefined) {
    throw new Error("Duplicate Block ID entry for " + id.toString());
  }

  var blockIdObject = {
    onLoad: loadFunction
  };

  blockIds[id] = blockIdObject;
}

function generateBlockIdForConstructor(id, constructor) {
  addBlockId(id, function(defObj) {
    var newObj = new constructor(defObj.x, defObj.y);
    if (defObj.r) newObj.sprite.rotation = (defObj.r / 180) * Math.PI;
    return newObj;
  });
}

function placeGus(defObj) {
  window.game.gusStartPos = { x: defObj.x, y: defObj.y };
}

// dynamically generate our block ids
for (var index in tilemap) {
  if (tilemap[index] === "Gus") {
    addBlockId(index, placeGus);
  } else {
    var foundConstructor = undefined;
    for (var objKey in objects) {
      if (tilemap[index] === objKey) foundConstructor = objects[objKey];
    }

    if (foundConstructor !== undefined) {
      generateBlockIdForConstructor(index, foundConstructor);
    } else {
      console.log(
        "[LVGN]!! Failed to look up constructor for " + tilemap[index]
      );
    }
  }
}

module.exports = blockIds;

},{"../const/tilemap":4,"../objects":14}],6:[function(require,module,exports){
var blockIds = require("./blockIds");
var defaultSkyColor = require("../const/colors").DEFAULT_SKY;
var tilemap = require("../const/tilemap");

var GhostBreakBrickBlock = require("../objects/ghostBreakBrickBlock");
function LevelGenerator(levelData) {
  if (blockIds === undefined) console.error("blockIds are undefined (wtf!!)");
  this.blockIds = blockIds;
  this.levelData = levelData;
}

LevelGenerator.prototype.getSkyColor = function() {
  return this.levelData.sky || defaultSkyColor;
};
LevelGenerator.prototype.getStartingGirders = function() {
  return this.levelData.girders || 10;
};

LevelGenerator.prototype.parseObjects = function() {
  var levelObjects = [];
  var objDefList = this.levelData.objs;
  var blocks = this.blockIds;

  objDefList.forEach(function(objDef) {
    // find the object definition function for this id
    var createFunction = undefined;
    if (objDef.t !== undefined && blocks[objDef.t] !== undefined) {
      createFunction = blocks[objDef.t].onLoad;
    } else {
      console.log("[LVGN] No tile found for", objDef.t);
    }

    if (typeof createFunction !== "function") {
      console.error(
        "Received an invalid object definition from mapdata:\n",
        JSON.stringify(objDef)
      );
      return;
    }

    // create it!
    levelObjects.push(createFunction(objDef));

    // account for ghost mode
    if (tilemap[objDef.t] === "BreakBrickBlock") {
      levelObjects.push(new GhostBreakBrickBlock(objDef.x, objDef.y));
    }
  });

  return levelObjects;
};

module.exports = LevelGenerator;

},{"../const/colors":2,"../const/tilemap":4,"../objects/ghostBreakBrickBlock":10,"./blockIds":5}],7:[function(require,module,exports){
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
  if (phaser && window.game === undefined) {
    console.log("Phaser runtime initialized, starting...");
    startGame(phaser);
  } else {
    setTimeout(function() {
      checkPhaserExists(window.Phaser);
    }, 100);
  }
})(window.Phaser);

},{"./states/boot":19,"./states/game":20,"./states/load":21}],8:[function(require,module,exports){
var ParticleBurst = require("../particles/burst");
var COLLISION_GROUPS = require("../const/collisionGroup");
var TAU = require("../const").TAU;
function Block(x, y, sprite) {
  var game = window.game;
  x = Math.floor(x / 32) * 32;
  y = Math.floor(y / 32) * 32;

  this.sprite = game.add.sprite(x, y, sprite);
  this.sprite.smoothed = false;

  game.physics.p2.enable(this.sprite, false);

  this.sprite.body.setRectangle(32, 32);
  this.sprite.body.static = true;
  this.sprite.body.fixedRotation = true;
}

function RedBrickBlock(x, y) {
  Block.call(this, x, y, "BrickRed");

  this.sprite.body.setCollisionGroup(COLLISION_GROUPS.BLOCK_ROTATE);
  this.sprite.body.collides([
    COLLISION_GROUPS.PLAYER_SOLID,
    COLLISION_GROUPS.GHOST_PLAYER_SOLID,
    COLLISION_GROUPS.PLAYER_SENSOR,
    COLLISION_GROUPS.GHOST_PLAYER_SENSOR
  ]);
}
RedBrickBlock.prototype = Block;
function Girder(x, y) {
  Block.call(this, x, y, "Girder");

  this.sprite.body.setCollisionGroup(COLLISION_GROUPS.BLOCK_ROTATE);
  this.sprite.body.collides([
    COLLISION_GROUPS.PLAYER_SOLID,
    COLLISION_GROUPS.GHOST_PLAYER_SOLID,
    COLLISION_GROUPS.PLAYER_SENSOR,
    COLLISION_GROUPS.GHOST_PLAYER_SENSOR
  ]);
}
Girder.prototype = Block;

function BlackBrickBlock(x, y) {
  Block.call(this, x, y, "BrickBlack");

  this.sprite.body.setCollisionGroup(COLLISION_GROUPS.BLOCK_SOLID);
  this.sprite.body.collides([
    COLLISION_GROUPS.PLAYER_SOLID,
    COLLISION_GROUPS.GHOST_PLAYER_SOLID
  ]);
}
BlackBrickBlock.prototype = Block;

var breakingBlocks = [];
function BreakBrickBlock(x, y, setCollisions) {
  if (setCollisions === undefined) setCollisions = true;
  Block.call(this, x, y, "BrickBreak");

  this.collapseTime = 1000;
  this.countCollapseTime = 0;

  if (setCollisions) this.setCollisions();

  breakingBlocks.push(this);
}
BreakBrickBlock.prototype = Object.create(Block.prototype);

BreakBrickBlock.prototype.setCollisions = function() {
  this.sprite.body.setCollisionGroup(COLLISION_GROUPS.BLOCK_BREAK);
  this.sprite.body.collides([
    COLLISION_GROUPS.PLAYER_SOLID,
    COLLISION_GROUPS.PLAYER_SENSOR,
    COLLISION_GROUPS.GHOST_PLAYER_SENSOR
  ]);
  this.sprite.body.onBeginContact.add(
    BreakBrickBlock.prototype.startCollapsing,
    this
  );
};

BreakBrickBlock.prototype.startCollapsing = function() {
  this.countCollapseTime = this.countCollapseTime || game.time.physicsElapsedMS;
};

BreakBrickBlock.prototype.update = function() {
  if (this.countCollapseTime > this.collapseTime) {
    this.collapse();
  } else if (this.countCollapseTime > 0) {
    this.countCollapseTime += game.time.physicsElapsedMS;

    var s = Math.round(Math.cos(this.countCollapseTime / (3 * TAU))) * 0.25;
    this.sprite.scale = { x: 1 + s, y: 1 + s };
  }
};

BreakBrickBlock.prototype.collapse = function() {
  if (!this.sprite.visible) return;

  this.sprite.visible = false;
  this.sprite.body.clearShapes();

  // make some particles!
  this.breakBurst = new ParticleBurst(
    this.sprite.position.x,
    this.sprite.position.y,
    "Debris",
    {
      lifetime: 500,
      count: 14,
      scaleMin: 0.4,
      scaleMax: 1.0,
      speed: 200,
      fadeOut: true
    }
  );
};

BreakBrickBlock.update = function() {
  breakingBlocks.forEach(function(block) {
    block.update();
  });
};

BreakBrickBlock.reset = function() {
  breakingBlocks.forEach(function(block) {
    block.sprite.visible = true;
    block.sprite.scale = { x: 1, y: 1 }; // this is cheaper than a Phaser.Point
    block.countCollapseTime = 0;
    block.setCollisions();
  });
};

module.exports = Block;
module.exports.RedBrickBlock = RedBrickBlock;
module.exports.BlackBrickBlock = BlackBrickBlock;
module.exports.BreakBrickBlock = BreakBrickBlock;
module.exports.Girder = Girder;

},{"../const":3,"../const/collisionGroup":1,"../particles/burst":18}],9:[function(require,module,exports){
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

},{"../const":3}],10:[function(require,module,exports){
"use strict";
const BreakBrickBlock = require("./blocks").BreakBrickBlock;
const COLLISION_GROUPS = require("../const/collisionGroup");
class GhostBreakBrickBlock extends BreakBrickBlock {
  constructor(x, y) {
    super(x, y, false); // call BreakBrickBlock without it setting collisions

    this.sprite.alpha = 0.5;

    // set collisions
    this.sprite.body.setCollisionGroup(COLLISION_GROUPS.GHOST_BLOCK_BREAK);
    this.sprite.body.collides([
      COLLISION_GROUPS.GHOST_PLAYER_SOLID,
      COLLISION_GROUPS.GHOST_PLAYER_SENSOR
    ]);
    this.sprite.body.onBeginContact.add(
      BreakBrickBlock.prototype.startCollapsing,
      this
    );
  }
}

module.exports = GhostBreakBrickBlock;

},{"../const/collisionGroup":1,"./blocks":8}],11:[function(require,module,exports){
"use strict";

const game = window.game;

const Gus = require("./gus");
const ParticleBurst = require("../particles/burst");

const COLLISION_GROUPS = require("../const/collisionGroup");
const EPSILON = require("../const").EPSILON;
const TAU = require("../const").TAU;

class GhostGus extends Gus {
  constructor(x, y) {
    console.log("calling Bali constructor");
    super(x, y, false);
    console.log("'called Bali constructor'");
    this.sprite.alpha = 0.5;
    this.setCollision();
    this.record = [
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      0,
      0,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ];
  }
  // diff from Gus's doom: doesn't unlock the dolly
  doom() {
    this.sprite.body.clearCollision();
    this.sprite.body.fixedRotation = false;

    this.sprite.body.velocity.x = Math.sin(this.rotation) * 250;
    this.sprite.body.velocity.y = Math.cos(this.rotation) * -250;

    this.sprite.body.angularVelocity = 30;
    //this.sprite.body.rotateRight( 360 );
  }

  setCollision() {
    this.sprite.body.setCollisionGroup(COLLISION_GROUPS.GHOST_PLAYER_SOLID);
    this.sprite.body.setCollisionGroup(
      COLLISION_GROUPS.GHOST_PLAYER_SENSOR,
      this.rotationSensor
    );
    this.sprite.body.collides([
      COLLISION_GROUPS.GHOST_BLOCK_BREAK,
      COLLISION_GROUPS.BLOCK_SOLID,
      COLLISION_GROUPS.BLOCK_ROTATE,
      COLLISION_GROUPS.ITEM,
      COLLISION_GROUPS.SPIKES
    ]);
  }

  update() {
    // clear horizontal movement
    const currentMove = this.record.pop();

    if (Math.abs(Math.cos(this.rotation)) > EPSILON)
      this.sprite.body.velocity.x = 0;
    else this.sprite.body.velocity.y = 0;

    // check to see if we're rotating
    if (this.rotating) {
      // stop all movement
      this.stop();
      this.sprite.body.velocity.y = 0;
      this.sprite.body.velocity.x = 0;

      // create a rotate tween
      if (this.rotateTween === undefined) {
        this.rotateTween = game.add
          .tween(this.sprite)
          .to(
            {
              rotation: this.targetRotation
            },
            300,
            Phaser.Easing.Default,
            true
          )
          .onComplete.add(function() {
            this.rotation = this.targetRotation % TAU; // keep angle within 0-2pi
            this.finishRotation();
          }, this);
      }
    } else if (!this.isDead) {
      // do gravity
      this.applyGravity();

      if (this.rotationSensor.needsCollisionData) {
        this.setCollision();
        this.rotationSensor.needsCollisionData = false;
      }

      // check for input
      if (currentMove === 1) {
        this.walk("left");
      } else if (currentMove === 2) {
        this.walk("right");
      } else {
        this.stop();
      }

      if (!this.isTouching("down")) {
        this.fallTime += game.time.physicsElapsedMS;

        if (this.fallTime > this.killTime) {
          this.kill();
        }
      } else {
        this.fallTime = 0;
      }
    }
  }
}

module.exports = GhostGus;

},{"../const":3,"../const/collisionGroup":1,"../particles/burst":18,"./gus":13}],12:[function(require,module,exports){
var game = window.game;
var Girder = require("./blocks").Girder;
var ParticleBurst = require("../particles/burst");
var COLLISION_GROUPS = require("../const/collisionGroup");
var EPSILON = require("../const").EPSILON;
function GirderMarker() {
  if (game === undefined) game = window.game;

  this.master = null;
  this.girdersPlaced = [];
  this.placeGirderButton = null;

  // initialize our sprite
  this.sprite = game.add.sprite(0, 0, "Girder");
  this.sprite.anchor = new Phaser.Point(0.5, 0.5);

  // change the sprite visibility
  this.placeable = false;
  this.sprite.alpha = 0.5;
  this.sprite.visible = false;
}

GirderMarker.prototype.setMaster = function(newMaster) {
  this.master = newMaster;
};

GirderMarker.prototype.masterPos = function() {
  var masterPos = this.master.sprite.position;
  var cosine = Math.cos(this.master.rotation);

  var sine = Math.sin(this.master.rotation);

  masterPos.right = function() {
    if (Math.abs(cosine) > 1 - EPSILON) {
      masterPos.x += cosine * 24;
      return masterPos;
    } else {
      masterPos.y += sine * 24;
      return masterPos;
    }
  };

  masterPos.left = function() {
    if (Math.abs(cosine) > 1 - EPSILON) {
      masterPos.x -= cosine * 24;
      return masterPos;
    } else {
      masterPos.y -= sine * 24;
      return masterPos;
    }
  };

  masterPos.top = function() {
    if (Math.abs(cosine) > 1 - EPSILON)
      return new Phaser.Point(masterPos.x + cosine, masterPos.y - cosine * 32);
    else return new Phaser.Point(masterPos.x + sine * 32, masterPos.y + sine);
  };

  masterPos.front = function() {
    if (Math.abs(cosine) > 1 - EPSILON)
      return new Phaser.Point(masterPos.x + cosine, masterPos.y);
    else return new Phaser.Point(masterPos.x, masterPos.y + sine);
  };

  masterPos.bottom = function() {
    if (Math.abs(cosine) > 1 - EPSILON)
      return new Phaser.Point(masterPos.x + cosine, masterPos.y + cosine * 32);
    else return new Phaser.Point(masterPos.x - sine * 32, masterPos.y + sine);
  };

  return masterPos;
};

GirderMarker.prototype.getTargetPos = function() {
  // get our position factory based on the player's facing
  var posFactory = this.masterPos();
  if (this.master.facingRight) posFactory = posFactory.right();
  else posFactory = posFactory.left();

  // start at the bottom
  var bottom = posFactory.bottom();
  bottom.isBottom = true;

  // test to see if there's anything in the way of this girder
  var hitBoxes = game.physics.p2.hitTest(bottom);
  if (hitBoxes.length) {
    // there is! is it an unplaceable object?
    var hitUnplaceable = false;
    hitBoxes.forEach(function(box) {
      if (
        box.parent.collidesWith.indexOf(COLLISION_GROUPS.PLAYER_SENSOR) === -1
      )
        hitUnplaceable = true;
    });
    if (hitUnplaceable) return undefined;
    // check in front of the player instead
    var front = posFactory.front();
    front.isBottom = false;
    // if we hit another thing, return undefined. otherwise, return the position
    if (game.physics.p2.hitTest(front).length) {
      return undefined;
    } else {
      return front;
    }
  } else {
    // check to see if there's something underneath Gus
    var hitBelow = [];
    if (this.master.facingRight)
      hitBelow = game.physics.p2.hitTest(
        this.masterPos()
          .left()
          .bottom()
      );
    else
      hitBelow = game.physics.p2.hitTest(
        this.masterPos()
          .right()
          .bottom()
      );

    if (hitBelow.length) {
      // Gus is standing on something, check to see if we can place on it
      var standingOnUnplaceable = false;
      hitBelow.forEach(function(box) {
        if (
          box.parent.collidesWith.indexOf(COLLISION_GROUPS.PLAYER_SENSOR) === -1
        )
          standingOnUnplaceable = true;
      });
      if (standingOnUnplaceable) return undefined;

      return bottom;
    } else {
      return undefined;
    }
  }
};

GirderMarker.prototype.roundTargetPos = function(pos) {
  return new Phaser.Point(
    Math.round(pos.x / 32) * 32,
    Math.round(pos.y / 32) * 32
  );
};

GirderMarker.prototype.setPlaceGirderButton = function(key) {
  key.onDown.add(GirderMarker.prototype.placeGirder, this, 0);
  this.placeGirderButton = key;
};

GirderMarker.prototype.placeGirder = function() {
  if (this.master.girders === 0) return;
  if (this.placeable) {
    var newGirder = new Girder(this.sprite.position.x, this.sprite.position.y);
    newGirder.sprite.rotation = this.master.sprite.rotation;

    this.girdersPlaced.push(newGirder);

    this.master.girders--;
    // stop Gus from rotating onto the new girder immediately
    this.master.canRotate = false;

    // make some particles!
    this.debrisBurst = new ParticleBurst(
      this.sprite.position.x,
      this.sprite.position.y,
      "Debris",
      {
        lifetime: 500,
        count: 14,
        scaleMin: 0.4,
        scaleMax: 1.0,
        speed: 200,
        fadeOut: true
      }
    );
  }
};

GirderMarker.prototype.update = function() {
  // if we have a master with girders, try to reposition the marker
  if (this.master && !this.master.rotating && this.master.girders > 0) {
    var targetPos = this.getTargetPos();

    // if we found a valid position and our master is on the ground, show the marker
    if (targetPos && this.master.isTouching("down")) {
      this.sprite.position = this.roundTargetPos(targetPos);
      this.sprite.rotation = this.master.rotation;

      this.sprite.visible = true;
      this.placeable = true;
      // if we're holding space, build a bridge

      if (targetPos.isBottom && this.placeGirderButton.isDown) {
        this.placeGirder();
      }
    } else {
      // no legal position found, hide the marker
      this.sprite.visible = false;
      this.placeable = false;
    }
  }
};

module.exports = GirderMarker;

},{"../const":3,"../const/collisionGroup":1,"../particles/burst":18,"./blocks":8}],13:[function(require,module,exports){
var COLLISION_GROUPS = require("../const/collisionGroup");
var EPSILON = require("../const").EPSILON;
var TAU = require("../const").TAU;

var game = window.game;

function Gus(x, y) {
  if (game === undefined) game = window.game;

  this.speed = 250; // walk speed
  this.gravity = 1000; // gravity speed
  this.hopStrength = 0; // strength of gus's walk cycle hops
  this.dancingTime = 20000; // how long gus has to hold still to start dancing
  this.killTime = 3000; // how long gus has to fall before the game counts him as dead

  this.rotation = 0; // internal rotation counter
  this.prevRotation = 0; // previous rotation
  this.idleTime = 0; // how long gus has been holding still
  this.fallTime = 0;
  this.girders = 0;
  this.isDead = false;
  this.facingRight = true; // is gus facing right?
  this.rotating = false; // is gus rotating?
  this.canRotate = false; // can gus rotate?
  this.targetRotation = 0; // target rotation of this flip

  // create a sprite object and set its anchor
  this.sprite = game.add.sprite(x, y, "Gus");
  this.sprite.name = "Gus";
  // attach our sprite to the physics engine
  game.physics.p2.enable(this.sprite, false);
  this.sprite.body.setRectangle(20, 32);
  this.sprite.body.fixedRotation = true;
  this.sprite.body.gameObject = this;

  // create gus's rotation sensor
  this.rotationSensor = this.sprite.body.addRectangle(20, 20, 0, -6);
  //set collision
  this.setCollision();
  this.sprite.body.onBeginContact.add(Gus.prototype.touchesWall, this);

  // add animations
  this.sprite.animations.add("stand", [0], 10, true);
  this.sprite.animations.add("walk", [1, 2], 7, true);
  this.sprite.animations.add("dance", [3, 4, 6, 7], 5, true);
}

function saneVec(vec) {
  var x = Math.abs(vec[0]) < EPSILON ? 0 : vec[0];
  var y = Math.abs(vec[1]) < EPSILON ? 0 : vec[1];
  return p2.vec2.fromValues(x, y);
}

function dot(vec1, vec2) {
  return vec1[0] * vec2[0] + vec1[1] * vec2[1];
}

Gus.prototype.setCollision = function() {
  this.sprite.body.setCollisionGroup(COLLISION_GROUPS.PLAYER_SOLID);
  this.sprite.body.setCollisionGroup(
    COLLISION_GROUPS.PLAYER_SENSOR,
    this.rotationSensor
  );
  this.sprite.body.collides([
    COLLISION_GROUPS.BLOCK_SOLID,
    COLLISION_GROUPS.BLOCK_ROTATE,
    COLLISION_GROUPS.BLOCK_BREAK,
    COLLISION_GROUPS.ITEM,
    COLLISION_GROUPS.SPIKES
  ]);
};

Gus.prototype.respawn = function() {
  this.rotation = 0;
  this.prevRotation = 0;
  this.targetRotation = 0;
  this.rotating = false;
  this.canRotate = false;
  this.idleTime = 0;
  this.fallTime = 0;
  this.isDead = false;

  this.sprite.rotation = 0;
  this.sprite.body.rotation = 0;
  this.sprite.body.fixedRotation = true;
  this.setCollision();

  this.sprite.reset(game.gusStartPos.x, game.gusStartPos.y);
};

Gus.prototype.doom = function() {
  this.sprite.body.clearCollision();
  this.sprite.body.fixedRotation = false;

  this.sprite.body.velocity.x = Math.sin(this.rotation) * 250;
  this.sprite.body.velocity.y = Math.cos(this.rotation) * -250;

  this.sprite.body.angularVelocity = 30;
  game.dolly.unlock();
};

Gus.prototype.kill = function() {
  this.sprite.visible = false;
  this.isDead = true;

  this.sprite.body.velocity.x = 0;
  this.sprite.body.velocity.y = 0;
};

Gus.prototype.touchesWall = function(gus, other, sensor, shape, contact) {
  if (!this.canRotate) return;
  if (sensor !== this.rotationSensor) {
    var isHorizontal = Math.abs(Math.cos(this.rotation)) > EPSILON;
    if (isHorizontal && Math.abs(this.sprite.body.velocity.y) > 1)
      this.sprite.position.x -= this.sprite.body.velocity.x;
    else if (Math.abs(this.sprite.body.velocity.x) > 1)
      this.sprite.position.y -= this.sprite.body.velocity.y;

    return;
  }

  var leftVec = p2.vec2.fromValues(
    -Math.cos(this.rotation),
    -Math.sin(this.rotation)
  );
  var d = dot(saneVec(leftVec), saneVec(contact[0].normalA));
  if (contact[0].bodyB === gus.data) d *= -1;

  if (d > 1 - EPSILON) this.rotate("left");
  else if (d < -1 + EPSILON) this.rotate("right");
};

Gus.prototype.checkForRotation = function(side) {
  if (side === "left" && this.isTouching("left")) {
    this.rotate("left");
  } else if (side === "right" && this.isTouching("right")) {
    this.rotate("right");
  }
};

Gus.prototype.isTouching = function(side) {
  // get the vector to check
  var dirVec = null;
  if (side === "left")
    dirVec = p2.vec2.fromValues(
      -Math.cos(this.rotation),
      -Math.sin(this.rotation)
    );
  if (side === "right")
    dirVec = p2.vec2.fromValues(
      Math.cos(this.rotation),
      Math.sin(this.rotation)
    );
  if (side === "down")
    dirVec = p2.vec2.fromValues(
      -Math.sin(this.rotation),
      Math.cos(this.rotation)
    );
  if (side === "up")
    dirVec = p2.vec2.fromValues(
      Math.sin(this.rotation),
      -Math.cos(this.rotation)
    );

  // loop throuhg all contacts
  for (
    var i = 0;
    i < game.physics.p2.world.narrowphase.contactEquations.length;
    ++i
  ) {
    var contact = game.physics.p2.world.narrowphase.contactEquations[i];

    // check to see if the player has been affected
    if (
      contact.bodyA === this.sprite.body.data ||
      contact.bodyB === this.sprite.body.data
    ) {
      // if the dot of the normal is 1, the player is perpendicular to the collision
      var d = dot(saneVec(dirVec), saneVec(contact.normalA));
      if (contact.bodyA === this.sprite.body.data) d *= -1;
      if (d > 1 - EPSILON && contact.bodyA !== null && contact.bodyB !== null) {
        return true;
      }
    }
  }
};

Gus.prototype.rotate = function(dir) {
  if (this.rotating) return;

  // find the angle to rotate by
  var rot = 0;
  if (dir === "left") {
    rot = -Math.PI / 2;
    if (this.targetRotation - rot < this.rotation) this.sprite.rotation -= TAU;
  } else if (dir === "right") {
    rot = Math.PI / 2;
    if (this.targetRotation - rot < this.rotation - TAU)
      this.sprite.rotation -= TAU;
  }

  // change values
  this.targetRotation -= rot;
  this.rotating = true;
  this.canRotate = false;
  this.sprite.body.enabled = false;
};

Gus.prototype.finishRotation = function() {
  // keep our rotation between tau and 0
  if (this.rotation < 0) this.rotation += TAU;
  if (this.targetRotation < 0) this.targetRotation += TAU;
  else if (this.targetRotation >= TAU) this.targetRotation %= TAU;
  // set gravity relative to our new axis
  this.sprite.body.gravity.y = Math.floor(
    Math.cos(this.rotation) * this.gravity
  );
  this.sprite.body.gravity.x = Math.floor(
    Math.sin(this.rotation) * -this.gravity
  );

  // change rotation
  this.sprite.rotation = this.rotation;
  this.sprite.body.rotation = this.rotation;

  // reset state after rotation
  this.sprite.body.enabled = true;
  this.rotating = false;
  delete this.rotateTween;
};

Gus.prototype.applyGravity = function() {
  if (!this.isTouching("down")) {
    this.sprite.body.velocity.x += Math.floor(
      Math.sin(this.rotation) * (-this.gravity * game.time.physicsElapsed)
    );

    this.sprite.body.velocity.y += Math.floor(
      Math.cos(this.rotation) * (this.gravity * game.time.physicsElapsed)
    );
    this.sprite.body.velocity.x += Math.floor(
      Math.sin(this.rotation) * (-this.gravity * game.time.physicsElapsed)
    );
    this.sprite.body.velocity.y += Math.floor(
      Math.cos(this.rotation) * (this.gravity * game.time.physicsElapsed)
    );
  }
};

Gus.prototype.walk = function(dir) {
  this.idleTime = 0;

  // determine speed and flip the sprite if necessary
  var intendedVelocity = 0;
  if (dir === "left") {
    intendedVelocity = -this.speed;
    this.sprite.scale.x = -1;
    this.facingRight = false;
  } else if (dir === "right") {
    intendedVelocity = this.speed;
    this.sprite.scale.x = 1;
    this.facingRight = true;
  }

  // see if we're walking horizontally or vertically
  var cosine = Math.cos(this.rotation);
  if (Math.abs(cosine) > EPSILON) {
    this.sprite.body.velocity.x = cosine * intendedVelocity;
  } else {
    var sine = Math.sin(this.rotation);
    this.sprite.body.velocity.y = sine * intendedVelocity;
  }

  // play animations
  this.sprite.animations.play("walk");
  if (this.canRotate === false) {
    this.canRotate = true;
    this.sprite.body.clearCollision();
    this.rotationSensor.needsCollisionData = true;
  }
  //this.checkForRotation( dir );
};

Gus.prototype.stop = function() {
  if (this.idleTime < this.dancingTime) {
    this.sprite.animations.play("stand");
    if (this.isTouching("down")) this.idleTime += game.time.elapsed;
  } else {
    this.sprite.animations.play("dance");
  }
};

Gus.prototype.update = function() {
  // clear horizontal movement
  if (Math.abs(Math.cos(this.rotation)) > EPSILON)
    this.sprite.body.velocity.x = 0;
  else this.sprite.body.velocity.y = 0;

  // check to see if we're rotating
  if (this.rotating) {
    // stop all movement
    this.stop();
    this.sprite.body.velocity.y = 0;
    this.sprite.body.velocity.x = 0;

    // create a rotate tween
    if (this.rotateTween === undefined) {
      this.rotateTween = game.add
        .tween(this.sprite)
        .to({ rotation: this.targetRotation }, 800, Phaser.Easing.Default, true)
        .onComplete.add(function() {
          this.rotation = this.targetRotation % TAU; // keep angle within 0-2pi
          this.finishRotation();
        }, this);
    }
  } else if (!this.isDead) {
    // do gravity
    this.applyGravity();

    if (this.rotationSensor.needsCollisionData) {
      this.setCollision();
      this.rotationSensor.needsCollisionData = false;
    }

    // check for input
    if (game.cursors.left.isDown) {
      this.walk("left");
    } else if (game.cursors.right.isDown) {
      this.walk("right");
    } else {
      this.stop();
    }

    if (!this.isTouching("down")) {
      this.fallTime += game.time.physicsElapsedMS;

      if (this.fallTime > this.killTime) {
        this.kill();
      }
    } else {
      this.fallTime = 0;
    }
  }
};

module.exports = Gus;

},{"../const":3,"../const/collisionGroup":1}],14:[function(require,module,exports){
module.exports = {
  RedBrickBlock: require("./blocks").RedBrickBlock,
  BlackBrickBlock: require("./blocks").BlackBrickBlock,
  BreakBrickBlock: require("./blocks").BreakBrickBlock,
  GhostBreakBrickBlock: require("./ghostBreakBrickBlock"),
  GhostGus: require("./ghostGus"),
  Girder: require("./blocks").Girder,
  Gus: require("./gus"),
  GirderMarker: require("./girderMarker"),
  RecordingGus: require("./recordingGus"),
  Tool: require("./tool"),
  Spike: require("./spike")
};

},{"./blocks":8,"./ghostBreakBrickBlock":10,"./ghostGus":11,"./girderMarker":12,"./gus":13,"./recordingGus":15,"./spike":16,"./tool":17}],15:[function(require,module,exports){
"use strict";

const game = window.game;

const Gus = require("./gus");
const ParticleBurst = require("../particles/burst");

const COLLISION_GROUPS = require("../const/collisionGroup");
const EPSILON = require("../const").EPSILON;
const TAU = require("../const").TAU;

class RecordingGus extends Gus {
  constructor(x, y) {
    super(x, y);
    this.record = [];
  }

  // accounting for rotation, determines what keyDown the ghost
  // should simulate (1 for left, 2 for right)
  recordKeyDown() {
    let n = 0;

    if (game.cursors.left.isDown) n = 1;
    else if (game.cursors.right.isDown) n = 2;

    // account for rotation
    n += Math.floor(this.rotation / (Math.PI / 2));

    // result should only be 1 or 2
    this.record.push(n % 3);
  }

  kill() {
    this.record = this.record.reverse();
    document.getElementById("arr").textContent = this.record;
    console.log(this.record);
    new ParticleBurst(
      this.sprite.position.x,
      this.sprite.position.y,
      "GusHead",
      {
        lifetime: 5000,
        count: 14,
        scaleMin: 0.4,
        scaleMax: 1.0,
        speed: 100,
        fadeOut: true
      }
    );

    this.sprite.visible = false;
    this.isDead = true;

    this.sprite.body.velocity.x = 0;
    this.sprite.body.velocity.y = 0;
  }

  update() {
    this.recordKeyDown();
    // clear horizontal movement
    if (Math.abs(Math.cos(this.rotation)) > EPSILON)
      this.sprite.body.velocity.x = 0;
    else this.sprite.body.velocity.y = 0;

    // check to see if we're rotating
    if (this.rotating) {
      // stop all movement
      this.stop();
      this.sprite.body.velocity.y = 0;
      this.sprite.body.velocity.x = 0;

      // create a rotate tween
      if (this.rotateTween === undefined) {
        this.rotateTween = game.add
          .tween(this.sprite)
          .to(
            {
              rotation: this.targetRotation
            },
            300,
            Phaser.Easing.Default,
            true
          )
          .onComplete.add(function() {
            this.rotation = this.targetRotation % TAU; // keep angle within 0-2pi
            this.finishRotation();
          }, this);
      }
    } else if (!this.isDead) {
      // do gravity
      this.applyGravity();

      if (this.rotationSensor.needsCollisionData) {
        this.setCollision();
        this.rotationSensor.needsCollisionData = false;
      }

      // check for input
      if (game.cursors.left.isDown) {
        this.walk("left");
      } else if (game.cursors.right.isDown) {
        this.walk("right");
      } else {
        this.stop();
      }

      if (!this.isTouching("down")) {
        this.fallTime += game.time.physicsElapsedMS;

        if (this.fallTime > this.killTime) {
          this.kill();
        }
      } else {
        this.fallTime = 0;
      }
    }
  }
}

module.exports = RecordingGus;

},{"../const":3,"../const/collisionGroup":1,"../particles/burst":18,"./gus":13}],16:[function(require,module,exports){
var COLLISION_GROUPS = require("../const/collisionGroup");

function Spike(x, y) {
  var game = window.game;
  x = Math.floor(x / 32) * 32;
  y = Math.floor(y / 32) * 32;

  this.sprite = game.add.sprite(x, y, "Spike");

  game.physics.p2.enable(this.sprite, false);

  this.sprite.body.setRectangle(32, 32);
  this.sprite.body.static = true;
  this.sprite.body.fixedRotation = true;

  this.sprite.body.setCollisionGroup(COLLISION_GROUPS.SPIKES);
  this.sprite.body.collides([
    COLLISION_GROUPS.PLAYER_SOLID,
    COLLISION_GROUPS.GHOST_PLAYER_SOLID
  ]);

  this.sprite.body.onBeginContact.add(Spike.prototype.touched, this);
}

Spike.prototype.touched = function(spikes, other) {
  var otherBlockType = other.parent.gameObject.constructor.name;

  if (otherBlockType === "Gus" || otherBlockType === "GhostGus") {
    other.parent.gameObject.doom();
  }
};

module.exports = Spike;

},{"../const/collisionGroup":1}],17:[function(require,module,exports){
var ParticleBurst = require("../particles/burst");
var COLLISION_GROUPS = require("../const/collisionGroup");
var TAU = require("../const").TAU;

function Tool(x, y) {
  var game = window.game;

  this.sprite = game.add.sprite(x, y, "Tool");
  this.sprite.name = "Tool";
  this.sprite.owner = this;
  this.sprite.smoothed = false;

  this.sprite.initialRotation = Math.random() * TAU;
  this.sprite.cosOffset = Math.random() * 10;
  game.physics.p2.enable(this.sprite, false);

  this.setCollisions();

  game.toolsToCollect = game.toolsToCollect || [];
  game.toolsToCollect.push(this);
}

Tool.prototype.setCollisions = function() {
  this.sprite.body.setRectangle(32, 32);
  this.sprite.body.kinematic = true;

  this.sprite.body.setCollisionGroup(COLLISION_GROUPS.ITEM);
  this.sprite.body.collides([COLLISION_GROUPS.PLAYER_SOLID]);

  this.sprite.body.fixedRotation = true;
};

Tool.prototype.collect = function() {
  if (!this.sprite.visible) return;

  console.log("tool collected!");
  this.sprite.visible = false;
  this.sprite.body.clearShapes();
  game.toolsRemaining--;
  this.collectBurst = new ParticleBurst(
    this.sprite.position.x,
    this.sprite.position.y,
    "Tool",
    {
      lifetime: 3000,
      count: 8,
      scaleMin: 0.4,
      scaleMax: 1.0,
      rotMin: 0,
      rotMax: 360,
      speed: 100,
      fadeOut: true
    }
  );
};

Tool.prototype.reset = function() {
  if (this.sprite.visible === false) {
    this.sprite.visible = true;
    this.setCollisions();
    game.toolsRemaining++;
  }
};

Tool.prototype.update = function() {
  var time = game.time.now;
  var phase = Math.sin((TAU / 15) * (time / 1000 + this.sprite.cosOffset));

  this.sprite.rotation = this.sprite.initialRotation + phase * TAU;
};

module.exports = Tool;

},{"../const":3,"../const/collisionGroup":1,"../particles/burst":18}],18:[function(require,module,exports){
var particleBursts = [];
function ParticleBurst(x, y, particle, options) {
  options = options || {};
  var game = window.game;

  this.emitter = game.add.emitter(x, y, 200);
  this.fadeOut = options.fadeOut || false;

  this.emitter.makeParticles(particle);

  this.emitter.setAlpha(
    options.alphaMin || 1.0,
    options.alphaMax || 1.0,
    options.lifetime || 1000,
    Phaser.Easing.Linear.None,
    true
  );
  this.emitter.setRotation(options.rotMin || 0, options.rotMax || 0);

  this.emitter.setScale(
    options.scaleMin || 1,
    options.scaleMax || 1,
    options.scaleMin || 1,
    options.scaleMax || 1,
    0
  );

  this.emitter.setXSpeed(-(options.speed || 100), options.speed || 100);
  this.emitter.setYSpeed(-(options.speed || 100), options.speed || 100);
  this.emitter.gravity = options.gravity || 0;

  this.emitter.start(true, options.lifetime || 1000, null, options.count || 10);
  this.startTime = game.time.now;

  particleBursts.push(this);
}

ParticleBurst.update = function() {
  particleBursts.forEach(function(burst, idx) {
    if (game.time.now - burst.startTime > burst.emitter.lifespan) {
      particleBursts.splice(idx, 1);
      burst.emitter.destroy();
      return;
    }

    if (!burst.fadeOut) return;

    burst.emitter.forEachAlive(function(part) {
      part.alpha = part.lifespan / burst.emitter.lifespan;
    });
  });
};

module.exports = ParticleBurst;

},{}],19:[function(require,module,exports){
var COLLISION_GROUPS = require("../const/collisionGroup");

function initBootState() {
  var state = {};
  var game = window.game;
  state.create = function() {
    // use advance timing engine
    game.time.advancedTiming = true;
    // start game physics
    console.log("Initializing physics...");
    game.physics.startSystem(Phaser.Physics.P2JS);
    game.physics.p2.setImpactEvents(true);
    console.log("Creating collision groups...");

    for (var key in COLLISION_GROUPS) {
      COLLISION_GROUPS[key] = game.physics.p2.createCollisionGroup();
      console.log("created collision group for", key);
    }
    console.log("Activating ghost state...");
    game.ghost = true;
    console.log("Bootstrap complete");

    game.state.start("load");
  };

  return state;
}
module.exports = initBootState;

},{"../const/collisionGroup":1}],20:[function(require,module,exports){
var Gus = require("../objects/gus");
var Dolly = require("../objects/dolly");
var GirderMarker = require("../objects/girderMarker");
var LevelGenerator = require("../generator");
var ParticleBurst = require("../particles/burst");
var BreakBrickBlock = require("../objects").BreakBrickBlock;
function initGameState() {
  var state = {};

  var gus,
    ghostGus,
    marker,
    generator,
    restartTimeout,
    hudCounters,
    levelStarted;
  var fpsCounter;
  const game = window.game;

  state.preload = function() {
    console.log("Loading level data...");
    console.log(game.level);
    generator = new LevelGenerator(game.level);

    // set background color
    game.stage.setBackgroundColor(generator.getSkyColor());
  };

  state.create = function() {
    // generate the rest of the fucking level
    console.log("Generating level from level data...");
    generator.parseObjects();

    // needs to be added girder-gus-test
    if (game.toolsToCollect !== undefined) {
      game.toolsRemaining = game.toolsToCollect.length;
    } else {
      game.toolsRemaining = 1;
      game.toolsToCollect = []; // needs to be added
      console.error("No tools were included in this level");
    }
    //---------------------------
    console.log("Creating Gus...");

    if (game.gusStartPos === undefined) {
      game.gusStartPos = { x: 0, y: 0 };
    }

    const GhostGus = require("../objects/ghostGus");
    ghostGus = new GhostGus(game.gusStartPos.x, game.gusStartPos.y);

    gus = new Gus(game.gusStartPos.x, game.gusStartPos.y);
    gus.girders = generator.getStartingGirders();
    marker = new GirderMarker();
    marker.setMaster(gus);

    game.dolly = new Dolly(game.camera);
    game.dolly.lockTo(gus.sprite);
    game.physics.p2.setPostBroadphaseCallback(state.postBroadphase, state);

    console.log("Binding to keys...");

    game.cursors = game.input.keyboard.createCursorKeys();
    marker.setPlaceGirderButton(
      game.input.keyboard.addKey(Phaser.KeyCode.SPACEBAR)
    );
    // needs to be added
    game.input.keyboard.addKey(Phaser.KeyCode.R).onDown.add(
      function() {
        gus.doom();
      },
      this,
      0
    );
    // make hud icons
    fpsCounter = game.add.text(0, 0, "60 FPS", { font: "9pt mono" });
    hudCounters = [
      {
        icon: game.add.sprite(41, 41, "Tool"),
        value: function() {
          return game.toolsRemaining;
        }
      },
      {
        icon: game.add.sprite(181, 41, "Girder"),
        value: function() {
          return gus.girders;
        }
      },
      {
        icon: game.add.sprite(game.camera.width - 200, 41, "Clock"),
        value: function() {
          var timediff = Math.floor((game.time.now - levelStarted) / 1000);
          if (timediff > 99 * 60 + 59) timediff = 99 * 60 + 59;
          var minutes = Math.floor(timediff / 60).toString();
          var seconds =
            timediff % 60 < 10
              ? "0" + (timediff % 60).toString()
              : (timediff % 60).toString();
          return minutes + ":" + seconds;
        }
      }
    ];

    hudCounters.map(function(counter) {
      counter.icon.initPos = {
        x: counter.icon.position.x,
        y: counter.icon.position.y
      };
      counter.icon.anchor = new Phaser.Point(0.5, 0.5);
      counter.shadow = game.add.text(
        counter.icon.position.x + 4,
        counter.icon.position.y + 4,
        "",
        {
          font: "bold 24pt 'Press Start 2P', sans-serif",
          fill: "#0D0D0D"
        }
      );
      counter.text = game.add.text(
        counter.icon.position.x,
        counter.icon.position.y,
        "",
        {
          font: "bold 24pt 'Press Start 2P', sans-serif",
          fill: "#F2F2F2"
        }
      );
      counter.text.anchor = new Phaser.Point(0, 0.5);
      counter.shadow.anchor = new Phaser.Point(0, 0.5);

      return counter;
    });
    levelStarted = game.time.now;
  };

  state.update = function() {
    // update actors
    gus.update();
    ghostGus.update();
    marker.update();
    game.toolsToCollect.forEach(function(tool) {
      tool.update();
    });
    BreakBrickBlock.update();

    if (game.toolsRemaining === 0) {
      if (restartTimeout === undefined)
        restartTimeout = setTimeout(function() {
          state.restartLevel();
        }, 15000);

      gus.isDead = true;

      gus.sprite.body.velocity.x = 0;
      gus.sprite.body.velocity.y = 0;

      gus.rotationSpeed = gus.rotationSpeed || 0;
      gus.rotationSpeed += game.time.physicsElapsed;
      gus.sprite.rotation += gus.rotationSpeed * game.time.physicsElapsed;

      game.camera.scale.x *= 1 + game.time.physicsElapsed / 5;
      game.camera.scale.y *= 1 + game.time.physicsElapsed / 5;
      game.dolly.rotation = Math.PI * 2 - gus.sprite.rotation;
      game.dolly.unlock();
    } else if (gus.isDead && restartTimeout === undefined) {
      game.dolly.unlock();

      restartTimeout = setTimeout(function() {
        state.restartLevel();
      }, 500);
    }

    // lock camera to player
    game.dolly.update();
    ParticleBurst.update();
    // render HUD
    var rate = game.time.fps;
    fpsCounter.position = game.dolly.screenspaceToWorldspace({ x: 0, y: 0 });
    fpsCounter.rotation = game.dolly.rotation;
    fpsCounter.text = rate + " FPS" + (rate < 30 ? "!!!!" : " :)");

    hudCounters.forEach(function(counter) {
      counter.icon.bringToTop();
      counter.icon.position = game.dolly.screenspaceToWorldspace(
        counter.icon.initPos
      );

      counter.icon.rotation = game.dolly.rotation;

      var textpos = {
        x: counter.icon.initPos.x + 36,
        y: counter.icon.initPos.y + 8
      };
      counter.shadow.bringToTop();
      counter.shadow.position = game.dolly.screenspaceToWorldspace(textpos);
      counter.shadow.text = counter.value();
      counter.shadow.rotation = game.dolly.rotation;

      textpos = {
        x: counter.icon.initPos.x + 32,
        y: counter.icon.initPos.y + 4
      };
      counter.text.bringToTop();
      counter.text.position = game.dolly.screenspaceToWorldspace(textpos);
      counter.text.text = counter.value();
      counter.text.rotation = game.dolly.rotation;
    });
  };

  // needs to be added
  state.restartLevel = function() {
    game.toolsToCollect.forEach(function(tool) {
      tool.reset();
    });
    marker.girdersPlaced.forEach(function(girder) {
      girder.sprite.destroy();
    });
    BreakBrickBlock.reset();
    gus.respawn();
    gus.rotationSpeed = 0;
    game.dolly.lockTo(gus.sprite);
    gus.girders = generator.getStartingGirders();

    game.camera.scale.x = 1;
    game.camera.scale.y = 1;

    restartTimeout = undefined;
    levelStarted = game.time.now;
  };
  state.postBroadphase = function(body1, body2) {
    if (
      body1.sprite.name === "Gus" &&
      body2.sprite.name === "Tool" &&
      body1.fixedRotation
    ) {
      body2.sprite.owner.collect();
      return false;
    } else if (
      body1.sprite.name === "Tool" &&
      body2.sprite.name === "Gus" &&
      body2.fixedRotation
    ) {
      body1.sprite.owner.collect();
      return false;
    }

    return true;
  };
  return state;
}

module.exports = initGameState;

},{"../generator":6,"../objects":14,"../objects/dolly":9,"../objects/ghostGus":11,"../objects/girderMarker":12,"../objects/gus":13,"../particles/burst":18}],21:[function(require,module,exports){
function initLoadState() {
  var state = {};
  var game = window.game;

  state.preload = function() {
    console.log("Loading assets...");
    game.load.image("Clock", "/assets/images/clock.png");
    game.load.image("BrickBlack", "/assets/images/brick_black.png");
    game.load.image("BrickBreak", "/assets/images/brick_break.png");
    game.load.image("BrickRed", "/assets/images/brick_red.png");
    game.load.image("Girder", "/assets/images/girder.png");
    game.load.image("Tool", "/assets/images/tool.png");
    game.load.image("Spike", "/assets/images/spike.png");
    game.load.image("GusHead", "/assets/images/part_gushead.png");
    game.load.image("Debris", "/assets/images/part_redblock.png");
    game.load.spritesheet("Gus", "/assets/images/gus.png", 32, 32);

    console.log("Done loading");
  };

  state.create = function() {
    console.log("Starting world...");
    game.world.setBounds(-400, -300, 800, 600); // fullscreen???
    game.physics.p2.setBoundsToWorld();
    game.add.sprite(-16, -16, "Gus");
    var loadText = game.add.text(0, 32, "Loading assets...", {
      font: '12pt "Arial", sans-serif',
      fill: "white"
    });
    loadText.anchor = { x: 0.5, y: 0 };

    // start game state
    game.level = {
      sky: "#FFBB22",
      girders: 10,
      objs: [
        { t: 4, x: 0, y: 0 },
        { t: 4, x: 32, y: 0 },
        { t: 4, x: 64, y: 0 },
        { t: 4, x: 96, y: 0 },
        { t: 4, x: 128, y: 0 },
        { t: 4, x: 160, y: 0 },
        { t: 4, x: 192, y: 0 },
        { t: 4, x: 224, y: 0 },
        { t: 4, x: 0, y: 32 },
        { t: 4, x: 32, y: 32 },
        { t: 4, x: 64, y: 32 },
        { t: 4, x: 96, y: 32 },
        { t: 4, x: 128, y: 32 },
        { t: 4, x: 160, y: 32 },
        { t: 4, x: 192, y: 32 },
        { t: 4, x: 224, y: 32 },
        { t: 2, x: 96, y: -32 },
        { t: 2, x: 96, y: 64 },

        { t: 2, x: 512, y: -32 },
        { t: 3, x: 416, y: 0 },
        { t: 3, x: 448, y: 0 },
        { t: 3, x: 480, y: 0 },
        { t: 3, x: 512, y: 0 },
        { t: 3, x: 544, y: 0 },
        { t: 3, x: 576, y: 0 },
        { t: 3, x: 608, y: 0 },
        { t: 3, x: 416, y: 32 },
        { t: 3, x: 448, y: 32 },
        { t: 3, x: 480, y: 32 },
        { t: 3, x: 512, y: 32 },
        { t: 3, x: 544, y: 32 },
        { t: 3, x: 576, y: 32 },
        { t: 3, x: 608, y: 32 },

        { t: 6, x: 0, y: 160 },
        { t: 6, x: 32, y: 160 },
        { t: 6, x: 64, y: 160 },
        { t: 6, x: 96, y: 160 },
        { t: 6, x: 128, y: 160 },
        { t: 6, x: 160, y: 160 },
        { t: 6, x: 192, y: 160 },
        { t: 6, x: 224, y: 160 },
        { t: 6, x: 256, y: 160 },
        { t: 6, x: 288, y: 160 },
        { t: 6, x: 320, y: 160 },
        { t: 6, x: 352, y: 160 },
        { t: 6, x: 384, y: 160 },
        { t: 6, x: 416, y: 160 },
        { t: 6, x: 440, y: 160 },
        { t: 6, x: 472, y: 160 },
        { t: 4, x: 0, y: 192 },
        { t: 4, x: 32, y: 192 },
        { t: 4, x: 64, y: 192 },
        { t: 4, x: 96, y: 192 },
        { t: 4, x: 128, y: 192 },
        { t: 4, x: 160, y: 192 },
        { t: 4, x: 192, y: 192 },
        { t: 4, x: 224, y: 192 },
        { t: 4, x: 256, y: 192 },
        { t: 4, x: 288, y: 192 },
        { t: 4, x: 320, y: 192 },
        { t: 4, x: 352, y: 192 },
        { t: 4, x: 384, y: 192 },
        { t: 4, x: 416, y: 192 },
        { t: 4, x: 440, y: 192 },
        { t: 4, x: 472, y: 192 },
        { t: 4, x: 0, y: 224 },
        { t: 4, x: 32, y: 224 },
        { t: 6, r: 180, x: 64, y: 224 },
        { t: 6, r: 180, x: 96, y: 224 },
        { t: 6, r: 180, x: 128, y: 224 },
        { t: 6, r: 180, x: 160, y: 224 },
        { t: 6, r: 180, x: 192, y: 224 },
        { t: 6, r: 180, x: 224, y: 224 },
        { t: 6, r: 180, x: 256, y: 224 },
        { t: 6, r: 180, x: 288, y: 224 },
        { t: 6, r: 180, x: 320, y: 224 },
        { t: 6, r: 180, x: 352, y: 224 },
        { t: 6, r: 180, x: 384, y: 224 },
        { t: 6, r: 180, x: 416, y: 224 },
        { t: 6, r: 180, x: 440, y: 224 },
        { t: 6, r: 180, x: 472, y: 224 },

        { t: 4, x: 576, y: 64 },
        { t: 4, x: 608, y: 64 },
        { t: 4, x: 576, y: 96 },
        { t: 4, x: 608, y: 96 },
        { t: 3, x: 576, y: 128 },
        { t: 3, x: 608, y: 128 },
        { t: 3, x: 576, y: 160 },
        { t: 3, x: 608, y: 160 },
        { t: 3, x: 576, y: 192 },
        { t: 3, x: 608, y: 192 },
        { t: 2, x: 544, y: 192 },
        { t: 3, x: 576, y: 224 },
        { t: 3, x: 608, y: 224 },
        { t: 3, x: 576, y: 256 },
        { t: 3, x: 608, y: 256 },
        { t: 3, x: 576, y: 288 },
        { t: 3, x: 608, y: 288 },
        { t: 3, x: 576, y: 320 },
        { t: 3, x: 608, y: 320 },
        { t: 3, x: 576, y: 352 },
        { t: 3, x: 608, y: 352 },
        { t: 3, x: 576, y: 384 },
        { t: 3, x: 608, y: 384 },
        { t: 5, x: 416, y: 352 },
        { t: 5, x: 448, y: 352 },
        { t: 5, x: 480, y: 352 },

        { t: 4, x: 0, y: 256 },
        { t: 4, x: 32, y: 256 },
        { t: 4, x: 0, y: 288 },
        { t: 4, x: 32, y: 288 },
        { t: 4, x: 0, y: 320 },
        { t: 4, x: 32, y: 320 },
        { t: 4, x: 0, y: 352 },
        { t: 4, x: 32, y: 352 },
        { t: 3, x: 64, y: 352 },
        { t: 3, x: 96, y: 352 },
        { t: 3, x: 128, y: 352 },
        { t: 3, x: 160, y: 352 },
        { t: 3, x: 192, y: 352 },
        { t: 3, x: 224, y: 352 },
        { t: 3, x: 256, y: 352 },
        { t: 3, x: 256, y: 352 },
        { t: 3, x: 288, y: 352 },
        { t: 3, x: 320, y: 352 },
        { t: 3, x: 352, y: 352 },
        { t: 3, x: 384, y: 352 },
        { t: 4, x: 0, y: 384 },
        { t: 4, x: 32, y: 384 },
        { t: 3, x: 64, y: 384 },
        { t: 3, x: 96, y: 384 },
        { t: 3, x: 128, y: 384 },
        { t: 3, x: 160, y: 384 },
        { t: 3, x: 192, y: 384 },
        { t: 3, x: 224, y: 384 },
        { t: 3, x: 256, y: 384 },
        { t: 3, x: 256, y: 384 },
        { t: 3, x: 288, y: 384 },
        { t: 3, x: 320, y: 384 },
        { t: 3, x: 352, y: 384 },
        { t: 3, x: 384, y: 384 },

        { t: 1, x: 128, y: 320 },
        { t: 2, x: 128, y: 416 }
      ]
    };
    loadText.text = "Waiting for level info...";
    console.log("##", loadText.text);
    // eventEmitter.on("play this level", function(data) {
    //   console.log(data);
    //   if (data[0] === "levelArr") {
    //     loadText.text = "Creating level...";

    //     game.level = {
    //       sky: "#FFBB22",
    //       girders: 12,
    //       objs: data[1]
    //     };

    //     (function gotoStart() {
    //       if (game.state) game.state.start("game");
    //       else setTimeout(gotoStart, 100);
    //     })();
    //   } else if (data[0] === "levelId") {
    //     loadText.text = "Downloading level...";

    //     var data = "";
    //     var progress = 0;
    //     var req = http.request(
    //       {
    //         hostname: "localhost",
    //         path: "/api/levels/" + data[1] + "/map",
    //         port: 1337,
    //         headers: {
    //           Origin: "localhost"
    //         }
    //       },
    //       function(res) {
    //         res.setEncoding("utf8");
    //         console.dir(res);
    //         var totalLen = res.headers["content-length"];

    //         res.on("data", function(chunk) {
    //           data += chunk;
    //           progress += Math.floor((chunk.length / totalLen) * 100);
    //           loadText.text =
    //             "Downloading level (" + progress.toString() + "%)...";
    //         });

    //         res.on("end", function() {
    //           loadText.text = "Downloading level (100%)...";
    //           console.log(data);
    //           (function gotoStart() {
    //             if (game.state) game.state.start("game");
    //             else setTimeout(gotoStart, 100);
    //           })();
    //         });
    //       }
    //     );

    //     req.on("error", function(err) {
    //       console.error("An error occurred receiving level data:", err);
    //     });

    //     req.end();
    //   }
    // });
    //eventEmitter.emit("what level to play", "log me");

    game.state.start("game"); // remove this when eventEmitter figured out
  };

  return state;
}

module.exports = initLoadState;

},{}]},{},[7]);
