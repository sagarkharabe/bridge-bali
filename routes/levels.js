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
router.get("/", function(req, res, next) {
  var q = { published: { $in: [null, true] } };
  getDocsAndSend(
    "Level",
    ["title", "creator", "dateCreated", "starCount"],
    [{ path: "creator", select: "name" }],
    // change { $in: [null, true] } to just true to drop malformed docs
    q
  )(req, res, next);
});
router.get("/drafts/", mustBeLoggedIn, function(req, res, next) {
  getDocsAndSend("Level", ["title", "dateCreated", "starCount"], [], {
    published: false,
    creator: req.user._id
  })(req, res, next);
});
// user can create level
// router.post("/",mustBeLoggedIn, createDoc("Level", "creator"));
router.post("/", createDoc("Level"));

function onlyOwnersCanOpenDrafts(req) {
  console.log(req.user ? req.user._id : "null");
  console.log(
    req.user
      ? req.user.createdLevels.indexOf(req.params.id.toLowerCase()) !== -1
      : false
  );
  var query = { published: { $in: [true, null] } };
  if (
    req.user &&
    req.user.createdLevels.indexOf(req.params.id.toLowerCase()) !== -1
  )
    query = {};
  console.log(query);

  return query;
}

// guest can see level
router.get("/:id", function(req, res, next) {
  getDocAndSend(
    "Level",
    ["-map"],
    [
      {
        path: "creator",
        select: "name totalStars totalFollowers totalCreatedLevels"
      }
    ],
    onlyOwnersCanOpenDrafts(req)
  )(req, res, next);
});

// mapdata route
router.get("/:id/map", function(req, res, next) {
  getDocAndSend("Level", ["map"], [])(req, res, next);
});

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
