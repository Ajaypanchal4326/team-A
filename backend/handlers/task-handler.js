const uploadToCloudinary = require('../utils/uploadToCloudinary');
const deleteFromCloudinary = require("../utils/deleteFromCloudinary");
const Requests = require('../db/requests');
const Task = require('../db/task');

async function createTask(model, file, userId) {
  try {
    let Img = null;
    if (file) {
      try {
        Img = await uploadToCloudinary(file.path, 'tasks');
      } catch (err) {
        console.error("Failed to upload image to Cloudinary:", err);
        Img = null;
      }
    }

    let task = new Task({
      user_id: userId,
      title: model.title,
      description: model.description || '',
      location: model.location,
      start_time: model.start_time,
      end_time: model.end_time || null,
      category: model.category,
      picture: Img ? Img.secure_url : null,
      picture_public_id: Img ? Img.public_id : null
    });

    await task.save();
    return { status: 201, message: "Task created successfully.", taskId: task._id };
  } catch (err) {
    console.error("Create Task error:", err);
    return { status: 500, message: "Something went wrong while saving your task." };
  }
};


async function updateTask(taskId, model, file, userId) {
  try {
    const task = await Task.findById(taskId);

    if (!task) {
      return { status: 404, message: "Task not found" };
    }

    if (task.user_id.toString() !== userId.toString()) {
      return { status: 403, message: "You are not allowed to edit this task" };
    }

    let imageUrl = task.picture;
    let publicId = task.picture_public_id;

    if (file) {
      try {
        const uploadedImg = await uploadToCloudinary(file.path, "tasks");

        if (publicId) {
          try {
            await deleteFromCloudinary(publicId);
          } catch (err) {
            console.error("Failed to delete old image from Cloudinary:", err);
          }
        }
        
        imageUrl = uploadedImg.secure_url;
        publicId = uploadedImg.public_id;
      } catch (err) {
        return {
          status: 500,
          message: "Failed to upload image. Please try again."
        };
      }
    }

    task.title = model.title ?? task.title;
    task.description = model.description ?? task.description;
    task.location = model.location ?? task.location;
    task.start_time = model.start_time ?? task.start_time;
    task.end_time = model.end_time ?? task.end_time;
    task.category = model.category ?? task.category;
    task.picture = imageUrl;
    task.picture_public_id = publicId;
    task.status = task.prev_status === "assigned" ? "assigned" : "open";

    await task.save();

    return {
      status: 200,
      message: "Task updated successfully",
      taskId: task._id 
    };
  } catch (err) {
    console.error("Update Task error:", err);
    return {
      status: 500,
      message: "Something went wrong while updating the task"
    };
  }
}


async function getUserTasks(userId) {
  try {
    const user_tasks = await Task.find({ user_id: userId })
    .select("title description location picture status start_time end_time category")
    .sort({ createdAt: -1 })
    .lean();

    return {
      status: 200,
      message: "User tasks fetched successfully",
      tasks : user_tasks
    };
  } catch (err) {
    console.error("Get User Tasks error:", err);
    return {
      status: 500,
      message: "Failed to fetch user tasks"
    };
  }
}

async function getOtherUserTasks(userId) {
  try {
    const other_user_tasks = await Task.find({ 
      user_id: { $ne: userId },
      status: { $in: ["open"] }
    })
    .select("title description location picture status start_time end_time category user_id")
    .populate({
        path: "user_id",
        select: "first_name last_name profile_picture -_id"
    })
    .sort({ createdAt: -1 })
    .lean();

    const userRequests = await Requests.find(
      { requester_id: userId },
      { task_id: 1, _id: 0, status: 1, rejectedAt: 1}
    ).lean();

    const oneDay = 24 * 60 * 60 * 1000;
    const now = Date.now();

    const requestMap = new Map();

    for (const req of userRequests) {
      let blockRequest = false;

      if (req.status === "pending" || req.status === "accepted") {
        blockRequest = true;
      }

      if (req.status === "rejected") {
        if (!req.rejectedAt) {
          blockRequest = true;
        } else {
          const rejectedTime = new Date(req.rejectedAt).getTime();
          if (now - rejectedTime < oneDay) {
            blockRequest = true;
          }
        }
      }

      requestMap.set(req.task_id.toString(), blockRequest);
    }

    const tasksWithRequestStatus = other_user_tasks.map(task => ({
      ...task,
      hasRequested: requestMap.get(task._id.toString()) || false,
    }));

    return {
      status: 200,
      message: "Other users tasks fetched successfully",
      tasks : tasksWithRequestStatus
    };
  } catch (err) {
    console.error("Get Other User Tasks error:", err);
    return {
      status: 500,
      message: "Failed to fetch other users tasks"
    };
  }
}



module.exports = {
  createTask,
  updateTask,
  getUserTasks,
  getOtherUserTasks
};
