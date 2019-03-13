const mongoose = require("mongoose");
const Promise = require("bluebird");
var schema = new mongoose.Schema({
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
  totalFollowing: {
    type: Number,
    default: 0
  },
  followers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ],
  totalFollowers: {
    type: Number,
    default: 0
  },
  likedLevels: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Level"
    }
  ],
  totalLikedLevels: {
    type: Number,
    default: 0
  },
  createdLevels: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Level"
    }
  ],
  totalCreatedLevels: {
    type: Number,
    default: 0
  },
  // drafts: [{
  //     type: mongoose.Schema.Types.ObjectId,
  //     ref: 'Level'
  // }],
  totalDrafts: {
    type: Number,
    default: 0
  },
  totalStars: {
    type: Number,
    default: 0
  },
  isAdmin: {
    type: Boolean,
    default: false
  }
});

// sets user's totalStars based on sum of stars for user's createdLevels
schema.methods.setStars = function() {
  var that = this;
  var Level = mongoose.model("Level");
  return Level.find({ _id: { $in: that.createdLevels } }).then(function(
    usersLevels
  ) {
    that.totalStars = usersLevels.reduce(function(prev, level) {
      return prev + level.starCount;
    }, 0);
    return that.save();
  });
};

//
schema.methods.followUser = function(userId) {
  var self = this;
  if (self._id === userId) {
    var err = new Error();
    err.status = 400;
    throw err;
  }
  return this.model("User")
    .findById(userId)
    .then(function(user) {
      // throw error if no user has userId
      if (user === null) {
        var err = new Error("User #" + userId + " not found");
        throw err;
      }
      // throw error if user is already following userId
      if (self.following.indexOf(user._id) !== -1) {
        err = new Error("Already following user #" + user._id);
        err.status = 400;
        throw err;
      }
      if (user._id.equals(self._id)) {
        err = new Error("Can't follow self");
        err.status = 400;
        throw err;
      }

      self.following.push(user._id);
      self.totalFollowing = self.following.length;
      var here = self.save();
      var there = user.addFollower(self._id);

      return Promise.all([here, there]);
    })
    .then(function(data) {
      return {
        user: {
          _id: data[0]._id,
          following: data[0].following,
          totalFollowed: data[0].totalFollowed
        },
        creator: {
          _id: data[1]._id,
          totalFollowers: data[1].totalFollowers
        }
      };
    });
};

schema.methods.addFollower = function(userId) {
  if (this.followers.indexOf(userId) !== -1) return;

  this.followers.push(userId);
  this.totalFollowers = this.followers.length;

  return this.save();
};

schema.methods.unfollowUser = function(userId) {
  var self = this;
  var followingIdx = self.following.indexOf(userId);
  if (followingIdx !== -1) self.following.splice(followingIdx, 1);
  self.totalFollowing = self.following.length;
  var here = self.save();
  var there = this.model("User")
    .findById(userId)
    .then(function(user) {
      if (user === null) throw new Error("User #" + userId + " not found");
      return user.removeFollower(self._id);
    });
  return Promise.all([here, there]).then(function(data) {
    return {
      user: {
        _id: data[0]._id,
        following: data[0].following,
        totalFollowed: data[0].totalFollowed
      },
      creator: {
        _id: data[1]._id,
        totalFollowers: data[1].totalFollowers
      }
    };
  });
};

schema.methods.removeFollower = function(userId) {
  var followerIdx = this.followers.indexOf(userId);
  if (followerIdx === -1) return;

  this.followers.splice(followerIdx, 1);
  this.totalFollowers = this.followers.length;

  return this.save();
};

schema.methods.setLevelCounts = function() {
  return this.populate({
    path: "createdLevels",
    select: "published"
  })
    .execPopulate()
    .then(function(user) {
      var createdLevels = user.createdLevels.filter(function(level) {
        return level.published;
      });
      var drafts = user.createdLevels.filter(function(level) {
        return !level.published;
      });
      user.totalCreatedLevels = createdLevels.length;
      user.totalDrafts = drafts.length;
      return user.save();
    });
};

// adds levelId to user's createdLevels array
schema.methods.addLevel = function(levelId) {
  if (this.createdLevels.indexOf(levelId) === -1) {
    this.createdLevels.push(levelId);

    return this.save().then(function(user) {
      return user.setLevelCounts();
    });
  }
};

// removes levelId from user's createdLevels array
schema.methods.removeLevel = function(levelId) {
  this.createdLevels = this.createdLevels.filter(function(level) {
    return !level.equals(levelId);
  });
  this.totalCreatedLevels = this.createdLevels.length;

  return this.save().then(function(user) {
    return user.setLevelCounts();
  });
};

schema.methods.likeLevel = function(levelId) {
  var self = this;
  var Level = mongoose.model("Level");
  return Level.findById(levelId)
    .then(function(level) {
      if (level === null) {
        var err = new Error("Cannot like level: Level does not exist");
        err.status = 404;
        throw err;
      }
      if (self.likedLevels.indexOf(level._id) !== -1) {
        err = new Error("Cannot like level: Level has already been liked");
        err.status = 400;
        throw err;
      }
      if (level.creator.equals(self._id)) {
        err = new Error("Cannot like own level");
        err.status = 400;
        throw err;
      }

      self.likedLevels.push(levelId);
      self.totalLikedLevels = self.likedLevels.length;
      return Promise.all([self.save(), level]);
    })
    .then(function(data) {
      var user = data[0];
      var level = data[1];
      return Promise.all([user, level.setStars()]);
    })
    .then(function(data) {
      var user = {
        _id: data[0]._id,
        likedLevels: data[0].likedLevels,
        totalLikedLevels: data[0].totalLikedLevels
      };
      var level = {
        _id: data[1].level._id,
        starCount: data[1].level.starCount
      };
      var creator = {
        _id: data[1].creator._id,
        totalStars: data[1].creator.totalStars
      };

      return {
        user: user,
        level: level,
        creator: creator
      };
    });
};

schema.methods.unlikeLevel = function(levelId) {
  var likedIdx = this.likedLevels.indexOf(levelId);
  if (likedIdx !== -1) this.likedLevels.splice(likedIdx, 1);
  this.totalLikedLevels = this.likedLevels.length;
  var here = this.save();

  var Level = mongoose.model("Level");
  var there = Level.findById(levelId);

  return Promise.all([here, there])
    .then(function(data) {
      var user = data[0];
      var level = data[1];
      if (level === null) throw new Error("Level #" + levelId + " not found");
      return Promise.all([user, level.setStars()]);
    })
    .then(function(data) {
      var user = {
        _id: data[0]._id,
        likedLevels: data[0].likedLevels,
        totalLikedLevels: data[0].totalLikedLevels
      };
      var level = {
        _id: data[1].level._id,
        starCount: data[1].level.starCount
      };
      var creator = {
        _id: data[1].creator._id,
        totalStars: data[1].creator.totalStars
      };

      return {
        user: user,
        level: level,
        creator: creator
      };
    });
};

schema.virtual("user").get(function() {
  return this._id;
});

var User = mongoose.model("User", schema);
module.exports = User;
