var FULLSCREEN = false;
var WIDTH = FULLSCREEN ? window.innerWidth * window.devicePixelRatio : 800,
  HEIGHT = FULLSCREEN ? window.innerHeight * window.devicePixelRatio : 600;

// initialize the game
var game = new Phaser.Game(WIDTH, HEIGHT, Phaser.AUTO, "gameContainer");

// add states
game.state.add("boot", initBootState());
game.state.add("load", initLoadState());
game.state.add("game", initGameState());

game.state.start("boot");
var COLORS = {
  BACKGROUND_SKY: "#4428BC"
};

var EPSILON = 0.0001;
function Gus(x, y) {
  this.speed = 250;

  this.sprite = game.add.sprite(x, y, "Gus");
  this.sprite.anchor.setTo(0.5, 0.5);

  game.physics.enable(this.sprite, Phaser.Physics.ARCADE);

  this.sprite.body.gravity.y = 500;
  this.sprite.body.maxVelocity.y = 1000;

  this.sprite.animations.add("stand", [0], 10, true);
  this.sprite.animations.add("walk", [1, 2], 10, true);

  this.facing = "right";
  this.rotation = 0;
  this.prevRotation = 0;

  this.rotating = false;
  this.canRotate = true;
  this.targetRotation = 0;
}

Gus.prototype.isTouching = function(side) {
  if (side === "left") {
    if (this.rotation === 0) return this.sprite.body.touching.left;
    if (this.rotation === Math.PI / 2) return this.sprite.body.touching.up;
    if (this.rotation === Math.PI) return this.sprite.body.touching.right;
    if (this.rotation === (3 * Math.PI) / 2)
      return this.sprite.body.touching.down;
  } else {
    if (this.rotation === 0) return this.sprite.body.touching.right;
    if (this.rotation === Math.PI / 2) return this.sprite.body.touching.down;
    if (this.rotation === Math.PI) return this.sprite.body.touching.left;
    if (this.rotation === (3 * Math.PI) / 2)
      return this.sprite.body.touching.up;
  }

  console.error(
    "!!!!!!ALERT!!!!! check Gus.prototype.isTouching because David didn't account for this.rotation being",
    this.rotation
  );
};

Gus.prototype.checkForRotation = function(dir) {
  if (dir === "left" && this.isTouching("left")) {
    this.rotate("left");
  } else if (dir === "right" && this.isTouching("right")) {
    this.rotate("right");
  }
};

Gus.prototype.rotate = function(dir) {
  if (dir === "left") {
    var rot = -Math.PI / 2;
  } else {
    var rot = Math.PI / 2;
  }

  this.targetRotation -= rot;
  this.rotating = true;
};

Gus.prototype.finishRotation = function() {
  this.sprite.body.gravity.y = Math.floor(Math.cos(this.rotation) * 500);
  this.sprite.body.gravity.x = Math.floor(Math.sin(this.rotation) * -500);

  this.sprite.rotation = this.rotation;

  this.canRotate = false;
  this.rotating = false;
  delete this.rotateTween;
};

Gus.prototype.walk = function(dir) {
  if (dir === "left") {
    var intendedVelocity = -this.speed;
    this.sprite.scale.x = -1;
  } else {
    var intendedVelocity = this.speed;
    this.sprite.scale.x = 1;
  }

  console.log(this.isTouching("right"), this.rotation === Math.PI / 2);

  var cosine = Math.cos(this.rotation);
  if (Math.abs(cosine) > EPSILON) {
    this.sprite.body.velocity.x = cosine * intendedVelocity;
  } else {
    this.sprite.body.velocity.y = Math.sin(this.rotation) * intendedVelocity;
  }

  this.sprite.animations.play("walk");
  this.canRotate = true;
};

Gus.prototype.stop = function() {
  this.sprite.animations.play("stand");
};

Gus.prototype.update = function() {
  if (Math.abs(Math.cos(this.rotation)) > EPSILON)
    this.sprite.body.velocity.x = 0;
  else this.sprite.body.velocity.y = 0;

  if (this.rotating) {
    this.stop();
    this.sprite.body.velocity.y = 0;
    this.sprite.body.velocity.x = 0;

    if (this.rotateTween === undefined) {
      this.rotateTween = game.add
        .tween(this.sprite)
        .to(
          { rotation: this.targetRotation },
          1000,
          Phaser.Easing.Default,
          true
        )
        .onComplete.add(function(gus, tween) {
          this.rotation = this.targetRotation % (Math.PI * 2);
          this.finishRotation();
        }, this);
    }

    // if ( this.rotateTime <= 0 ) {
    //   this.rotation = this.targetRotation;
    //   this.finishRotation();
    // } else {
    //   this.rotateTime -= game.time.elapsed;
    //   this.rotation = game.math.linear( this.prevRotation, this.targetRotation, 1 - this.rotateTime );
    //   this.sprite.rotation = this.rotation;
    //   console.log( this.rotation );
    // }
  } else {
    if (cursors.left.isDown) {
      this.walk("left");
      if (this.canRotate) this.checkForRotation("left");
    } else if (cursors.right.isDown) {
      this.walk("right");
      if (this.canRotate) this.checkForRotation("right");
    } else {
      this.stop();
    }
  }
};
function initBootState() {
  var state = {};

  state.create = function() {
    // start game physics
    game.physics.startSystem(Phaser.Physics.ARCADE);

    game.state.start("load");
  };

  return state;
}

function initGameState() {
  var state = {};
  var gus, blocks;

  state.preload = function() {};

  state.create = function() {
    game.add.plugin(Phaser.Plugin.Debug);
    game.world.setBounds(-400, -300, 800, 600);

    gus = new Gus(0, 0);

    blocks = game.add.group();
    blocks.enableBody = true;

    for (var i = 0; i < 10; ++i) {
      var newBlock = blocks.create(-128 + 32 * i, 128, "BrickRed");
      newBlock.body.immovable = true;
    }

    for (var i = 0; i < 10; ++i) {
      var newBlock = blocks.create(-160, 128 - 32 * i, "BrickRed");
      newBlock.body.immovable = true;
    }

    for (var i = 0; i < 10; ++i) {
      var newBlock = blocks.create(-256, 128 - 32 * i, "BrickRed");
      newBlock.body.immovable = true;
    }

    cursors = game.input.keyboard.createCursorKeys();

    game.camera.follow(gus.sprite, game.camera.FOLLOW_PLATFORMER);
  };

  state.update = function() {
    game.physics.arcade.collide(gus.sprite, blocks);

    gus.update();

    game.camera.displayObject.pivot.x = gus.sprite.position.x;
    game.camera.displayObject.pivot.y = gus.sprite.position.y;
    //game.camera.displayObject.rotation = (Math.PI * 2) - gus.sprite.rotation;
    //game.world.rotation = (Math.PI * 2) - gus.rotation;
    //game.physics.arcade.collide( gus.sprite, blocks );
  };

  return state;
}

function initLoadState() {
  var state = {};

  state.preload = function() {
    game.load.image("BrickBlack", "game/images/brick_black.png");
    game.load.image("BrickBreak", "game/images/brick_break.png");
    game.load.image("BrickRed", "game/images/brick_red.png");
    game.load.image("Girder", "game/images/girder.png");
    game.load.image("Tool", "game/images/tool.png");
    game.load.spritesheet("Gus", "game/images/gus.png", 32, 32);
  };

  state.create = function() {
    // set background color
    game.stage.setBackgroundColor(COLORS.BACKGROUND_SKY);

    // start game state
    game.state.start("game");
  };

  return state;
}
