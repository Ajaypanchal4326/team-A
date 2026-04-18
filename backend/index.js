const express = require("express");
const cors = require("cors");
const app = express();
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const helmet = require("helmet");
const { rateLimit } = require("express-rate-limit");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth")
const taskRoutes = require("./routes/task")
const requestsRoutes = require("./routes/requests")
const notificationsRoutes = require("./routes/notification")
const userRoutes = require("./routes/user")
const authmiddleware = require("./middleware/auth-middleware");
dotenv.config();

app.set("trust proxy", 1);

const apiLimiter = rateLimit({
    windowMs: Number(process.env.API_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    limit: Number(process.env.API_RATE_LIMIT_MAX) || 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many requests, please try again later." }
});

const authLimiter = rateLimit({
    windowMs: Number(process.env.AUTH_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    limit: Number(process.env.AUTH_RATE_LIMIT_MAX) || 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many auth requests, please try again later." }
});

app.use(express.json());
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,              
}));
app.use(cookieParser());
app.use(helmet());

app.use("/api", apiLimiter);


app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/task", authmiddleware, taskRoutes);
app.use("/api/requests", authmiddleware, requestsRoutes);
app.use("/api/notifications", authmiddleware, notificationsRoutes);
app.use("/api/user", authmiddleware, userRoutes);

app.use((err, req, res, next) => {
    console.error("Unhandled error:", err);

    if (res.headersSent) {
        return next(err);
    }

    const status = err.statusCode || err.status || 500;
    const isProd = process.env.NODE_ENV === "production";

    return res.status(status).json({
        message: isProd ? "Internal server error" : (err.message || "Internal server error")
    });
});

const PORT = process.env.PORT || 5000;

async function startServer() {
    await connectDB();

    app.listen(PORT, () => {
        console.log(`Server started on port ${PORT}`);
    });
}

startServer().catch((err) => {
    console.error(err.message);
    process.exit(1);
});
