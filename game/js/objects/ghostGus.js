"use strict";

const game = window.game;

const Gus = require("./gus");
const GhostGirderMarker = require("./ghostGirderMarker");

const ParticleBurst = require("../particles/burst");

const COLLISION_GROUPS = require("../const/collisionGroup");
const EPSILON = require("../const").EPSILON;
const TAU = require("../const").TAU;

class GhostGus extends Gus {
  constructor(x, y) {
    super(x, y, false);
    console.log("ghosting");
    this.sprite.alpha = 0.5;

    this.startTime = game.time.now + 500;
    this.timingTolerance = -20; // in ms

    this.records = [
      { INPUT: [2], ENDTIME: 10867 },
      { INPUT: [1], ENDTIME: 9817 },
      { INPUT: [0], ENDTIME: 9517 },
      { INPUT: [2], ENDTIME: 9167 },
      { INPUT: [1], ENDTIME: 8667 },
      { INPUT: [0], ENDTIME: 8367 },
      { INPUT: [1], ENDTIME: 7634 },
      { INPUT: [2], ENDTIME: 7317 },
      { INPUT: [0], ENDTIME: 6867 },
      { INPUT: [1], ENDTIME: 6667 },
      { INPUT: [0], ENDTIME: 6317 },
      { INPUT: [2], ENDTIME: 6284 },
      { INPUT: [0], ENDTIME: 5817 },
      { INPUT: [2], ENDTIME: 5550 },
      { INPUT: [1], ENDTIME: 4967 },
      { INPUT: [0], ENDTIME: 4667 },
      { INPUT: [2], ENDTIME: 4267 },
      { INPUT: [1], ENDTIME: 3817 },
      { INPUT: [0], ENDTIME: 3367 },
      { INPUT: [2], ENDTIME: 2734 },
      { INPUT: [0], ENDTIME: 800 }
    ];
    this.currentRecord = this.records.pop();
    this.currentRecord.hasBeenExecuted = false;

    this.setCollision();

    this.marker = new GhostGirderMarker();
    this.marker.setMaster(this);
  }
  evaluateRecord() {
    if (this.currentRecord) {
      if (this.isRecordExpired() && this.currentRecord.hasBeenExecuted) {
        this.currentRecord = this.records.pop();
      }

      if (!this.currentRecord) return;

      this.currentRecord.INPUT.forEach(action => {
        switch (action) {
          case 1:
            this.walk("left");
            break;
          case 2:
            this.walk("right");
            break;
          case 3:
            // debugger;
            this.marker.placeGirder();
            break;
          default:
            this.stop();
            break;
        }
      });

      this.currentRecord.hasBeenExecuted = true;
    }
  }
  getTime() {
    return game.time.now - this.startTime;
  }

  isRecordExpired() {
    const currentTime = this.getTime();
    const currentRecordEnd = this.currentRecord.ENDTIME;
    //console.log(currentTime, currentRecordEnd);

    return currentTime >= currentRecordEnd - this.timingTolerance;
  }

  // diff from Gus's doom: doesn't unlock the dolly
  doom() {
    this.sprite.body.clearCollision();
    this.sprite.body.fixedRotation = false;

    this.sprite.body.velocity.x = Math.sin(this.rotation) * 250;
    this.sprite.body.velocity.y = Math.cos(this.rotation) * -250;

    this.sprite.body.angularVelocity = 30;
    //this.sprite.body.rotateRight( 360 );
  }

  setCollision() {
    this.sprite.body.setCollisionGroup(COLLISION_GROUPS.GHOST_PLAYER_SOLID);
    this.sprite.body.setCollisionGroup(
      COLLISION_GROUPS.GHOST_PLAYER_SENSOR,
      this.rotationSensor
    );
    this.sprite.body.collides([
      COLLISION_GROUPS.GHOST_BLOCK_ROTATE,
      COLLISION_GROUPS.BLOCK_SOLID,
      COLLISION_GROUPS.BLOCK_ROTATE,
      COLLISION_GROUPS.ITEM,
      COLLISION_GROUPS.SPIKES
    ]);
  }

  update() {
    if (Math.abs(Math.cos(this.rotation)) > EPSILON)
      this.sprite.body.velocity.x = 0;
    else this.sprite.body.velocity.y = 0;
    this.evaluateRecord();

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

      this.marker.update();

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

module.exports = GhostGus;
