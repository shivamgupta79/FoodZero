// server/routes/notifications.js

const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");
const { protect } = require("../middleware/authMiddleware");

// All routes require authentication
router.use(protect);

// Get user notifications
router.get("/", notificationController.getNotifications);

// Get unread notification count
router.get("/unread-count", notificationController.getUnreadCount);

// Mark notifications as read
router.post("/mark-read", notificationController.markAsRead);

// Delete specific notification
router.delete("/:notificationId", notificationController.deleteNotification);

// Clear all notifications
router.delete("/", notificationController.clearAllNotifications);

// Get notification preferences
router.get("/preferences", notificationController.getPreferences);

// Update notification preferences
router.put("/preferences", notificationController.updatePreferences);

// Register FCM token for push notifications
router.post("/fcm-token", notificationController.registerFCMToken);

// Send test notification
router.post("/test", notificationController.sendTestNotification);

// Admin routes
router.get("/stats", notificationController.getNotificationStats);
router.post("/broadcast", notificationController.broadcastNotification);

module.exports = router;