const notificationService = require("../services/notificationService");

exports.getNotifications = async (req, res, next) => {
  try {
    const notifications = await notificationService.getNotifications(req.user.id, req.query);
    res.json(notifications);
  } catch (error) {
    next(error);
  }
};

exports.markAsRead = async (req, res, next) => {
  try {
    const notification = await notificationService.markAsRead(req.params.id, req.user.id);
    res.json({ message: "Notification marked as read.", data: notification });
  } catch (error) {
    next(error);
  }
};
