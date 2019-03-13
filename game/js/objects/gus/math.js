var EPSILON = require("../../const").EPSILON;
var TAU = require("../../const").TAU;

var compose = require("./helpers").compose;

function GusMath(gus) {
  this.gus = gus;

  // cache our sine and cosine results so we don't have to calculate them
  // unless the rotation changes
  this.rotcache = {
    rotation: 0,
    sin: 0,
    cos: 1
  };

  this.lastDot = {
    vec1: [0, 0],
    vec2: [0, 0],
    returned: 0
  };
}

// checkCacheBefore
// helper decorator that checks to see if the cache needs to be updated and
// does so before running the decorated function.
var checkCacheBefore = function(fn) {
  return compose(
    function() {
      if (!this.isRotCacheValid(this.gus.rotation))
        this.updateCache(this.gus.rotation);
    },
    fn
  );
};

// GusMath.prototype.isRotCacheValid
// returns true if the given rotation matches the rotation in the cache, else
// returns false.
GusMath.prototype.isRotCacheValid = function(rot) {
  return this.rotcache.rotation === rot;
};

// GusMath.prototype.updateCache
// updates the cache based on the given rotation values.
GusMath.prototype.updateCache = function(rot) {
  this.rotcache.rotation = rot;
  this.rotcache.sin = Math.sin(rot);
  this.rotcache.cos = Math.cos(rot);
};

// GusMath.prototype.sin
// returns the point on the sinewave for a given rotation.
GusMath.prototype.sin = checkCacheBefore(function() {
  return this.rotcache.sin;
});

// GusMath.prototype.cos
// returns the point on the cosinewave for a given rotation.
GusMath.prototype.cos = checkCacheBefore(function() {
  return this.rotcache.cos;
});

// GusMath.prototype.isHorizontal
// returns true if Gus is horizontal (aligned on the x axis) at the given
// rotation.
GusMath.prototype.isHorizontal = checkCacheBefore(function() {
  return Math.abs(this.rotcache.cos) > 1 - EPSILON;
});

GusMath.prototype.dot = function(vec1, vec2) {
  if (
    vec1[0] === this.lastDot.vec1[0] &&
    vec1[1] === this.lastDot.vec1[1] &&
    vec2[0] === this.lastDot.vec2[0] &&
    vec2[1] === this.lastDot.vec2[1]
  )
    return this.lastDot.returned;

  var result = vec1[0] * vec2[0] + vec1[1] * vec2[1];
  this.lastDot = {
    vec1: vec1,
    vec2: vec2,
    returned: result
  };
  return result;
};

GusMath.prototype.svec = function(vec) {
  var x = Math.abs(vec[0]) < EPSILON ? 0 : vec[0];
  var y = Math.abs(vec[1]) < EPSILON ? 0 : vec[1];
  return p2.vec2.fromValues(x, y);
};

module.exports = GusMath;
