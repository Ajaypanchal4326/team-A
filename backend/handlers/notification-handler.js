const Notification = require("../db/notification");

async function getUserNotifications(userId) {
  try {
    const notifications = await Notification.find({
      user_id: userId,
      read: false
    }).sort({ createdAt: -1 });

    return {
      status: 200,
      notifications
    };
  } catch (err) {
    console.error("Get Notifications error:", err);
    return {
      status: 500,
      message: "Failed to fetch notifications"
    };
  }
}

module.exports = {
  getUserNotifications
};
