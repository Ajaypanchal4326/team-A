const nodemailer = require("nodemailer")
const dotenv = require("dotenv");
dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "isb.inder59433@gmail.com",
    pass: process.env.GMAIL_PASS,
  },
});

module.exports = transporter;