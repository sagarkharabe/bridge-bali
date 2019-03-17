function initLoadState() {
  var state = {};
  var game = window.game;
  const eventEmitter = window.eventEmitter;
  const http = require("http");

  state.preload = function() {
    console.log("Loading assets...");
    game.load.image("Clock", "game/assets/images/clock.png");
    game.load.image("BrickBlack", "game/assets/images/brick_black.png");
    game.load.image("BrickBreak", "game/assets/images/brick_break.png");
    game.load.image("BrickRed", "game/assets/images/brick_red.png");
    game.load.image("GhostGirder", "game/assets/images/girder.png");
    game.load.image("Girder", "game/assets/images/girder.png");
    game.load.image("Tool", "game/assets/images/tool.png");
    game.load.image("Spike", "game/assets/images/spike.png");
    game.load.image("GusHead", "game/assets/images/part_gushead.png");
    game.load.image("Debris", "game/assets/images/part_redblock.png");
    game.load.image("Select", "game/assets/images/selectedBlockOutline.png");
    game.load.spritesheet("Gus", "game/assets/images/gus.png", 32, 32);

    console.log("Done loading");
  };
  state.gotoStart = function() {
    (function gotoStart() {
      if (game.state) game.state.start("game");
      else setTimeout(gotoStart, 100);
    })();
  };

  var danceInstead = function(loadText, gus, err) {
    loadText.text = err || "Level not found!";
    gus.animations.play("dance");
  };

  state.create = function() {
    console.log("Starting world...");
    game.world.setBounds(-400, -300, 800, 600); // fullscreen???
    game.physics.p2.setBoundsToWorld();
    var gus = game.add.sprite(-16, -16, "Gus");
    gus.animations.add("dance", [3, 4, 6, 7], 5, true);
    var loadText = game.add.text(0, 0, "Loading assets...", {
      font: '12pt "Arial", sans-serif',
      fill: "white"
    });
    loadText.anchor = middle;

    // start game state
    game.level = {
      skyColor: "#FFBB22",
      startgirders: 10,
      objects: [
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
    loadText.text = "Waiting for level info...";

    eventEmitter.on("play this level", function(data) {
      console.log("##", data);
      if (data[0] === "levelArr") {
        loadText.text = "Creating level...";

        game.level = {
          skyColor: data[1].skyColor,
          startGirders: data[1].girdersAllowed,
          objects: data[1].levelArr
        };

        state.gotoStart();
      } else if (data[0] === "levelId") {
        if (data[1] === undefined) return danceInstead(loadText, gus);

        loadText.text = "Downloading level...";

        var levelData = "";
        var progress = 0;
        var id = data[1];

        console.log("Getting level " + id);
        var req = http.request(
          {
            hostname: window.location.hostname,
            path: "/api/levels/" + id + "/map",
            port: window.location.port || 5000,
            headers: {
              Origin: "localhost"
            }
          },
          function(res) {
            res.setEncoding("utf8");
            console.dir(res);
            var totalLen = res.headers["content-length"];

            res.on("data", function(chunk) {
              levelData += chunk;
              progress += Math.floor((chunk.length / totalLen) * 100);
              loadText.text =
                "Downloading level (" + progress.toString() + "%)...";
            });

            res.on("end", function() {
              loadText.text = "Downloading level (100%)...";
              levelData = JSON.parse(levelData);
              console.log("LEVELDATA:", levelData);
              if (levelData === null || typeof levelData.map !== "object") {
                return danceInstead(loadText, gus);
              } else if (levelData.map) {
                // check checksum here

                game.level = levelData.map;
              } else {
                return danceInstead(loadText, gus, "Mapdata was malformed");
              }

              state.gotoStart();
            });
          }
        );

        req.on("error", function(err) {
          console.error("An error occurred receiving level data:", err);
        });

        req.end();
      } else if (data[0] === "notFound") {
        return danceInstead(loadText, gus);
      } else {
        state.gotoStart();
      }
    });
    eventEmitter.emit("what level to play", "log me");
  };

  return state;
}

module.exports = initLoadState;
