var Gus = require("../objects/gus");
var GirderMarker = require("../objects/girderMarker");
var RedBrickBlock = require("../objects/blocks").RedBrickBlock;
var BlackBrickBlock = require("../objects/blocks").BlackBrickBlock;
var LevelGenerator = require("../generator");

function initGameState() {
  var state = {};
  var blocks = [];
  var gus, marker;
  var game = window.game;

  state.preload = function() {
    console.log("Loading level data...");

    var level = {
      skyColor: "#AA4404",
      objects: [
        { tile: "a", x: -96, y: 128 },
        { tile: "a", x: -64, y: 128 },
        { tile: "a", x: -32, y: 128 },
        { tile: "a", x: 0, y: 128 },
        { tile: "a", x: 32, y: 128 },
        { tile: "a", x: 64, y: 128 },
        { tile: "a", x: 96, y: 128 },
        { tile: "a", x: 128, y: 128 },
        { tile: "a", x: -96, y: 160 },
        { tile: "a", x: -64, y: 160 },
        { tile: "a", x: -32, y: 160 },
        { tile: "a", x: 0, y: 160 },
        { tile: "a", x: 32, y: 160 },
        { tile: "a", x: 64, y: 160 },
        { tile: "a", x: 96, y: 160 },
        { tile: "a", x: 128, y: 160 },
        { tile: "b", x: 64, y: 96 },
        { tile: "b", x: 64, y: 64 },
        { tile: "G", x: 96, y: 96 }
      ]
    };

    const generator = new LevelGenerator(level);

    // set background color
    game.stage.setBackgroundColor(generator.getSkyColor());
  };

  state.create = function() {
    // generate the rest of the fucking level
    console.log("Generating level from level data...");
    generator.parseObjects();

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
  };

  state.update = function() {
    // update actors
    gus.update();
    marker.update();

    // lock camera to player
    game.camera.displayObject.pivot.x = gus.sprite.position.x;
    game.camera.displayObject.pivot.y = gus.sprite.position.y;
    game.camera.displayObject.rotation = Math.PI * 2 - gus.sprite.rotation;
  };

  return state;
}

module.exports = initGameState;
