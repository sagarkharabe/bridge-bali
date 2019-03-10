const mongoose = require("mongoose");

var schema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  levels: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Level"
    }
  ],
  dateCreated: {
    type: Date,
    default: Date.now()
  },
  previewPic: {
    type: String
  }
});

schema.pre("save", function(doc, next) {
  doc
    .populate("levels")
    .then(function(doc) {
      for (var i = 0; i < doc.levels.length; i++) {
        if (doc.levels[i].screenshot) {
          doc.previewPic = doc.levels[i].screenshot;
          return doc;
        }
      }

      return doc;
    })
    .then(function(doc) {
      next();
    });
});

schema.virtual("totalLevels").get(function() {
  return this.levels.length;
});

schema.virtual("user").get(function() {
  return this.creator;
});

const Playlist = mongoose.model("Playlist", schema);
module.exports = Playlist;
