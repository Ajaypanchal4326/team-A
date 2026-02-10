const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const transporter = require("../config/email.js");
const { Welcome_Email_Template, Verification_Email_Template } = require("./emailTemplates.js")

dotenv.config();

async function generateAndSendOTP(user, path, email = null) {
    const otp = Math.floor(100000 + Math.random() * 900000);
    const salt = await bcrypt.genSalt(10);
    const hashotp = await bcrypt.hash(otp.toString(), salt);

    user.otp_hash = hashotp;
    user.otp_expires_at = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes validity
    user.otp_attempts = 0;
    user.otp_blocked_time = null;

    if (path) {
        user.password_is_verified = false;
    }

    await user.save();
    await sendOTPEmail(otp, email || user.email_id);
}

/**
 * Sends an OTP email to the specified address.
 */
async function sendOTPEmail(otp, email) {
    try {
        const response = await transporter.sendMail({
            from: '"Account Security" <isb.inder59433@gmail.com>',
            to: email,
            subject: "Your OTP Code for Account Verification",
            text: `Your One-Time Password is ${otp}. It is valid for 10 minutes. Do not share it with anyone.`,
            html: Verification_Email_Template.replace("{otp}", otp)
        });
        console.log('OTP Email sent Successfully', response.messageId);
    } catch (err) {
        console.error("OTP email failed:", err.message);
        throw new Error("Failed to send OTP email");
    }
}

/**
 * Sends a welcome message after successful verification.
 */
async function welcomeMsg(email, name) {
    try {
        const response = await transporter.sendMail({
            from: '"Support Team" <isb.inder59433@gmail.com>',
            to: email,
            subject: "Welcome — Your Account is Successfully Verified 🎉",
            text: `Welcome ${name}! Your account has been successfully created and verified.`,
            html: Welcome_Email_Template.replace("{name}", name)
        });
        console.log('Welcome Email sent Successfully:', response.messageId);
    } catch (err) {
        console.error("Welcome email failed:", err.message);
        throw new Error("Failed to send Welcome email");
    }
}

module.exports = { welcomeMsg, generateAndSendOTP };
