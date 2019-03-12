"use strict";
const BreakBrickBlock = require("./blocks").BreakBrickBlock;
const Block = require("./blocks");

const COLLISION_GROUPS = require("../const/collisionGroup");

class GhostBreakBrickBlock extends BreakBrickBlock {
  constructor(x, y) {
    super(x, y, false); // false argument calls BreakBrickBlock constructor without it setting collisions

    this.sprite.alpha = 0.5;

    // set collisions
    this.sprite.body.setCollisionGroup(COLLISION_GROUPS.GHOST_BLOCK_ROTATE);
    this.sprite.body.collides([
      COLLISION_GROUPS.GHOST_PLAYER_SOLID,
      COLLISION_GROUPS.GHOST_PLAYER_SENSOR
    ]);
    this.sprite.body.onBeginContact.add(this.startCollapsing, this);
  }
  startCollapsing(target) {
    var targetConstructorName = target.sprite.body.gameObject.constructor.name;

    if (targetConstructorName === "GhostGus") {
      this.countCollapseTime =
        this.countCollapseTime || game.time.physicsElapsedMS;
    }
  }
}

class GhostGirder extends Block {
  constructor(x, y) {
    super(x, y, "Girder"); // Block constructor does not set collisions

    this.sprite.alpha = 0.5;
    console.log("GHOST GIRDER BEING MADED!");
    // set collisions
    this.sprite.body.setCollisionGroup(COLLISION_GROUPS.GHOST_BLOCK_ROTATE);
    this.sprite.body.collides([
      COLLISION_GROUPS.GHOST_PLAYER_SOLID,
      COLLISION_GROUPS.GHOST_PLAYER_SENSOR
    ]);
  }
}

module.exports = {
  GhostBreakBrickBlock: GhostBreakBrickBlock,
  GhostGirder: GhostGirder
};
