const router = require("express").Router();
const {
  createDoc,
  getDocAndSend,
  getDocsAndSend,
  getDocAndUpdateIfOwnerOrAdmin,
  getDocAndDeleteIfOwnerOrAdmin
} = require("./helpers/crud");
const { mustBeLoggedIn } = require("./helpers/permissions");

// guest can see all users
router.get("/", getDocsAndSend("User"));

// guest can create user
router.post("/", createDoc("User"));

// guest can see user
router.get("/:id", getDocAndSend("User"));

// guest can see all users with associated created levels
router.get("/levels", getDocsAndSend("User", null, ["createdLevels"]));

// user can update own profile
router.put("/:id", mustBeLoggedIn, getDocAndUpdateIfOwnerOrAdmin("User"));

// user can delete own profile (optional to implement)
router.delete("/:id", mustBeLoggedIn, getDocAndDeleteIfOwnerOrAdmin("User"));

module.exports = router;
