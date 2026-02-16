const express = require("express");
const authUser = require("../middleware/authMiddleware");
const uploadImage = require("../middleware/uploadImageMiddleware");
const { uploadCapturedImage } = require("../controllers/capturedImageController");
const router = express.Router();

router.post(
    "/upload-image",
    authUser,
    uploadImage.single("image"),
    uploadCapturedImage
);

module.exports = router;