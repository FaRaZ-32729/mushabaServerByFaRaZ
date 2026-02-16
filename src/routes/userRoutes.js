const express = require("express");
const authUser = require("../middleware/authMiddleware");
const { verifiedUser, getAllUsers, getUserById } = require("../controllers/userController");
const router = express.Router();

router.get("/me", authUser, verifiedUser);
router.get("/single/:id", authUser, getUserById);
router.get("/all", authUser, getAllUsers);

module.exports = router;