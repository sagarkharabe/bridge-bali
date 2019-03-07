const COLORS = require("../../game/js/const/colors");
const NUM_TO_TILES = require("../../game/js/const/tilemap");
let gusSpawn;
function tileToNum(tile) {
  for (let n in NUM_TO_TILES) if (NUM_TO_TILES[n] === tile) return +n;

  throw new Error("Tile not found!");
}
function initCreateState() {
  const state = {};

  const eventEmitter = window.eventEmitter;

  /* unparsedTileMap[x][y] = {sprite: sprite, tile: tile}
   * e.g. { 50: { 25: [ sprite: sprite, tile: 'RedBrick' ] } }
   *
   * formatted like this so that each addition to it is O(1) rather than O(n)
   * O(n) would suck with mouse drag.
   */
  const unparsedTileMap = {};

  state.preload = function() {
    eventEmitter.emit("loaded", () => {});
  };

  state.create = function() {
    const game = window.game;
    gusSpawn = game.add.sprite(0, 0, "Gus");
    game.stage.setBackgroundColor(COLORS.DEFAULT_SKY);

    eventEmitter.on("change active tool", tool => {
      game.activeTool = tool;
    });

    eventEmitter.on("request tile map", function() {
      console.log("recieved request. processing...");
      const parsedTileMap = [];

      for (let x in unparsedTileMap) {
        if (!unparsedTileMap.hasOwnProperty(x)) continue;

        for (let y in unparsedTileMap[x]) {
          if (!unparsedTileMap[x].hasOwnProperty(x)) continue;
          if (unparsedTileMap[x][y] && unparsedTileMap[x][y]["tile"]) {
            parsedTileMap.push({
              x: x,
              y: y,
              t: tileToNum(unparsedTileMap[x][y]["tile"])
            });
          }
        }
      }
      if (gusSpawn)
        parsedTileMap.push({
          x: gusSpawn.x,
          y: gusSpawn.y,
          t: tileToNum("Gus")
        });
      console.log("sending...");
      eventEmitter.emit("send tile map", parsedTileMap);
    });
    eventEmitter.on("request screenshot", function() {
      var screenshot = game.canvas.toDataURL();
      eventEmitter.emit("send screenshot", screenshot);
    });
  };

  state.update = function() {
    function parseCoordinate(n) {
      return Math.floor(n / 32) * 32;
    }

    if (game.input.activePointer.isDown) {
      const x = parseCoordinate(game.input.mousePointer.x) - 400;
      const y = parseCoordinate(game.input.mousePointer.y) - 300;
      let placedTool;
      if (game.activeTool) placedTool = game.add.sprite(x, y, game.activeTool);
      if (game.activeTool === "Gus") {
        if (gusSpawn) gusSpawn.kill();
        gusSpawn = placedTool;
        return;
      }

      if (
        unparsedTileMap[x] &&
        unparsedTileMap[x][y] &&
        unparsedTileMap[x][y]["sprite"]
      )
        unparsedTileMap[x][y]["sprite"].kill();

      if (!unparsedTileMap[x]) unparsedTileMap[x] = {};
      unparsedTileMap[x][y] = {
        sprite: placedTool,
        tile: game.activeTool
      };
      console.dir(unparsedTileMap);
    }
  };

  return state;
}

module.exports = initCreateState;
