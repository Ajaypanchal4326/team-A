const mongoose = require("mongoose");
const Requests = require("./db/requests");
const Task = require("./db/task");
const User = require("./db/user");

const MONGO_URI = "mongodb+srv://db_user:1a2b3c4d@cluster0.74bwd8n.mongodb.net/hirehelper-db";

async function run() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to DB");

        // Find last 5 requests
        const requests = await Requests.find().sort({ createdAt: -1 }).limit(5).lean();

        if (!requests.length) {
            console.log("No requests found");
            return;
        }

        for (const req of requests) {
            console.log(`\n========================================`);
            console.log(`Request ID: ${req._id}`);
            console.log(`Task ID (Raw): ${req.task_id} (Type: ${typeof req.task_id})`);
            console.log(`Requester ID (Raw): ${req.requester_id} (Type: ${typeof req.requester_id})`);

            // Check Task Existence directly
            const task = await Task.findOne({ _id: req.task_id }).lean();
            if (!task) {
                console.log("❌ CRITICAL: Task document NOT found in Task collection!");
                continue;
            } else {
                console.log(`✅ Task Found: Title="${task.title}", Status="${task.status}"`);
                console.log(`   Task User ID (Owner): ${task.user_id} (Type: ${typeof task.user_id})`);

                // Check User Existence directly
                const user = await User.findOne({ _id: task.user_id }).lean();
                if (!user) {
                    console.log("❌ CRITICAL: User (Owner) document NOT found in User collection!");
                } else {
                    console.log(`✅ Owner Found: Name="${user.first_name} ${user.last_name}"`);
                }
            }

            // Test Populate
            const populatedRequest = await Requests.findById(req._id)
                .populate({
                    path: "task_id",
                    populate: { path: "user_id" }
                })
                .lean();

            console.log("--- Population Test ---");
            if (populatedRequest.task_id && typeof populatedRequest.task_id === 'object') {
                console.log("Task Populated: YES");
                const taskOwner = populatedRequest.task_id.user_id;
                if (taskOwner && typeof taskOwner === 'object') {
                    console.log(`Owner Populated: YES -> Name: ${taskOwner.first_name} ${taskOwner.last_name}`);
                } else {
                    console.log(`❌ Owner Population FAILED. Value:`, taskOwner);
                }
            } else {
                console.log("❌ Task Population FAILED. Value:", populatedRequest.task_id);
            }
        }

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await mongoose.disconnect();
    }
}

run();
