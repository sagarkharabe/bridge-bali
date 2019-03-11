const router = require("express").Router();
const {
  createDoc,
  getDocAndSend,
  getDocsAndSend,
  getDocAndUpdateIfOwnerOrAdmin,
  getDocAndDeleteIfOwnerOrAdmin,
  getDocAndRunFunction,
  getDocAndRunFunctionIfOwnerOrAdmin,
  getUserDocAndRunFunction
} = require("./helpers/crud");
const { mustBeLoggedIn } = require("./helpers/permissions");

// guest can see all users
router.get(
  "/",
  getDocsAndSend(
    "User",
    ["name", "followers", "createdLevels", "totalStars", "profilePic"],
    [{ path: "createdLevels", select: "title dateCreated starCount" }]
  )
);

// guest can create user
router.post("/", createDoc("User"));

// guest can see user
router.get("/:id", getDocAndSend("User"));

// user can follow other users

router.post("/follow", mustBeLoggedIn, getUserDocAndRunFunction());

router.post(
  "/:id/like",
  getDocAndRunFunctionIfOwnerOrAdmin("User", "likeLevel")
);

router.post(
  "/:id/unlike",
  getDocAndRunFunctionIfOwnerOrAdmin("User", "unlikeLevel")
);

// guest can see all users with associated created levels
router.get("/levels", getDocsAndSend("User", null, ["createdLevels"]));

// user can update own profile
router.put("/:id", mustBeLoggedIn, getDocAndUpdateIfOwnerOrAdmin("User"));

// user can delete own profile (optional to implement)
router.delete("/:id", mustBeLoggedIn, getDocAndDeleteIfOwnerOrAdmin("User"));

module.exports = router;
