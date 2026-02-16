const multer = require("multer");
// const path = require("path");

// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, "uploads/");
//     },
//     filename: function (req, file, cb) {
//         const userId = req.user._id;
//         const timestamp = Date.now();
//         const ext = path.extname(file.originalname);

//         const uniqueName = `${userId}-${timestamp}${ext}`;
//         cb(null, uniqueName);
//     },
// });

// const uploadImage = multer({
//     storage,
//     limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
// });

const uploadImage = multer({
    storage: multer.memoryStorage(), // important
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

module.exports = uploadImage;