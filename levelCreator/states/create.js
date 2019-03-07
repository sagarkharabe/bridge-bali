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
    gusSpawn = game.add.sprite(-16, -16, "Gus");
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

    eventEmitter.on("request tile map", function() {
      console.log("recieved request. processing...");
      const parsedTileMap = [];

      for (let x in unparsedTileMap) {
        if (!unparsedTileMap.hasOwnProperty(x)) continue;

        for (let y in unparsedTileMap[x]) {
          if (!unparsedTileMap[x].hasOwnProperty(x)) continue;
          if (unparsedTileMap[x][y] && unparsedTileMap[x][y]["tile"]) {
            parsedTileMap.push({
              x: parseInt(x),
              y: parseInt(y),
              t: parseInt(tileToNum(unparsedTileMap[x][y]["tile"])),
              r:
                unparsedTileMap[x][y].tile !== "Spike"
                  ? undefined
                  : unparsedTileMap[x][y].sprite.angle === 0
                  ? undefined
                  : unparsedTileMap[x][y].sprite.angle === -180
                  ? 180
                  : unparsedTileMap[x][y].sprite.angle === -90
                  ? 270
                  : unparsedTileMap[x][y].sprite.angle
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
      console.log(unparsedTileMap);
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
      const clickPoint = new Phaser.Point(
        game.input.mousePointer.x,
        game.input.mousePointer.y
      );
      const targetPoint = game.dolly.screenspaceToWorldspace(clickPoint);
      const x = parseCoordinate(targetPoint.x);
      const y = parseCoordinate(targetPoint.y);
      let placedTool;
      if (game.activeTool) {
        placedTool = game.add.sprite(x, y, game.activeTool);
        placedTool.anchor.setTo(0.5, 0.5);
      }
      if (game.activeTool === "Spike") {
        let orientations = {
          0: 0,
          "-180": 0,
          90: 0,
          "-90": 0
        };
        let above = !unparsedTileMap[x]
            ? {}
            : !unparsedTileMap[x][y - 32]
            ? {}
            : unparsedTileMap[x][y - 32],
          below = !unparsedTileMap[x]
            ? {}
            : !unparsedTileMap[x][y + 32]
            ? {}
            : unparsedTileMap[x][y + 32],
          left = !unparsedTileMap[x - 32]
            ? {}
            : !unparsedTileMap[x - 32][y]
            ? {}
            : unparsedTileMap[x - 32][y],
          right = !unparsedTileMap[x + 32]
            ? {}
            : !unparsedTileMap[x + 32][y]
            ? {}
            : unparsedTileMap[x + 32][y];
        // aboveLeft = !unparsedTileMap[x-32] ? {} : !unparsedTileMap[x-32][y-32] ? {} : unparsedTileMap[x-32][y-32],
        // aboveRight = !unparsedTileMap[x+32] ? {} : !unparsedTileMap[x+32][y-32] ? {} : unparsedTileMap[x+32][y-32],
        // belowLeft = !unparsedTileMap[x-32] ? {} : !unparsedTileMap[x-32][y+32] ? {} : unparsedTileMap[x-32][y+32],
        // belowRight = !unparsedTileMap[x+32] ? {} : !unparsedTileMap[x+32][y+32] ? {} : unparsedTileMap[x+32][y+32];
        if (above.tile === "RedBrickBlock" || above.tile === "BlackBrickBlock")
          orientations[-180] += 7;
        if (below.tile === "RedBrickBlock" || below.tile === "BlackBrickBlock")
          orientations[0] += 7;
        if (left.tile === "RedBrickBlock" || left.tile === "BlackBrickBlock")
          orientations[90] += 7;
        if (right.tile === "RedBrickBlock" || right.tile === "BlackBrickBlock")
          orientations[-90] += 7;
        if (
          above.tile === "Spike" &&
          (above.sprite.angle === 90 || above.sprite.angle === -90)
        )
          orientations[above.sprite.angle] += 2;
        if (
          below.tile === "Spike" &&
          (below.sprite.angle === 90 || below.sprite.angle === -90)
        )
          orientations[below.sprite.angle] += 2;
        if (
          left.tile === "Spike" &&
          (left.sprite.angle === 0 || left.sprite.angle === -180)
        )
          orientations[left.sprite.angle] += 2;
        if (
          right.tile === "Spike" &&
          (right.sprite.angle === 0 || right.sprite.angle === -180)
        ) {
          console.log("right is spike");
          orientations[right.sprite.angle] += 2;
        }
        console.log(
          "right",
          right,
          "left",
          left,
          "above",
          above,
          "below",
          below
        );
        console.log("orientations", orientations);
        let maxOrient = 0;
        if (orientations["-180"] > orientations[maxOrient]) maxOrient = -180;
        if (orientations[90] > orientations[maxOrient]) maxOrient = 90;
        if (orientations["-90"] > orientations[maxOrient]) maxOrient = -90;
        placedTool.angle = maxOrient;
        console.log("new spike angle", placedTool.angle);
        // console.log('above',above,'below',below,'left',left,'right',right);
        // if(unparsedTileMap[x-32] && unparsedTileMap[x-32][y] && (unparsedTileMap[x-32][y].tile === 'RedBrickBlock' || unparsedTileMap[x-32][y].tile === 'BlackBrickBlock'))
        //   orientations[90] += 7;
        // else if((unparsedTileMap[x+32] && unparsedTileMap[x+32][y] && (unparsedTileMap[x+32][y].tile === 'RedBrickBlock' || unparsedTileMap[x+32][y].tile === 'BlackBrickBlock')))
        //   orientations[270] += 7;
        // else if((unparsedTileMap[x] && unparsedTileMap[x][y-32] && (unparsedTileMap[x][y-32].tile === 'RedBrickBlock' || unparsedTileMap[x][y-32].tile === 'BlackBrickBlock')))
        //   orientations.push(180);
        // else if((unparsedTileMap[x] && unparsedTileMap[x][y+32] && (unparsedTileMap[x][y+32].tile === 'RedBrickBlock' || unparsedTileMap[x][y+32].tile === 'BlackBrickBlock')))
        //   orientations.push(0);

        // if(orientations.length === 1)
        //   placedTool.angle = orientations[0];
        // else {
        //   if(orientations.indexOf(0) && )
        // }
      }
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
        // r: game.activeTool === 'Spike' ? placedTool.angle : undefined
      };
      console.dir(unparsedTileMap);
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
