const COLORS = require("../../game/js/const/colors");
const NUM_TO_TILES = require("../../game/js/const/tilemap");
let gusSpawn,
  upKey,
  downKey,
  leftKey,
  rightKey,
  rotateCounterKey,
  routateClockwiseKey;
let lastRotTime = 0;
const Dolly = require("../../game/js/objects/dolly");
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

    game.dolly = new Dolly(game.camera);
    game.dolly.targetPos = new Phaser.Point(0, 0);

    // Set Keyboard input
    upKey = game.input.keyboard.addKey(Phaser.Keyboard.W);
    downKey = game.input.keyboard.addKey(Phaser.Keyboard.S);
    leftKey = game.input.keyboard.addKey(Phaser.Keyboard.A);
    rightKey = game.input.keyboard.addKey(Phaser.Keyboard.D);
    rotateCounterKey = game.input.keyboard.addKey(Phaser.Keyboard.Q);
    routateClockwiseKey = game.input.keyboard.addKey(Phaser.Keyboard.E);

    game.dolly = new Dolly(game.camera);
    game.dolly.targetPos = new Phaser.Point(0, 0);

    eventEmitter.on("change active tool", tool => {
      game.activeTool = tool;
    });

    var handleTileMapRequest = function() {
      console.log("recieved request. processing...");
      const parsedTileMap = [];

      for (let x in unparsedTileMap) {
        if (!unparsedTileMap.hasOwnProperty(x)) continue;

        for (let y in unparsedTileMap[x]) {
          if (!unparsedTileMap[x].hasOwnProperty(y)) continue;
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
    };
    if (eventEmitter.listenerCount("request tile map")) {
      eventEmitter.removeAllListeners("request tile map");
    }
    eventEmitter.on("request tile map", handleTileMapRequest);

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
      const clickPoint = new Phaser.Point(
        game.input.mousePointer.x,
        game.input.mousePointer.y
      );
      const targetPoint = game.dolly.screenspaceToWorldspace(clickPoint);
      const x = parseCoordinate(targetPoint.x);
      const y = parseCoordinate(targetPoint.y);

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
    }

    function move(xDiff, yDiff) {
      const clickPoint = new Phaser.Point(
        game.camera.width / 2 - xDiff,
        game.camera.height / 2 - yDiff
      );
      game.dolly.targetPos = game.dolly.screenspaceToWorldspace(clickPoint);
    }

    function rotate(dir) {
      if (Date.now() - lastRotTime > 500) {
        if (!game.dolly.targetAng) game.dolly.targetAng = 0;
        game.dolly.targetAng += (dir * Math.PI) / 2;
        lastRotTime = Date.now();
      }
    }

    const moveAmount = 64;

    if (upKey.isDown) move(0, moveAmount);
    if (downKey.isDown) move(0, -moveAmount);
    if (leftKey.isDown) move(moveAmount, 0);
    if (rightKey.isDown) move(-moveAmount, 0);

    if (rotateCounterKey.isDown) rotate(1);
    if (routateClockwiseKey.isDown) rotate(-1);

    game.dolly.update();
  };

  return state;
}

module.exports = initCreateState;
