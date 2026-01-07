const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const userSchema = new mongoose.Schema({
        _id: { type: String, default: uuidv4 },
        first_name: { type: String, required: true },
        last_name:  { type: String, required: true },
        phone_number: { 
            type: String, 
            required: true, 
            unique:true 
        },
        email_id: {
            type: String, 
            required: true, 
            unique: true, 
            index: true
        },
        password: { type: String, required: true },
        profile_picture: { type: String },
        otp_hash: { type: String, default: null },
        otp_expires_at: { type: Date, default: null },
        is_verified: { type: Boolean, default: false }
    },
    { timestamps: true, _id: false }
);
const User = mongoose.model("User",userSchema);
module.exports = User;