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

        return res.status(200).json({
            success: true,
            user,
        });
    } catch (error) {
        console.error("VerifiedUser Error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
}

const getUserById = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID",
            });
        }

        const user = await userModel
            .findById(id)
            .select("-password -otp -otpExpires -__v");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        return res.status(200).json({
            success: true,
            user,
        });

    } catch (error) {
        console.error("GetUserById Error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};

const getAllUsers = async (req, res) => {
    try {
        const users = await userModel
            .find()
            .select("-password -otp -otpExpires -__v")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            totalUsers: users.length,
            users,
        });

    } catch (error) {
        console.error("GetAllUsers Error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};


// confirm this api and which role delete what 
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID",
            });
        }

        const userToDelete = await userModel.findById(id);

        if (!userToDelete) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        const loggedInUser = req.user;

        // 🔹 If ADMIN
        if (loggedInUser.role === "admin") {

            // Admin cannot delete himself
            if (loggedInUser._id.toString() === id) {
                return res.status(400).json({
                    success: false,
                    message: "Admin cannot delete their own account",
                });
            }

            await userModel.findByIdAndDelete(id);

            return res.status(200).json({
                success: true,
                message: "User deleted successfully by admin",
            });
        }

        // 🔹 If OWNER
        if (loggedInUser.role === "owner") {

            // Owner can only delete himself
            if (loggedInUser._id.toString() !== id) {
                return res.status(403).json({
                    success: false,
                    message: "Owner can only delete their own account",
                });
            }

            await userModel.findByIdAndDelete(id);

            return res.status(200).json({
                success: true,
                message: "Owner account deleted successfully",
            });
        }

        // 🔹 Members cannot delete anyone
        return res.status(403).json({
            success: false,
            message: "Access denied",
        });

    } catch (error) {
        console.error("DeleteUser Error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};
// this is happening in current deleteUser api

// Role 	Delete Self 	Delete Others 
// Admin	 ❌ No 	    ✅ Yes
// Owner	 ✅ Yes 	    ❌ No
// Member	 ❌ No	    ❌ No


module.exports = {
    verifiedUser,
    getUserById,
    getAllUsers,
}