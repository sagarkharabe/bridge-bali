const passport = require("passport");
const mongoose = require("mongoose");
const User = mongoose.model("User");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.googleClientId,
      clientSecret: process.env.googleClientSecret,
      callbackURL: "/auth/google/callback",
      proxy: true
    },
    (accessToken, refreshToken, profile, done) => {
      User.findOne({
        email: profile.emails[0].value
      }).then(user => {
        if (user) {
          done(null, user);
          console.log("User email exists");
        } else
          new User({
            googleID: profile.id,
            email: profile.emails[0].value,
            name: profile.displayName
          })
            .save()
            .then(user => done(null, user));
      });
    }
  )
);

passport.serializeUser(function(user, done) {
  done(null, user.id);
});
passport.deserializeUser(function(id, done) {
  User.findById(id).then(user => done(null, user));
});
