const express = require("express");
const router = express.Router();
const authUser = require("../middleware/authMiddleware");
const uploadVideo = require("../middleware/uploadVideoMiddleware");
const { uploadCapturedVideo, getAllVideosByUser, getRecentVideoByUser, deleteCapturedVideo } = require("../controllers/capturedVideoController");


// 🔹 Upload Video (max 5 sec validated inside controller)
router.post(
    "/upload",
    authUser,
    uploadVideo.single("video"), // field name must be "video" in Postman
    uploadCapturedVideo
);


// 🔹 Get All Videos of Logged-in User
router.get(
    "/all",
    authUser,
    getAllVideosByUser
);


// 🔹 Get Most Recent Video of Logged-in User
router.get(
    "/recent",
    authUser,
    getRecentVideoByUser
);


// 🔹 Delete Video by ID
router.delete(
    "/:videoId",
    authUser,
    deleteCapturedVideo
);


module.exports = router;
