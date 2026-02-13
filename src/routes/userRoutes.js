const express = require("express");
const authUser = require("../middleware/authMiddleware");
const { verifiedUser } = require("../controllers/userController");
const router = express.Router();

router.get("/me", authUser, verifiedUser);

module.exports = router;
