const User = require("../db/user");
const express = require("express");
const { registerNewUser,verifyOTP,resendOTP,loginUser,updateExistingUser } = require("../handlers/auth-handler");
const router = express.Router();

router.post("/register",async(req,res)=>{
    try{
        let model=req.body;
        let existingUser = await User.findOne({email_id: model.email_id});

        if(existingUser && existingUser.is_verified)
            return res.status(400).json({ message: "User already exists" });

        if(existingUser){
            await updateExistingUser(model);
        }else{
            await registerNewUser(model);
        }
        
        res.send({ message: "User Registered, OTP sent to mail."});
    }catch(err){
        console.error("Register Route error:", err);

        if (err.code === 11000) {
            if (err.keyPattern?.phone_number)
                throw new Error("Phone number already registered");

            if (err.keyPattern?.email_id)
                throw new Error("Email already registered");

            throw new Error("User already exists.");
        }

        throw new Error("Registration failed. Please try again later.");
    }
});

router.post("/verify-otp",async(req,res)=>{
    try {
        const result = await verifyOTP(req.body);
        return res.status(result.status).json({ message: result.message });
    } catch (err) {
        console.error("Verify OTP route error:", err);
        return res.status(500).json({ message: "Something went wrong while verifying your OTP. Please try again." });
    }
});

router.post("/resend-otp",async(req,res)=>{
    try {
        const result = await resendOTP(req.body);
        return res.status(result.status).json({ message: result.message });
    } catch (err) {
        console.error("Resend OTP route error:", err);
        return res.status(500).json({ message: "Something went wrong while resending your OTP. Please try again." });
    }
});

router.post("/login",async(req,res)=>{
    try {
        const result = await loginUser(req.body,res);
        return res.status(result.status).json({ message: result.message });
    } catch (err) {
        console.error("Resend OTP route error:", err);
        return res.status(500).json({ message: "Something went wrong while resending your OTP. Please try again." });
    }
});

module.exports = router;