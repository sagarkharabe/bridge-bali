const router = require("express").Router();
const {
  createDoc,
  getDocAndSend,
  getDocsAndSend,
  getDocAndUpdateIfOwnerOrAdmin,
  getDocAndDeleteIfOwnerOrAdmin,
  getDocAndRunFunction,
  getDocAndRunFunctionIfOwnerOrAdmin
} = require("./helpers/crud");
const { mustBeLoggedIn } = require("./helpers/permissions");

// guest can see all users
router.get(
  "/",
  getDocsAndSend(
    "User",
    ["name", "followers", "createdLevels", "totalStars", "profilePic"],
    [{ path: "createdLevels", select: "title dateCreat starCount" }]
  )
);

// guest can create user
router.post("/", createDoc("User"));

// guest can see user
router.get("/:id", getDocAndSend("User"));

router.post(
  "/:id/follow",
  mustBeLoggedIn,
  getDocAndRunFunctionIfOwnerOrAdmin("User", "followUser")
);

router.post(
  "/:id/unfollow",
  mustBeLoggedIn,
  getDocAndRunFunctionIfOwnerOrAdmin("User", "unfollowUser")
);

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
