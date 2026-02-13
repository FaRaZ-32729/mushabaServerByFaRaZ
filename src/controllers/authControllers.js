const bcrypt = require("bcryptjs");
const { OAuth2Client } = require("google-auth-library");
const { validateEmail, validatePhone, validatePassword } = require("../helpers/validators");
const userModel = require("../models/userModel");
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

        // Create user
        const user = await userModel.create({
            name,
            email,
            password: hashedPassword,
            phone,
            nationality,
        });

        res.status(201).json({ message: "User registered successfully!", user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};




// Register/login with Google
const registerByGoogle = async (req, res) => {
    try {
        const { token, phone, nationality } = req.body;

        if (!token || !phone || !nationality) {
            return res.status(400).json({ message: "Token, phone, and nationality are required!" });
        }

        // Validate phone
        if (!validatePhone(phone)) {
            return res.status(400).json({ message: "Invalid phone number!" });
        }

        // Verify token
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const { sub: googleId, email, name, picture } = payload;

        // Check if user exists
        let user = await userModel.findOne({ googleId });
        if (!user) {
            user = await userModel.create({
                name,
                email,
                googleId,
                provider: "google",
                phone,
                nationality,
                image: picture,
                isVerified: true,
            });
        }

        res.status(200).json({ message: "User registered successfully!", user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

module.exports = {
    registerUser,
    registerByGoogle,
};
