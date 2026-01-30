const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth-middleware");
const { getUserNotifications,markNotificationRead, markAllNotificationsRead} = require("../handlers/notification-handler");

router.get("/", protect, async (req, res) => {
  const result = await getUserNotifications(req.user._id);
  return res.status(result.status).json(result);
});


router.put("/:notificationId/read", protect, async (req, res) => {
  const { notificationId } = req.params;

  const result = await markNotificationRead(
    notificationId,
    req.user._id
  );

  return res.status(result.status).json(result);
});


router.put("/read-all", protect, async (req, res) => {
  const result = await markAllNotificationsRead(req.user._id);
  return res.status(result.status).json(result);
});



module.exports = router;
