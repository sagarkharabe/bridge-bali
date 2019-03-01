const mongoose = require("mongoose");
const schema = new mongoose.Schema({
  title: { type: String, required: true },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users"
  },
  map: {
    required: true
  },
  dateCreated: {
    type: Date,
    default: Date.now()
  },
  starCount: { type: Number, default: 0 }
});

const Level = mongoose.model("Level", schema);

module.exports = Level;
