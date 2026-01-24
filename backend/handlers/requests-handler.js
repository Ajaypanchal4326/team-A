const Requests = require("../db/requests");
const Task = require("../db/task");
const AcceptedTasks = require("../db/acceptedTasks");
const Notifications = require("../db/notification");

async function createRequest(model,taskId,requesterId,requesterName) {
    try{
        const task = await Task.findById(taskId);
        if (!task)

            return { status: 404, message: "Task not found" };

        if(task.status !== "open")
            return { status: 400, message: "Task is not available for requests" };

        if(task.user_id.toString() === requesterId.toString())
            return { status: 403, message: "You cannot send a request for your own task" };

        const requestExists = await Requests.findOne({ task_id: taskId, requester_id: requesterId });
        if (requestExists)
            return { status: 409, message: "You have already sent a request for this task" };


        const newRequest = new Requests({
            task_id: taskId,
            requester_id: requesterId,
            description: model.description,
            status: "pending"
        });
        await newRequest.save();

        try{
            const notification = new Notifications({
                user_id: task.user_id,
                message: `New request received for your task "${task.title}" from ${requesterName}.`
            });
            await notification.save();
        }catch(err){
            console.error("Error sending notification:", err);
        }
        return { status: 201, message: "Request sent successfully", requestId: newRequest._id };
    }catch(err){
        console.error("Error creating request:", err);
        return { status: 500, message: "Failed to save the request" };
    }
};

module.exports = {
    createRequest,
};