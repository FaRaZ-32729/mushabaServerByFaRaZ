const express = require("express");
const authRoutes = require("./authRoutes");
const userRoutes = require("./userRoutes");
const capturedImageRouter = require("./capturedImageRouter");
const router = express.Router();

router.use("/auth", authRoutes);
router.use("/user", userRoutes);
router.use("/image", capturedImageRouter);

module.exports = router;
