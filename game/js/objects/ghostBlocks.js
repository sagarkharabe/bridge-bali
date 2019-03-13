"use strict";
const BreakBrickBlock = require("./blocks").BreakBrickBlock;
const Block = require("./blocks");

const COLLISION_GROUPS = require("../const/collisionGroup");

class GhostBreakBrickBlock extends BreakBrickBlock {
  constructor(x, y) {
    super(x, y, false); // false argument calls BreakBrickBlock constructor without it setting collisions

    this.isGhost = true;
    this.sprite.object = this;

    this.sprite.alpha = 0.5;

    this.setCollisions();
  }

  setCollisions() {
    // set collisions
    this.sprite.body.setCollisionGroup(COLLISION_GROUPS.GHOST_BLOCK_ROTATE);
    this.sprite.body.collides([
      COLLISION_GROUPS.GHOST_PLAYER_SOLID,
      COLLISION_GROUPS.GHOST_PLAYER_SENSOR
    ]);
    this.sprite.body.onBeginContact.add(this.startCollapsing, this);
  }

  startCollapsing(target) {
    if (target.sprite.name === "Ghost Gus") {
      this.countCollapseTime =
        this.countCollapseTime || game.time.physicsElapsedMS;
    }
  }

  static hideAll() {
    const ghostBricks = BreakBrickBlock.bricks().filter(brick => brick.isGhost);

    ghostBricks.forEach(brick => {
      brick.sprite.alpha = 0;
    });
  }

  static showAll() {
    const ghostBricks = BreakBrickBlock.bricks().filter(brick => brick.isGhost);

    ghostBricks.forEach(brick => {
      brick.sprite.alpha = 0.5;
    });
  }
}

class GhostGirder extends Block {
  constructor(x, y) {
    super(x, y, "GhostGirder"); // Block constructor does not set collisions

    this.sprite.alpha = 0.5;
    this.isGhost = true;
    this.sprite.object = this;

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
