const multer = require("multer");

// store in memory to upload to Firebase
const uploadVideo = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit for 5 seconds video approx
});

module.exports = uploadVideo;
