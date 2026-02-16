const express = require("express");
const authRoutes = require("./authRoutes");
const userRoutes = require("./userRoutes");
const capturedImageRouter = require("./capturedImageRouter");
const capturedvideoRoutes = require("./capturedvideoRoutes");
const router = express.Router();

router.use("/auth", authRoutes);
router.use("/user", userRoutes);
router.use("/image", capturedImageRouter);
router.use("/video", capturedvideoRoutes);

module.exports = router;