const uploadToCloudinary = require('../utils/uploadToCloudinary');
const deleteFromCloudinary = require("../utils/deleteFromCloudinary");
const User = require('../db/user');
const bcrypt = require("bcryptjs");

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

    }catch (err) {
        console.error("Error fetching user for profile update:", err);
        return { status: 500, message: "Something went wrong while updating your profile. Please try again later." };
    }
}

module.exports = {updateProfile};