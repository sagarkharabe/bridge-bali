const mongoose = require("mongoose");

const post = require("../helpers/promisifiedPost");

const User = mongoose.model("User");

const schema = new mongoose.Schema({
  datasetId: String,
  level: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Level",
    required: true
  },
  player: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  girdersPlaced: {
    type: Number,
    required: true
  },
  // in milliseconds
  timeToComplete: {
    type: Number,
    required: true
  }
});

// save in demography if demography knows about the level
schema.post("save", (doc, next) => {
  if (!doc.datasetId) return next();

  let url;

  const postData = {
    data: [
      {
        id: doc._id,
        girdersPlaced: doc.girdersPlaced,
        timeToComplete: doc.timeToComplete
      }
    ],
    token: env.DEMOGRAPHY.ACCESS_KEY
  };

  // retrieve datasetId from level
  Level.findById(doc.level)
    .then(level => {
      if (!level || !level.datasetId) {
        console.log("level", level.title, level.datasetId);
        throw new Error("Level not on Demography! Stats will not be saved.");
      }

      url = env.DEMOGRAPHY.API_URL + level.datasetId + "/entries";
      console.log(url);

      return User.findById(doc.player);
    })
    .then(player => {
      postData.playerName = player.name;
      console.dir(postData);
      return post(url, postData);
    })
    .then(res => {
      console.dir(res);
      next();
    }, next);
});

const Statistic = mongoose.model("Statistic", schema);

module.exports = Statistic;
