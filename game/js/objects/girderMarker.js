function GirderMarker() {
  this.sprite = game.add.sprite(0, 0, "Girder");
  this.sprite.anchor = new Phaser.Point(0.5, 0.5);
  this.master = null;

  this.placeable = false;
  this.sprite.alpha = 0.5;
  this.sprite.visible = false;
}

GirderMarker.prototype.setMaster = function(newMaster) {
  this.master = newMaster;
};

GirderMarker.prototype.masterRight = function() {
  var masterPos = this.master.sprite.position;
  var cosine = Math.cos(this.master.rotation);
  //if ( cosine < 0 ) cosine *= 2;
  var sine = Math.sin(this.master.rotation);
  //if ( sine < 0 ) sine *= 2;

  masterPos.top = function() {
    if (Math.abs(cosine) > 1 - EPSILON)
      return new Phaser.Point(
        masterPos.x + cosine * 32,
        masterPos.y - cosine * 32
      );
    else
      return new Phaser.Point(masterPos.x + sine * 32, masterPos.y + sine * 32);
  };

  masterPos.front = function() {
    if (Math.abs(cosine) > 1 - EPSILON)
      return new Phaser.Point(masterPos.x + cosine * 32, masterPos.y);
    else return new Phaser.Point(masterPos.x, masterPos.y + sine * 32);
  };

  masterPos.bottom = function() {
    if (Math.abs(cosine) > 1 - EPSILON)
      return new Phaser.Point(
        masterPos.x + cosine * 32,
        masterPos.y + cosine * 32
      );
    else
      return new Phaser.Point(masterPos.x - sine * 32, masterPos.y + sine * 32);
  };

  return masterPos;
};

GirderMarker.prototype.masterLeft = function() {
  var masterPos = this.master.sprite.position;
  var cosine = Math.cos(this.master.rotation);
  //if ( cosine < 0 ) cosine *= 2;
  var sine = Math.sin(this.master.rotation);
  //if ( sine < 0 ) sine *= 2;

  masterPos.top = function() {
    if (Math.abs(cosine) > 1 - EPSILON)
      return new Phaser.Point(
        masterPos.x - cosine * 32,
        masterPos.y - cosine * 32
      );
    else
      return new Phaser.Point(masterPos.x + sine * 32, masterPos.y - sine * 32);
  };

  masterPos.front = function() {
    if (Math.abs(cosine) > 1 - EPSILON)
      return new Phaser.Point(masterPos.x - cosine * 32, masterPos.y);
    else return new Phaser.Point(masterPos.x, masterPos.y - sine * 32);
  };

  masterPos.bottom = function() {
    if (Math.abs(cosine) > 1 - EPSILON)
      return new Phaser.Point(
        masterPos.x - cosine * 32,
        masterPos.y + cosine * 32
      );
    else
      return new Phaser.Point(masterPos.x - sine * 32, masterPos.y - sine * 32);
  };

  return masterPos;
};

GirderMarker.prototype.getTargetPos = function() {
  if (this.master.facingRight) var posFactory = this.masterRight();
  else var posFactory = this.masterLeft();

  var bottom = posFactory.bottom();

  if (game.physics.p2.hitTest(bottom).length) {
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
    newGirder.sprite.rotation = this.master.rotation;
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
