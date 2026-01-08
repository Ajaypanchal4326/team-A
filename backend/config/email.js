const nodemailer = require("nodemailer")
const dotenv = require("dotenv");
dotenv.config();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, 
  auth: {
    user: "isb.inder59433@gmail.com",
    pass: process.env.GMAIL_PASS,
  },
});

module.exports = transporter;