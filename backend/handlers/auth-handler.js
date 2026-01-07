const User = require("../db/user")
const bcrypt = require("bcryptjs")
const { generateAndSendOTP,welcomeMsg } = require("../utils/otp")
const generateToken = require("../utils/generateToken")

async function updateExistingUser(model){
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
        let user = await User.findOne({ email_id:model.email_id });
        user.first_name=model.first_name;
        user.last_name=model.last_name;
        user.phone_number=model.phone_number;
        user.email_id=model.email_id;
        user.password=hashPassword;

        await user.save();
        try{
            await generateAndSendOTP(user);
        }catch(err){
            console.error("Problem Sending OTP:", err);
        }
    }catch(err){
        console.error("Database save failed:", err);
        if (err && err.code === 11000) {
            throw err; 
        }
        throw err;
    }
}
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

        await user.save();
        try{
            await generateAndSendOTP(user);
        }catch(err){
            console.error("Problem Sending OTP:", err);
        }
    }catch(err){
        console.error("Database save failed:", err);
        if (err && err.code === 11000) {
            throw err; 
        }
        throw err;
    }
}


async function verifyOTP(model){
    try{
        const email = model.email_id;
        const user = await User.findOne({ email_id:email });
        if (!user)
            return { status: 404, message: "User not found" };

        if (!user.otp_hash || Date.now() > user.otp_expires_at)
            return { status: 400, message: "OTP expired. Please resend OTP." };

        const otp = model.otp;
        const valid = await bcrypt.compare(otp, user.otp_hash);
        if (!valid)
            return { status: 400, message: "Invalid OTP" };

        user.is_verified=true;
        user.otp_hash=null;
        user.otp_expires_at=null;
        await user.save();

        try{
            await welcomeMsg(user.email_id, `${user.first_name} ${user.last_name}`);
        }catch(err){
            console.error("Welcome message failed:", err);
        }

        return { status: 200, message: "Email verified successfully" };
    }catch(err){
        console.error("OTP verification failed:", err);
        return { status: 500, message: "Something went wrong while verifying your OTP." };
    }
}

async function resendOTP(model){
    try{
        const email = model.email_id;
        const user = await User.findOne({ email_id:email });
        if (!user)
            return { status: 404, message: "User not found" };

        if (user.is_verified)
            return { status: 400, message: "Your email is already verified. No OTP is required." };

        await generateAndSendOTP(user);
        return { status: 200, message: "OTP resent successfully" };
    }catch(err){
        console.error("Resend OTP failed:", err);
        return { status: 500, message: "Something went wrong while resending your OTP." };
    }
}

async function loginUser(model, res){
    try{
        const email = model.email_id;
        const user = await User.findOne({ email_id:email });
        if (!user)
            return { status: 404, message: "User not found" };

        if (!user.is_verified)
            return { status: 400, message: "User not verified." };

        const valid = await bcrypt.compare(model.password,user.password);

        if(!valid)
            return { status: 400, message: "Invalid Password." };

        generateToken(res, user._id);

        return { status: 200, message: "Login successful" };
    }catch(err){
        console.error("Login failed:", err);
        return { status: 500, message: "Something went wrong while logging in. Please try again later." };
    }
}

module.exports = {registerNewUser,verifyOTP,resendOTP,loginUser,updateExistingUser};