"use strict";

var path = require("path");
var fs = require("fs");
var Canvas = require("canvas").Canvas;
var Image = require("canvas").Image;

var spriteBasePath = path.join(__dirname, "../game/assets/images/");
var spriteNames = {
  1: "gus-static.png",
  2: "tool.png",
  3: "brick_red.png",
  4: "brick_black.png",
  5: "brick_break.png",
  6: "spike.png"
};

function getMapObjectsInBounds(objs, xmin, ymin, xmax, ymax, margin) {
  return objs.filter(function(objDef) {
    return (
      objDef.x + margin > xmin &&
      objDef.x - margin < xmax &&
      objDef.y + margin > ymin &&
      objDef.y - margin < ymax
    );
  });
}

function getObjSpritePath(objDef) {
  var filename = spriteNames[objDef.t];

  if (filename === undefined)
    console.error("No sprite found for tile", objDef.t);
  else return spriteBasePath + filename;
}

function mapToCanvas(mapData, xCenter, yCenter, width, height, scale) {
  var halfWidth = width / (2 * scale),
    halfHeight = height / (2 * scale);
  var validObjects = getMapObjectsInBounds(
    mapData.objects,
    xCenter - halfWidth,
    yCenter - halfHeight,
    xCenter + halfWidth,
    yCenter + halfHeight,
    16 / scale
  );

  // initialize our canvas
  var canvas = new Canvas(width, height);
  var ctx = canvas.getContext("2d");
  ctx.antialias = "none";

  ctx.scale(scale, scale);
  ctx.translate(-xCenter, -yCenter);

  // fill the background with the sky color
  ctx.fillStyle = mapData.skyColor.toString() || "#000000";

  ctx.fillRect(
    xCenter - width / scale / 2,
    yCenter - height / scale / 2,
    (width / scale) * 2,
    (height / scale) * 2
  );

  var spriteBuffers = {};

  // draw the sprites to the canvas
  return Promise.all(
    validObjects.map(function(objDef) {
      var filename = getObjSpritePath(objDef);

      // use a promise to fetch the sprite data
      return new Promise(function(ok, fail) {
        if (spriteBuffers[filename]) {
          ok(spriteBuffers[filename]);
        } else {
          fs.readFile(filename, function(err, spriteBuffer) {
            if (err) fail(err);

            spriteBuffers[filename] = spriteBuffer;
            ok(spriteBuffer);
          });
        }
      }).then(function(spriteBuffer) {
        let imageBuffer = new Image();
        imageBuffer.src = spriteBuffer;

        // set up transformation matrix
        ctx.save();
        ctx.translate(objDef.x + halfWidth, objDef.y + halfHeight);
        if (objDef.r) ctx.rotate((objDef.r * Math.PI) / 180);

        // draw it!!!
        ctx.drawImage(imageBuffer, -16, -16, 32, 32);

        // restore the canvas
        ctx.restore();
      });
    })
  ) // END validObjects.map
    .then(function() {
      return canvas;
    });
}

module.exports = mapToCanvas;
