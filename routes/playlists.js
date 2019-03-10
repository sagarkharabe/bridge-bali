const router = require("express").Router();
//temp test!
var Level = require("mongoose").model("Level");

module.exports = router;

import {
  createDoc,
  getDocAndSend,
  getDocsAndSend,
  getDocAndUpdateIfOwnerOrAdmin,
  getDocAndDeleteIfOwnerOrAdmin
} from "./helpers/crud";

import { mustBeLoggedIn } from "./helpers/permissions";

// user can create playlist
router.post("/", mustBeLoggedIn, createDoc("Playlist", "creator"));

// guest can see all playlists
router.get(
  "/",
  getDocsAndSend(
    "Playlist",
    ["title", "creator", "previewPic", "totalLevels"],
    [
      { path: "creator", select: "name" },
      { path: "levels", select: "previewPic" }
    ]
  )
);

// guest can see playlist
router.get("/:id", getDocAndSend("Playlist", ["creator", "levels"]));

// user can update own playlist
router.put("/:id", mustBeLoggedIn, getDocAndUpdateIfOwnerOrAdmin("Playlist"));

// user can delete own playlist
router.delete(
  "/:id",
  mustBeLoggedIn,
  getDocAndDeleteIfOwnerOrAdmin("Playlist")
);
