const passport = require("passport");
const { mustBeAdmin, mustBeLoggedIn } = require("./helpers/permissions");
const router = require("express").Router();
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get("/google/callback", passport.authenticate("google"), (req, res) => {
  res.redirect("http://localhost:3000");
  console.log(req.user);
});
router.get("/logout", (req, res) => {
  req.logout();
  console.log("Logged out now redirecting");
  res.redirect("/");
});
router.get("/verify", mustBeLoggedIn, (req, res) => {
  //res.send(req.session);
  console.log("verifying user req.user ", req.user);
  res.send(req.user);
});

module.exports = router;
