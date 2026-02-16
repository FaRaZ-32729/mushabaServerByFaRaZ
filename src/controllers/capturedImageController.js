const path = require("path");
const mongoose = require("mongoose");
const userModel = require("../models/userModel");
const capturedImageModel = require("../models/capturedImageModel");

const uploadCapturedImage = async (req, res) => {
    try {
        // Check authentication
        if (!req.user || !req.user._id) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized access",
            });
        }

        // Validate file existence
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No image uploaded",
            });
        }

        // Validate user ID format
        if (!mongoose.Types.ObjectId.isValid(req.user._id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID",
            });
        }

        // Check if user still exists
        const userExists = await userModel.findById(req.user._id);
        if (!userExists) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // Validate file type
        const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
        if (!allowedTypes.includes(req.file.mimetype)) {
            return res.status(400).json({
                success: false,
                message: "Only JPEG, JPG, PNG, and WEBP images are allowed",
            });
        }

        // Validate file size (extra safety)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (req.file.size > maxSize) {
            return res.status(400).json({
                success: false,
                message: "Image size should not exceed 5MB",
            });
        }

        // Save image record
        const image = await capturedImageModel.create({
            user: req.user._id,
            imageUrl: `/uploads/${req.file.filename}`,
            imageName: req.file.filename,
        });

        res.status(201).json({
            success: true,
            message: "Image uploaded successfully",
            image,
        });

    } catch (error) {
        console.error("Upload Error:", error.message);
        res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};



module.exports = { uploadCapturedImage };
