// server/controllers/notificationController.js

const notificationService = require("../services/notificationService");
const User = require("../models/User");

/**
 * Get user notifications with pagination
 */
exports.getNotifications = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const type = req.query.type; // Optional filter by type

    const result = await notificationService.getUserNotifications(req.user._id, page, limit, type);
    
    res.json(result);
  } catch (error) {
    console.error("Error getting notifications:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Mark notifications as read
 */
exports.markAsRead = async (req, res) => {
  try {
    const { notificationIds } = req.body;

    const result = await notificationService.markAsRead(req.user._id, notificationIds);
    
    res.json(result);
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get unread notification count
 */
exports.getUnreadCount = async (req, res) => {
  try {
    const Notification = require("../models/Notification");
    const count = await Notification.getUnreadCount(req.user._id);
    
    res.json({ unreadCount: count });
  } catch (error) {
    console.error("Error getting unread count:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Update notification preferences
 */
exports.updatePreferences = async (req, res) => {
  try {
    const {
      push = true,
      sms = false,
      email = true,
      whatsapp = true,
      quietHours = null,
      types = {}
    } = req.body;

    // Validate quiet hours format
    if (quietHours && (!quietHours.start || !quietHours.end)) {
      return res.status(400).json({ 
        message: "Quiet hours must include start and end times" 
      });
    }

    const preferences = {
      push,
      sms,
      email,
      whatsapp,
      quietHours,
      ...types // Specific type preferences (donation-accepted: true, etc.)
    };

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { notificationPreferences: preferences },
      { new: true }
    ).select("notificationPreferences");

    res.json({
      success: true,
      message: "Notification preferences updated",
      preferences: user.notificationPreferences
    });
  } catch (error) {
    console.error("Error updating notification preferences:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get notification preferences
 */
exports.getPreferences = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("notificationPreferences");
    
    const defaultPreferences = {
      push: true,
      sms: false,
      email: true,
      whatsapp: true,
      quietHours: null,
      "donation-accepted": true,
      "donation-delivered": true,
      "new-donation": true,
      "geofence-alert": true
    };

    const preferences = { ...defaultPreferences, ...user.notificationPreferences };
    
    res.json({ preferences });
  } catch (error) {
    console.error("Error getting notification preferences:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Send test notification
 */
exports.sendTestNotification = async (req, res) => {
  try {
    const { type = "general", channels = ["socket"] } = req.body;

    const io = req.app.get("io");
    
    const result = await notificationService.sendNotification({
      userId: req.user._id,
      type: type,
      title: "Test Notification 🧪",
      message: "This is a test notification to verify your settings are working correctly.",
      data: {
        test: true,
        timestamp: new Date(),
        io: io
      },
      channels: channels,
      priority: "normal"
    });

    res.json({
      success: true,
      message: "Test notification sent",
      results: result.results
    });
  } catch (error) {
    console.error("Error sending test notification:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Register FCM token for push notifications
 */
exports.registerFCMToken = async (req, res) => {
  try {
    const { fcmToken } = req.body;

    if (!fcmToken) {
      return res.status(400).json({ message: "FCM token is required" });
    }

    await User.findByIdAndUpdate(req.user._id, { fcmToken });

    res.json({
      success: true,
      message: "FCM token registered successfully"
    });
  } catch (error) {
    console.error("Error registering FCM token:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Delete notification
 */
exports.deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const Notification = require("../models/Notification");

    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      userId: req.user._id
    });

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json({
      success: true,
      message: "Notification deleted"
    });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Clear all notifications
 */
exports.clearAllNotifications = async (req, res) => {
  try {
    const Notification = require("../models/Notification");
    
    const result = await Notification.deleteMany({ userId: req.user._id });

    res.json({
      success: true,
      message: `${result.deletedCount} notifications cleared`
    });
  } catch (error) {
    console.error("Error clearing notifications:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get notification statistics (Admin only)
 */
exports.getNotificationStats = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const Notification = require("../models/Notification");
    
    const stats = await Notification.aggregate([
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 },
          unreadCount: {
            $sum: { $cond: [{ $eq: ["$read", false] }, 1, 0] }
          }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const totalNotifications = await Notification.countDocuments();
    const totalUnread = await Notification.countDocuments({ read: false });

    res.json({
      totalNotifications,
      totalUnread,
      byType: stats
    });
  } catch (error) {
    console.error("Error getting notification stats:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Broadcast notification to all users (Admin only)
 */
exports.broadcastNotification = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const { title, message, type = "system-alert", priority = "normal", targetRole } = req.body;

    if (!title || !message) {
      return res.status(400).json({ message: "Title and message are required" });
    }

    // Get target users
    let query = {};
    if (targetRole && ["donor", "ngo"].includes(targetRole)) {
      query.role = targetRole;
    }

    const users = await User.find(query).select("_id");
    const io = req.app.get("io");

    // Send to all target users
    const results = await Promise.all(
      users.map(user => 
        notificationService.sendNotification({
          userId: user._id,
          type: type,
          title: title,
          message: message,
          data: {
            broadcast: true,
            adminId: req.user._id,
            io: io
          },
          channels: ["socket", "push"],
          priority: priority
        })
      )
    );

    const successCount = results.filter(r => r.success).length;

    res.json({
      success: true,
      message: `Broadcast sent to ${successCount}/${users.length} users`,
      targetUsers: users.length,
      successCount
    });
  } catch (error) {
    console.error("Error broadcasting notification:", error);
    res.status(500).json({ message: error.message });
  }
};