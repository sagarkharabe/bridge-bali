var particleBursts = [];
function ParticleBurst(x, y, particle, options) {
  options = options || {};
  var game = window.game;

  this.emitter = game.add.emitter(x, y, 200);
  this.fadeOut = options.fadeOut || false;

  this.emitter.makeParticles(particle);

  this.emitter.setAlpha(
    options.alphaMin || 1.0,
    options.alphaMax || 1.0,
    options.lifetime || 1000,
    Phaser.Easing.Linear.None,
    true
  );
  this.emitter.setRotation(options.rotMin || 0, options.rotMax || 0);

  var scale =
    (options.scaleMin || 1) +
    Math.random() * ((options.scaleMax || 1) - (options.scaleMin || 1));
  this.emitter.setScale(
    options.scaleMin || 1,
    options.scaleMax || 1,
    options.scaleMin || 1,
    options.scaleMax || 1,
    0
  );

  this.emitter.setXSpeed(-(options.speed || 100), options.speed || 100);
  this.emitter.setYSpeed(-(options.speed || 100), options.speed || 100);
  this.emitter.gravity = options.gravity || 0;

  this.emitter.start(true, options.lifetime || 1000, null, options.count || 10);
  this.startTime = game.time.now;

  particleBursts.push(this);
}

ParticleBurst.update = function() {
  particleBursts.forEach(function(burst, idx) {
    if (game.time.now - burst.startTime > burst.emitter.lifespan) {
      particleBursts.splice(idx, 1);
      burst.emitter.destroy();
      return;
    }

    if (!burst.fadeOut) return;

    burst.emitter.forEachAlive(function(part) {
      part.alpha = part.lifespan / burst.emitter.lifespan;
    });
  });
};

module.exports = ParticleBurst;
