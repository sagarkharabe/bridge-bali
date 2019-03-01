function initBootState() {
  var state = {};

  state.create = function() {
    // start game physics
    game.physics.startSystem(Phaser.Physics.ARCADE);

    game.state.start("load");
  };

  return state;
}
