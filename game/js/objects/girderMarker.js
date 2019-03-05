var game = window.game;
var Girder = require("./blocks").Girder;

var COLLISION_GROUPS = require("../consts/collisionGroups");
var EPSILON = require("../consts").EPSILON;
function GirderMarker() {
  if (game === undefined) game = window.game;
  this.sprite = game.add.sprite(0, 0, "Girder");
  this.sprite.anchor = new Phaser.Point(0.5, 0.5);
  this.master = null;
  this.girdersPlaced = [];
  this.placeable = false;
  this.sprite.alpha = 0.5;
  this.sprite.visible = false;
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
      masterPos.x += cosine * 20;
      return masterPos;
    } else {
      masterPos.y += sine * 20;
      return masterPos;
    }
  };

  masterPos.left = function() {
    if (Math.abs(cosine) > 1 - EPSILON) {
      masterPos.x -= cosine * 20;
      return masterPos;
    } else {
      masterPos.y -= sine * 20;
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
  var posFactory = null;
  if (this.master.facingRight) posFactory = this.masterPos().right();
  else posFactory = this.masterPos().left();

  var bottom = posFactory.bottom();

  var hitBoxes = game.physics.p2.hitTest(bottom);
  if (hitBoxes.length) {
    var hitUnplaceable = false;
    hitBoxes.forEach(function(box) {
      if (
        box.parent.collidesWith.indexOf(COLLISION_GROUPS.PLAYER_SENSOR) === -1
      )
        hitUnplaceable = true;
    });
    if (hitUnplaceable) return undefined;

    var front = posFactory.front();

    if (game.physics.p2.hitTest(front).length) {
      return undefined;
    } else {
      return front;
    }
  } else {
    return bottom;
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
};

GirderMarker.prototype.placeGirder = function() {
  if (this.placeable) {
    var newGirder = new Girder(this.sprite.position.x, this.sprite.position.y);
    newGirder.sprite.rotation = this.master.sprite.rotation;

    this.girdersPlaced.push(newGirder);

    this.master.canRotate = false;
  }
};

GirderMarker.prototype.update = function() {
  if (this.master) {
    var targetPos = this.getTargetPos();

    if (targetPos && this.master.isTouching("down")) {
      this.sprite.position = this.roundTargetPos(targetPos);
      this.sprite.rotation = this.master.rotation;

      this.sprite.visible = true;
      this.placeable = true;
      //console.log( this.sprite.position );
    } else {
      this.sprite.visible = false;
      this.placeable = false;
    }
  }
};

module.exports = GirderMarker;
