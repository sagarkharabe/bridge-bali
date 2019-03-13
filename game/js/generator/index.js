var blockIds = require("./blockIds");
var defaultSkyColor = require("../const/colors").DEFAULT_SKY;
var tilemap = require("../const/tilemap");

var GhostBreakBrickBlock = require("../objects/ghostBlocks")
  .GhostBreakBrickBlock;
function LevelGenerator(levelData) {
  if (blockIds === undefined) console.error("blockIds are undefined (wtf!!)");
  this.blockIds = blockIds;
  this.levelData = levelData;
  this.spriteBatches = {
    3: null,
    4: null,
    5: null,
    6: null
  };
}

LevelGenerator.prototype.getSkyColor = function() {
  return this.levelData.skyColor || defaultSkyColor;
};
LevelGenerator.prototype.getStartingGirders = function() {
  return this.levelData.startGirders !== undefined
    ? this.levelData.startGirders
    : 10;
};

LevelGenerator.prototype.parseObjects = function() {
  var levelObjects = [];
  var objDefList = this.levelData.objects;
  var blocks = this.blockIds;
  var game = window.game;
  var spriteBatches = this.spriteBatches;
  console.log("sag, ", objDefList);
  objDefList.forEach(function(objDef) {
    // find the object definition function for this id
    var createFunction = undefined;
    if (objDef.t !== undefined && blocks[objDef.t] !== undefined) {
      createFunction = blocks[objDef.t].onLoad;
    } else {
      console.log("[LVGN] No tile found for", objDef.t);
    }

    if (typeof createFunction !== "function") {
      console.error(
        "Received an invalid object definition from mapdata:\n",
        JSON.stringify(objDef)
      );
      return;
    }

    // create it!
    var newObject = createFunction(objDef);
    levelObjects.push(newObject);
    // batch it maybe
    if (spriteBatches[objDef.t] !== undefined) {
      if (spriteBatches[objDef.t] === null)
        spriteBatches[objDef.t] = game.add.spriteBatch();
      spriteBatches[objDef.t].add(newObject.sprite);
    }

    // account for ghost mode
    if (tilemap[objDef.t] === "BreakBrickBlock" && game.recordingMode) {
      var ghostBlock = new GhostBreakBrickBlock(objDef.x, objDef.y);
      levelObjects.push(ghostBlock);

      if (spriteBatches["GhostBreakBrickBlock"] === undefined)
        spriteBatches["GhostBreakBrickBlock"] = game.add.spriteBatch();
      spriteBatches["GhostBreakBrickBlock"].add(ghostBlock.sprite);
    }
  });

  return levelObjects;
};

module.exports = LevelGenerator;
