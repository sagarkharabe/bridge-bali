var Gus = require("../objects/gus");
var Dolly = require("../objects/dolly");
var GirderMarker = require("../objects/girderMarker");
var LevelGenerator = require("../generator");

function initGameState() {
  var state = {};

  var gus, marker, generator, restartTimeout, hudCounter, levelStarted;
  var game = window.game;

  state.preload = function() {
    console.log("Loading level data...");

    var level = {
      sky: "#4499FF",
      girder: 6,
      objs: [
        { t: 3, x: -288, y: -160 },
        { t: 3, x: -288, y: -128 },
        { t: 3, x: -288, y: -96 },
        { t: 3, x: -288, y: -64 },
        { t: 3, x: -288, y: -32 },
        { t: 3, x: -288, y: 0 },
        { t: 3, x: -288, y: 32 },
        { t: 3, x: -288, y: 64 },
        { t: 3, x: -288, y: 96 },
        { t: 3, x: -288, y: 128 },
        { t: 3, x: -288, y: 160 },
        { t: 3, x: -256, y: -160 },
        { t: 3, x: -256, y: -128 },
        { t: 3, x: -256, y: -96 },
        { t: 3, x: -256, y: -64 },
        { t: 3, x: -256, y: -32 },
        { t: 3, x: -256, y: 0 },
        { t: 3, x: -256, y: 32 },
        { t: 3, x: -256, y: 64 },
        { t: 3, x: -256, y: 96 },
        { t: 3, x: -256, y: 128 },
        { t: 3, x: -256, y: 160 },
        { t: 3, x: -224, y: 128 },
        { t: 3, x: -224, y: 160 },
        { t: 6, r: 180, x: -224, y: -128 },
        { t: 3, x: -224, y: -160 },
        { t: 3, x: -192, y: 128 },
        { t: 3, x: -192, y: 160 },
        { t: 6, r: 180, x: -192, y: -128 },
        { t: 3, x: -192, y: -160 },
        { t: 3, x: -160, y: 128 },
        { t: 3, x: -160, y: 160 },
        { t: 6, r: 180, x: -160, y: -128 },
        { t: 3, x: -160, y: -160 },
        { t: 3, x: -128, y: 128 },
        { t: 3, x: -128, y: 160 },
        { t: 6, r: 180, x: -128, y: -128 },
        { t: 3, x: -128, y: -160 },
        { t: 6, r: 180, x: -96, y: -128 },
        { t: 3, x: -96, y: -160 },
        { t: 6, r: 180, x: -64, y: -128 },
        { t: 3, x: -64, y: -160 },
        { t: 6, r: 180, x: -32, y: -128 },
        { t: 3, x: -32, y: -160 },
        { t: 6, r: 180, x: 0, y: -128 },
        { t: 3, x: 0, y: -160 },
        { t: 6, r: 180, x: 32, y: -128 },
        { t: 3, x: 32, y: -160 },
        { t: 6, r: 180, x: 64, y: -128 },
        { t: 3, x: 64, y: -160 },
        { t: 3, x: 96, y: 128 },
        { t: 3, x: 96, y: 160 },
        { t: 6, r: 180, x: 96, y: -128 },
        { t: 3, x: 96, y: -160 },
        { t: 3, x: 128, y: 128 },
        { t: 3, x: 128, y: 160 },
        { t: 6, r: 180, x: 128, y: -128 },
        { t: 3, x: 128, y: -160 },
        { t: 3, x: 160, y: 128 },
        { t: 3, x: 160, y: 160 },
        { t: 6, r: 180, x: 160, y: -128 },
        { t: 3, x: 160, y: -160 },
        { t: 3, x: 192, y: 128 },
        { t: 3, x: 192, y: 160 },
        { t: 6, r: 180, x: 192, y: -128 },
        { t: 3, x: 192, y: -160 },
        { t: 3, x: 224, y: -160 },
        { t: 3, x: 224, y: -128 },
        { t: 3, x: 224, y: -96 },
        { t: 3, x: 224, y: -64 },
        { t: 3, x: 224, y: -32 },
        { t: 3, x: 224, y: 0 },
        { t: 3, x: 224, y: 32 },
        { t: 3, x: 224, y: 64 },
        { t: 3, x: 224, y: 96 },
        { t: 3, x: 224, y: 128 },
        { t: 3, x: 224, y: 160 },
        { t: 3, x: 256, y: -160 },
        { t: 3, x: 256, y: -128 },
        { t: 3, x: 256, y: -96 },
        { t: 3, x: 256, y: -64 },
        { t: 3, x: 256, y: -32 },
        { t: 3, x: 256, y: 0 },
        { t: 3, x: 256, y: 32 },
        { t: 3, x: 256, y: 64 },
        { t: 3, x: 256, y: 96 },
        { t: 3, x: 256, y: 128 },
        { t: 3, x: 256, y: 160 },
        { t: 2, x: 128, y: 96 },
        { t: 2, x: 128, y: -96 },
        { t: 2, x: -160, y: -96 },
        { t: 1, x: -160, y: 96 }
      ]
    };

    generator = new LevelGenerator(level);

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
      game.toolsToCollect = []; // needs to be added
      console.error("No tools were included in this level");
    }
    //---------------------------
    console.log("Creating Gus...");

    if (game.gusStartPos === undefined) {
      game.gusStartPos = { x: 0, y: 0 };
    }

    gus = new Gus(game.gusStartPos.x, game.gusStartPos.y);
    gus.girders = generator.getStartingGirders();
    marker = new GirderMarker();
    marker.setMaster(gus);

    game.dolly = new Dolly(game.camera);
    game.dolly.lockTo(gus.sprite);

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
    levelStarted = game.time.now;
  };

  state.update = function() {
    // update actors
    gus.update();
    marker.update();
    game.toolsToCollect.forEach(function(tool) {
      tool.update();
    });

    if (game.toolsRemaining === 0) {
      if (restartTimeout === undefined)
        restartTimeout = setTimeout(function() {
          state.restartLevel();
        }, 15000);

      gus.isDead = true;

      gus.rotationSpeed = gus.rotationSpeed || 0;
      gus.rotationSpeed += game.time.physicsElapsed;
      gus.sprite.rotation += gus.rotationSpeed * game.time.physicsElapsed;

      game.camera.scale.x *= 1 + game.time.physicsElapsed / 5;
      game.camera.scale.y *= 1 + game.time.physicsElapsed / 5;
      game.dolly.rotation = Math.PI * 2 - gus.sprite.rotation;
      game.dolly.unlock();
    } else if (gus.isDead && restartTimeout === undefined) {
      game.dolly.unlock();

      restartTimeout = setTimeout(function() {
        state.restartLevel();
      }, 5000);
    }

    // lock camera to player
    game.dolly.update();

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
    game.toolsToCollect.forEach(function(tool) {
      tool.reset();
    });
    marker.girdersPlaced.forEach(function(girder) {
      girder.sprite.destroy();
    });

    gus.respawn();
    gus.rotationSpeed = 0;
    gus.girders = generator.getStartingGirders();

    game.camera.scale.x = 1;
    game.camera.scale.y = 1;

    restartTimeout = undefined;
    levelStarted = game.time.now;
  };
  // -----------------------------
  return state;
}

module.exports = initGameState;
