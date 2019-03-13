"use strict";

const GhostGirder = require("./ghostBlocks").GhostGirder;
const GirderMarker = require("./girderMarker");
const ParticleBurst = require("../particles/burst");

const COLLISION_GROUPS = require("../const/collisionGroup");

class GhostGirderMarker extends GirderMarker {
  constructor() {
    super(true); // call GirderMarker constructor with isGhost = true;
  }

  getTargetPos() {
    var playerSensor = this.ghost
      ? COLLISION_GROUPS.GHOST_PLAYER_SENSOR
      : COLLISION_GROUPS.PLAYER_SENSOR;

    // get our position factory based on the player's facing
    var posFactory = this.masterPos();
    if (this.master.facingRight) posFactory = posFactory.right();
    else posFactory = posFactory.left();

    // start at the bottom
    var bottom = posFactory.bottom();
    bottom.isBottom = true;

    var front = posFactory.front();
    front.isBottom = false;

    var frontTarget = game.physics.p2.hitTest(front);

    if (frontTarget.length) {
      if (
        frontTarget.length > 1 ||
        frontTarget[0].parent.sprite.key !== "Girder"
      ) {
        return undefined;
      }
    }

    // test to see if there's anything in the way of this girder
    var hitBoxes = game.physics.p2.hitTest(bottom);
    if (hitBoxes.length) {
      // there is! is it an unplaceable object?
      var hitUnplaceable = false;
      hitBoxes.forEach(function(box) {
        if (box.parent.collidesWith.indexOf(playerSensor) === -1)
          hitUnplaceable = true;
      });
      if (hitUnplaceable) return undefined; // yes, return undefined

      return front;
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
          if (box.parent.collidesWith.indexOf(playerSensor) === -1)
            standingOnUnplaceable = true;
        });
        if (standingOnUnplaceable) return undefined;

        return bottom;
      } else {
        return undefined;
      }
    }
  }

  placeGirder() {
    // if Gus is out of girders, we can't place a new one
    if (this.master.girders === 0) return;

    // check that we're placeable
    if (this.placeable) {
      // spawn a new girder and set its rotation
      var newGirder = new GhostGirder(
        this.sprite.position.x,
        this.sprite.position.y
      );
      console.log("newGirder: ", newGirder);
      newGirder.sprite.rotation = this.master.sprite.rotation;

      // do a little bookkeeping
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
  }

  update(currentMove) {
    // if we have a master with girders, try to reposition the marker
    if (this.master && !this.master.rotating && this.master.girders > 0) {
      var targetPos = this.getTargetPos();

      // if we found a valid position and our master is on the ground, show the marker
      if (targetPos && this.master.isTouching("down")) {
        this.sprite.position = this.roundTargetPos(targetPos);
        this.sprite.rotation = this.master.rotation;

        this.sprite.visible = true;
        this.placeable = true;

        // // if we're holding space, build a bridge
        // if (targetPos.isBottom && currentMove === 3) {
        //   this.placeGirder();
        // }
      } else {
        // no legal position found, hide the marker
        this.sprite.visible = false;
        this.placeable = false;
      }
    }
  }
}

module.exports = GhostGirderMarker;
