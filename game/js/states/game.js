var Gus = require("../objects/gus");
var GirderMarker = require("../objects/girderMarker");
var RedBrickBlock = require("../objects/blocks").RedBrickBlock;
var BlackBrickBlock = require("../objects/blocks").BlackBrickBlock;
var LevelGenerator = require("../generator");

function initGameState() {
  var state = {};
  var blocks = [];
  var gus, marker, generator, restartTimeout;
  var game = window.game;

  state.preload = function() {
    console.log("Loading level data...");

    var level = {
      sky: "#4499FF",
      objs: [
        { t: "3", x: -288, y: -160 },
        { t: "3", x: -288, y: -128 },
        { t: "3", x: -288, y: -96 },
        { t: "3", x: -288, y: -64 },
        { t: "3", x: -288, y: -32 },
        { t: "3", x: -288, y: 0 },
        { t: "3", x: -288, y: 32 },
        { t: "3", x: -288, y: 64 },
        { t: "3", x: -288, y: 96 },
        { t: "3", x: -288, y: 128 },
        { t: "3", x: -288, y: 160 },
        { t: "3", x: -256, y: -160 },
        { t: "3", x: -256, y: -128 },
        { t: "3", x: -256, y: -96 },
        { t: "3", x: -256, y: -64 },
        { t: "3", x: -256, y: -32 },
        { t: "3", x: -256, y: 0 },
        { t: "3", x: -256, y: 32 },
        { t: "3", x: -256, y: 64 },
        { t: "3", x: -256, y: 96 },
        { t: "3", x: -256, y: 128 },
        { t: "3", x: -256, y: 160 },
        { t: "3", x: -224, y: 128 },
        { t: "3", x: -224, y: 160 },
        { t: "3", x: -224, y: -128 },
        { t: "3", x: -224, y: -160 },
        { t: "3", x: -192, y: 128 },
        { t: "3", x: -192, y: 160 },
        { t: "3", x: -192, y: -128 },
        { t: "3", x: -192, y: -160 },
        { t: "3", x: -160, y: 128 },
        { t: "3", x: -160, y: 160 },
        { t: "3", x: -160, y: -128 },
        { t: "3", x: -160, y: -160 },
        { t: "3", x: -128, y: 128 },
        { t: "3", x: -128, y: 160 },
        { t: "3", x: -128, y: -128 },
        { t: "3", x: -128, y: -160 },
        { t: "3", x: -96, y: -128 },
        { t: "3", x: -96, y: -160 },
        { t: "3", x: -64, y: -128 },
        { t: "3", x: -64, y: -160 },
        { t: "3", x: -32, y: -128 },
        { t: "3", x: -32, y: -160 },
        { t: "3", x: 0, y: -128 },
        { t: "3", x: 0, y: -160 },
        { t: "3", x: 32, y: -128 },
        { t: "3", x: 32, y: -160 },
        { t: "3", x: 64, y: -128 },
        { t: "3", x: 64, y: -160 },
        { t: "3", x: 96, y: 128 },
        { t: "3", x: 96, y: 160 },
        { t: "3", x: 96, y: -128 },
        { t: "3", x: 96, y: -160 },
        { t: "3", x: 128, y: 128 },
        { t: "3", x: 128, y: 160 },
        { t: "3", x: 128, y: -128 },
        { t: "3", x: 128, y: -160 },
        { t: "3", x: 160, y: 128 },
        { t: "3", x: 160, y: 160 },
        { t: "3", x: 160, y: -128 },
        { t: "3", x: 160, y: -160 },
        { t: "3", x: 192, y: 128 },
        { t: "3", x: 192, y: 160 },
        { t: "3", x: 192, y: -128 },
        { t: "3", x: 192, y: -160 },
        { t: "3", x: 224, y: -160 },
        { t: "3", x: 224, y: -128 },
        { t: "3", x: 224, y: -96 },
        { t: "3", x: 224, y: -64 },
        { t: "3", x: 224, y: -32 },
        { t: "3", x: 224, y: 0 },
        { t: "3", x: 224, y: 32 },
        { t: "3", x: 224, y: 64 },
        { t: "3", x: 224, y: 96 },
        { t: "3", x: 224, y: 128 },
        { t: "3", x: 224, y: 160 },
        { t: "3", x: 256, y: -160 },
        { t: "3", x: 256, y: -128 },
        { t: "3", x: 256, y: -96 },
        { t: "3", x: 256, y: -64 },
        { t: "3", x: 256, y: -32 },
        { t: "3", x: 256, y: 0 },
        { t: "3", x: 256, y: 32 },
        { t: "3", x: 256, y: 64 },
        { t: "3", x: 256, y: 96 },
        { t: "3", x: 256, y: 128 },
        { t: "3", x: 256, y: 160 },
        { t: "2", x: 128, y: 96 },
        { t: "2", x: 128, y: -96 },
        { t: "2", x: -160, y: -96 },
        { t: "1", x: -160, y: 96 }
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
    marker = new GirderMarker();
    marker.setMaster(gus);

    // var i;
    // for ( i = 0; i < 10; ++i ) {
    //   blocks.push( new RedBrickBlock( -128 + (32 * i), 128 ) );
    // }

    // for ( i = 0; i < 10; ++i ) {
    //   blocks.push( new BlackBrickBlock( 64, 96 - ( 32 * i ) ) );
    // }

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
  };

  //---------------------------
  state.update = function() {
    // update actors
    gus.update();
    marker.update();

    // needs to be added
    game.toolsToCollect.forEach(function(tool) {
      tool.update();
    });

    if (game.toolsRemaining === 0) {
      if (restartTimeout === undefined)
        restartTimeout = setTimeout(function() {
          state.restartLevel();
        }, 10000);

      game.camera.scale.x *= 1 + game.time.physicsElapsed;
      game.camera.scale.y *= 1 + game.time.physicsElapsed;
      gus.sprite.rotation += game.time.physicsElapsed * 60;
    } else if (gus.isDead && restartTimeout === undefined) {
      restartTimeout = setTimeout(function() {
        state.restartLevel();
      }, 5000);
    }
    // ----------------

    // lock camera to player
    game.camera.displayObject.pivot.x = gus.sprite.position.x;
    game.camera.displayObject.pivot.y = gus.sprite.position.y;
    game.camera.displayObject.rotation = Math.PI * 2 - gus.sprite.rotation;
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

    game.camera.scale.x = 1;
    game.camera.scale.y = 1;

    restartTimeout = undefined;
  };
  // -----------------------------
  return state;
}

module.exports = initGameState;
