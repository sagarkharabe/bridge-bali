var tilemap = require("../const/tilemap");
var objects = require("../objects");

var blockIds = {};

function addBlockId(id, loadFunction) {
  if (blockIds[id] !== undefined) {
    throw new Error("Duplicate Block ID entry for " + id.toString());
  }

  var blockIdObject = {
    onLoad: loadFunction
  };

  blockIds[id] = blockIdObject;
}

function generateBlockIdForConstructor(id, constructor) {
  addBlockId(id, function(defObj) {
    var newObj = new constructor(defObj.x, defObj.y);
    if (defObj.r) newObj.sprite.rotation = (defObj.r / 180) * Math.PI;
    return newObj;
  });
}

function placeGus(defObj) {
  window.game.gusStartPos = { x: defObj.x, y: defObj.y };
}

// dynamically generate our block ids
for (var index in tilemap) {
  if (tilemap[index] === "Gus") {
    addBlockId(index, placeGus);
  } else {
    var foundConstructor = undefined;
    for (var objKey in objects) {
      if (tilemap[index] === objKey) foundConstructor = objects[objKey];
    }

    if (foundConstructor !== undefined) {
      generateBlockIdForConstructor(index, foundConstructor);
    } else {
      console.log(
        "[LVGN]!! Failed to look up constructor for " + tilemap[index]
      );
    }
  }
}

module.exports = blockIds;
