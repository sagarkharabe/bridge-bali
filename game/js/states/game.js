function initGameState() {
  var state = {};
  var gus, blocks, marker;

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

    for (var i = 0; i < 10; ++i) {
      var block = new RedBrickBlock(-128 + 32 * i, 128);
    }
    for (var i = 0; i < 10; ++i) {
      var block = new BlackBrickBlock(64, 96 - 32 * i);
    }
    console.log("Binding to keys...");

    window.cursors = game.input.keyboard.createCursorKeys();
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
