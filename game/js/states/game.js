var Gus = require("../objects/gus");
var Dolly = require("../objects/dolly");
var GirderMarker = require("../objects/girderMarker");
var LevelGenerator = require("../generator");
var ParticleBurst = require("../particles/burst");
var BreakBrickBlock = require("../objects").BreakBrickBlock;
var ResultScreen = require("../scenes/resultScreen");
var Gus = require("../objects/recordingGus");
function initGameState() {
  var state = {};

  var gus,
    ghostGus,
    marker,
    ghostMarker,
    generator,
    restartTimeout,
    hudCounters,
    levelStarted,
    startingGirderCount;
  var gameEndingEmitted = false;
  const game = window.game;
  const eventEmitter = window.eventEmitter;
  state.preload = function() {
    console.log("Loading level data...");
    console.log("Game level", game.level);
    generator = new LevelGenerator(game.level);

    // set background color
    game.stage.setBackgroundColor(generator.getSkyColor());
  };

  state.create = function() {
    // generate the rest of the fucking level
    console.log("Generating level from level data...");
    generator.parseObjects();

    // needs to be added girder-gus-test
    if (game.toolsToCollect !== undefined) {
      game.toolsRemaining = game.toolsToCollect.length;
    } else {
      game.toolsRemaining = 1;
      game.toolsToCollect = [];
      console.error("No tools were included in this level");
    }

    console.log("Creating Gus...");

    if (game.gusStartPos === undefined) {
      game.gusStartPos = { x: 0, y: 0 };
    }

    const GhostGus = require("../objects/ghostGus");
    ghostGus = new GhostGus(game.gusStartPos.x, game.gusStartPos.y);
    ghostGus.girders = generator.getStartingGirders();

    gus = new Gus(game.gusStartPos.x, game.gusStartPos.y);
    gus.girders = generator.getStartingGirders();
    startingGirderCount = gus.girders;
    marker = new GirderMarker();
    marker.setMaster(gus);

    game.dolly = new Dolly(game.camera);
    game.dolly.lockTo(gus.sprite);
    game.physics.p2.setPostBroadphaseCallback(state.postBroadphase, state);

    console.log("Binding to keys...");

    game.cursors = game.input.keyboard.createCursorKeys();
    marker.setPlaceGirderButton(
      game.input.keyboard.addKey(Phaser.KeyCode.SPACEBAR)
    );
    // needs to be added
    game.input.keyboard.addKey(Phaser.KeyCode.R).onDown.add(
      function() {
        gus.doom();
      },
      this,
      0
    );
    // make hud icons
    hudCounters = [
      {
        icon: game.add.sprite(41, 41, "Tool"),
        value: function() {
          return game.toolsRemaining;
        }
      },
      {
        icon: game.add.sprite(181, 41, "Girder"),
        value: function() {
          return gus.girders;
        }
      },
      {
        icon: game.add.sprite(game.camera.width - 200, 41, "Clock"),
        value: function() {
          var timediff = Math.floor((game.time.now - levelStarted) / 1000);
          if (timediff > 99 * 60 + 59) timediff = 99 * 60 + 59;
          var minutes = Math.floor(timediff / 60).toString();
          var seconds =
            timediff % 60 < 10
              ? "0" + (timediff % 60).toString()
              : (timediff % 60).toString();
          return minutes + ":" + seconds;
        }
      }
    ];

    hudCounters.map(function(counter) {
      counter.icon.initPos = {
        x: counter.icon.position.x,
        y: counter.icon.position.y
      };
      counter.icon.anchor = new Phaser.Point(0.5, 0.5);
      counter.shadow = game.add.text(
        counter.icon.position.x + 4,
        counter.icon.position.y + 4,
        "",
        {
          font: "bold 24pt 'Press Start 2P', sans-serif",
          fill: "#0D0D0D"
        }
      );
      counter.text = game.add.text(
        counter.icon.position.x,
        counter.icon.position.y,
        "",
        {
          font: "bold 24pt 'Press Start 2P', sans-serif",
          fill: "#F2F2F2"
        }
      );
      counter.text.anchor = new Phaser.Point(0, 0.5);
      counter.shadow.anchor = new Phaser.Point(0, 0.5);

      return counter;
    });
    eventEmitter.only("stop input capture", function() {
      game.input.enabled = false;
      game.input.reset();
    });

    eventEmitter.only("start input capture", function() {
      game.input.enabled = true;
      game.input.reset();
    });
    levelStarted = game.time.now;
  };

  state.update = function() {
    // update actors
    gus.update();
    ghostGus.update();
    marker.update();
    game.toolsToCollect.forEach(function(tool) {
      tool.update();
    });
    BreakBrickBlock.update();

    // lock camera to player
    game.dolly.update();
    ParticleBurst.update();

    if (game.toolsRemaining === 0) {
      // if (restartTimeout === undefined)
      //   restartTimeout = setTimeout(function() {
      //     state.restartLevel();
      //     gameEndingEmitted = false;
      //   }, 15000);

      gus.isDead = true;

      gus.sprite.body.velocity.x = 0;
      gus.sprite.body.velocity.y = 0;

      gus.rotationSpeed = gus.rotationSpeed || 0;
      gus.rotationSpeed += game.time.physicsElapsed;
      gus.sprite.rotation += gus.rotationSpeed * game.time.physicsElapsed;

      game.camera.scale.x *= 1 + game.time.physicsElapsed / 5;
      game.camera.scale.y *= 1 + game.time.physicsElapsed / 5;
      game.dolly.rotation = Math.PI * 2 - gus.sprite.rotation;
      game.dolly.unlock();

      if (!gameEndingEmitted) {
        gameEndingEmitted = true;
        eventEmitter.emit("game ended", [
          startingGirderCount - gus.girders,
          game.time.now - levelStarted
        ]);
        console.log("YOU DID IT!");
        console.log("Girders placed:", startingGirderCount - gus.girders);
        console.log("Time taken:", game.time.now - levelStarted);

        state.resultScreen = new ResultScreen(
          startingGirderCount - gus.girders,
          game.time.now - levelStarted,
          function() {
            state.restartLevel();
          }
        );
        state.resultScreen.draw();

        game.input.keyboard
          .addKey(Phaser.KeyCode.R)
          .onDown.add(state.restartLevel, this, 0);
      }
      state.resultScreen.update();
    } else if (gus.isDead && restartTimeout === undefined) {
      game.dolly.unlock();

      restartTimeout = setTimeout(function() {
        state.restartLevel();
      }, 500);
    }

    // render HUD

    hudCounters.forEach(function(counter) {
      counter.icon.bringToTop();
      counter.icon.position = game.dolly.screenspaceToWorldspace(
        counter.icon.initPos
      );

      counter.icon.rotation = game.dolly.rotation;

      var textpos = {
        x: counter.icon.initPos.x + 36,
        y: counter.icon.initPos.y + 8
      };
      counter.shadow.bringToTop();
      counter.shadow.position = game.dolly.screenspaceToWorldspace(textpos);
      counter.shadow.text = counter.value();
      counter.shadow.rotation = game.dolly.rotation;

      textpos = {
        x: counter.icon.initPos.x + 32,
        y: counter.icon.initPos.y + 4
      };
      counter.text.bringToTop();
      counter.text.position = game.dolly.screenspaceToWorldspace(textpos);
      counter.text.text = counter.value();
      counter.text.rotation = game.dolly.rotation;
    });
  };

  // needs to be added
  state.restartLevel = function() {
    if (this.resultScreen) {
      this.resultScreen.texture.visible = false;
      game.input.keyboard
        .addKey(Phaser.KeyCode.R)
        .onDown.remove(state.restartLevel, this);
    }
    game.toolsToCollect.forEach(function(tool) {
      tool.reset();
    });
    marker.girdersPlaced.forEach(function(girder) {
      girder.sprite.destroy();
    });
    BreakBrickBlock.reset();
    gus.respawn();
    gus.rotationSpeed = 0;
    game.dolly.lockTo(gus.sprite);
    gus.girders = generator.getStartingGirders();

    game.camera.scale.x = 1;
    game.camera.scale.y = 1;

    restartTimeout = undefined;
    levelStarted = game.time.now;
    gameEndingEmitted = false;
  };
  state.postBroadphase = function(body1, body2) {
    if (
      body1.sprite.name === "Gus" &&
      body2.sprite.name === "Tool" &&
      body1.fixedRotation
    ) {
      body2.sprite.owner.collect();
      return false;
    } else if (
      body1.sprite.name === "Tool" &&
      body2.sprite.name === "Gus" &&
      body2.fixedRotation
    ) {
      body1.sprite.owner.collect();
      return false;
    }

    return true;
  };
  return state;
}

module.exports = initGameState;
