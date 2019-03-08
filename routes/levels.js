const router = require("express").Router();
const {
  createDoc,
  getDocAndSend,
  getDocsAndSend,
  getDocAndUpdateIfOwnerOrAdmin,
  getDocAndDeleteIfOwnerOrAdmin
} = require("./helpers/crud");
const { mustBeLoggedIn } = require("./helpers/permissions");

// guest can see all levels
router.get(
  "/",
  getDocsAndSend(
    "Level",
    ["title", "creator", "dateCreate", "starCount"],
    [{ path: "creator", select: "name" }]
  )
);
// guest can see all levels with creators
router.get("/users", getDocsAndSend("Level", null, ["creator"]));

// user can create level
router.post("/", mustBeLoggedIn, createDoc("Level", "creator"));
// guest can see level
router.get("/:id", getDocAndSend("Level", ["-map"], ["creator"]));

// mapdata route
router.get("/:id/map", getDocAndSend("Level", ["map"], ["map"]));

// user can update own level
router.put("/:id", mustBeLoggedIn, getDocAndUpdateIfOwnerOrAdmin("Level"));

// user can delete own level
router.delete("/:id", mustBeLoggedIn, getDocAndDeleteIfOwnerOrAdmin("Level"));

module.exports = router;
