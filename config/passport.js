const passport = require("passport");
const mongoose = require("mongoose");
const User = mongoose.model("User");
const GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.googleClientId,
      clientSecret: process.env.googleClientSecret,
      callbackURL: "http://localhost:5000/auth/google/callback",
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
  done(null, user);
});
passport.deserializeUser(function(user, done) {
  done(null, user);
});
