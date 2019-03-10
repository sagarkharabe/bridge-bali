const eventEmitter = window.eventEmitter;
var nextMapUse = null;
var unparsedLevelArr = null;
var parsedLevelArr = [];
var nextMapUse = null;
var draftSaveObj;
var testing = false;
var beaten, beatenLevel;
var activeToolImg = "/game/assets/images/brick_red.png";

requestParsedTileMap = () => {
  nextMapUse = "log";
  console.log("requesting tile map...");
  eventEmitter.emit("request tile map", "");
};

eventEmitter.on("game ended", function(data) {
  console.log(data);
  beaten = true;
  beatenLevel = parsedLevelArr;
  //$scope.$digest();
});

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
    // eventEmitter.emit("what level to play", parsedLevelArr);
    //console.log(changeCreateToTest());
    // getScreenshot();
  }
});

eventEmitter.on("I need both the maps!", function() {
  eventEmitter.emit("found maps!", [unparsedLevelArr, parsedLevelArr]);
});

const getScreenshot = function() {
  eventEmitter.emit("request screenshot");
};
const submitBeatenLevel = function(levelArrayBeaten) {
  console.log(levelArrayBeaten);
};

const stopInputCapture = function() {
  eventEmitter.emit("stop input capture");
};

const startInputCapture = function() {
  eventEmitter.emit("start input capture");
};

const testTesting = function() {
  window.game.destroy();
  // var my_awesome_script = document.createElement("script");

  // my_awesome_script.setAttribute("src", "/game/js/bundle.js");

  // document.head.appendChild(my_awesome_script);

  (function checkGameDestroyed() {
    if (window.game.state === null) {
      window.game = null;
      nextMapUse = "switchToGame";
      activeToolImg = "/game/assets/images/brick_red.png";
      if (!testing) {
        eventEmitter.emit("request tile map", "");
      } else {
        testing = !testing;
        beatenLevel = null;
        beaten = false;
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
    eventEmitter.emit("play this level", [
      "levelArr",
      {
        levelArr: parsedLevelArr,
        skyColor: document.getElementById("color").value,

        girdersAllowed: document.getElementById("girder-count").value
      }
    ]);
    console.log("found a parsed level arr");
  } else {
    console.log(parsedLevelArr);
  }
});

const changeActiveTool = function(tool) {
  console.log("##from change tools", tool.tile);
  eventEmitter.emit("change active tool", tool.tile);
  activeToolImg = tool.img;
  console.log(activeToolImg);
  document.getElementById("level-creator-container").style.cursor =
    'url("' + activeToolImg + '") 16 16, auto';
};

const changeCreateToTest = function() {
  var newPath = "/testLevel";
  window.location.pathname = newPath;
};
