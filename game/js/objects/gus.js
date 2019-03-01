function Gus(x, y) {
  this.sprite = game.add.sprite(x, y, "Gus");
  game.physics.enable(this.sprite, Phaser.Physics.ARCADE);

  this.sprite.body.gravity.y = 500;
  this.sprite.body.maxVelocity = 1000;

  this.sprite.animation.add("stand", [0], 10, true);
  this.sprite.animation.add("walk", [1, 2], 10, true);
}
