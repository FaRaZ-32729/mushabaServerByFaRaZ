const express = require("express");
const authUser = require("../middleware/authMiddleware");
const { uploadCapturedImage, getAllImagesByUser, getRecentImageByUser, deleteCapturedImage } = require("../controllers/capturedImageController");
const uploadImage = require("../middleware/uploadImageMiddleware");
const router = express.Router();

router.post(
    "/upload",
    authUser,
    uploadImage.single("image"),
    uploadCapturedImage
);
router.get("/all", authUser, getAllImagesByUser);
router.get("/recent", authUser, getRecentImageByUser);
router.delete("/:imageId", authUser, deleteCapturedImage);

module.exports = router;