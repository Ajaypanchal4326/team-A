const Requests = require("../db/requests");
const Task = require("../db/task");
const AcceptedTasks = require("../db/acceptedTasks");
const Notifications = require("../db/notification");

async function createRequest(model, taskId, requesterId, requesterName) {
    try {
        const task = await Task.findById(taskId);
        if (!task)

            return { status: 404, message: "Task not found" };

        if (task.status !== "open")
            return { status: 400, message: "Task is not available for requests" };

        if (task.user_id.toString() === requesterId.toString())
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

        try {
            const notification = new Notifications({
                user_id: task.user_id,
                message: `New request received for your task "${task.title}" from ${requesterName}.`
            });
            await notification.save();
        } catch (err) {
            console.error("Error sending notification:", err);
        }
        return { status: 201, message: "Request sent successfully", requestId: newRequest._id };
    } catch (err) {
        console.error("Error creating request:", err);
        return { status: 500, message: "Failed to save the request" };
    }
};

async function getReceivedRequests(userId) {
    try {
        const tasks = await Task.find({ user_id: userId }).select("_id title");

        if (!tasks.length) {
            return { status: 200, data: [] };
        }

        const taskIds = tasks.map(t => t._id);

        const requests = await Requests.find({
            task_id: { $in: taskIds }
        })
            .populate("requester_id", "first_name last_name profile_picture")
            .populate("task_id", "title")
            .sort({ createdAt: -1 });

        const response = requests.map(r => ({
            requestId: r._id,
            taskTitle: r.task_id.title,
            requester: {
                name: `${r.requester_id.first_name} ${r.requester_id.last_name}`,
                profile_picture: r.requester_id.profile_picture
            },
            status: r.status,
            isOwner: true
        }));

        return { status: 200, data: response };
    } catch (err) {
        console.error("Get received requests error:", err);
        return { status: 500, data: [] };
    }
}


async function updateRequestStatus(requestId, action, loggedInUserId) {
    try {
        const request = await Requests.findById(requestId).populate("task_id");

        if (!request)
            return { status: 404, message: "Request not found" };

        if (request.task_id.user_id.toString() !== loggedInUserId.toString()) {
            return { status: 403, message: "Not authorized" };
        }

        if (request.status !== "pending") {
            return { status: 400, message: "Request already processed" };
        }

        if (action === "rejected") {
            request.status = "rejected";
            await request.save();

            await Notifications.create({
                user_id: request.requester_id,
                message: `Your request for "${request.task_id.title}" was rejected.`
            });

            return { status: 200, message: "Request rejected successfully" };
        }

        request.status = "accepted";
        await request.save();

        await AcceptedTasks.create({
            task_id: request.task_id._id,
            user_id: request.requester_id,
            status: "accepted"
        });

        await Requests.updateMany(
            {
                task_id: request.task_id._id,
                _id: { $ne: requestId },
                status: "pending"
            },
            { status: "rejected" }
        );

        await Task.findByIdAndUpdate(request.task_id._id, {
            status: "assigned"
        });

        await Notifications.create({
            user_id: request.requester_id,
            message: `Your request for "${request.task_id.title}" was accepted!`
        });

        return { status: 200, message: "Request accepted successfully" };
    } catch (err) {
        console.error("Update request status error:", err);
        return { status: 500, message: "Failed to update request" };
    }
}

module.exports = {
    createRequest,
    getReceivedRequests,
    updateRequestStatus,
};