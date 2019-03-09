const eventEmitter = window.eventEmitter;
var nextMapUse = null;
var unparsedLevelArr = null;
var parsedLevelArr = [];
var draftSaveObj;
var testing = false;
var activeToolImg = "/game/assets/images/brick_red.png";

// document.addEventListener("DOMContentLoaded", function() {
//   document.getElementById("creatorAndTester").innerHTML =
//     '<span> <link rel="stylesheet" href="/browser/stylesheets/levelCreator.css"><script type="text/javascript" src="levelCreator/levelCreatorBundle.js"></script><div class="level-creator-view"><div class="game-window"id="level-creator-container></div></div></span> ';
// });

const changeActiveTool = function(tool) {
  console.log("##from change tools", tool.tile);
  eventEmitter.emit("change active tool", tool.tile);
  activeToolImg = tool.img;
  console.log(activeToolImg);
  document.getElementById("level-creator-container").style.cursor =
    'url("' + activeToolImg + '") 16 16, auto';
};
requestParsedTileMap = () => {
  nextMapUse = "log";
  console.log("requesting tile map...");
  eventEmitter.emit("request tile map", "");
};
eventEmitter.on("send tile map", mapArr => {
  if (nextMapUse === "log") {
    console.log("recieved.");
    console.log(mapArr[0]);
    console.log(mapArr[1]);
  } else if (nextMapUse === "switchToGame") {
    console.log("ready to switch");
    parsedLevelArr = mapArr[0];
    console.log(parsedLevelArr);
    console.log("look above");
    unparsedLevelArr = mapArr[1];
    testing = true;
    // getScreenshot();
  }
});
eventEmitter.on("I need both the maps!", function() {
  eventEmitter.emit("found maps!", [unparsedLevelArr, parsedLevelArr]);
});

const getScreenshot = function() {
  eventEmitter.emit("request screenshot");
};

const testTesting = function() {
  window.game.destroy();
  (function checkGameDestroyed() {
    if (window.game.state === null) {
      window.game = null;
      nextMapUse = "switchToGame";
      activeToolImg = "/game/assets/images/brick_red.png";
      if (!testing) {
        eventEmitter.emit("request tile map", "");
      } else {
        testing = !testing;
      }
    } else {
      setTimeout(checkGameDestroyed, 100);
    }
  })();
};

eventEmitter.on("send screenshot", screenshot => {
  console.log("screenshot");
  console.log(screenshot);
});

eventEmitter.on("what level to play", data => {
  console.log(data);
  if (parsedLevelArr) {
    eventEmitter.emit("play this level", ["levelArr", parsedLevelArr]);
    console.log("found a parsed level arr");
  } else {
    console.log(parsedLevelArr);
  }
});
