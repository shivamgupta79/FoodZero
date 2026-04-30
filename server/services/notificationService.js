// server/services/notificationService.js

/**
 * Enhanced Notification Service
 * 
 * Features:
 * 1. Push notifications (Firebase FCM)
 * 2. SMS notifications (Twilio)
 * 3. Email notifications (SendGrid)
 * 4. In-app notifications with persistence
 * 5. Notification preferences management
 */

const User = require("../models/User");
const Notification = require("../models/Notification");

class NotificationService {
  constructor() {
    // Initialize services (add API keys to .env)
    this.fcm = null; // Firebase Cloud Messaging
    this.twilio = null; // Twilio SMS
    this.sendgrid = null; // SendGrid Email
    
    this.initializeServices();
  }

  /**
   * Initialize external notification services
   */
  initializeServices() {
    try {
      // Firebase FCM (uncomment when you add firebase-admin)
      // const admin = require('firebase-admin');
      // const serviceAccount = require('../config/firebase-service-account.json');
      // admin.initializeApp({
      //   credential: admin.credential.cert(serviceAccount)
      // });
      // this.fcm = admin.messaging();

      // Twilio SMS (uncomment when you add twilio)
      // const twilio = require('twilio');
      // this.twilio = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

      // SendGrid Email (uncomment when you add @sendgrid/mail)
      // const sgMail = require('@sendgrid/mail');
      // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      // this.sendgrid = sgMail;

      // WhatsApp via Twilio (uncomment when you add twilio)
      // this.whatsapp = twilio; // Same Twilio client for WhatsApp

      console.log("Notification services initialized");
    } catch (error) {
      console.error("Error initializing notification services:", error);
    }
  }

  /**
   * Send comprehensive notification through all channels
   */
  async sendNotification(options) {
    try {
      const {
        userId,
        type,
        title,
        message,
        data = {},
        channels = ["socket", "push", "sms", "email"],
        priority = "normal", // low, normal, high, critical
        persistent = true
      } = options;

      // Get user details and preferences
      const user = await User.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      const results = {
        socket: false,
        push: false,
        sms: false,
        email: false,
        whatsapp: false,
        persistent: false
      };

      // Store persistent notification
      if (persistent) {
        results.persistent = await this.createPersistentNotification({
          userId,
          type,
          title,
          message,
          data,
          priority
        });
      }

      // Socket.io (real-time)
      if (channels.includes("socket") && data.io) {
        results.socket = await this.sendSocketNotification(userId, {
          type,
          title,
          message,
          data,
          priority,
          timestamp: new Date()
        }, data.io);
      }

      // Push notification
      if (channels.includes("push") && this.shouldSendPush(user, type, priority)) {
        results.push = await this.sendPushNotification(user, {
          title,
          message,
          data,
          priority
        });
      }

      // SMS notification
      if (channels.includes("sms") && this.shouldSendSMS(user, type, priority)) {
        results.sms = await this.sendSMSNotification(user, {
          message: `${title}: ${message}`,
          priority
        });
      }

      // Email notification
      if (channels.includes("email") && this.shouldSendEmail(user, type, priority)) {
        results.email = await this.sendEmailNotification(user, {
          subject: title,
          message,
          data,
          type
        });
      }

      // WhatsApp notification
      if (channels.includes("whatsapp") && this.shouldSendWhatsApp(user, type, priority)) {
        results.whatsapp = await this.sendWhatsAppNotification(user, {
          message: `${title}: ${message}`,
          priority
        });
      }

      return {
        success: true,
        results,
        message: "Notification sent successfully"
      };
    } catch (error) {
      console.error("Error sending notification:", error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Create persistent notification in database
   */
  async createPersistentNotification(options) {
    try {
      const notification = await Notification.create({
        userId: options.userId,
        type: options.type,
        title: options.title,
        message: options.message,
        data: options.data,
        priority: options.priority,
        read: false,
        createdAt: new Date()
      });

      return !!notification;
    } catch (error) {
      console.error("Error creating persistent notification:", error);
      return false;
    }
  }

  /**
   * Send Socket.io notification
   */
  async sendSocketNotification(userId, notificationData, io) {
    try {
      io.to(userId.toString()).emit("notification", notificationData);
      return true;
    } catch (error) {
      console.error("Error sending socket notification:", error);
      return false;
    }
  }

  /**
   * Send push notification via Firebase FCM
   */
  async sendPushNotification(user, options) {
    try {
      if (!this.fcm || !user.fcmToken) {
        return false;
      }

      const message = {
        token: user.fcmToken,
        notification: {
          title: options.title,
          body: options.message
        },
        data: {
          ...options.data,
          priority: options.priority,
          timestamp: new Date().toISOString()
        },
        android: {
          priority: options.priority === "critical" ? "high" : "normal",
          notification: {
            sound: "default",
            clickAction: "FLUTTER_NOTIFICATION_CLICK"
          }
        },
        apns: {
          payload: {
            aps: {
              sound: "default",
              badge: 1
            }
          }
        }
      };

      const response = await this.fcm.send(message);
      console.log("Push notification sent:", response);
      return true;
    } catch (error) {
      console.error("Error sending push notification:", error);
      return false;
    }
  }

  /**
   * Send SMS notification via Twilio
   */
  async sendSMSNotification(user, options) {
    try {
      if (!this.twilio || !user.donorDetails?.phoneNumber) {
        return false;
      }

      const message = await this.twilio.messages.create({
        body: options.message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: user.donorDetails.phoneNumber
      });

      console.log("SMS sent:", message.sid);
      return true;
    } catch (error) {
      console.error("Error sending SMS:", error);
      return false;
    }
  }

  /**
   * Send email notification via SendGrid
   */
  async sendEmailNotification(user, options) {
    try {
      if (!this.sendgrid) {
        return false;
      }

      const emailTemplate = this.getEmailTemplate(options.type, options);
      
      const msg = {
        to: user.email,
        from: process.env.FROM_EMAIL || 'noreply@foodzero.com',
        subject: options.subject,
        html: emailTemplate
      };

      await this.sendgrid.send(msg);
      console.log("Email sent to:", user.email);
      return true;
    } catch (error) {
      console.error("Error sending email:", error);
      return false;
    }
  }

  /**
   * Send WhatsApp notification via Twilio
   */
  async sendWhatsAppNotification(user, options) {
    try {
      if (!this.whatsapp || !user.donorDetails?.phoneNumber) {
        return false;
      }

      // Format phone number for WhatsApp (must include country code)
      let phoneNumber = user.donorDetails.phoneNumber;
      if (!phoneNumber.startsWith('+')) {
        // Assume Indian number if no country code
        phoneNumber = '+91' + phoneNumber.replace(/^0/, '');
      }

      const message = await this.whatsapp.messages.create({
        body: options.message,
        from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`, // e.g., whatsapp:+14155238886
        to: `whatsapp:${phoneNumber}`
      });

      console.log("WhatsApp sent:", message.sid);
      return true;
    } catch (error) {
      console.error("Error sending WhatsApp:", error);
      return false;
    }
  }

  /**
   * Check if push notification should be sent based on user preferences
   */
  shouldSendPush(user, type, priority) {
    const preferences = user.notificationPreferences || {};
    
    // Always send critical notifications
    if (priority === "critical") return true;
    
    // Check user preferences
    if (preferences.push === false) return false;
    if (preferences[type] === false) return false;
    
    // Check quiet hours
    if (preferences.quietHours && this.isQuietHours(preferences.quietHours)) {
      return priority === "high" || priority === "critical";
    }
    
    return true;
  }

  /**
   * Check if SMS notification should be sent
   */
  shouldSendSMS(user, type, priority) {
    const preferences = user.notificationPreferences || {};
    
    // For delivery completion, always send SMS unless explicitly disabled
    if (type === "donation-delivered") {
      return preferences.sms !== false;
    }
    
    // Only send SMS for high priority or critical notifications by default
    if (priority === "low" || priority === "normal") {
      return preferences.sms === true && preferences[type] !== false;
    }
    
    return preferences.sms !== false;
  }

  /**
   * Check if email notification should be sent
   */
  shouldSendEmail(user, type, priority) {
    const preferences = user.notificationPreferences || {};
    
    // For delivery completion, always send email unless explicitly disabled
    if (type === "donation-delivered") {
      return preferences.email !== false;
    }
    
    // Send email for most notifications unless explicitly disabled
    if (preferences.email === false) return false;
    if (preferences[type] === false) return false;
    
    return true;
  }

  /**
   * Check if WhatsApp notification should be sent
   */
  shouldSendWhatsApp(user, type, priority) {
    const preferences = user.notificationPreferences || {};
    
    // Only send WhatsApp for delivery completion by default
    if (type !== "donation-delivered") {
      return preferences.whatsapp === true && preferences[type] !== false;
    }
    
    // Always send WhatsApp for delivery completion unless explicitly disabled
    return preferences.whatsapp !== false;
  }

  /**
   * Check if current time is within quiet hours
   */
  isQuietHours(quietHours) {
    if (!quietHours || !quietHours.start || !quietHours.end) return false;
    
    const now = new Date();
    const currentHour = now.getHours();
    
    const startHour = parseInt(quietHours.start.split(':')[0]);
    const endHour = parseInt(quietHours.end.split(':')[0]);
    
    if (startHour <= endHour) {
      return currentHour >= startHour && currentHour < endHour;
    } else {
      // Quiet hours span midnight
      return currentHour >= startHour || currentHour < endHour;
    }
  }

  /**
   * Get email template based on notification type
   */
  getEmailTemplate(type, options) {
    const baseTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ff6b35, #f7931e); color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
          .button { display: inline-block; padding: 12px 24px; background: #ff6b35; color: white; text-decoration: none; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🍽️ FoodZero</h1>
            <p>Fighting Food Waste Together</p>
          </div>
          <div class="content">
            <h2>${options.subject}</h2>
            <p>${options.message}</p>
            ${this.getTypeSpecificContent(type, options)}
          </div>
          <div class="footer">
            <p>© 2024 FoodZero. Making a difference, one meal at a time.</p>
            <p>You can manage your notification preferences in your account settings.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return baseTemplate;
  }

  /**
   * Get type-specific email content
   */
  getTypeSpecificContent(type, options) {
    switch (type) {
      case "donation-accepted":
        return `
          <div style="background: #e8f5e8; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <h3>🎉 Great News!</h3>
            <p>Your food donation has been accepted and will help feed people in need.</p>
            <a href="${process.env.CLIENT_URL}/donor/tracking" class="button">Track Your Donation</a>
          </div>
        `;
      
      case "donation-delivered":
        return `
          <div style="background: #e8f5e8; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <h3>✅ Mission Accomplished!</h3>
            <p>Your donation has been successfully delivered. Thank you for making a difference!</p>
            <a href="${process.env.CLIENT_URL}/donor/dashboard" class="button">View Impact</a>
          </div>
        `;
      
      case "new-donation":
        return `
          <div style="background: #fff3cd; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <h3>🍽️ New Food Available</h3>
            <p>A new food donation is available in your area. Act quickly to help reduce waste!</p>
            <a href="${process.env.CLIENT_URL}/ngo/dashboard" class="button">View Donations</a>
          </div>
        `;
      
      default:
        return "";
    }
  }

  /**
   * Send donation status update notifications
   */
  async sendDonationUpdate(donationId, status, io) {
    try {
      const donation = await Donation.findById(donationId)
        .populate("donor", "_id name email donorDetails notificationPreferences")
        .populate("ngoAssigned", "_id name email");

      if (!donation || !donation.donor) return;

      const statusMessages = {
        "accepted": {
          title: "Donation Accepted! 🎉",
          message: `${donation.ngoAssigned?.name || 'An NGO'} has accepted your ${donation.foodType} donation`,
          priority: "high"
        },
        "picked_up": {
          title: "Donation Picked Up 📦",
          message: `Your ${donation.foodType} donation has been picked up and is on its way`,
          priority: "normal"
        },
        "in_transit": {
          title: "Donation In Transit 🚚",
          message: `Your ${donation.foodType} donation is being transported to help those in need`,
          priority: "normal"
        },
        "delivered": {
          title: "Donation Delivered! ✅",
          message: `Your ${donation.foodType} donation has been successfully delivered. Thank you for making a difference!`,
          priority: "high"
        }
      };

      const notificationData = statusMessages[status];
      if (!notificationData) return;

      await this.sendNotification({
        userId: donation.donor._id,
        type: `donation-${status}`,
        title: notificationData.title,
        message: notificationData.message,
        data: {
          donationId: donation._id,
          foodType: donation.foodType,
          ngoName: donation.ngoAssigned?.name,
          status: status,
          io: io
        },
        channels: ["socket", "push", "email"],
        priority: notificationData.priority
      });

      console.log(`Donation update notification sent for ${donationId}: ${status}`);
    } catch (error) {
      console.error("Error sending donation update notification:", error);
    }
  }

  /**
   * Send new donation alert to NGOs
   */
  async sendNewDonationAlert(donation, io) {
    try {
      // Find nearby NGOs
      const nearbyNGOs = await User.find({
        role: "ngo",
        "ngoDetails.verificationStatus": "verified",
        location: { $exists: true }
      });

      for (const ngo of nearbyNGOs) {
        if (!ngo.location) continue;

        // Calculate distance
        const distance = this.calculateDistance(donation.location, ngo.location);
        
        // Only notify NGOs within 20km
        if (distance <= 20) {
          await this.sendNotification({
            userId: ngo._id,
            type: "new-donation",
            title: "New Food Donation Available! 🍽️",
            message: `${donation.foodType} available ${distance.toFixed(1)}km away - Expires ${this.formatExpiryTime(donation.expiryTime)}`,
            data: {
              donationId: donation._id,
              foodType: donation.foodType,
              quantity: donation.quantity,
              distance: distance,
              expiryTime: donation.expiryTime,
              io: io
            },
            channels: ["socket", "push"],
            priority: this.getPriorityByExpiry(donation.expiryTime)
          });
        }
      }

      console.log(`New donation alerts sent for ${donation._id}`);
    } catch (error) {
      console.error("Error sending new donation alerts:", error);
    }
  }

  /**
   * Calculate distance between coordinates
   */
  calculateDistance(coord1, coord2) {
    const R = 6371; // Earth's radius in km
    const lat1 = coord1.lat * Math.PI / 180;
    const lat2 = coord2.lat * Math.PI / 180;
    const deltaLat = (coord2.lat - coord1.lat) * Math.PI / 180;
    const deltaLng = (coord2.lng - coord1.lng) * Math.PI / 180;

    const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    
    return R * c;
  }

  /**
   * Format expiry time for display
   */
  formatExpiryTime(expiryTime) {
    if (!expiryTime) return "No expiry";
    
    const now = new Date();
    const expiry = new Date(expiryTime);
    const hours = (expiry - now) / (1000 * 60 * 60);
    
    if (hours < 1) return "< 1 hour";
    if (hours < 24) return `${Math.round(hours)} hours`;
    return `${Math.round(hours / 24)} days`;
  }

  /**
   * Get priority based on expiry time
   */
  getPriorityByExpiry(expiryTime) {
    if (!expiryTime) return "normal";
    
    const hours = (new Date(expiryTime) - new Date()) / (1000 * 60 * 60);
    
    if (hours <= 2) return "critical";
    if (hours <= 6) return "high";
    return "normal";
  }

  /**
   * Get user notifications with pagination
   */
  async getUserNotifications(userId, page = 1, limit = 20) {
    try {
      const skip = (page - 1) * limit;
      
      const notifications = await Notification.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Notification.countDocuments({ userId });
      const unreadCount = await Notification.countDocuments({ userId, read: false });

      return {
        notifications,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        },
        unreadCount
      };
    } catch (error) {
      console.error("Error getting user notifications:", error);
      throw error;
    }
  }

  /**
   * Mark notifications as read
   */
  async markAsRead(userId, notificationIds = []) {
    try {
      const query = { userId };
      
      if (notificationIds.length > 0) {
        query._id = { $in: notificationIds };
      }

      const result = await Notification.updateMany(
        query,
        { read: true, readAt: new Date() }
      );

      return {
        success: true,
        modifiedCount: result.modifiedCount
      };
    } catch (error) {
      console.error("Error marking notifications as read:", error);
      throw error;
    }
  }

  /**
   * Delete old notifications (cleanup job)
   */
  async cleanupOldNotifications(daysOld = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const result = await Notification.deleteMany({
        createdAt: { $lt: cutoffDate },
        read: true
      });

      console.log(`Cleaned up ${result.deletedCount} old notifications`);
      return result.deletedCount;
    } catch (error) {
      console.error("Error cleaning up notifications:", error);
      throw error;
    }
  }
}

module.exports = new NotificationService();