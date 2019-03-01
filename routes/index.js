const router = require("express").Router();
router.use("/levels", require("./levels"));
router.use("/users", require("./users"));
router.use((req, res) => res.status(404).end());
module.exports = router;
