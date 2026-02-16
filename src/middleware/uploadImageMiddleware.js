const multer = require("multer");

const uploadImage = multer({
    storage: multer.memoryStorage(), // important
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

module.exports = uploadImage;