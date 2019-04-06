const passport = require("passport");
const router = require("express").Router();
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get("/google/callback", passport.authenticate("google"), (req, res) => {
  res.redirect("/");
  console.log(req.user);
});
router.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});
router.get("/verify", (req, res) => {
  //res.send(req.session);
  res.send(req.user);
});

module.exports = router;
