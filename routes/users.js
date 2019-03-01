const router = require("express").Router();
import {
  createDoc,
  getDocAndSend,
  getDocsAndSend,
  getDocAndUpdateIfOwnerOrAdmin,
  getDocAndDeleteIfOwnerOrAdmin
} from "./helpers/crud";
import { mustBeLoggedIn } from "./helpers/permissions";

// guest can see all users
router.get("/", getDocsAndSend("User"));

// guest can create user
router.post("/", createDoc("User"));

// guest can see user
router.get("/:id", getDocAndSend("User"));

// user can update own profile
router.put("/:id", mustBeLoggedIn, getDocAndUpdateIfOwnerOrAdmin("User"));

// user can delete own profile (optional to implement)
router.delete("/:id", mustBeLoggedIn, getDocAndDeleteIfOwnerOrAdmin("User"));

module.exports = router;
