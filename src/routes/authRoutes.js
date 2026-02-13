const express = require("express");
const { registerUser, registerByGoogle, verifyOtp, regenerateOtp, loginUser } = require("../controllers/authControllers");
const router = express.Router();

router.post("/register", registerUser);
router.post("/google-register", registerByGoogle);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", regenerateOtp);
router.post("/login", loginUser);

module.exports = router;
