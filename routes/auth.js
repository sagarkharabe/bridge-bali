const passport = require("passport");
const router = require("express").Router();
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/", session: false }),
  (req, res) => {
    res.redirect("/");
    console.log(req.user);
  }
);
router.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});
router.get("/verify", (req, res) => {
  if (req.user) {
    console.log("auth");
    console.log(req.user);
  } else console.log("not auth");
});

module.exports = router;
