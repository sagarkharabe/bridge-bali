const router = require("express").Router();
import {
  createDoc,
  getDocAndSend,
  getDocsAndSend,
  getDocAndUpdateIfOwnerOrAdmin,
  getDocAndDeleteIfOwnerOrAdmin
} from "./helpers/crud";
import { mustBeLoggedIn } from "./helpers/permissions";

// guest can see all levels
router.get("/", getDocsAndSend("Level"));

// user can create level
router.post("/", mustBeLoggedIn, createDoc("Level", "creator"));
// guest can see level
router.get("/:id", getDocAndSend("Level"));

// user can update own level
router.put("/:id", mustBeLoggedIn, getDocAndUpdateIfOwnerOrAdmin("Level"));

// user can delete own level
router.delete("/:id", mustBeLoggedIn, getDocAndDeleteIfOwnerOrAdmin("Level"));

module.exports = router;
