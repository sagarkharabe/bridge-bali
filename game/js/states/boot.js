function initBootState() {
  var state = {};

  state.create = function() {
    // start game physics
    game.physics.startSystem(Phaser.Physics.P2JS);
    game.physics.p2.setImpactEvents(true);

    game.state.start("load");
  };

  return state;
}
