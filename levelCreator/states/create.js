"use strict";
const COLORS = require("../../game/js/const/colors");
const NUM_TO_TILES = require("../../game/js/const/tilemap");

var Dolly = require("../../game/js/objects/dolly");
var Cursors = require("../controls/cursors");
let gusSpawn,
  upKey,
  downKey,
  leftKey,
  rightKey,
  rotateCounterKey,
  routateClockwiseKey,
  grid,
  selector;
let wasdCursors, arrowCursors;
let lastRotTime = 0;

function tileToNum(tile) {
  for (let n in NUM_TO_TILES) if (NUM_TO_TILES[n] === tile) return +n;

  throw new Error("Tile not found!");
}

function parseCoordinate(n) {
  return Math.floor(n / 32) * 32;
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
  let unparsedTileMap;

  state.preload = function() {
    eventEmitter.emit("loaded", () => {});
    unparsedTileMap = game.unparsedTileMap;
    game.parsedTileMap.forEach(function(obj) {
      var unparTiMa = unparsedTileMap[obj.x][obj.y];
      var sprite = game.add.sprite(obj.x, obj.y, unparTiMa.tile);
      if (unparTiMa.tile === "Gus") {
        gusSpawn = sprite;
      }
      sprite.anchor.setTo(0.5, 0.5);
      unparTiMa.sprite = sprite;
      if (unparTiMa !== undefined) unparTiMa.sprite.angle = obj.r;
    });
    game.activeTool = "RedBrickBlock";
    selector = game.add.sprite("0", "0", "Select");
    selector.anchor.setTo(0.5, 0.5);
  };

  state.create = function() {
    const game = window.game;
    gusSpawn = gusSpawn || game.add.sprite("0", "0", "Gus");
    gusSpawn.anchor.setTo(0.5, 0.5);
    game.stage.setBackgroundColor(COLORS.DEFAULT_SKY);

    game.dolly = new Dolly(game.camera);
    game.dolly.targetPos = new Phaser.Point(0, 0);

    grid = game.add.graphics();
    grid.lineStyle(2, 0x000, 0.2);
    for (
      var y =
        parseCoordinate(game.dolly.position.y - game.camera.width / 2) - 16;
      y < game.dolly.position.y + game.camera.width / 2 + 16;
      y += 32
    ) {
      grid.moveTo(game.dolly.position.x - game.camera.width / 2 - 32, y);
      grid.lineTo(game.dolly.position.x + game.camera.width / 2 + 32, y);
    }

    for (
      var x =
        parseCoordinate(game.dolly.position.x - game.camera.width / 2) - 16;
      x < game.dolly.position.x + game.camera.width / 2 + 16;
      x += 32
    ) {
      grid.moveTo(x, game.dolly.position.y - game.camera.width / 2 - 32);
      grid.lineTo(x, game.dolly.position.y + game.camera.width / 2 + 32);
    }

    // Set Keyboard input
    wasdCursors = new Cursors(
      game.input.keyboard.addKey(Phaser.KeyCode.W),
      game.input.keyboard.addKey(Phaser.KeyCode.A),
      game.input.keyboard.addKey(Phaser.KeyCode.S),
      game.input.keyboard.addKey(Phaser.KeyCode.D)
    );
    arrowCursors = new Cursors(
      game.input.keyboard.addKey(Phaser.KeyCode.UP),
      game.input.keyboard.addKey(Phaser.KeyCode.LEFT),
      game.input.keyboard.addKey(Phaser.KeyCode.DOWN),
      game.input.keyboard.addKey(Phaser.KeyCode.RIGHT)
    );
    rotateCounterKey = game.input.keyboard.addKey(Phaser.KeyCode.Q);
    routateClockwiseKey = game.input.keyboard.addKey(Phaser.KeyCode.E);

    game.dolly = new Dolly(game.camera);
    game.dolly.targetPos = new Phaser.Point(0, 0);

    eventEmitter.on("change active tool", tool => {
      game.activeTool = tool;
    });

    var handleTileMapRequest = function() {
      const parsedTileMap = [];

      if (!unparsedTileMap[gusSpawn.x]) {
        unparsedTileMap[gusSpawn.x] = {};
      }
      unparsedTileMap[gusSpawn.x][gusSpawn.y] = {
        tile: "Gus",
        sprite: gusSpawn
      };

      for (let x in unparsedTileMap) {
        if (!unparsedTileMap.hasOwnProperty(x)) continue;

        for (let y in unparsedTileMap[x]) {
          if (!unparsedTileMap[x].hasOwnProperty(y)) continue;
          if (unparsedTileMap[x][y] && unparsedTileMap[x][y]["tile"]) {
            if (unparsedTileMap[x][y]["tile"] === "Gus") {
              if (x != gusSpawn.x || y != gusSpawn.y) {
                continue;
              }
            }
            parsedTileMap.push({
              x: x,
              y: y,
              t: tileToNum(unparsedTileMap[x][y]["tile"]),
              r: unparsedTileMap[x][y].sprite.angle
                ? unparsedTileMap[x][y].sprite.angle
                : undefined
            });
          }
        }
      }
      /*if (gusSpawn) parsedTileMap.push({
			  x: gusSpawn.x,
			  y: gusSpawn.y,
			  t: tileToNum('Gus')
			  });*/
      eventEmitter.emit("send tile map", [parsedTileMap, unparsedTileMap]);
    };

    eventEmitter.on("request tile map", handleTileMapRequest);

    eventEmitter.on("request screenshot", function() {
      var screenshot = game.canvas.toDataURL();
      eventEmitter.emit("send screenshot", screenshot);
    });

    eventEmitter.on("stop input capture", function() {
      game.input.enabled = false;
      game.input.reset();
    });

    eventEmitter.on("start input capture", function() {
      game.input.enabled = true;
      game.input.reset();
    });
  };

  state.update = function() {
    const cosine = Math.cos(game.dolly.rotation),
      sine = Math.sin(game.dolly.rotation);

    const mousePoint = new Phaser.Point(
      game.input.mousePointer.x + (16 * cosine + sine),
      game.input.mousePointer.y + (16 * cosine - sine)
    );
    const convertedMousePoint = game.dolly.screenspaceToWorldspace(mousePoint);
    selector.x = parseCoordinate(convertedMousePoint.x);
    selector.y = parseCoordinate(convertedMousePoint.y);

    grid.position.x = parseCoordinate(game.dolly.position.x);
    grid.position.y = parseCoordinate(game.dolly.position.y);

    if (game.input.activePointer.isDown) {
      const clickPoint = new Phaser.Point(
        game.input.mousePointer.x + (16 * cosine + sine),
        game.input.mousePointer.y + (16 * cosine - sine)
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
          90: 0,
          180: 0,
          270: 0
        };

        // find all adjacent blocks, checking in arcs of 90 degrees
        for (var orient = 0; orient < 360; orient += 90) {
          var orientRadians = (orient / 180) * Math.PI;
          var adjPoint = {
            x: x - Math.round(Math.sin(orientRadians)) * 32,
            y: y + Math.round(Math.cos(orientRadians)) * 32
          };

          if (unparsedTileMap && unparsedTileMap[adjPoint.x]) {
            var adjacentBlock = unparsedTileMap[adjPoint.x][adjPoint.y];

            if (adjacentBlock === undefined) continue;

            // check what kind of block it is, and weight it based on the angles
            if (
              adjacentBlock.tile === "RedBrickBlock" ||
              adjacentBlock.tile === "BlackBrickBlock"
            ) {
              orientations[orient] += 7;
            } else if (adjacentBlock.tile === "Spike") {
              orientations[adjacentBlock.sprite.angle] += 2;
            }
          }
        }

        // weight our rotation selection to our current rotation
        var curRot = game.dolly.targetAng % (Math.PI * 2);
        if (curRot < 0) curRot += Math.PI * 2;
        var maxOrient = (180 * curRot) / Math.PI;

        // find the maximum orientation
        for (var ang in orientations) {
          if (orientations[ang] > orientations[maxOrient]) {
            maxOrient = ang;
          }
        }

        // set angle
        placedTool.angle = maxOrient;
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

    var vec;
    if (arrowCursors.isDown()) {
      vec = arrowCursors.getVector();
      move(vec.x * moveAmount, vec.y * moveAmount);
    } else if (wasdCursors.isDown()) {
      vec = wasdCursors.getVector();
      move(vec.x * moveAmount, vec.y * moveAmount);
    }

    if (rotateCounterKey.isDown) rotate(1);
    if (routateClockwiseKey.isDown) rotate(-1);

    game.dolly.update();
  };

  return state;
}

module.exports = initCreateState;
