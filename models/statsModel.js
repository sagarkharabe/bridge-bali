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

  const url = env.DEMOGRAPHY.API_URL + doc.datasetId + "/entries";

  const data = {
    girdersPlaced: doc.girdersPlaced,
    timeToComplete: doc.timeToComplete
  };

  User.findById(doc.player)
    .then(player => {
      data.playerName = doc.name;
      return post(url, data);
    })
    .then(res => {
      console.dir(res);
      next();
    }, next);
});

const Statistic = mongoose.model("Statistic", schema);

module.exports = Statistic;
