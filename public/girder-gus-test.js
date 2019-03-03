var FULLSCREEN = false;
var WIDTH = FULLSCREEN ? window.innerWidth * window.devicePixelRatio : 800,
  HEIGHT = FULLSCREEN ? window.innerHeight * window.devicePixelRatio : 600;

// initialize the game
var game = new Phaser.Game(WIDTH, HEIGHT, Phaser.AUTO, "gameContainer");
console.log(game);
// add states
game.state.add("boot", initBootState());
game.state.add("load", initLoadState());
game.state.add("game", initGameState());

game.state.start("boot");

var COLLISION_GROUPS = {};
COLLISION_GROUPS.BLOCK_SOLID = true;
COLLISION_GROUPS.BLOCK_ROTATE = true;
COLLISION_GROUPS.PLAYER_SOLID = true;
COLLISION_GROUPS.PLAYER_SENSOR = true;
COLLISION_GROUPS.ITEM = true;
var COLORS = {};
COLORS.BACKGROUND_SKY = "#4428BC";

var EPSILON = 0.000001;
var TAU = Math.PI * 2;
function Gus(x, y) {
  this.speed = 250; // walk speed
  this.gravity = 1000; // gravity speed
  this.hopStrength = 10; // strength of gus's walk cycle hops
  this.dancingTime = 20000; // how long gus has to hold still to start dancing
  this.killTime = 1000; // how long gus has to fall before the game counts him as dead
  this.rotation = 0; // internal rotation counter
  this.prevRotation = 0; // previous rotation
  this.idleTime = 0; // how long gus has been holding still
  this.fallTime = 0;
  this.isDead = false;
  this.facingRight = true; // is gus facing right?
  this.rotating = false; // is gus rotating?
  this.canRotate = false; // can gus rotate?
  this.targetRotation = 0; // targ

  // create a sprite object and set its anchor
  this.sprite = game.add.sprite(x, y, "Gus");

  // attach our sprite to the physics engine
  game.physics.p2.enable(this.sprite, true);
  this.sprite.body.fixedRotation = true;
  this.sprite.body.setCollisionGroup(COLLISION_GROUPS.PLAYER_SOLID);
  this.sprite.body.collides([
    COLLISION_GROUPS.BLOCK_SOLID,
    COLLISION_GROUPS.BLOCK_ROTATE,
    COLLISION_GROUPS.ITEM
  ]);

  // create gus's rotation sensor
  this.rotationSensor = this.sprite.body.addRectangle(this.sprite.width, 20);
  this.setCollision();
  this.sprite.body.onBeginContact.add(Gus.prototype.touchesWall, this);
  //this.sprite.body.collides( [ COLLISION_GROUPS.BLOCK_ROTATE ], Gus.prototype.touchesWall, this );

  // add animations
  this.sprite.animations.add("stand", [0], 10, true);
  this.sprite.animations.add("walk", [1, 2], 10, true);
  this.sprite.animations.add("dance", [3, 4, 5, 6, 7], 10, true);
}

function saneVec(vec) {
  var x = Math.abs(vec[0]) < EPSILON ? 0 : vec[0];
  var y = Math.abs(vec[1]) < EPSILON ? 0 : vec[1];
  return p2.vec2.fromValues(x, y);
}

function dot(vec1, vec2) {
  return vec1[0] * vec2[0] + vec1[1] * vec2[1];
}

function clampAngleToTau(ang) {
  ang = ang % TAU;
  if (ang < 0) ang = TAU - ang;
  return ang;
}

function angWithin(ang, min, max) {
  ang = clampAngleToTau(ang);
  min = clampAngleToTau(min);
  max = clampAngleToTau(max);

  if (min > max) return ang >= min || ang <= max;
  else return ang >= min && ang <= max;
}
Gus.prototype.respawn = function() {
  this.rotation = 0;
  this.prevRotation = 0;
  this.targetRotation = 0;
  this.rotating = false;
  this.canRotate = false;
  this.idleTime = 0;
  this.fallTime = 0;
  this.isDead = false;

  this.sprite.rotation = 0;
  this.sprite.body.rotation = 0;
  this.sprite.body.fixedRotation = true;
  this.setCollision();
  this.sprite.reset(0, 0);
  //this.sprite.reset(game.gusStartPos.x, game.gusStartPos.y);
};

Gus.prototype.doom = function() {
  this.sprite.body.clearCollision();
  this.sprite.body.fixedRotation = false;

  this.sprite.body.velocity.x = Math.sin(this.rotation) * 250;
  this.sprite.body.velocity.y = Math.cos(this.rotation) * -250;

  this.sprite.body.angularVelocity = 60;
  //this.sprite.body.rotateRight( 360 );
};

Gus.prototype.kill = function() {
  this.sprite.visible = false;
  this.isDead = true;

  this.sprite.body.velocity.x = 0;
  this.sprite.body.velocity.y = 0;
};
Gus.prototype.touchesWall = function(gus, other, sensor, shape, contact) {
  if (!this.canRotate) return;
  if (sensor !== this.rotationSensor) return;

  var leftVec = p2.vec2.fromValues(
    -Math.cos(this.rotation),
    -Math.sin(this.rotation)
  );
  var d = dot(saneVec(leftVec), saneVec(contact[0].normalA));
  if (contact[0].bodyB === gus.data) d *= -1;

  if (d > 1 - EPSILON) this.rotate("left");
  else if (d < -1 + EPSILON) this.rotate("right");
};

Gus.prototype.isTouching = function(side) {
  // get the vector to check
  var dirVec = null;
  if (side === "left")
    dirVec = p2.vec2.fromValues(
      -Math.cos(this.rotation),
      -Math.sin(this.rotation)
    );
  if (side === "right")
    dirVec = p2.vec2.fromValues(
      Math.cos(this.rotation),
      Math.sin(this.rotation)
    );
  if (side === "down")
    dirVec = p2.vec2.fromValues(
      -Math.sin(this.rotation),
      Math.cos(this.rotation)
    );
  if (side === "up")
    dirVec = p2.vec2.fromValues(
      Math.sin(this.rotation),
      -Math.cos(this.rotation)
    );

  // loop throuhg all contacts
  for (
    var i = 0;
    i < game.physics.p2.world.narrowphase.contactEquations.length;
    ++i
  ) {
    var contact = game.physics.p2.world.narrowphase.contactEquations[i];

    // check to see if the player has been affected
    if (
      contact.bodyA === this.sprite.body.data ||
      contact.bodyB === this.sprite.body.data
    ) {
      // if the dot of the normal is 1, the player is perpendicular to the collision
      var d = dot(saneVec(dirVec), saneVec(contact.normalA));
      if (contact.bodyA === this.sprite.body.data) d *= -1;
      if (d > 1 - EPSILON && contact.bodyA !== null && contact.bodyB !== null) {
        return true;
      }
    }
  }
};

Gus.prototype.checkForRotation = function(dir) {
  if (dir === "left" && this.isTouching("left")) {
    this.rotate("left");
  } else if (dir === "right" && this.isTouching("right")) {
    this.rotate("right");
  }
};

Gus.prototype.rotate = function(dir) {
  if (this.rotating) return;

  // find the angle to rotate by
  var rot = 0;
  if (dir === "left") {
    rot = -Math.PI / 2;
    this.sprite.rotation -= TAU;
  } else if (dir === "right") {
    rot = Math.PI / 2;
  }

  // change values
  this.targetRotation -= rot;
  this.rotating = true;
  this.canRotate = false;
  this.sprite.body.enabled = false;
};

Gus.prototype.finishRotation = function() {
  // keep our rotation between tau and 0
  if (this.rotation < 0) this.rotation = TAU + this.rotation;

  // set gravity relative to our new axis
  this.sprite.body.gravity.y = Math.floor(
    Math.cos(this.rotation) * this.gravity
  );
  this.sprite.body.gravity.x = Math.floor(
    Math.sin(this.rotation) * -this.gravity
  );

  // change rotation
  this.sprite.rotation = this.rotation;
  this.sprite.body.rotation = this.rotation;

  // reset state after rotation
  this.sprite.body.enabled = true;
  this.rotating = false;
  delete this.rotateTween;
};

Gus.prototype.applyGravity = function() {
  if (!this.isTouching("down")) {
    this.sprite.body.velocity.x += Math.floor(
      Math.sin(this.rotation) * (-this.gravity * game.time.physicsElapsed)
    );
    this.sprite.body.velocity.y += Math.floor(
      Math.cos(this.rotation) * (this.gravity * game.time.physicsElapsed)
    );
  }
};

Gus.prototype.walk = function(dir) {
  this.idleTime = 0;

  // determine speed and flip the sprite if necessary
  var intendedVelocity = 0;
  if (dir === "left") {
    intendedVelocity = -this.speed;
    this.sprite.scale.x = -1;
    this.facingRight = false;
  } else if (dir === "right") {
    intendedVelocity = this.speed;
    this.sprite.scale.x = 1;
    this.facingRight = true;
  }
  // see if we're walking horizontally or vertically
  var cosine = Math.cos(this.rotation);
  if (Math.abs(cosine) > EPSILON) {
    this.sprite.body.velocity.x = cosine * intendedVelocity;
    if (this.isTouching("down"))
      this.sprite.body.velocity.y = cosine * -this.hopStrength;
  } else {
    var sine = Math.sin(this.rotation);
    this.sprite.body.velocity.y = sine * intendedVelocity;
    if (this.isTouching("down"))
      this.sprite.body.velocity.x = sine * this.hopStrength;
  }

  this.sprite.animations.play("walk");
  this.canRotate = true; //differetn fromchange in gus.js file
};

Gus.prototype.stop = function() {
  if (this.idleTime < this.dancingTime) {
    this.sprite.animations.play("stand");
    if (this.isTouching("down")) this.idleTime += game.time.elapsed;
  } else {
    this.sprite.animations.play("dance");
  }
};
Gus.prototype.setCollision = function() {
  this.sprite.body.setCollisionGroup(COLLISION_GROUPS.PLAYER_SOLID);
  this.sprite.body.setCollisionGroup(
    COLLISION_GROUPS.PLAYER_SENSOR,
    this.rotationSensor
  );
  this.sprite.body.collides([
    COLLISION_GROUPS.BLOCK_SOLID,
    COLLISION_GROUPS.BLOCK_ROTATE,
    COLLISION_GROUPS.ITEM
  ]);
};
Gus.prototype.update = function() {
  // clear horizontal movement
  if (Math.abs(Math.cos(this.rotation)) > EPSILON)
    this.sprite.body.velocity.x = 0;
  else this.sprite.body.velocity.y = 0;

  // check to see if we're rotating
  if (this.rotating) {
    // stop all movement
    this.stop();
    this.sprite.body.velocity.y = 0;
    this.sprite.body.velocity.x = 0;

    // create a rotate tween
    if (this.rotateTween === undefined) {
      this.rotateTween = game.add
        .tween(this.sprite)
        .to({ rotation: this.targetRotation }, 300, Phaser.Easing.Default, true)
        .onComplete.add(function(gus, tween) {
          this.rotation = this.targetRotation % TAU;
          this.finishRotation();
          // set gravity relative to our new axis
        }, this);
    }

    // change rotation
  } else if (!this.isDead) {
    // do gravity
    this.applyGravity();
    if (this.rotationSensor.needsCollisionData) {
      this.setCollision();
      this.rotationSensor.needsCollisionData = false;
    }
    // check for input
    if (cursors.left.isDown) {
      //if ( this.canRotate ) this.checkForRotation( "left" );
      this.walk("left");
    } else if (cursors.right.isDown) {
      //if ( this.canRotate ) this.checkForRotation( "right" );
      this.walk("right");
    } else {
      this.stop();
    }

    if (!this.isTouching("down")) {
      this.fallTime += game.time.physicsElapsedMS;

      if (this.fallTime > this.killTime) {
        this.kill();
      }
    } else {
      this.fallTime = 0;
    }
  }
};

function initBootState() {
  var state = {};

  state.create = function() {
    console.log("Initializing physics...");

    // start game physics
    game.physics.startSystem(Phaser.Physics.P2JS);
    game.physics.p2.setImpactEvents(true);

    console.log("Creating collision groups...");

    for (var key in COLLISION_GROUPS) {
      COLLISION_GROUPS[key] = game.physics.p2.createCollisionGroup();
    }

    console.log("Collsion groups addition complete");

    game.state.start("load");
  };

  return state;
}

function Block(x, y, sprite) {
  var game = window.game;
  x = Math.floor(x / 32) * 32;
  y = Math.floor(y / 32) * 32;

  this.sprite = game.add.sprite(x, y, sprite);

  game.physics.p2.enable(this.sprite, false);

  this.sprite.body.setRectangle(32, 32);
  this.sprite.body.static = true;
  this.sprite.body.fixedRotation = true;
}
function BlackBrickBlock(x, y) {
  Block.call(this, x, y, "BrickBlack");

  this.sprite.body.setCollisionGroup(COLLISION_GROUPS.BLOCK_SOLID);
  this.sprite.body.collides([COLLISION_GROUPS.PLAYER_SOLID]);
}
function RedBrickBlock(x, y) {
  Block.call(this, x, y, "BrickRed");

  this.sprite.body.setCollisionGroup(COLLISION_GROUPS.BLOCK_ROTATE);
  this.sprite.body.collides([
    COLLISION_GROUPS.PLAYER_SOLID,
    COLLISION_GROUPS.PLAYER_SENSOR
  ]);
}

function initGameState() {
  var state = {};
  var gus, blocks;

  state.preload = function() {};

  state.create = function() {
    console.log("Starting world...");

    // game.add.plugin(Phaser.Plugin.Debug);

    // game.world.setBounds(-400, -300, 800, 600);
    // game.physics.p2.setBoundsToWorld();

    console.log("Creating Gus...");

    gus = new Gus(0, 0);

    console.log("Creating blocks...");

    blocks = game.add.group();
    blocks.enableBody = true;
    blocks.physicsBodyType = Phaser.Physics.P2JS;

    for (var i = 0; i < 10; ++i) {
      // var newBlock =
      RedBrickBlock(-128 + 32 * i, 128);
      //blocks.create(-128 + 32 * i, 128, "BrickRed");
      // newBlock.body.static = true;

      //game.physics.p2.enable( newBlock, true );
      // newBlock.body.setRectangle(32, 32);
      // newBlock.body.setCollisionGroup(COLLISION_GROUPS.BLOCK_ROTATE);
      // newBlock.body.collides([
      //   COLLISION_GROUPS.PLAYER_SOLID,
      //   COLLISION_GROUPS.PLAYER_SENSOR
      // ]);
      // newBlock.body.static = true;
    }

    for (var i = 0; i < 10; ++i) {
      BlackBrickBlock(-160, 128 - 32 * i);

      // var newBlock = blocks.create(-160, 128 - 32 * i, "BrickRed");
      // newBlock.body.setRectangle(32, 32);
      // newBlock.body.setCollisionGroup(COLLISION_GROUPS.BLOCK_ROTATE);
      // newBlock.body.collides([
      //   COLLISION_GROUPS.PLAYER_SOLID,
      //   COLLISION_GROUPS.PLAYER_SENSOR
      // ]);
      // newBlock.body.static = true;
    }

    for (var i = 0; i < 10; ++i) {
      RedBrickBlock(192, 128 - 32 * i);
      // var newBlock = blocks.create(192, 128 - 32 * i, "BrickBlack");
      // newBlock.body.setRectangle(32, 32);
      // newBlock.body.setCollisionGroup(COLLISION_GROUPS.BLOCK_ROTATE);
      // newBlock.body.collides([
      //   COLLISION_GROUPS.PLAYER_SOLID,
      //   COLLISION_GROUPS.PLAYER_SENSOR
      // ]);
      // newBlock.body.static = true;
    }

    for (var i = 0; i < 10; ++i) {
      RedBrickBlock(-256, 128 - 32 * i);
      var newBlock = blocks.create(-256, 128 - 32 * i, "BrickRed");
      // newBlock.body.setRectangle(32, 32);
      // newBlock.body.setCollisionGroup(COLLISION_GROUPS.BLOCK_ROTATE);
      // newBlock.body.collides([
      //   COLLISION_GROUPS.PLAYER_SOLID,
      //   COLLISION_GROUPS.PLAYER_SENSOR
      // ]);
      // newBlock.body.static = true;
    }

    console.log("Binding to keys...");

    cursors = game.input.keyboard.createCursorKeys();
  };

  state.update = function() {
    //game.physics.arcade.collide( gus.sprite, blocks );

    gus.update();

    game.camera.displayObject.pivot.x = gus.sprite.position.x;
    game.camera.displayObject.pivot.y = gus.sprite.position.y;
    game.camera.displayObject.rotation = Math.PI * 2 - gus.sprite.rotation;
    //game.world.rotation = (Math.PI * 2) - gus.rotation;
    //game.physics.arcade.collide( gus.sprite, blocks );
  };

  return state;
}

function initLoadState() {
  var state = {};

  state.preload = function() {
    console.log("Loading assets...");

    game.load.image("BrickBlack", "/public/assets/images/brick_black.png");
    game.load.image("BrickBreak", "/public/assets/images/brick_break.png");
    game.load.image("BrickRed", "/public/assets/images/brick_red.png");
    game.load.image("Girder", "/public/assets/images/girder.png");
    game.load.image("Tool", "/public/assets/images/tool.png");
    game.load.spritesheet("Gus", "/public/assets/images/gus.png", 32, 32);

    console.log("Done loading");
  };

  state.create = function() {
    // set background color
    game.stage.setBackgroundColor("#4428BC");
    console.log("Setting World Bounds");
    game.world.setBounds(-400, -300, 800, 600); // fullscreen???
    game.physics.p2.setBoundsToWorld();
    console.log("World Bounds Set");
    // start game state
    game.state.start("game");
  };

  return state;
}
