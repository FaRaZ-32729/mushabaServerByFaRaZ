const bcrypt = require("bcryptjs");
const { OAuth2Client } = require("google-auth-library");
const { validateEmail, validatePhone, validatePassword } = require("../helpers/validators");
const userModel = require("../models/userModel");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");
const { generateOTP } = require("../helpers/otp");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Register normal user
const registerUser = async (req, res) => {
    try {
        const { name, email, password, phone, nationality } = req.body;

        // Check required fields
        if (!name || !email || !password || !phone || !nationality) {
            return res.status(400).json({ message: "All fields are required!" });
        }

        // Validate each field
        if (!validateEmail(email)) {
            return res.status(400).json({ message: "Invalid email format!" });
        }

        if (!validatePhone(phone)) {
            return res.status(400).json({ message: "Invalid phone number!" });
        }

        if (!validatePassword(password)) {
            return res.status(400).json({ message: "Password must be min 6 chars, include letters & numbers!" });
        }

        // Check if user exists
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists!" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate OTP
        const otp = generateOTP();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Create user
        const newUser = {
            name,
            email,
            password: hashedPassword,
            phone,
            nationality,
            otp,
            otpExpires
        };

        // ---------------- SEND SETUP EMAIL ----------------
        try {
            await sendEmail(
                newUser.email,
                "Verify Your Data Center Account",
                `
    <div style="font-family: Arial, sans-serif; color: #333; background-color: #f9fafb; padding: 10px;">
        <div style=" background-color: #ffffff; border-radius: 10px; padding: 20px; box-shadow: 0 4px 8px rgba(0,0,0,0.05);">
            
            <div style="text-align: center; margin-bottom: 20px;">
                <img src="https://polekit.iotfiysolutions.com/assets/logo.png" alt="DataCenter Logo" style="width: 120px;" />
            </div>
            
            <h2 style="color: #0055a5; text-align: center;">Welcome to Data Center!</h2>
            
            <p style="font-size: 16px; line-height: 1.6;">
                Hello <strong>${newUser.name || newUser.email}</strong>,
            </p>
            
            <p style="font-size: 16px; line-height: 1.6;">
                Thank you for registering. Please use the OTP below to verify your account:
            </p>
            
            <div style="text-align: center; margin: 20px 0;">
                <span style="
                    display: inline-block;
                    font-size: 24px;
                    letter-spacing: 3px;
                    background-color: #f0f4ff;
                    color: #0055a5;
                    padding: 15px 25px;
                    border-radius: 8px;
                    font-weight: bold;
                    border: 1px dashed #0055a5;
                ">${otp}</span>
            </div>
            
            <p style="font-size: 14px; color: #555; text-align: center;">
                This OTP will expire in 10 minutes. Please do not share it with anyone.
            </p>

            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />

            <p style="font-size: 12px; text-align: center; color: #888;">
                © ${new Date().getFullYear()} IOTFIY Solutions. All rights reserved.
            </p>
        </div>
    </div>
    `
            );

        } catch (mailError) {
            console.error("Email sending failed:", mailError.message);

            return res.status(500).json({
                message: "Failed to send setup email. User was NOT created.",
            });
        }

        const user = await userModel.create(newUser);

        return res.status(201).json({ message: "User registered & email send successfully!", user });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server Error" });
    }
};

// Verify OTP before login
const verifyOtp = async (req, res) => {
    try {
        const { userId, otp } = req.body;

        if (!userId || !otp) return res.status(400).json({ message: "UserId and OTP are required" });

        const user = await userModel.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        if (user.isVerified) return res.status(400).json({ message: "User already verified" });

        if (user.otp !== otp) return res.status(400).json({ message: "Invalid OTP" });

        if (user.otpExpires < new Date()) return res.status(400).json({ message: "OTP expired" });

        user.isVerified = true;
        user.otp = null;
        user.otpExpires = null;
        await user.save();

        return res.status(200).json({ message: "User verified successfully!", token });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server Error" });
    }
};

// regenerateOtp
const regenerateOtp = async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ message: "UserId is required" });
        }

        const user = await userModel.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.isVerified) {
            return res.status(400).json({ message: "User already verified" });
        }

        // Optional: prevent spam (only allow after expiry)
        if (user.otpExpires && user.otpExpires > new Date()) {
            return res.status(400).json({
                message: "OTP still valid. Please wait before requesting new one.",
            });
        }

        // Generate new OTP
        const newOtp = generateOTP();
        const newOtpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

        user.otp = newOtp;
        user.otpExpires = newOtpExpiry;

        await user.save();

        // Send OTP again
        await sendEmail(
            user.email,
            "Your New OTP Code",
            `
            <p>Hello ${user.name},</p>
            <p>Your new OTP is: <b>${newOtp}</b></p>
            <p>This OTP will expire in 10 minutes.</p>
            `
        );

        return res.status(200).json({
            message: "New OTP sent successfully!",
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server Error" });
    }
};

// login api based on react native application
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required",
            });
        }

        // Validate email format
        if (!validateEmail(email)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email format",
            });
        }

        // Check if user exists
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid credentials",
            });
        }

        // Prevent local login for Google users
        if (user.provider === "google") {
            return res.status(400).json({
                success: false,
                message: "Please login using Google",
            });
        }

        // Check if user is verified
        if (!user.isVerified) {
            return res.status(403).json({
                success: false,
                message: "Please verify your account first",
            });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Invalid credentials",
            });
        }

        // Generate JWT
        const token = jwt.sign(
            {
                id: user._id,
            },
            process.env.JWT_SECRET,
            { expiresIn: "7d" } // mobile apps usually longer expiry
        );

        // Set JWT in HTTP-only cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        return res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user
        });

    } catch (error) {
        console.error("Login Error:", error);
        return res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};

// Register with Google
const registerByGoogle = async (req, res) => {
    try {
        const { token, phone, nationality } = req.body;

        // 1️⃣ Validate required fields
        if (!token || !phone || !nationality) {
            return res.status(400).json({ message: "Token, phone, and nationality are required!" });
        }

        if (!validatePhone(phone)) {
            return res.status(400).json({ message: "Invalid phone number!" });
        }

        // 2️⃣ Verify Google token
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const { sub: googleId, email, name, picture } = payload;

        // 3️⃣ Check if user already exists
        const existingUser = await userModel.findOne({ googleId });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already registered. Please log in instead.",
            });
        }

        // 4️⃣ Create new user
        const user = await userModel.create({
            name,
            email,
            googleId,
            provider: "google",
            phone,
            nationality,
            image: picture,
            isVerified: true,
        });

        return res.status(201).json({
            success: true,
            message: "User registered successfully via Google!",
            user,
        });
    } catch (error) {
        console.error("Google Registration Error:", error.message);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};

// login with Google
const googleLogin = async (req, res) => {
    try {
        const { idToken } = req.body;

        if (!idToken) {
            return res.status(400).json({ success: false, message: "ID token required" });
        }

        // 1️⃣ Verify ID token with Google
        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const { sub, email, name, picture } = payload;

        // 2️⃣ Find or Create User
        let user = await userModel.findOne({ googleId: sub });

        if (!user) {
            // Create new user
            user = await userModel.create({
                name,
                email,
                provider: "google",
                googleId: sub,
                image: picture,
                isVerified: true, // Google accounts are verified
            });
        }

        // 3️⃣ Generate JWT for your app
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        // 4️⃣ Set JWT in cookie for Postman/testing
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return res.status(200).json({
            success: true,
            message: "Google login successful",
            token,
            user,
        });
    } catch (error) {
        console.error("Google Login Error:", error.message);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

module.exports = {
    registerUser,
    registerByGoogle,
    verifyOtp,
    regenerateOtp,
    loginUser,
};
