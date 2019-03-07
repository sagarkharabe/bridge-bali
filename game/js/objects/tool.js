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
  this.sprite.rotation =
    this.sprite.initialRotation +
    Math.sin((TAU / 100) * (game.time.now / 1000)) * TAU;
};

module.exports = Tool;
