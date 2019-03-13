const router = require("express").Router();

const { createDoc } = require("./helpers/crud");
const { mustBeLoggedIn } = require("./helpers/permissions");

router.post("/", mustBeLoggedIn, createDoc("Statistic", "player"));

module.exports = router;
