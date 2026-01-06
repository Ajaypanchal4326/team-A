const jwt = require("jsonwebtoken");

function generateToken(res, userId) {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.cookie(process.env.COOKIE_NAME, token, {
        httpOnly: true,
        secure: false,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return token;
};

module.exports = generateToken;