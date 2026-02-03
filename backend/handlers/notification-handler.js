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

async function markNotificationRead(notificationId, userId) {
  try {
    const notification = await Notification.findOne({
      _id: notificationId,
      user_id: userId
    });

    if (!notification) {
      return { status: 404, message: "Notification not found" };
    }

    notification.read = true;
    await notification.save();

    return {
      status: 200,
      message: "Notification marked as read"
    };
  } catch (err) {
    console.error("Mark Notification Read error:", err);
    return {
      status: 500,
      message: "Failed to update notification"
    };
  }
}


async function markAllNotificationsRead(userId) {
  try {
    await Notification.updateMany(
      { user_id: userId, read: false },
      { $set: { read: true } }
    );

    return {
      status: 200,
      message: "All notifications marked as read"
    };
  } catch (err) {
    console.error("Mark All Notifications Read error:", err);
    return {
      status: 500,
      message: "Failed to update notifications"
    };
  }
}

module.exports = {
  getUserNotifications,
  markNotificationRead,
  markAllNotificationsRead
};
