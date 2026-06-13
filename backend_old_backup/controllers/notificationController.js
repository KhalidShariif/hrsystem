const Notification = require('../models/Notification');

const getNotifications = async (req, res, next) => {
  try {
    const { role } = req.user;
    const notifications = await Notification.find({
      $or: [{ targetRole: role }, { targetRole: 'all' }]
    }).sort({ createdAt: -1 }).limit(50);
    res.json(notifications);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const createNotification = async (req, res, next) => {
  try {
    const notification = new Notification(req.body);
    const savedNotification = await notification.save();
    res.status(201).json(savedNotification);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    if (!notification) return res.status(404).json({ message: 'Notification not found' });
    res.json(notification);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getNotifications,
  createNotification,
  markAsRead
};
