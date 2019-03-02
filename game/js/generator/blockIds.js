var blocks = require("../objects/blocks");

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

addBlockId("a", function(defObj) {
  return new blocks.RedBrickBlock(defObj.x, defObj.y);
});
addBlockId("b", function(defObj) {
  return new blocks.BlackBrickBlock(defObj.x, defObj.y);
});

module.exports = blockIds;
