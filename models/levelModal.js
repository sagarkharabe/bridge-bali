const mongoose = require("mongoose");
const TILE_MAP = require("../game/js/const/tilemap");
const numTiles = Object.keys(TILE_MAP).length;
const User = mongoose.model("User");
const path = require("path");
const Promise = require("bluebird");
const convert = require("../imaging/convert");
const mapToCanvas = require("../imaging/mapToCanvas");
const uploadMapThumb = require("../imaging/upload");
const removeLocalMapThumb = require("../imaging/delete");
const deleteServerThumb = require("../imaging/deleteServerThumb");
const post = require("../helpers/promisifiedPost"); // only has post and put
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
    default: function() {
      return Date.now();
    }
  },
  published: {
    type: Boolean,
    default: true
  },
  starCount: { type: Number, default: 0 },
  datasetId: String
});

/*
 * SCREENSHOT LOGIC
 */

// post-save hook to save a screenshot of the level
schema.post("save", function(doc, next) {
  if (!doc.shouldSaveScreenshot) {
    console.log("Updating already existing map, skipping screenshot");
    return next();
  }

  // find gus's position in the map
  var gusDef = doc.map.objects.reduce(function(gus, objDef) {
    if (objDef.t === 1) return objDef;
    return gus;
  }, undefined);

  if (gusDef === undefined) {
    console.log("Could not find gusDef in saved level, skipping screenshot");
    return next();
  }

  // now let's start making beautiful pictures
  var outPath = path.join(__dirname, "../public/") + doc._id + ".png";
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

// delete thumbnail from S3
schema.post("remove", function(doc) {
  deleteServerThumb(doc._id);
});

/*
 * CREATOR LOGIC
 */

// add level to creator's createdLevels if level is new
schema.post("save", function(doc, next) {
  if (doc.wasNew) {
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

// post-save hook to set total star count of associated user
schema.post("save", function(doc, next) {
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

// post-remove hook to delete level from creator's
//   createdLevels list and update creator's star count
schema.post("remove", function(doc) {
  // remove level from creator's list
  User.findById(doc.creator)
    .then(function(user) {
      return user.removeLevel(doc._id);
    })
    // set creator's total star count
    .then(function(user) {
      return user.setStars();
    })
    .then(null, function(err) {
      console.error(err);
    });
});

/*
 * PLAYERS LOGIC
 */

// find all users who have liked deleted level and remove
//    level from their likedLevels array
schema.post("remove", function(doc) {
  User.find({
    likedLevels: doc._id
  })
    .then(function(users) {
      var usersPromises = users.map(function(user) {
        user.likedLevels = user.likedLevels.filter(function(level) {
          return !doc._id.equals(level);
        });

        return user.save();
      });

      return Promise.all(usersPromises);
    })
    .then(null, function(err) {
      console.error(err);
    });
});

/*
 * DEMOGRAPHY INTEGRATION LOGIC
 */
// tell demography about newly-published levels
// schema.post("save", (doc, next) => {
//   if (!doc.published || doc.datasetId) return next();

//   const data = {
//     data: [
//       {
//         id: null,
//         girdersPlaced: null,
//         playerName: "",
//         timeToComplete: null
//       }
//     ],
//     id: doc._id,
//     isPublic: true,
//     title: doc.title,
//     token: env.DEMOGRAPHY.ACCESS_KEY
//   };

//   post(env.DEMOGRAPHY.API_URL, data)
//     .then(res => {
//       console.log("Saved to demography!");
//       doc.datasetId = res.datasetId;
//       return doc.save();
//     })
//     .then(() => {
//       console.log("Updated with demography id");
//       next();
//     }, next);
// });
/*
 * MISCELLENOUS
 */

// sets a levels star count based on how many users have like it
schema.methods.setStars = function() {
  var self = this;
  return User.find({
    likedLevels: {
      $in: [self._id]
    }
  })
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
  this.shouldSaveScreenshot = !this.published || this.isNew;
  next();
});

schema.pre("update", function(next) {
  console.log("pre update");
  console.log(this);
  next();
});

schema.virtual("screenshot").get(function() {
  return "https://s3.amazonaws.com/bridge-bali-test/" + this._id + ".png";
});

schema.virtual("user").get(function() {
  return this.creator;
});

const Level = mongoose.model("Level", schema);

module.exports = Level;
