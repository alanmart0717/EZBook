const express = require("express");
const router = express.Router();

const NotificationController = require("../controllers/notification.controller");
const authenticateUser = require("../middleware/auth.middleware");

router.get(
  "/me",
  authenticateUser,
  NotificationController.getMyNotifications
);

router.patch(
  "/:notificationId/read",
  authenticateUser,
  NotificationController.markAsRead
);

module.exports = router;