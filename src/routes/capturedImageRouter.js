const express = require("express");
const authUser = require("../middleware/authMiddleware");
const { uploadCapturedImage } = require("../controllers/capturedImageController");
const uploadImage = require("../middleware/uploadImageMiddleware");
const router = express.Router();

router.post(
    "/upload",
    authUser,
    uploadImage.single("image"),
    uploadCapturedImage
);

module.exports = router;