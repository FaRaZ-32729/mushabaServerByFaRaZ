const path = require("path");
const sharp = require("sharp");
const capturedImageModel = require("../models/capturedImageModel");
const bucket = require("../config/firebaseAdmin");


// upload image
// const uploadCapturedImage = async (req, res) => {
//     try {
//         if (!req.file) {
//             return res.status(400).json({
//                 success: false,
//                 message: "No image uploaded",
//             });
//         }

//         // Validate image type
//         const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
//         if (!allowedTypes.includes(req.file.mimetype)) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Only JPG, PNG, and WEBP images are allowed",
//             });
//         }

//         const userId = req.user._id.toString();
//         const timestamp = Date.now();
//         const ext = path.extname(req.file.originalname);

//         // New folder structure
//         const fileName = `mushaba/capturedImages/${userId}-${timestamp}${ext}`;

//         const file = bucket.file(fileName);

//         await file.save(req.file.buffer, {
//             metadata: {
//                 contentType: req.file.mimetype,
//             },
//         });

//         // No makePublic()
//         // Generate signed URL (private access)
//         // const [signedUrl] = await file.getSignedUrl({
//         //     action: "read",
//         //     expires: "03-01-2035", // long-term access
//         // });

//         await file.makePublic();
//         const imageUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

//         const image = await capturedImageModel.create({
//             user: userId,
//             imageUrl,
//             imageName: fileName,
//         });

//         return res.status(201).json({
//             success: true,
//             message: "Image uploaded successfully",
//             image,
//         });

//     } catch (error) {
//         console.error("Firebase Upload Error:", error);
//         return res.status(500).json({
//             success: false,
//             message: "Server Error",
//         });
//     }
// };

// upload image
const uploadCapturedImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No image uploaded",
            });
        }

        const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
        if (!allowedTypes.includes(req.file.mimetype)) {
            return res.status(400).json({
                success: false,
                message: "Only JPG, PNG, and WEBP images are allowed",
            });
        }

        const userId = req.user._id.toString();
        const timestamp = Date.now();

        // Compress Image Using Sharp
        const compressedBuffer = await sharp(req.file.buffer)
            .resize({ width: 512, withoutEnlargement: true })
            .jpeg({ quality: 20 })
            .toBuffer();

        const fileName = `mushaba/capturedImages/${userId}-${timestamp}.jpg`;

        const file = bucket.file(fileName);

        await file.save(compressedBuffer, {
            metadata: {
                contentType: "image/jpeg",
            },
        });

        await file.makePublic();

        const imageUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

        const image = await capturedImageModel.create({
            user: userId,
            imageUrl,
            imageName: fileName,
        });

        return res.status(201).json({
            success: true,
            message: "Image uploaded successfully",
            image,
        });

    } catch (error) {
        console.error("Firebase Upload Error:", error);
        return res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};

// get all images of logged in user
const getAllImagesByUser = async (req, res) => {
    try {
        const userId = req.user._id.toString(); // Authenticated user

        const images = await capturedImageModel
            .find({ user: userId })
            .sort({ createdAt: -1 }); // latest first

        if (!images) {
            return res.status(404).json({ success: false, message: "No images found for this user" })
        }

        return res.status(200).json({
            success: true,
            totalImages: images.length,
            images,
        });
    } catch (error) {
        console.error("GetAllImages Error:", error);
        return res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};

// get recent image of logged in user
const getRecentImageByUser = async (req, res) => {
    try {
        const userId = req.user._id.toString();

        const recentImage = await capturedImageModel
            .findOne({ user: userId })
            .sort({ createdAt: -1 }); // latest first

        if (!recentImage) {
            return res.status(404).json({
                success: false,
                message: "No image found for this user",
            });
        }

        return res.status(200).json({
            success: true,
            image: recentImage,
        });
    } catch (error) {
        console.error("GetRecentImage Error:", error);
        return res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};

// delete image 
const deleteCapturedImage = async (req, res) => {
    try {
        const userId = req.user._id.toString();
        const { imageId } = req.params; // Pass image _id in URL

        // Find image in MongoDB
        const image = await capturedImageModel.findById(imageId);

        if (!image) {
            return res.status(404).json({
                success: false,
                message: "Image not found",
            });
        }

        // Make sure the logged-in user owns this image
        if (image.user.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: "You are not allowed to delete this image",
            });
        }

        // Delete file from Firebase Storage
        const file = bucket.file(image.imageName); // the path saved in MongoDB
        await file.delete(); // deletes from Firebase

        // Delete from MongoDB
        await capturedImageModel.findByIdAndDelete(imageId);

        return res.status(200).json({
            success: true,
            message: "Image deleted successfully",
        });

    } catch (error) {
        console.error("Delete Image Error:", error);
        return res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};


module.exports = { uploadCapturedImage, getAllImagesByUser, getRecentImageByUser, deleteCapturedImage };