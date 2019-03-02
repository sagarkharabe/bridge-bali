function RedBrickBlock(x, y) {
  x = Math.floor(x / 32) * 32;
  y = Math.floor(y / 32) * 32;

  this.sprite = game.add.sprite(x, y, "BrickRed");

  game.physics.p2.enable(this.sprite, false);

  this.sprite.body.setRectangle(32, 32);
  this.sprite.body.setCollisionGroup(COLLISION_GROUPS.BLOCK_ROTATE);
  this.sprite.body.collides([
    COLLISION_GROUPS.PLAYER_SOLID,
    COLLISION_GROUPS.PLAYER_SENSOR
  ]);
  this.sprite.body.static = true;
}
