const jwt = require("jsonwebtoken");

function generateToken(rememberMe,userId) {
    const expiresIn = rememberMe ? "30d" : "2h";
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn });
    return token;
};

module.exports = generateToken;