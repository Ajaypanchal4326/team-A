const mongoose = require("mongoose");
const autoCloseTasksJob = require("../utils/autoCloseTasks");

async function connectDB() {
    try{
        const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || process.env.DATABASE_URL;

        if (!mongoUri) {
            throw new Error("Missing MongoDB connection string. Set MONGO_URI, MONGODB_URI, or DATABASE_URL in backend/.env");
        }

        await mongoose.connect(mongoUri);
        console.log("MongoDb connected")
        autoCloseTasksJob();
    }catch(err){
        console.error(err.message);
        process.exit(1);
    }
};

module.exports = connectDB;
