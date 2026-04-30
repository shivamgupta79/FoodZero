// server/models/Notification.js

const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true,
    index: true
  },
  type: {
    type: String,
    required: true,
    enum: [
      "donation-accepted",
      "donation-picked_up", 
      "donation-in_transit",
      "donation-delivered",
      "donation-cancelled",
      "new-donation",
      "ngo-request",
      "feedback-received",
      "verification-approved",
      "verification-rejected",
      "geofence-alert",
      "gps-update",
      "system-alert",
      "general"
    ]
  },
  title: {
    type: String,
    required: true,
    maxlength: 100
  },
  message: {
    type: String,
    required: true,
    maxlength: 500
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  priority: {
    type: String,
    enum: ["low", "normal", "high", "critical"],
    default: "normal"
  },
  read: {
    type: Boolean,
    default: false,
    index: true
  },
  readAt: Date,
  channels: {
    socket: { type: Boolean, default: false },
    push: { type: Boolean, default: false },
    sms: { type: Boolean, default: false },
    email: { type: Boolean, default: false }
  },
  deliveryStatus: {
    socket: { 
      sent: { type: Boolean, default: false },
      sentAt: Date,
      error: String
    },
    push: {
      sent: { type: Boolean, default: false },
      sentAt: Date,
      messageId: String,
      error: String
    },
    sms: {
      sent: { type: Boolean, default: false },
      sentAt: Date,
      messageId: String,
      error: String
    },
    email: {
      sent: { type: Boolean, default: false },
      sentAt: Date,
      messageId: String,
      error: String
    }
  },
  expiresAt: {
    type: Date,
    default: function() {
      // Auto-expire notifications after 30 days
      return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    }
  },
  createdAt: { 
    type: Date, 
    default: Date.now,
    index: true
  }
});

// Compound indexes for efficient queries
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, read: 1 });
notificationSchema.index({ userId: 1, type: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Virtual for formatted creation time
notificationSchema.virtual('timeAgo').get(function() {
  const now = new Date();
  const diff = now - this.createdAt;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'Just now';
});

// Static method to get unread count for user
notificationSchema.statics.getUnreadCount = function(userId) {
  return this.countDocuments({ userId, read: false });
};

// Static method to mark all as read for user
notificationSchema.statics.markAllAsRead = function(userId) {
  return this.updateMany(
    { userId, read: false },
    { read: true, readAt: new Date() }
  );
};

// Instance method to mark as read
notificationSchema.methods.markAsRead = function() {
  this.read = true;
  this.readAt = new Date();
  return this.save();
};

// Pre-save middleware to update readAt timestamp
notificationSchema.pre('save', function(next) {
  if (this.isModified('read') && this.read && !this.readAt) {
    this.readAt = new Date();
  }
  next();
});

module.exports = mongoose.model("Notification", notificationSchema);