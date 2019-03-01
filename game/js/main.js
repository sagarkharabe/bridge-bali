var FULLSCREEN = false;
var WIDTH = FULLSCREEN ? window.innerWidth * window.devicePixelRatio : 800,
  HEIGHT = FULLSCREEN ? window.innerHeight * window.devicePixelRatio : 600;

var config = {
  type: Phaser.AUTO,
  width: WIDTH,
  height: HEIGHT,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 200 }
    }
  },
  scene: {
    preload: preload,
    create: create
  }
};
var game = new Phaser.Game(config);
