function ResultScreen(girdersPlaced, timeTaken, callback) {
  this.girdersPlaced = girdersPlaced;
  this.timeTaken = timeTaken;
  this.lifespan = 0;
  this.callback = callback;
}

ResultScreen.prototype.draw = function() {
  const game = window.game;
  const middle = new Phaser.Point(0.5, 0.5);

  this.bitmapData = game.add.bitmapData(game.width, game.height);

  this.bitmapData.fill(0, 0, 0, 0.65);

  this.headerText = game.make.text(0, 0, "YOU DID IT!", {
    font: 'bold 32pt "Press Start 2P", sans-serif',
    fill: "#FFFFFF"
  });
  this.headerText.anchor = middle;

  this.girderCount = game.make.text(
    0,
    0,
    "Girders Placed: " + this.girdersPlaced.toString(),
    { font: "bold 18pt Arial, sans-serif", fill: "#FFFFFF" }
  );
  this.girderCount.anchor = middle;

  var seconds = (this.timeTaken % 60000) / 1000;
  var time =
    Math.floor(this.timeTaken / 60000) +
    ":" +
    (seconds < 10 ? "0" + seconds : seconds);
  this.timerCount = game.make.text(0, 0, "Time Taken: " + time.toString(), {
    font: "bold 18pt Arial, sans-serif",
    fill: "#FFFFFF"
  });
  this.timerCount.anchor = middle;

  this.pressAnyKey = game.make.text(0, 0, "Press R to restart", {
    font: "bold 18pt Arial, sans-serif",
    fill: "#FFFFFF"
  });
  this.pressAnyKey.anchor = middle;

  this.bitmapData.draw(this.headerText, game.width / 2, 150);

  this.texture = this.bitmapData.addToWorld();
  this.texture.anchor = middle;
};

ResultScreen.prototype.update = function() {
  const game = window.game;

  this.lifespan += game.time.physicsElapsed;

  if (game.dolly) {
    this.texture.position = game.dolly.position;
    this.texture.rotation = Math.PI * 2 - game.camera.displayObject.rotation;
    this.texture.width = game.camera.width / game.camera.scale.x;
    this.texture.height = game.camera.height / game.camera.scale.y;
  }

  if (this.lifespan > 2 && this.girderCount.blitted === undefined) {
    this.bitmapData.draw(this.girderCount, game.width / 2, 350);
    this.girderCount.blitted = true;
  }

  if (this.lifespan > 3 && this.timerCount.blitted === undefined) {
    this.bitmapData.draw(this.timerCount, game.width / 2, 382);
    this.timerCount.blitted = true;
  }

  if (this.lifespan > 4 && this.pressAnyKey.blitted === undefined) {
    this.bitmapData.draw(this.pressAnyKey, game.width / 2, 414);
    this.pressAnyKey.blitted = true;
  }
};

module.exports = ResultScreen;
