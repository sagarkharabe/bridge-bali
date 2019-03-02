var COLLISION_GROUPS = require("../consts/collisionGroups");
var EPSILON = require("../consts").EPSILON;
var TAU = require("../consts").TAU;

var game = window.game;

function Gus(x, y) {
  if (game === undefined) game = window.game;

  this.speed = 250; // walk speed
  this.gravity = 1000; // gravity speed
  this.hopStrength = 0; // strength of gus's walk cycle hops
  this.dancingTime = 20000; // how long gus has to hold still to start dancing

  this.rotation = 0; // internal rotation counter
  this.prevRotation = 0; // previous rotation
  this.idleTime = 0; // how long gus has been holding still

  this.facingRight = true; // is gus facing right?
  this.rotating = false; // is gus rotating?
  this.canRotate = true; // can gus rotate?
  this.targetRotation = 0; // target rotation of this flip

  // create a sprite object and set its anchor
  this.sprite = game.add.sprite(x, y, "Gus");

  // attach our sprite to the physics engine
  game.physics.p2.enable(this.sprite, true);
  this.sprite.body.fixedRotation = true;
  this.sprite.body.setCollisionGroup(COLLISION_GROUPS.PLAYER_SOLID);
  this.sprite.body.collides([
    COLLISION_GROUPS.BLOCK_SOLID,
    COLLISION_GROUPS.BLOCK_ROTATE
  ]);

  // create gus's rotation sensor
  this.rotationSensor = this.sprite.body.addRectangle(this.sprite.width, 20);
  this.sprite.body.setCollisionGroup(
    COLLISION_GROUPS.PLAYER_SENSOR,
    this.rotationSensor
  );
  this.sprite.body.collides(
    [COLLISION_GROUPS.BLOCK_ROTATE],
    Gus.prototype.touchesWall,
    this,
    this.rotationSensor
  );
  this.sprite.body.onBeginContact.add(Gus.prototype.touchesWall, this);

  // add animations
  this.sprite.animations.add("stand", [0], 10, true);
  this.sprite.animations.add("walk", [1, 2], 10, true);
  this.sprite.animations.add("dance", [3, 4, 5, 6, 7], 10, true);
}

function saneVec(vec) {
  var x = Math.abs(vec[0]) < EPSILON ? 0 : vec[0];
  var y = Math.abs(vec[1]) < EPSILON ? 0 : vec[1];
  return p2.vec2.fromValues(x, y);
}

function dot(vec1, vec2) {
  return vec1[0] * vec2[0] + vec1[1] * vec2[1];
}

Gus.prototype.touchesWall = function(gus, other, sensor, shape, contact) {
  if (!this.canRotate) return;
  if (sensor !== this.rotationSensor) return;

  var leftVec = p2.vec2.fromValues(
    -Math.cos(this.rotation),
    -Math.sin(this.rotation)
  );
  var d = dot(saneVec(leftVec), saneVec(contact[0].normalA));
  if (contact[0].bodyB === gus.data) d *= -1;

  if (d > 1 - EPSILON) this.rotate("left");
  else if (d < -1 + EPSILON) this.rotate("right");
};

Gus.prototype.checkForRotation = function(side) {
  if (side === "left" && this.isTouching("left")) {
    this.rotate("left");
  } else if (side === "right" && this.isTouching("right")) {
    this.rotate("right");
  }
};

Gus.prototype.isTouching = function(side) {
  // get the vector to check
  var dirVec = null;
  if (side === "left")
    dirVec = p2.vec2.fromValues(
      -Math.cos(this.rotation),
      -Math.sin(this.rotation)
    );
  if (side === "right")
    dirVec = p2.vec2.fromValues(
      Math.cos(this.rotation),
      Math.sin(this.rotation)
    );
  if (side === "down")
    dirVec = p2.vec2.fromValues(
      -Math.sin(this.rotation),
      Math.cos(this.rotation)
    );
  if (side === "up")
    dirVec = p2.vec2.fromValues(
      Math.sin(this.rotation),
      -Math.cos(this.rotation)
    );

  // loop throuhg all contacts
  for (
    var i = 0;
    i < game.physics.p2.world.narrowphase.contactEquations.length;
    ++i
  ) {
    var contact = game.physics.p2.world.narrowphase.contactEquations[i];

    // check to see if the player has been affected
    if (
      contact.bodyA === this.sprite.body.data ||
      contact.bodyB === this.sprite.body.data
    ) {
      // if the dot of the normal is 1, the player is perpendicular to the collision
      var d = dot(saneVec(dirVec), saneVec(contact.normalA));
      if (contact.bodyA === this.sprite.body.data) d *= -1;
      if (d > 1 - EPSILON && contact.bodyA !== null && contact.bodyB !== null) {
        return true;
      }
    }
  }
};

Gus.prototype.rotate = function(dir) {
  if (this.rotating) return;

  // find the angle to rotate by
  var rot = 0;
  if (dir === "left") {
    rot = -Math.PI / 2;
    this.sprite.rotation -= TAU;
  } else if (dir === "right") {
    rot = Math.PI / 2;
  }

  // change values
  this.targetRotation -= rot;
  this.rotating = true;
  this.canRotate = false;
  this.sprite.body.enabled = false;
};

Gus.prototype.finishRotation = function() {
  // keep our rotation between tau and 0
  if (this.rotation < 0) this.rotation = TAU + this.rotation;

  // set gravity relative to our new axis
  this.sprite.body.gravity.y = Math.floor(
    Math.cos(this.rotation) * this.gravity
  );
  this.sprite.body.gravity.x = Math.floor(
    Math.sin(this.rotation) * -this.gravity
  );

  // change rotation
  this.sprite.rotation = this.rotation;
  this.sprite.body.rotation = this.rotation;

  // reset state after rotation
  this.sprite.body.enabled = true;
  this.rotating = false;
  delete this.rotateTween;
};

Gus.prototype.applyGravity = function() {
  if (!this.isTouching("down")) {
    this.sprite.body.velocity.x += Math.floor(
      Math.sin(this.rotation) * (-this.gravity * 0.016)
    );
    this.sprite.body.velocity.y += Math.floor(
      Math.cos(this.rotation) * (this.gravity * 0.016)
    );
  }
};

Gus.prototype.walk = function(dir) {
  this.idleTime = 0;

  // determine speed and flip the sprite if necessary
  var intendedVelocity = 0;
  if (dir === "left") {
    intendedVelocity = -this.speed;
    this.sprite.scale.x = -1;
    this.facingRight = false;
  } else if (dir === "right") {
    intendedVelocity = this.speed;
    this.sprite.scale.x = 1;
    this.facingRight = true;
  }

  // see if we're walking horizontally or vertically
  var cosine = Math.cos(this.rotation);
  if (Math.abs(cosine) > EPSILON) {
    this.sprite.body.velocity.x = cosine * intendedVelocity;
    if (this.isTouching("down"))
      this.sprite.body.velocity.y = cosine * -this.hopStrength;
  } else {
    var sine = Math.sin(this.rotation);
    this.sprite.body.velocity.y = sine * intendedVelocity;
    if (this.isTouching("down"))
      this.sprite.body.velocity.x = sine * this.hopStrength;
  }

  // play animations
  this.sprite.animations.play("walk");
  if (this.canRotate === false) {
    this.canRotate = true;
    this.sprite.body.clearCollision();
    this.rotationSensor.needsCollisionData = true;
  }
  //this.checkForRotation( dir );
};

Gus.prototype.stop = function() {
  if (this.idleTime < this.dancingTime) {
    this.sprite.animations.play("stand");
    if (this.isTouching("down")) this.idleTime += game.time.elapsed;
  } else {
    this.sprite.animations.play("dance");
  }
};

Gus.prototype.update = function() {
  // clear horizontal movement
  if (Math.abs(Math.cos(this.rotation)) > EPSILON)
    this.sprite.body.velocity.x = 0;
  else this.sprite.body.velocity.y = 0;

  // check to see if we're rotating
  if (this.rotating) {
    // stop all movement
    this.stop();
    this.sprite.body.velocity.y = 0;
    this.sprite.body.velocity.x = 0;

    // create a rotate tween
    if (this.rotateTween === undefined) {
      this.rotateTween = game.add
        .tween(this.sprite)
        .to({ rotation: this.targetRotation }, 300, Phaser.Easing.Default, true)
        .onComplete.add(function() {
          this.rotation = this.targetRotation % TAU; // keep angle within 0-2pi
          this.finishRotation();
        }, this);
    }
  } else {
    // do gravity
    this.applyGravity();

    if (this.rotationSensor.needsCollisionData) {
      this.sprite.body.setCollisionGroup(COLLISION_GROUPS.PLAYER_SOLID);
      this.sprite.body.collides([
        COLLISION_GROUPS.BLOCK_SOLID,
        COLLISION_GROUPS.BLOCK_ROTATE
      ]);
      this.rotationSensor.needsCollisionData = false;
    }

    // check for input
    if (game.cursors.left.isDown) {
      this.walk("left");
    } else if (game.cursors.right.isDown) {
      this.walk("right");
    } else {
      this.stop();
    }
  }
};

module.exports = Gus;
