var COLLISION_GROUPS = require("../consts/collisionGroups");

function Block(x, y, sprite) {
  var game = window.game;
  x = Math.floor(x / 32) * 32;
  y = Math.floor(y / 32) * 32;

  this.sprite = game.add.sprite(x, y, sprite);

  game.physics.p2.enable(this.sprite, false);

  this.sprite.body.setRectangle(32, 32);
  this.sprite.body.static = true;
}

function RedBrickBlock(x, y) {
  Block.call(this, x, y, "BrickRed");

  this.sprite.body.setCollisionGroup(COLLISION_GROUPS.BLOCK_ROTATE);
  this.sprite.body.collides([
    COLLISION_GROUPS.PLAYER_SOLID,
    COLLISION_GROUPS.PLAYER_SENSOR
  ]);
}

function Girder(x, y) {
  Block.call(this, x, y, "Girder");

  this.sprite.body.setCollisionGroup(COLLISION_GROUPS.BLOCK_ROTATE);
  this.sprite.body.collides([
    COLLISION_GROUPS.PLAYER_SOLID,
    COLLISION_GROUPS.PLAYER_SENSOR
  ]);
}

function BlackBrickBlock(x, y) {
  Block.call(this, x, y, "BrickBlack");

  this.sprite.body.setCollisionGroup(COLLISION_GROUPS.BLOCK_SOLID);
  this.sprite.body.collides([COLLISION_GROUPS.PLAYER_SOLID]);
}

module.exports = Block;
module.exports.RedBrickBlock = RedBrickBlock;
module.exports.BlackBrickBlock = BlackBrickBlock;
module.exports.Girder = Girder;
