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

    this.sprite.name = "Ghost Gus";

    this.sprite.alpha = 0.5;

    this.spawnTime = game.time.now;
    this.timingTolerance = -20; // in ms

    this.setCollision();

    this.marker = new GhostGirderMarker();
    this.marker.setMaster(this);

    console.log("Ghost Gus (a.k.a girder ghost) created.");
  }

  setCourseCorrectionRecords(courseCorrectionRecords) {
    this.courseCorrectionRecords = courseCorrectionRecords;

    if (this.courseCorrectionRecords.length) {
      this.currentCourseCorrectionRecord = this.courseCorrectionRecords.pop();
    }
  }

  setInputRecords(inputRecords) {
    if (!this.inputRecordsSet) {
      this.inputRecords = inputRecords;
      if (this.inputRecords.length) {
        this.currentInputRecord = this.inputRecords.pop();
        this.currentInputRecord.hasBeenExecuted = false;

        // hacky fix for edge case where 'win'/doom() gets added into the first input record
        this.currentInputRecord.input = this.currentInputRecord.input.filter(
          n => n !== 4
        );
      }

      this.inputRecordsSet = true;
    }
  }

  correctCourse() {
    if (this.isScrewed) return;

    if (this.currentCourseCorrectionRecord) {
      this.sprite.body.x = this.currentCourseCorrectionRecord.x;
      this.sprite.body.y = this.currentCourseCorrectionRecord.y;
    }

    if (this.courseCorrectionRecords.length) {
      this.currentCourseCorrectionRecord = this.courseCorrectionRecords.pop();
    } else {
      var respawnBurst = new ParticleBurst(
        this.sprite.x,
        this.sprite.y,
        "GusHead",
        {
          lifetime: 3000,
          count: 14,
          scaleMin: 0.2,
          scaleMax: 1.0,
          rotMin: 0,
          rotMax: 360,
          speed: 100,
          fadeOut: true
        }
      );
      this.destroy();
    }
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

  destroy() {
    console.log("GHOST GUS IS BANISHED");
    this.marker.girdersPlaced.forEach(girder => {
      girder.sprite.destroy();
    });
    this.marker.sprite.destroy();

    this.sprite.destroy();

    this.isDestroyed = true;
  }

  finishRotation() {
    if (this.isDestroyed) return;
    super.finishRotation();
  }

  evaluateInputRecord() {
    if (this.isScrewed) return;

    if (this.currentInputRecord) {
      if (this.isRecordExpired() && this.currentInputRecord.hasBeenExecuted) {
        this.currentInputRecord = this.inputRecords.pop();
      }

      if (!this.currentInputRecord) return;

      this.currentInputRecord.input.forEach(action => {
        if (action === 1) {
          this.walk("left");
        } else if (action === 2) {
          this.walk("right");
        } else if (action === 3) {
          this.marker.placeGirder();
        } else if (action === 4) {
          this.isScrewed = true;

          this.doom();
        } else {
          this.stop();
        }
      });

      this.currentInputRecord.hasBeenExecuted = true;
    }
  }

  getTime() {
    return game.time.now - this.spawnTime;
  }

  isRecordExpired() {
    const currentTime = this.getTime();
    const currentInputRecordEnd = this.currentInputRecord.endTime;

    return currentTime >= currentInputRecordEnd - this.timingTolerance;
  }

  resetSpawnTime() {
    this.spawnTime = game.time.now;
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
      COLLISION_GROUPS.SPIKES
    ]);
  }

  update() {
    if (this.isDestroyed) return;

    this.evaluateInputRecord();

    if (this.isDestroyed) return;

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

    // course correction
    if (
      this.currentCourseCorrectionRecord &&
      this.getTime() >= this.currentCourseCorrectionRecord.time
    ) {
      this.correctCourse();
    }
  }
}

module.exports = GhostGus;
