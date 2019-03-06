var COLLISION_GROUPS = require("../const/collisionGroup");
var TAU = require("../const").TAU;

function Tool(x, y) {
  var game = window.game;

  this.sprite = game.add.sprite(x, y, "Tool");
  this.sprite.smoothed = false;

  this.sprite.initialRotation = Math.random() * TAU;

  game.physics.p2.enable(this.sprite, true);

  this.setCollisions();

  game.toolsToCollect = game.toolsToCollect || [];
  game.toolsToCollect.push(this);
}

Tool.prototype.setCollisions = function() {
  this.sprite.body.setRectangle(32, 32);
  this.sprite.body.kinematic = true;

  this.sprite.body.setCollisionGroup(COLLISION_GROUPS.ITEM);
  this.sprite.body.collides([COLLISION_GROUPS.PLAYER_SOLID]);
  this.sprite.body.onBeginContact.add(Tool.prototype.collect, this);
  this.sprite.body.fixedRotation = true;
};

Tool.prototype.collect = function() {
  console.log("tool collected!");
  this.sprite.visible = false;
  this.sprite.body.clearShapes();
  game.toolsRemaining--;
};

Tool.prototype.reset = function() {
  if (this.sprite.visible === false) {
    this.sprite.visible = true;
    this.setCollisions();
    game.toolsRemaining++;
  }
};

Tool.prototype.update = function() {
  this.sprite.rotation =
    this.sprite.initialRotation +
    Math.sin((TAU / 100) * (game.time.now / 1000)) * TAU;
};

module.exports = Tool;
