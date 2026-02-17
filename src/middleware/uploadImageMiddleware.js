const multer = require("multer");

const uploadImage = multer({
    storage: multer.memoryStorage(), // important
    limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
});

module.exports = uploadImage;