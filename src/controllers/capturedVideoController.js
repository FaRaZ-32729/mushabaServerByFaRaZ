const path = require("path");
const capturedVideoModel = require("../models/capturedVideoModel"); // create similar to images
const bucket = require("../config/firebaseAdmin");
const fs = require("fs");
const ffmpeg = require("fluent-ffmpeg");
const os = require("os");

const uploadCapturedVideo = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No video uploaded",
            });
        }

        const allowedTypes = ["video/mp4", "video/mov", "video/webm"];
        if (!allowedTypes.includes(req.file.mimetype)) {
            return res.status(400).json({
                success: false,
                message: "Only MP4, MOV, and WEBM allowed",
            });
        }

        // 🔥 TEMP FILE PATH
        const tempPath = path.join(os.tmpdir(), `${Date.now()}-${req.file.originalname}`);
        fs.writeFileSync(tempPath, req.file.buffer);

        // 🔥 CHECK DURATION
        ffmpeg.ffprobe(tempPath, async (err, metadata) => {
            if (err) {
                fs.unlinkSync(tempPath);
                return res.status(500).json({
                    success: false,
                    message: "Error reading video metadata",
                });
            }

            const duration = metadata.format.duration;

            if (duration > 5) {
                fs.unlinkSync(tempPath);
                return res.status(400).json({
                    success: false,
                    message: "Video must not exceed 5 seconds",
                });
            }

            // ✅ If valid → Upload to Firebase
            const userId = req.user._id.toString();
            const timestamp = Date.now();
            const ext = path.extname(req.file.originalname);

            const fileName = `mushaba/capturedvideos/${userId}-${timestamp}${ext}`;
            const file = bucket.file(fileName);

            await file.save(req.file.buffer, {
                metadata: {
                    contentType: req.file.mimetype,
                },
            });

            await file.makePublic();
            const videoUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

            const video = await capturedVideoModel.create({
                user: userId,
                videoUrl,
                videoName: fileName,
            });

            // 🔥 DELETE TEMP FILE
            fs.unlinkSync(tempPath);

            return res.status(201).json({
                success: true,
                message: "Video uploaded successfully",
                video,
            });
        });

    } catch (error) {
        console.error("Upload Video Error:", error);
        return res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};  

// ----------------- Get All Videos by User -----------------
const getAllVideosByUser = async (req, res) => {
    try {
        const userId = req.user._id.toString();

        const videos = await capturedVideoModel
            .find({ user: userId })
            .sort({ createdAt: -1 });

        if (!videos || videos.length === 0) {
            return res.status(404).json({ success: false, message: "No videos found" });
        }

        return res.status(200).json({
            success: true,
            totalVideos: videos.length,
            videos,
        });
    } catch (error) {
        console.error("GetAllVideos Error:", error);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};

// ----------------- Get Recent Video -----------------
const getRecentVideoByUser = async (req, res) => {
    try {
        const userId = req.user._id.toString();

        const recentVideo = await capturedVideoModel
            .findOne({ user: userId })
            .sort({ createdAt: -1 });

        if (!recentVideo) {
            return res.status(404).json({ success: false, message: "No video found" });
        }

        return res.status(200).json({ success: true, video: recentVideo });
    } catch (error) {
        console.error("GetRecentVideo Error:", error);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};

// ----------------- Delete Video -----------------
const deleteCapturedVideo = async (req, res) => {
    try {
        const userId = req.user._id.toString();
        const { videoId } = req.params;

        const video = await capturedVideoModel.findById(videoId);
        if (!video) {
            return res.status(404).json({ success: false, message: "Video not found" });
        }

        if (video.user.toString() !== userId) {
            return res.status(403).json({ success: false, message: "Not allowed to delete this video" });
        }

        // Delete from Firebase
        const file = bucket.file(video.videoName);
        await file.delete();

        // Delete from MongoDB
        await capturedVideoModel.findByIdAndDelete(videoId);

        return res.status(200).json({ success: true, message: "Video deleted successfully" });
    } catch (error) {
        console.error("DeleteVideo Error:", error);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};

module.exports = { uploadCapturedVideo, getAllVideosByUser, getRecentVideoByUser, deleteCapturedVideo };
