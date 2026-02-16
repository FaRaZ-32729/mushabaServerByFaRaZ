const mongoose = require("mongoose");

const capturedVideoSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    videoUrl: { type: String, required: true },
    videoName: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model("capturedVideo", capturedVideoSchema);
