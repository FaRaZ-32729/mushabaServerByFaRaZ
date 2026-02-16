const path = require("path");
const mongoose = require("mongoose");
const userModel = require("../models/userModel");
const capturedImageModel = require("../models/capturedImageModel");
const bucket = require("../config/firebaseAdmin");

const uploadCapturedImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No image uploaded",
            });
        }

        // Validate image type
        const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
        if (!allowedTypes.includes(req.file.mimetype)) {
            return res.status(400).json({
                success: false,
                message: "Only JPG, PNG, and WEBP images are allowed",
            });
        }

        const userId = req.user._id.toString();
        const timestamp = Date.now();
        const ext = path.extname(req.file.originalname);

        // New folder structure
        const fileName = `mushaba/capturedImages/${userId}-${timestamp}${ext}`;

        const file = bucket.file(fileName);

        await file.save(req.file.buffer, {
            metadata: {
                contentType: req.file.mimetype,
            },
        });

        // No makePublic()
        // Generate signed URL (private access)
        // const [signedUrl] = await file.getSignedUrl({
        //     action: "read",
        //     expires: "03-01-2035", // long-term access
        // });

        await file.makePublic();
        const imageUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

        const image = await capturedImageModel.create({
            user: userId,
            imageUrl,
            imageName: fileName,
        });

        res.status(201).json({
            success: true,
            message: "Image uploaded successfully",
            image,
        });

    } catch (error) {
        console.error("Firebase Upload Error:", error);
        res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};

module.exports = { uploadCapturedImage };
