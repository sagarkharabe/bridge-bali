const evenEmitter = window.evenEmitter;
var nextMapUse = null;
var unparsedLevelArr = null;
var parsedLevelArr = [];
var draftSaveObj;

var toolArr = {
  Eraser: {
    img: "game/assets/images/eraser.png",
    tile: null
  },
  Gus: {
    img: "game/assets/images/gus-static.png",
    tile: "Gus"
  },
  "Red Brick": {
    img: "game/assets/images/brick_red.png",
    tile: "RedBrickBlock"
  },
  "Black Brick": {
    img: "game/assets/images/brick_black.png",
    tile: "BlackBrickBlock"
  },
  "Break Brick": {
    img: "game/assets/images/brick_break.png",
    tile: "BreakBrickBlock"
  },
  Spike: {
    img: "game/assets/images/spike.png",
    tile: "Spike"
  },
  Tool: {
    img: "game/assets/images/tool.png",
    tile: "Tool"
  }
};
