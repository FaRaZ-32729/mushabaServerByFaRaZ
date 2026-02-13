const express = require("express");
const { registerUser, registerByGoogle } = require("../controllers/authControllers");
const router = express.Router();

router.post("/register", registerUser);
router.post("/google-register", registerByGoogle);

module.exports = router;
