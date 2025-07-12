const sendNotification = require('../utils/notify');
const Notification = require('../models/Notification');

// POST /api/notifications/user
exports.sendNotificationToUser = async (req, res) => {
  try {
    const { userId, message, type = 'order' } = req.body;

    if (!userId || !message) {
      return res.status(400).json({ success: false, message: "Missing userId or message" });
    }

    // 🔥 Save in DB
    const dbNotif = await Notification.create({
      user: userId,
      message,
      type,
    });

    // 🔥 Send via socket
    sendNotification(`user_${userId}`, {
      type,
      message,
      timestamp: dbNotif.createdAt,
    });

    return res.status(200).json({ success: true, notification: dbNotif });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
// works

// GET /api/notifications/user/:id
exports.getUserNotifications = async (req, res) => {
  try {
    const userId = req.params.id;

    const notifications = await Notification.find({
      user: userId,
      isDeleted: false
    }).sort({ createdAt: -1 });

    return res.status(200).json({ success: true, data: notifications });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
// works