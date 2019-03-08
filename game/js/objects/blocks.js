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
