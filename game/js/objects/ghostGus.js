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

    this.startTime = game.time.now;

    console.log(this.startTime);

    this.records = [
      { INPUT: [], ENDTIME: 9438 },
      { INPUT: [2], ENDTIME: 8521 },
      { INPUT: [], ENDTIME: 8421 },
      { INPUT: [3], ENDTIME: 8321 },
      { INPUT: [], ENDTIME: 8221 },
      { INPUT: [2], ENDTIME: 7504 },
      { INPUT: [1, 2], ENDTIME: 7487 },
      { INPUT: [1], ENDTIME: 6286 },
      { INPUT: [], ENDTIME: 6270 },
      { INPUT: [2], ENDTIME: 5019 },
      { INPUT: [1, 2], ENDTIME: 5002 },
      { INPUT: [1], ENDTIME: 3835 },
      { INPUT: [], ENDTIME: 3819 },
      { INPUT: [2], ENDTIME: 2735 },
      { INPUT: [1, 2], ENDTIME: 2718 },
      { INPUT: [1], ENDTIME: 1701 },
      { INPUT: [], ENDTIME: 1668 },
      { INPUT: [2], ENDTIME: 801 },
      { INPUT: [], ENDTIME: 0 }
    ];

    this.currentRecord = this.records.pop();

    this.setCollision();

    this.marker = new GhostGirderMarker();
    this.marker.setMaster(this);
  }
  getTime() {
    return;
  }

  isRecordExpired() {
    const tolerance = 10; // in ms
    const currentTime = game.time.now - this.startTime;
    const currentRecordEnd = this.currentRecord.ENDTIME;
    console.log(currentTime, currentRecordEnd);

    return currentTime > currentRecordEnd - tolerance;
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
    this.marker.update();

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

      // evaluate INPUT
      if (this.currentRecord) {
        this.currentRecord.INPUT.forEach(action => {
          this.marker.update(action);

          // movement
          switch (action) {
            case 1:
              this.walk("left");
              break;
            case 2:
              this.walk("right");
              break;
            case 3:
              this.marker.placeGirder(action);
              break;
            default:
              this.stop();
              break;
          }
          if (action === 1) {
            this.walk("left");
            // console.log('walking left')
          } else if (action === 2) {
            this.walk("right");
            // console.log('walking right')
          } else {
            this.stop();
          }

          // girder placement
          if (action === 3) {
            this.marker.placeGirder();
          }
        });

        if (this.isRecordExpired()) {
          this.currentRecord = this.records.pop();
        }
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

module.exports = GhostGus;
