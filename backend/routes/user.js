const express = require("express");
const upload  = require("../middleware/multer.middleware");
const { updateProfile,changePassword } = require("../handlers/user-handler");
const {
  reverifyPassword,
  sendChangeEmailOtp,
  verifyChangeEmailOtp
} = require("../handlers/user-handler");
const protect = require("../middleware/auth-middleware");
const router = express.Router();

router.put("/profile", upload.single("profile_picture"), async (req, res) => {
    try{
        const model = req.body;
        if(!model.first_name || !model.last_name || !model.phone_number)
            return res.status(400).json({ message: "All fields are required" });

        const result = await updateProfile(req.user._id, model, req.file);
        return res.status(200).json({ message: "Profile updated successfully", result });
    }catch(err){
        console.error("Profile update Route error:", err);
        return res.status(500).json({ message: "Something went wrong while updating your profile. Please try again later." });
    }
});

router.post("/reverify-password", protect, reverifyPassword);

router.post("/change-email/send-otp", protect, sendChangeEmailOtp);

router.post("/change-email/verify-otp", protect, verifyChangeEmailOtp);

module.exports = router;