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

async function reverifyPassword(password, userId) {
    try {
        const user = await User.findById(userId);
        if (!user) {
            return { status: 404, message: "User not found" };
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return { status: 400, message: "Invalid password" };
        }

        user.password_verified_at = new Date();
        await user.save();

        return { status: 200, message: "Password verified successfully (valid for 10 minutes)" };

    } catch (err) {
        console.error("Reverify password error:", err);
        return { status: 500, message: "Something went wrong" };
    }
}

async function sendChangeEmailOtp(newEmail, userId) {
    try {
        const user = await User.findById(userId);
        if (!user) {
            return { status: 404, message: "User not found" };
        }

        const TEN_MINUTES = 10 * 60 * 1000;
        if (!user.password_verified_at ||
            Date.now() - new Date(user.password_verified_at).getTime() > TEN_MINUTES) {
            return { status: 403, message: "Please reverify your password before changing email" };
        }

        newEmail = newEmail.trim().toLowerCase();
        if (newEmail.toLowerCase() === user.email_id.toLowerCase()) {
            return { status: 400, message: "New Email cannot be same as current email. "};
        }

        const emailExists = await User.findOne({ email_id: newEmail });
        if (emailExists) {
            return {status:400, message: "Email already in use for another account. Please use a different email."};
        }

        user.pending_email = newEmail;
        await user.save();

        await generateAndSendOTP(user,false,user.pending_email);

        return { status: 200, message: "OTP sent to new email address" };

    } catch (err) {
        console.error("Send change email OTP error:", err);
        return { status: 500, message: "Failed to send OTP" };
    }
}

async function verifyChangeEmailOtp(otp, userId) {
    try {
        const user = await User.findById(userId);
        if (!user || !user.pending_email) {
            return { status: 400, message: "No email change request found" };
        }

        const TEN_MINUTES = 10 * 60 * 1000;
        if (!user.password_verified_at ||
            Date.now() - new Date(user.password_verified_at).getTime() > TEN_MINUTES) {
            return { status: 403, message: "Please reverify your password before changing email" };
        }

        if (user.otp_blocked_time && Date.now() < new Date(user.otp_blocked_time).getTime()) {
            return { status: 429, message: "Too many failed attempts. Try again later." };
        }

        if (!user.otp_hash || !user.otp_expires_at) {
            return { status: 400, message: "OTP not found" };
        }

        if (user.otp_expires_at < new Date()) {
            return { status: 400, message: "OTP expired" };
        }

        const isValidOtp = await bcrypt.compare(
            otp.toString(),
            user.otp_hash
        );

        if (!isValidOtp) {
            user.otp_attempts = (user.otp_attempts || 0) + 1;

            if (user.otp_attempts >= 6) {
                user.otp_blocked_time = new Date(Date.now() + 10 * 60 * 1000);
                await user.save();
                return {
                    status: 429,
                    message: "Too many wrong attempts. Reverify Password and try again after 10 minutes."
                };
            }

            await user.save();
            return {
                status: 400,
                message: `Invalid OTP. Attempts left: ${6 - user.otp_attempts}`
            };
        }

        user.otp_attempts = 0;
        user.otp_blocked_time = null;
        user.email_id = user.pending_email;
        user.pending_email = null;
        user.otp_hash = null;
        user.otp_expires_at = null;
        user.password_is_verified = false;
        user.password_verified_at = null;

        await user.save();

        return { status: 200, message: "Email updated successfully" };

    } catch (err) {
        console.error("Verify change email OTP error:", err);
        return { status: 500, message: "Email change failed" };
    }
}

async function resendOTP(userId) {
    try{
        const user = await User.findById(userId);
        if (!user || !user.pending_email) {
            return { status: 400, message: "No email change request found" };
        }

        if (!user.otp_hash || !user.otp_expires_at) {
            return { status: 400, message: "OTP cannot be resent" };
        }

        const expiresAt = new Date(user.otp_expires_at).getTime();
        const now = Date.now();
        const cooldown = 4 * 60 * 1000; 
        if (now < expiresAt - cooldown)
            return { status: 429, message: "Please wait before requesting another OTP"};

        try{
            await generateAndSendOTP(user,false,user.pending_email);
        }catch(err){
            console.error("Problem Sending OTP:", err);
            return { status: 500, message: "Failed to send OTP" };
        }
        return { status: 200, message: "OTP resent successfully" };
    }catch(err){
        console.error("Resend OTP failed:", err);
        return { status: 500, message: "Something went wrong while resending your OTP." };
    }  
}

async function changePassword(userId,model){
    try{
        const user = await User.findById(userId);
        if (!user) {
            return { status: 404, message: "User not found" };
        } 

        const valid = await bcrypt.compare(model.current_password,user.password);

        if(!valid)
            return { status: 400, message: "Current Password is incorrect." };

        let hashPassword;
        try{
            const salt = await bcrypt.genSalt(10);
            hashPassword = await bcrypt.hash(model.new_password,salt);
        }
        catch(err){
            console.error("Password hashing failed:", err);
            return { status: 500, message: "Something went wrong while securing your password"};
        }

        user.password = hashPassword;
        await user.save();
        return { status: 200, message: "Password changed successfully." };
    }catch(err){
        console.error("Error changing password: ",err);
        return { status: 500, message: "Something went wrong while changing your password. Please try again later."}
    }
}

module.exports = {
    updateProfile,
    reverifyPassword,
    sendChangeEmailOtp,
    verifyChangeEmailOtp,
    resendOTP,
    changePassword
};
