function Cursors(upkey, leftkey, downkey, rightkey) {
  this.up = upkey;
  this.left = leftkey;
  this.down = downkey;
  this.right = rightkey;
}

Cursors.prototype.isDown = function() {
  return (
    this.up.isDown || this.left.isDown || this.down.isDown || this.right.isDown
  );
};

Cursors.prototype.getVector = function() {
  var xMovement = Number(this.left.isDown) - Number(this.right.isDown);
  var yMovement = Number(this.up.isDown) - Number(this.down.isDown);

  return new Phaser.Point(xMovement, yMovement);
};

module.exports = Cursors;
