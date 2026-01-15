const express = require("express");
const router = express.Router();
const { createTask, getUserTasks, updateTask, getOtherUserTasks } = require("../handlers/task-handler");
const upload = require("../middleware/multer.middleware");


router.post("/create", upload.single("picture"), async(req, res) => {
    try{
        const model = req.body;
        if( !model.title || !model.start_time || !model.location )
            return res.status(400).json({ message : "Title, Start Time and Location are required." });

        const result = await createTask(model,req.file,req.user._id);
        return res.status(result.status).json({ message: result.message, taskId: result.taskId });
    }catch(err){
        console.error("Create Task Route error:", err);
        return res.status(500).json({ message : "Something went wrong while saving your task." });
    }
});

module.exports = router;