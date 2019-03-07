function initLoadState() {
  var state = {};
  var game = window.game;

  state.preload = function() {
    console.log("Loading assets...");
    game.load.image("Clock", "/assets/images/clock.png");
    game.load.image("BrickBlack", "/assets/images/brick_black.png");
    game.load.image("BrickBreak", "/assets/images/brick_break.png");
    game.load.image("BrickRed", "/assets/images/brick_red.png");
    game.load.image("Girder", "/assets/images/girder.png");
    game.load.image("Tool", "/assets/images/tool.png");
    game.load.image("Spike", "/assets/images/spike.png");
    game.load.image("GusHead", "/assets/images/part_gushead.png");
    game.load.image("Debris", "/assets/images/part_redblock.png");
    game.load.spritesheet("Gus", "/assets/images/gus.png", 32, 32);

    console.log("Done loading");
  };

  state.create = function() {
    console.log("Starting world...");
    game.world.setBounds(-400, -300, 800, 600); // fullscreen???
    game.physics.p2.setBoundsToWorld();

    // start game state
    game.level = {
      sky: "#FFBB22",
      girders: 10,
      objs: [
        { t: 4, x: 0, y: 0 },
        { t: 4, x: 32, y: 0 },
        { t: 4, x: 64, y: 0 },
        { t: 4, x: 96, y: 0 },
        { t: 4, x: 128, y: 0 },
        { t: 4, x: 160, y: 0 },
        { t: 4, x: 192, y: 0 },
        { t: 4, x: 224, y: 0 },
        { t: 4, x: 0, y: 32 },
        { t: 4, x: 32, y: 32 },
        { t: 4, x: 64, y: 32 },
        { t: 4, x: 96, y: 32 },
        { t: 4, x: 128, y: 32 },
        { t: 4, x: 160, y: 32 },
        { t: 4, x: 192, y: 32 },
        { t: 4, x: 224, y: 32 },
        { t: 2, x: 96, y: -32 },
        { t: 2, x: 96, y: 64 },

        { t: 2, x: 512, y: -32 },
        { t: 3, x: 416, y: 0 },
        { t: 3, x: 448, y: 0 },
        { t: 3, x: 480, y: 0 },
        { t: 3, x: 512, y: 0 },
        { t: 3, x: 544, y: 0 },
        { t: 3, x: 576, y: 0 },
        { t: 3, x: 608, y: 0 },
        { t: 3, x: 416, y: 32 },
        { t: 3, x: 448, y: 32 },
        { t: 3, x: 480, y: 32 },
        { t: 3, x: 512, y: 32 },
        { t: 3, x: 544, y: 32 },
        { t: 3, x: 576, y: 32 },
        { t: 3, x: 608, y: 32 },

        { t: 6, x: 0, y: 160 },
        { t: 6, x: 32, y: 160 },
        { t: 6, x: 64, y: 160 },
        { t: 6, x: 96, y: 160 },
        { t: 6, x: 128, y: 160 },
        { t: 6, x: 160, y: 160 },
        { t: 6, x: 192, y: 160 },
        { t: 6, x: 224, y: 160 },
        { t: 6, x: 256, y: 160 },
        { t: 6, x: 288, y: 160 },
        { t: 6, x: 320, y: 160 },
        { t: 6, x: 352, y: 160 },
        { t: 6, x: 384, y: 160 },
        { t: 6, x: 416, y: 160 },
        { t: 6, x: 440, y: 160 },
        { t: 6, x: 472, y: 160 },
        { t: 4, x: 0, y: 192 },
        { t: 4, x: 32, y: 192 },
        { t: 4, x: 64, y: 192 },
        { t: 4, x: 96, y: 192 },
        { t: 4, x: 128, y: 192 },
        { t: 4, x: 160, y: 192 },
        { t: 4, x: 192, y: 192 },
        { t: 4, x: 224, y: 192 },
        { t: 4, x: 256, y: 192 },
        { t: 4, x: 288, y: 192 },
        { t: 4, x: 320, y: 192 },
        { t: 4, x: 352, y: 192 },
        { t: 4, x: 384, y: 192 },
        { t: 4, x: 416, y: 192 },
        { t: 4, x: 440, y: 192 },
        { t: 4, x: 472, y: 192 },
        { t: 4, x: 0, y: 224 },
        { t: 4, x: 32, y: 224 },
        { t: 6, r: 180, x: 64, y: 224 },
        { t: 6, r: 180, x: 96, y: 224 },
        { t: 6, r: 180, x: 128, y: 224 },
        { t: 6, r: 180, x: 160, y: 224 },
        { t: 6, r: 180, x: 192, y: 224 },
        { t: 6, r: 180, x: 224, y: 224 },
        { t: 6, r: 180, x: 256, y: 224 },
        { t: 6, r: 180, x: 288, y: 224 },
        { t: 6, r: 180, x: 320, y: 224 },
        { t: 6, r: 180, x: 352, y: 224 },
        { t: 6, r: 180, x: 384, y: 224 },
        { t: 6, r: 180, x: 416, y: 224 },
        { t: 6, r: 180, x: 440, y: 224 },
        { t: 6, r: 180, x: 472, y: 224 },

        { t: 4, x: 576, y: 64 },
        { t: 4, x: 608, y: 64 },
        { t: 4, x: 576, y: 96 },
        { t: 4, x: 608, y: 96 },
        { t: 3, x: 576, y: 128 },
        { t: 3, x: 608, y: 128 },
        { t: 3, x: 576, y: 160 },
        { t: 3, x: 608, y: 160 },
        { t: 3, x: 576, y: 192 },
        { t: 3, x: 608, y: 192 },
        { t: 2, x: 544, y: 192 },
        { t: 3, x: 576, y: 224 },
        { t: 3, x: 608, y: 224 },
        { t: 3, x: 576, y: 256 },
        { t: 3, x: 608, y: 256 },
        { t: 3, x: 576, y: 288 },
        { t: 3, x: 608, y: 288 },
        { t: 3, x: 576, y: 320 },
        { t: 3, x: 608, y: 320 },
        { t: 3, x: 576, y: 352 },
        { t: 3, x: 608, y: 352 },
        { t: 3, x: 576, y: 384 },
        { t: 3, x: 608, y: 384 },
        { t: 5, x: 416, y: 352 },
        { t: 5, x: 448, y: 352 },
        { t: 5, x: 480, y: 352 },

        { t: 4, x: 0, y: 256 },
        { t: 4, x: 32, y: 256 },
        { t: 4, x: 0, y: 288 },
        { t: 4, x: 32, y: 288 },
        { t: 4, x: 0, y: 320 },
        { t: 4, x: 32, y: 320 },
        { t: 4, x: 0, y: 352 },
        { t: 4, x: 32, y: 352 },
        { t: 3, x: 64, y: 352 },
        { t: 3, x: 96, y: 352 },
        { t: 3, x: 128, y: 352 },
        { t: 3, x: 160, y: 352 },
        { t: 3, x: 192, y: 352 },
        { t: 3, x: 224, y: 352 },
        { t: 3, x: 256, y: 352 },
        { t: 3, x: 256, y: 352 },
        { t: 3, x: 288, y: 352 },
        { t: 3, x: 320, y: 352 },
        { t: 3, x: 352, y: 352 },
        { t: 3, x: 384, y: 352 },
        { t: 4, x: 0, y: 384 },
        { t: 4, x: 32, y: 384 },
        { t: 3, x: 64, y: 384 },
        { t: 3, x: 96, y: 384 },
        { t: 3, x: 128, y: 384 },
        { t: 3, x: 160, y: 384 },
        { t: 3, x: 192, y: 384 },
        { t: 3, x: 224, y: 384 },
        { t: 3, x: 256, y: 384 },
        { t: 3, x: 256, y: 384 },
        { t: 3, x: 288, y: 384 },
        { t: 3, x: 320, y: 384 },
        { t: 3, x: 352, y: 384 },
        { t: 3, x: 384, y: 384 },

        { t: 1, x: 128, y: 320 },
        { t: 2, x: 128, y: 416 }
      ]
    };

    // eventEmitter.on("play this level", function(data) {
    //   console.log(data);
    // });
    // eventEmitter.emit("what level to play", "log me");
    game.state.start("game");
  };

  return state;
}

module.exports = initLoadState;
