const express = require("express");
const cors = require("cors");
const app = express();
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth")
const taskRoutes = require("./routes/task")
const requestsRoutes = require("./routes/requests")
const authmiddleware = require("./middleware/auth-middleware");
dotenv.config();

app.use(express.json());
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,              
}));
app.use(cookieParser());


app.use("/api/auth", authRoutes);
app.use("/api/task", authmiddleware, taskRoutes);
app.use("/api/requests", authmiddleware, requestsRoutes);

connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
