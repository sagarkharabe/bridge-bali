var Gus = require("../objects/gus");
var GirderMarker = require("../objects/girderMarker");
var RedBrickBlock = require("../objects/redbrick");
var BlackBrickBlock = require("../objects/blackbrick");
function initGameState() {
  var state = {};
  var gus, blocks, marker;
  var game = window.game;
  state.preload = function() {};

  state.create = function() {
    console.log("Starting world...");

    //game.add.plugin(Phaser.Plugin.Debug);
    game.physics.p2.setBoundsToWorld();

    console.log("Creating Gus...");

    gus = new Gus(0, 0);
    marker = new GirderMarker();
    marker.setMaster(gus);

    console.log("Creating blocks...");

    for (let i = 0; i < 10; ++i) {
      blocks.push(new RedBrickBlock(-128 + 32 * i, 128));
    }
    for (let i = 0; i < 10; ++i) {
      blocks.push(new BlackBrickBlock(64, 96 - 32 * i));
    }
    console.log("Binding to keys...");

    game.cursors = game.input.keyboard.createCursorKeys();
    marker.setPlaceGirderButton(
      game.input.keyboard.addKey(Phaser.KeyCode.SPACEBAR)
    );
  };

  state.update = function() {
    //game.physics.arcade.collide( gus.sprite, blocks );

    gus.update();
    marker.update();

    game.camera.displayObject.pivot.x = gus.sprite.position.x;
    game.camera.displayObject.pivot.y = gus.sprite.position.y;
    game.camera.displayObject.rotation = Math.PI * 2 - gus.sprite.rotation;
    //game.world.rotation = (Math.PI * 2) - gus.rotation;
    //game.physics.arcade.collide( gus.sprite, blocks );
  };

  return state;
}
module.exports = initGameState;
