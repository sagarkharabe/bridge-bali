const router = require("express").Router();
const {
  createDoc,
  getDocAndSend,
  getDocsAndSend,
  getDocAndUpdateIfOwnerOrAdmin,
  getDocAndDeleteIfOwnerOrAdmin,
  getUserDocAndRunFunction
} = require("./helpers/crud");
const { mustBeLoggedIn } = require("./helpers/permissions");

// guest can see all levels
router.get(
  "/",
  getDocsAndSend(
    "Level",
    ["title", "creator", "dateCreated", "starCount"],
    [{ path: "creator", select: "name" }]
  )
);

// user can create level
router.post("/", mustBeLoggedIn, createDoc("Level", "creator"));
// guest can see level
router.get(
  "/:id",
  getDocAndSend(
    "Level",
    ["-map"],
    [
      {
        path: "creator",
        select: "name totalStars totalFollowers totalCreatedLevels"
      }
    ]
  )
);

// mapdata route
router.get("/:id/map", getDocAndSend("Level", ["map"]));

// user can update own level
router.put("/:id", mustBeLoggedIn, getDocAndUpdateIfOwnerOrAdmin("Level"));

// user can create own level
router.post(
  "/",
  mustBeLoggedIn,
  (req, res, next) => {
    console.log(req, res, next);
    next();
  },
  createDoc("Level", "creator")
);

// user can like level
router.post("/like", mustBeLoggedIn, getUserDocAndRunFunction());

// user can delete own level
router.delete("/:id", mustBeLoggedIn, getDocAndDeleteIfOwnerOrAdmin("Level"));

module.exports = router;
