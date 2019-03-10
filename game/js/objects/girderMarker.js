var game = window.game;
var Girder = require("./blocks").Girder;
var GhostGirder = require("./ghostBlocks").GhostGirder;
var ParticleBurst = require("../particles/burst");
var COLLISION_GROUPS = require("../const/collisionGroup");
var EPSILON = require("../const").EPSILON;
function GirderMarker(isGhost) {
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
  // set ghost status
  if (isGhost) this.ghost = true;
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

  if (game.physics.p2.hitTest(front).length) return undefined;

  // test to see if there's anything in the way of this girder
  var hitBoxes = game.physics.p2.hitTest(bottom);
  if (hitBoxes.length) {
    // there is! is it an unplaceable object?
    var hitUnplaceable = false;
    hitBoxes.forEach(function(box) {
      if (box.parent.collidesWith.indexOf(playerSensor) === -1)
        hitUnplaceable = true;
    });
    if (hitUnplaceable) return undefined;
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

    // add placeGirder action if Gus is recording
    if (this.master.constructor.name === "RecordingGus") {
      this.master.uncompressedRecord.push(3); // 3 corresponds to placeGirder
    }

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
