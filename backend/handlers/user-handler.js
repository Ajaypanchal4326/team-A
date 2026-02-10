const uploadToCloudinary = require('../utils/uploadToCloudinary');
const deleteFromCloudinary = require("../utils/deleteFromCloudinary");
const User = require('../db/user');
const bcrypt = require("bcryptjs");
const { generateAndSendOTP } = require("../utils/otp");

async function updateProfile(userId, model, file) {
    try {
        const user = await User.findById(userId);
        if (!user) {
            return { status: 404, message: "User not found" };
        }

        let imageUrl = user.profile_picture;
        let publicId = user.profile_picture_public_id;

        if (file) {
            try {
                const uploadedImg = await uploadToCloudinary(file.path, "profile_pictures");

                if (publicId) {
                    try {
                        await deleteFromCloudinary(publicId);
                    } catch (err) {
                        console.error("Failed to delete old image from Cloudinary:", err);
                    }
                }

                imageUrl = uploadedImg.secure_url;
                publicId = uploadedImg.public_id;
            } catch (err) {
                console.error("Failed to upload image. Proceeding without updating profile picture:", err);
            }
        }

        user.first_name = model.first_name ?? user.first_name;
        user.last_name = model.last_name ?? user.last_name;
        user.phone_number = model.phone_number ?? user.phone_number;
        user.profile_picture = imageUrl;
        user.profile_picture_public_id = publicId;
        await user.save();

        return { status: 200, message: "Profile updated successfully" };

    } catch (err) {
        console.error("Error fetching user for profile update:", err);
        return { status: 500, message: "Something went wrong while updating your profile. Please try again later." };
    }
}

async function reverifyPassword(req, res) {
    try {
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({ message: "Password is required" });
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return res.status(400).json({ message: "Invalid password" });
        }

        user.password_verified_at = new Date();
        user.password_is_verified = true;
        await user.save();

        return res.status(200).json({
            message: "Password verified successfully (valid for 10 minutes)"
        });

    } catch (err) {
        console.error("Reverify password error:", err);
        return res.status(500).json({ message: "Something went wrong" });
    }
}

async function sendChangeEmailOtp(req, res) {
    try {
        const { newEmail } = req.body;

        if (!newEmail) {
            return res.status(400).json({ message: "New email is required" });
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if password was verified in last 10 minutes
        const TEN_MINUTES = 10 * 60 * 1000;
        if (
            !user.password_verified_at ||
            Date.now() - new Date(user.password_verified_at).getTime() > TEN_MINUTES
        ) {
            return res.status(403).json({
                message: "Please reverify your password before changing email"
            });
        }

        if (newEmail === user.email_id) {
            return res.status(400).json({
                message: "New email cannot be same as current email"
            });
        }

        const emailExists = await User.findOne({ email_id: newEmail });
        if (emailExists) {
            return res.status(400).json({
                message: "Email already in use"
            });
        }

        // Store temporarily
        user.pending_email = newEmail;
        await user.save();

        // Send OTP to NEW email
        await generateAndSendOTP(user);

        return res.status(200).json({
            message: "OTP sent to new email address"
        });

    } catch (err) {
        console.error("Send change email OTP error:", err);
        return res.status(500).json({ message: "Failed to send OTP" });
    }
}

async function verifyChangeEmailOtp(req, res) {
    try {
        const { otp } = req.body;

        if (!otp) {
            return res.status(400).json({ message: "OTP is required" });
        }

        const user = await User.findById(req.user._id);
        if (!user || !user.pending_email) {
            return res.status(400).json({
                message: "No email change request found"
            });
        }

        if (!user.otp_hash || !user.otp_expires_at) {
            return res.status(400).json({ message: "OTP not found" });
        }

        if (user.otp_expires_at < new Date()) {
            return res.status(400).json({ message: "OTP expired" });
        }

        const isValidOtp = await bcrypt.compare(
            otp.toString(),
            user.otp_hash
        );

        if (!isValidOtp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        // Final update
        user.email_id = user.pending_email;
        user.pending_email = null;
        user.otp_hash = null;
        user.otp_expires_at = null;
        user.password_is_verified = false;

        await user.save();

        return res.status(200).json({
            message: "Email updated successfully"
        });

    } catch (err) {
        console.error("Verify change email OTP error:", err);
        return res.status(500).json({ message: "Email change failed" });
    }
}

module.exports = {
    updateProfile,
    reverifyPassword,
    sendChangeEmailOtp,
    verifyChangeEmailOtp
};
