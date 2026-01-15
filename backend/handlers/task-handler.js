const uploadToCloudinary = require('../utils/uploadToCloudinary');
const Task = require('../db/task'); 

async function createTask(model, file, userId) {
    try{
        let Img = null;
        if (file) {
            try{
                Img = await uploadToCloudinary(file.path, 'tasks');
            }catch(err){
                return { 
                    status: 500, 
                    message: "Failed to upload image to cloud. Please try again later." 
                };
            }
        }
        const allowedStatus = ["pending", "active", "completed", "cancelled"];

        let task = new Task({
            title: model.title,
            description: model.description || '',
            location: model.location,  
            start_time: model.start_time,
            end_time: model.end_time || null,
            picture: Img.secure_url || null,
            user_id: userId,
            status: allowedStatus.includes(model.status) ? model.status : "pending",
        });

        await task.save();
        return { status: 201, message: "Task created successfully.", taskId: task._id };
    }catch(err){
        console.error("Create Task error:", err);
        return { status: 500, message: "Something went wrong while saving your task."};
    }
};



module.exports = {
    createTask,
};