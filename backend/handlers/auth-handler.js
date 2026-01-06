const User = require("../db/user")
const bcrypt = require("bcryptjs")
const { generateAndSendOTP,welcomeMsg } = require("../utils/otp")
const generateToken = reuire("../utils/generateToken")

async function registerNewUser(model){
    let hashPassword;
    try{
        const salt = await bcrypt.genSalt(10);
        hashPassword = await bcrypt.hash(model.password,salt);
    }
    catch(err){
        console.error("Password hashing failed:", err);
        throw new Error("Something went wrong while securing your password");
    }

    try{
        let user = new User({
            first_name:model.first_name,
            last_name:model.last_name,
            phone_number:model.phone_number,
            email_id:model.email_id,
            password:hashPassword,
        });

        await generateAndSendOTP(user);
        await user.save();
    }catch(err){
        console.error("Database save failed:", err);

        if (err.code === 11000) {
            if (err.keyPattern?.phone_number)
                throw new Error("Phone number already registered");

            if (err.keyPattern?.email_id)
                throw new Error("Email already registered");

            throw new Error("User already exists.");
        }

        throw new Error("Registration failed. Please try again later.");
    }
}


async function verifyOTP(model){
    try{
        const email = model.email_id
        const user = await User.findOne({ email_id:email });
        if (!user) 
            return res.status(404).json({ message: "User not found" });

        if (!user.otp_hash || Date.now() > user.otp_expires_at)
            return res.status(400).json({ message: "OTP expired. Please resend OTP." });

        const otp = model.otp
        const valid = await bcrypt.compare(otp, user.otp_hash);
        if (!valid) 
            return res.status(400).json({ message: "Invalid OTP" });

        user.is_verified=true;
        user.otp_hash=null;
        user.otp_expires_at=null;
        await user.save();

        await welcomeMsg(user.email_id,`${user.first_name} ${user.last_name}`);

        res.json({ message: "Email verified successfully" });
    }catch(err){
        console.error("OTP verification failed:", err);
        throw new Error("Something went wrong while verifying your OTP.");
    }
}

async function resendOTP(model){
    try{
        const email = model.email_id;
        const user = await User.findOne({ email_id:email });
        if (!user) 
            return res.status(404).json({ message: "User not found" });

        if (user.is_verified)
            return res.status(400).json({ message: "Your email is already verified. No OTP is required." });

        await generateAndSendOTP(user);
    }catch(err){
        console.error("Resend OTP failed:", err);
        throw new Error("Something went wrong while resending your OTP.");
    }
}

async function loginUser(model){
    try{
        const email = model.email_id;
        const user = await User.findOne({ email_id:email });
        if (!user) 
            return res.status(404).json({ message: "User not found" });

        if (!user.is_verified)
            return res.status(400).json({ message: "User not verified. " });

        const valid = await bcrypt.compare(model.password,user.password);

        if(!valid)
            return res.status(400).json({ message: "Invalid Password." });

        generateToken(res, user._id);

        return res.status(200).json({ message: "Login successful" });
    }catch(err){
        console.error("Login failed:", err);
        throw new Error("Something went wrong while logging in. Please try again later.");
    }
}

module.exports = {registerNewUser,verifyOTP,resendOTP,loginUser};