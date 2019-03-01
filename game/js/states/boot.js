var STATE_BOOT = {};

STATE_BOOT.create = function() {
  console.log("boot");
  // start game physics
  game.physics.startSystem(Phaser.Physics.ARCADE);

  game.state.start("load");
};
