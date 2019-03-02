var COLLISION_GROUPS = require("../consts/collisionGroups");

function initBootState() {
  var state = {};
  var game = window.game;
  state.create = function() {
    // start game physics
    console.log("Initializing physics...");
    game.physics.startSystem(Phaser.Physics.P2JS);
    game.physics.p2.setImpactEvents(true);
    console.log("Creating collision groups...");

    for (var key in COLLISION_GROUPS) {
      COLLISION_GROUPS[key] = game.physics.p2.createCollisionGroup();
    }

    console.log("Bootstrap complete");

    game.state.start("load");
  };

  return state;
}
module.exports = initBootState;
