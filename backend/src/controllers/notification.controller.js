const Notification = require("../models/notification.model");

const getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.getNotificationsByUserId(
      req.user.userId
    );

    res.status(200).json({
      data: notifications
    });
  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
};

const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.markNotificationAsRead(
      notificationId,
      req.user.userId
    );

    res.status(200).json({
      message: "Notification marked as read",
      data: notification
    });
  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
};

module.exports = {
  getMyNotifications,
  markAsRead
};