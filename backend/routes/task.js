const express = require("express");
const router = express.Router();
const { createTask, getUserTasks, updateTask, getOtherUserTasks, changeTaskStatus } = require("../handlers/task-handler");
const upload = require("../middleware/multer.middleware");
const validator = require("validator");


router.post("/create", upload.single("picture"), async (req, res) => {
  try {
    const model = req.body;
    if (!model.title || !model.start_time || !model.location)
      return res.status(400).json({ message: "Title, Start Time and Location are required." });

    if (new Date(model.start_time) > new Date(model.endTime))
      return res.status(400).json({ message: "Start Time cannot be greater than End Time." });

    if (new Date(model.start_time) < new Date())
      return res.status(400).json({ message: "Start Time cannot be in the past." });

    const result = await createTask(model, req.file, req.user._id);
    return res.status(result.status).json({ message: result.message, taskId: result.taskId });
  } catch (err) {
    console.error("Create Task Route error:", err);
    return res.status(500).json({ message: "Something went wrong while saving your task." });
  }
});

router.get("/me",async (req, res) => {
  try{
    const result = await getUserTasks(req.user._id);
    return res.status(result.status).json({message: result.message, tasks: result.tasks });
  }catch(err){
    console.error("Get User Tasks Route error:", err);
    return res.status(500).json({ message : "Something went wrong while fetching your tasks." });
  }
});

router.get("/other", async (req, res) => {
  try{
    const result = await getOtherUserTasks(req.user._id);
    return res.status(result.status).json({message: result.message, tasks: result.tasks });
    }catch(err){
      console.error("Get Other Users Tasks Route error:", err);
      return res.status(500).json({ message : "Something went wrong while fetching other users tasks." });
    }
});

router.put("/:taskId",upload.single("picture"),async (req, res) => {
    try{
      const { taskId } = req.params;
      model = req.body;
      if (!validator.isUUID(taskId)) {
        return res.status(400).json({ message: "Invalid Task ID" });
      }

      if (new Date(model.start_time) > new Date(model.endTime))
      return res.status(400).json({ message: "Start Time cannot be greater than End Time." });

      if (new Date(model.start_time) < new Date())
        return res.status(400).json({ message: "Start Time cannot be in the past." });
      
      const result = await updateTask(
        taskId,
        model,
        req.file,
        req.user._id
      );
      return res.status(result.status).json({ message: result.message, taskId: result.taskId});
    }catch(err){
        console.error("Update Task Route error:", err);
        return res.status(500).json({ message : "Something went wrong while updating your task." });
    }
  }
);

module.exports = router;
