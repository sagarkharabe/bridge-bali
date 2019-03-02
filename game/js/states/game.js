function initGameState() {
  var state = {};
  var gus, blocks;

  state.preload = function() {};

  state.create = function() {
    game.add.plugin(Phaser.Plugin.Debug);
    game.world.setBounds(-400, -300, 800, 600);
    game.physics.p2.setBoundsToWorld();
    //game.physics.arcade.setBounds( -10000, -10000, 20000, 20000 );

    var gusCollisionGroup = game.physics.p2.createCollisionGroup();
    var blocksCollisionGroup = game.physics.p2.createCollisionGroup();

    gus = new Gus(0, 0);
    gus.sprite.body.setCollisionGroup(gusCollisionGroup);
    gus.sprite.body.collides([blocksCollisionGroup]);

    blocks = game.add.group();
    blocks.enableBody = true;
    blocks.physicsBodyType = Phaser.Physics.P2JS;

    for (var i = 0; i < 10; ++i) {
      var newBlock = blocks.create(-128 + 32 * i, 128, "BrickRed");
      // newBlock.body.static = true;

      //game.physics.p2.enable( newBlock, true );
      newBlock.body.setRectangle(32, 32);
      newBlock.body.setCollisionGroup(blocksCollisionGroup);
      newBlock.body.collides([gusCollisionGroup]);
      newBlock.body.static = true;
    }

    for (var i = 0; i < 10; ++i) {
      var newBlock = blocks.create(-160, 128 - 32 * i, "BrickRed");
      newBlock.body.setRectangle(32, 32);
      newBlock.body.setCollisionGroup(blocksCollisionGroup);
      newBlock.body.collides([gusCollisionGroup]);
      newBlock.body.static = true;
    }

    for (var i = 0; i < 10; ++i) {
      var newBlock = blocks.create(192, 128 - 32 * i, "BrickRed");
      newBlock.body.setRectangle(32, 32);
      newBlock.body.setCollisionGroup(blocksCollisionGroup);
      newBlock.body.collides([gusCollisionGroup]);
      newBlock.body.static = true;
    }

    for (var i = 0; i < 10; ++i) {
      var newBlock = blocks.create(-256, 128 - 32 * i, "BrickRed");
      newBlock.body.setRectangle(32, 32);
      newBlock.body.setCollisionGroup(blocksCollisionGroup);
      newBlock.body.collides([gusCollisionGroup]);
      newBlock.body.static = true;
    }

    cursors = game.input.keyboard.createCursorKeys();

    game.camera.follow(gus.sprite, game.camera.FOLLOW_PLATFORMER);
  };

  state.update = function() {
    //game.physics.arcade.collide( gus.sprite, blocks );

    gus.update();

    game.camera.displayObject.pivot.x = gus.sprite.position.x;
    game.camera.displayObject.pivot.y = gus.sprite.position.y;
    game.camera.displayObject.rotation = Math.PI * 2 - gus.sprite.rotation;
    //game.world.rotation = (Math.PI * 2) - gus.rotation;
    //game.physics.arcade.collide( gus.sprite, blocks );
  };

  return state;
}
