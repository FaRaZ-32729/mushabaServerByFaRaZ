const mongoose = require("mongoose");

const capturedImageSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        imageUrl: {
            type: String,
            required: true,
        },
        imageName: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

const capturedImageModel = mongoose.model("capturedImage", capturedImageSchema);

module.exports = capturedImageModel;
