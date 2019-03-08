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
