const mongoose = require("mongoose");
const schema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  following: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ],
  followers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ],
  likedLevels: [{ type: mongoose.Schema.Types.ObjectId, ref: "Level" }],
  createdLevels: [{ type: mongoose.Schema.Types.ObjectId, ref: "Level" }]
});
var User = mongoose.model("User", schema);
module.exports = User;
