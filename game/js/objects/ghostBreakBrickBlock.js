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
