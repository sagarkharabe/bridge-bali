const mongoose = require("mongoose");
const TILE_MAP = require("../game/js/const/tilemap");
const numTiles = Object.keys(TILE_MAP).length;
const User = mongoose.model("User");
const path = require("path");
const convert = require("../imaging/convert");
const mapToCanvas = require("../imaging/mapToCanvas");
// const uploadMapThumb = require("../imaging/upload");
// const removeLocalMapThumb = require("../imaging/delete");
// part of level schema
const map = {
  startGirders: {
    type: Number,
    default: 0
  },
  checksum: {
    type: String,
    default: function() {
      if (!this.objects) return "";
      return this.objects.reduce((prev, next) => prev + next, "");
    }
  },
  objects: [
    {
      t: {
        type: Number,
        max: numTiles
      },
      x: {
        type: Number
      },
      y: {
        type: Number
      },
      r: {
        type: Number
      }
    }
  ],

  skyColor: {
    type: String,
    default: "#4428BC"
  }
};

const schema = new mongoose.Schema({
  title: { type: String, required: true },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  map: map,
  dateCreated: {
    type: Date,
    default: Date.now()
  },
  published: {
    type: Boolean,
    default: true
  },
  starCount: { type: Number, default: 0 }
});

// sets a levels star count based on how many users have like it
schema.methods.setStars = function() {
  var self = this;
  return User.find({ likedLevels: { $in: [self._id] } })
    .then(function(users) {
      self.starCount = users.length;
      return self.save();
    })
    .then(function(level) {
      return level
        .populate({
          path: "creator",
          select: "totalStars"
        })
        .execPopulate();
    })
    .then(function(level) {
      return {
        level: {
          _id: level._id,
          starCount: level.starCount
        },
        creator: {
          _id: level.creator._id,
          totalStars: level.creator.totalStars
        }
      };
    });
};

// note whether level is new before saving
schema.pre("save", function(next) {
  this.wasNew = this.isNew;
  next();
});

// add level to creator's createdLevels if level is new
schema.post("save", function(doc, next) {
  if (doc.wasNew) {
    console.log("this doc is new");
    User.findById(doc.creator)
      .then(function(user) {
        return user.addLevel(doc._id);
      })
      .then(function(user) {
        next();
      });
  } else {
    next();
  }
});
schema.post("save", function(doc, next) {
  console.log("hitting post save");
  User.findById(doc.creator)
    .populate("createdLevels", "starCount")
    .then(function(user) {
      return user.setStars();
    })
    .then(function(user) {
      next();
    })
    .then(null, function(error) {
      console.error(error);
      next();
    });
});

// post-save hook to save a screenshot of the level
schema.post("save", function(doc, next) {
  // find gus's position in the map
  var gusDef = doc.map.objects.reduce(function(gus, objDef) {
    if (objDef.t === 1) return objDef;
    return gus;
  }, undefined);

  // now let's start making beautiful pictures
  var outPath =
    path.join(__dirname, "../public/images/mapthumbs/") + doc._id + ".png";
  mapToCanvas(doc.map, gusDef.x, gusDef.y, 250, 150, 0.5)
    .then(function(canvas) {
      var pngStream = convert.canvasToPNG(canvas);

      convert
        .streamToFile(pngStream, outPath)
        .then(() => {
          return uploadMapThumb(outPath, doc._id);
        })
        .then(() => {
          return removeLocalMapThumb(outPath);
        })
        .then(next, console.error.bind(console));
    })
    .then(null, next);
});

// hook to remove deleted level from creator's level list and
//   set users's new total star count
schema.post("remove", function(doc) {
  User.findById(doc.creator)
    .then(function(user) {
      // remove level from creator's list
      return user.removeLevel(doc._id);
    })
    // set user's total star count
    .then(function(user) {
      return user.setStars();
    });
});

schema.virtual("screenshot").get(function() {
  // game/images ????
  return "images/screenshots/" + this._id + ".png";
});

schema.virtual("user").get(function() {
  return this.creator;
});

const Level = mongoose.model("Level", schema);

module.exports = Level;
