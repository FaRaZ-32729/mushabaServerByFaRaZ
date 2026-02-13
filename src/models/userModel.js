const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
        },

        password: {
            type: String,
            required: function () {
                return this.provider === "local";
            },
        },

        role: {
            type: String,
            enum: ["admin", "owner", "member"],
            default: "member",
        },

        nationality: {
            type: String,
            required: true,
            trim: true
        },

        phone: {
            type: String,
            required: true,
            trim: true
        },

        image: {
            type: String,
        },

        provider: {
            type: String,
            enum: ["local", "google"],
            default: "local",
        },

        googleId: {
            type: String,
        },

        isVerified: {
            type: Boolean,
            default: false,
        },
        otp: { type: String },
        otpExpires: { type: Date },
    },
    { timestamps: true }
);

const userModel = mongoose.model("User", userSchema);

module.exports = userModel;