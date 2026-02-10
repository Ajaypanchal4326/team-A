const express = require("express");
const upload  = require("../middleware/multer.middleware");
const {
  updateProfile,
  reverifyPassword,
  sendChangeEmailOtp,
  verifyChangeEmailOtp,
  resendOTP,
  changePassword
} = require("../handlers/user-handler");

const router = express.Router();

router.put("/profile", protect, upload.single("profile_picture"), async (req, res) => {
    try {
        const model = req.body;
        if (!model.first_name || !model.last_name || !model.phone_number)
            return res.status(400).json({ message: "All fields are required" });

        const result = await updateProfile(req.user._id, model, req.file);
        return res.status(result.status).json({ message: result.message });
    }catch(err){
        console.error("Profile update Route error:", err);
        return res.status(500).json({ message: "Something went wrong while updating your profile. Please try again later." });
    }
});

router.post("/reverify-password", async (req, res) => {
    try{
        const { password } = req.body;
        if (!password) {
            return res.status(400).json({ message: "Password is required" });
        }

        const result = await reverifyPassword(password, req.user._id);
        return res.status(result.status).json({ message: result.message });
    }catch(err){
        console.error("Reverify password Route error:", err);
        return res.status(500).json({ message: "Something went wrong while re-verifying your password. Please try again later." });
    }
});

router.post("/change-email/send-otp", async (req, res) => {
    try {
        const { newEmail } = req.body;

        if (!newEmail) {
            return res.status(400).json({ message: "New email is required" });
        }

        const result = await sendChangeEmailOtp(newEmail, req.user._id);
        return res.status(result.status).json({ message: result.message });
    } catch (err) {
        console.error("Send change email OTP Route error:", err);
        return res.status(500).json({ message: "Failed to send OTP" });
    }
});

router.post("/change-email/verify-otp", async (req, res) => {
    try {
        const { otp } = req.body;
        
        if (!otp) {
            return res.status(400).json({ message: "OTP is required" });
        }
        const result = await verifyChangeEmailOtp(otp, req.user._id);
        return res.status(result.status).json({ message: result.message });
    } catch (err) {
        console.error("Verify change email OTP Route error:", err);
        return res.status(500).json({ message: "Failed to verify OTP" });
    }
});

router.post("/change-email/resend-otp", async (req, res) => {
    try {
        const result = await resendOTP(req.user._id);
        return res.status(result.status).json({ message: result.message });
    } catch (err) {
        console.error("Resend OTP Route error:", err);
        return res.status(500).json({ message: "Something went wrong while resending your OTP." });
    }
});

router.put("/change-password", async (req, res) => {
    try{
        const model = req.body;
        if(!model.current_password || !model.new_password)
            return res.status(400).json({ message: "Current and New Password are required" });
        if (model.current_password === model.new_password) {
            return res.status(400).json({ message: "New password must be different from current password." });
        }
        const result = await changePassword(req.user._id, model);
        return res.status(result.status).json({ message: result.message });
    }catch(err){
        console.error("Change Password Route error:", err);
        return res.status(500).json({ message: "Something went wrong while changing your password. Please try again later." });
    }
});

module.exports = router;