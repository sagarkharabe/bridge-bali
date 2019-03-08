"use strict";

const game = window.game;

const Gus = require("./gus");
const ParticleBurst = require("../particles/burst");

const COLLISION_GROUPS = require("../const/collisionGroup");
const EPSILON = require("../const").EPSILON;
const TAU = require("../const").TAU;

class RecordingGus extends Gus {
  constructor(x, y) {
    super(x, y);
    this.record = [];
  }

  // accounting for rotation, determines what keyDown the ghost
  // should simulate (1 for left, 2 for right)
  recordKeyDown() {
    let n = 0;

    if (game.cursors.left.isDown) n = 1;
    else if (game.cursors.right.isDown) n = 2;

    // account for rotation
    n += Math.floor(this.rotation / (Math.PI / 2));

    // result should only be 1 or 2
    this.record.push(n % 3);
  }

  kill() {
    this.record = this.record.reverse();
    document.getElementById("arr").textContent = this.record;
    console.log(this.record);
    new ParticleBurst(
      this.sprite.position.x,
      this.sprite.position.y,
      "GusHead",
      {
        lifetime: 5000,
        count: 14,
        scaleMin: 0.4,
        scaleMax: 1.0,
        speed: 100,
        fadeOut: true
      }
    );

    this.sprite.visible = false;
    this.isDead = true;

    this.sprite.body.velocity.x = 0;
    this.sprite.body.velocity.y = 0;
  }

  update() {
    this.recordKeyDown();
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
          .to(
            {
              rotation: this.targetRotation
            },
            300,
            Phaser.Easing.Default,
            true
          )
          .onComplete.add(function() {
            this.rotation = this.targetRotation % TAU; // keep angle within 0-2pi
            this.finishRotation();
          }, this);
      }
    } else if (!this.isDead) {
      // do gravity
      this.applyGravity();

      if (this.rotationSensor.needsCollisionData) {
        this.setCollision();
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

      if (!this.isTouching("down")) {
        this.fallTime += game.time.physicsElapsedMS;

        if (this.fallTime > this.killTime) {
          this.kill();
        }
      } else {
        this.fallTime = 0;
      }
    }
  }
}

module.exports = RecordingGus;
