const eventEmitter = window.eventEmitter;
var nextMapUse = null;
var unparsedLevelArr = null;
var parsedLevelArr = [];
var draftSaveObj;
var activeToolImg = "/game/assets/images/brick_red.png";

const changeActiveTool = function(tool) {
  console.log("##from change tools", tool.tile);
  eventEmitter.emit("change active tool", tool.tile);
  activeToolImg = tool.img;
  console.log(activeToolImg);
  document.getElementById("level-creator-container").style.cursor =
    'url("' + activeToolImg + '") 16 16, auto';
};

eventEmitter.on("I need both the maps!", function() {
  eventEmitter.emit("found maps!", [unparsedLevelArr, parsedLevelArr]);
});
