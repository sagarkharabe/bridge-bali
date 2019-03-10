"use strict";

const GhostGirder = require("./ghostBlocks").GhostGirder;
const GirderMarker = require("./girderMarker");
const ParticleBurst = require("../particles/burst");

class GhostGirderMarker extends GirderMarker {
  constructor() {
    super(true); // call GirderMarker constructor with isGhost = true;
  }

  placeGirder() {
    // if Gus is out of girders, we can't place a new one
    if (this.master.girders === 0) return;

    // check that we're placeable
    if (this.placeable) {
      // spawn a new girder and set its rotation
      var newGirder = new GhostGirder(
        this.sprite.position.x,
        this.sprite.position.y
      );
      console.log("newGirder: ", newGirder);
      newGirder.sprite.rotation = this.master.sprite.rotation;

      // do a little bookkeeping
      this.girdersPlaced.push(newGirder);
      this.master.girders--;

      // stop Gus from rotating onto the new girder immediately
      this.master.canRotate = false;

      // make some particles!
      this.debrisBurst = new ParticleBurst(
        this.sprite.position.x,
        this.sprite.position.y,
        "Debris",
        {
          lifetime: 500,
          count: 14,
          scaleMin: 0.4,
          scaleMax: 1.0,
          speed: 200,
          fadeOut: true
        }
      );
    }
  }
}

module.exports = GhostGirderMarker;
