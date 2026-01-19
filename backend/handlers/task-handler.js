const uploadToCloudinary = require('../utils/uploadToCloudinary');
const Task = require('../db/task');

async function createTask(model, file, userId) {
  try {
    let Img = null;
    if (file) {
      try {
        Img = await uploadToCloudinary(file.path, 'tasks');
      } catch (err) {
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
      picture: Img ? Img.secure_url : null,
      user_id: userId,
      status: allowedStatus.includes(model.status) ? model.status : "pending",
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

    if (file) {
      try {
        const uploadedImg = await uploadToCloudinary(file.path, "tasks");
        imageUrl = uploadedImg.secure_url;
      } catch (err) {
        return {
          status: 500,
          message: "Failed to upload image. Please try again."
        };
      }
    }

    const allowedStatus = ["pending", "active", "completed", "cancelled"];

    task.title = model.title ?? task.title;
    task.description = model.description ?? task.description;
    task.location = model.location ?? task.location;
    task.start_time = model.start_time ?? task.start_time;
    task.end_time = model.end_time ?? task.end_time;
    task.picture = imageUrl;
    task.status = allowedStatus.includes(model.status) ? model.status : task.status;

    await task.save();

    return {
      status: 200,
      message: "Task updated successfully",
      task
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
    const tasks = await Task.find({ user_id: userId })
      .sort({ createdAt: -1 });

    return {
      status: 200,
      message: "User tasks fetched successfully",
      tasks
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
    const tasks = await Task.find({
      user_id: { $ne: userId }
    }).sort({ createdAt: -1 });

    return {
      status: 200,
      message: "Other users tasks fetched successfully",
      tasks
    };
  } catch (err) {
    console.error("Get Other User Tasks error:", err);
    return {
      status: 500,
      message: "Failed to fetch other users tasks"
    };
  }
}


async function changeTaskStatus(taskId, status, userId) {
  try {
    const allowedStatus = ["pending", "active", "completed", "cancelled"];

    if (!allowedStatus.includes(status)) {
      return {
        status: 400,
        message: "Invalid status value"
      };
    }

    const task = await Task.findById(taskId);

    if (!task) {
      return {
        status: 404,
        message: "Task not found"
      };
    }

    if (task.user_id.toString() !== userId.toString()) {
      return {
        status: 403,
        message: "You are not allowed to change status of this task"
      };
    }

    task.status = status;
    await task.save();

    return {
      status: 200,
      message: "Task status updated successfully",
      task
    };
  } catch (err) {
    console.error("Change Task Status error:", err);
    return {
      status: 500,
      message: "Failed to update task status"
    };
  }
}


module.exports = {
  createTask,
  updateTask,
  getUserTasks,
  getOtherUserTasks,
  changeTaskStatus
};
