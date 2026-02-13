const userModel = require("../models/userModel");

const verifiedUser = async (req, res) => {
    try {
        // req.user comes from protect middleware
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Not authorized",
            });
        }

        // Fetch user fresh from DB, exclude sensitive info
        const user = await userModel.findById(req.user._id).select(
            "-password -otp -otpExpires -__v"
        );

        res.status(200).json({
            success: true,
            user,
        });
    } catch (error) {
        console.error("VerifiedUser Error:", error.message);
        res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
}

module.exports = {
    verifiedUser,
}