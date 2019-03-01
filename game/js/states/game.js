function initGameState() {
  var state = {};
  var gus, blocks;

  state.preload = function() {};

  state.create = function() {
    game.add.plugin(Phaser.Plugin.Debug);
    game.world.setBounds(-400, -300, 800, 600);
    gus = new Gus(0, 0);

    blocks = game.add.group();
    blocks.enableBody = true;
    for (var i = 0; i < 10; ++i) {
      var newBlock = blocks.create(-128 + 32 * i, 128, "BrickRed");
      newBlock.body.immovable = true;
    }

    for (var i = 0; i < 10; ++i) {
      var newBlock = blocks.create(-160, 128 - 32 * i, "BrickRed");
      newBlock.body.immovable = true;
    }

    for (var i = 0; i < 10; ++i) {
      var newBlock = blocks.create(-256, 128 - 32 * i, "BrickRed");
      newBlock.body.immovable = true;
    }

    cursors = game.input.keyboard.createCursorKeys();

    // etc 	    game.camera.follow( gus.sprite, game.camera.FOLLOW_PLATFORMER );
  };

  state.update = function() {
    game.physics.arcade.collide(gus.sprite, blocks);

    gus.update();

    game.camera.displayObject.pivot.x = gus.sprite.position.x;
    game.camera.displayObject.pivot.y = gus.sprite.position.y;
    //game.camera.displayObject.rotation = (Math.PI * 2) - gus.sprite.rotation;
    //game.world.rotation = (Math.PI * 2) - gus.rotation;
    //game.physics.arcade.collide( gus.sprite, blocks );
  };

  return state;
}
