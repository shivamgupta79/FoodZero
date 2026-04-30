// server/services/deliveryNotificationService.js

/**
 * Specialized Delivery Notification Service
 * 
 * Handles comprehensive notifications when donations are delivered,
 * including SMS, Email, and WhatsApp with rich content and impact metrics.
 */

const User = require("../models/User");
const Donation = require("../models/Donation");
const Tracking = require("../models/Tracking");
const notificationService = require("./notificationService");

class DeliveryNotificationService {
  constructor() {
    // Initialize Twilio for SMS and WhatsApp
    this.twilio = null;
    this.sendgrid = null;
    
    this.initializeServices();
  }

  /**
   * Initialize external services
   */
  initializeServices() {
    try {
      // Twilio for SMS and WhatsApp (uncomment when you add twilio)
      // const twilio = require('twilio');
      // this.twilio = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

      // SendGrid for email (uncomment when you add @sendgrid/mail)
      // const sgMail = require('@sendgrid/mail');
      // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      // this.sendgrid = sgMail;

      console.log("Delivery notification services initialized");
    } catch (error) {
      console.error("Error initializing delivery notification services:", error);
    }
  }

  /**
   * Send comprehensive delivery completion notifications
   */
  async sendDeliveryCompletionNotifications(donationId, io) {
    try {
      // Get donation with all related data
      const donation = await Donation.findById(donationId)
        .populate("donor", "name email donorDetails notificationPreferences")
        .populate("ngoAssigned", "name email ngoDetails");

      if (!donation || !donation.donor) {
        console.error("Donation or donor not found for delivery notification");
        return;
      }

      // Get tracking data for statistics
      const tracking = await Tracking.findOne({ donation: donationId });
      
      // Calculate impact metrics
      const impactMetrics = await this.calculateImpactMetrics(donation, tracking);

      // Send notifications through all channels
      await this.sendDeliveryNotifications(donation, impactMetrics, io);

      console.log(`Delivery completion notifications sent for donation ${donationId}`);
    } catch (error) {
      console.error("Error sending delivery completion notifications:", error);
    }
  }

  /**
   * Calculate impact metrics for the donation
   */
  async calculateImpactMetrics(donation, tracking) {
    try {
      const metrics = {
        foodType: donation.foodType,
        quantity: donation.quantity,
        estimatedMeals: this.estimateMealsFromDonation(donation),
        co2Saved: this.calculateCO2Savings(donation),
        waterSaved: this.calculateWaterSavings(donation),
        deliveryTime: null,
        distance: null,
        ngoName: donation.ngoAssigned?.name || "NGO Partner",
        recipientCount: donation.feedback?.recipientCount || null
      };

      // Calculate delivery statistics from tracking
      if (tracking && tracking.updates.length > 1) {
        const firstUpdate = tracking.updates[0];
        const lastUpdate = tracking.updates[tracking.updates.length - 1];
        
        // Calculate delivery time
        const deliveryTimeMs = new Date(lastUpdate.timestamp) - new Date(firstUpdate.timestamp);
        metrics.deliveryTime = Math.round(deliveryTimeMs / (1000 * 60)); // minutes

        // Calculate total distance if available
        let totalDistance = 0;
        for (let i = 1; i < tracking.updates.length; i++) {
          const prev = tracking.updates[i - 1];
          const curr = tracking.updates[i];
          
          if (prev.location && curr.location) {
            totalDistance += this.calculateDistance(prev.location, curr.location);
          }
        }
        metrics.distance = Math.round(totalDistance * 100) / 100; // km
      }

      return metrics;
    } catch (error) {
      console.error("Error calculating impact metrics:", error);
      return {
        foodType: donation.foodType,
        quantity: donation.quantity,
        estimatedMeals: 1,
        co2Saved: 0,
        waterSaved: 0,
        ngoName: donation.ngoAssigned?.name || "NGO Partner"
      };
    }
  }

  /**
   * Send delivery notifications through all channels
   */
  async sendDeliveryNotifications(donation, metrics, io) {
    const donor = donation.donor;
    const ngo = donation.ngoAssigned;

    // Prepare notification content
    const notificationContent = {
      title: "🎉 Donation Delivered Successfully!",
      shortMessage: `Your ${metrics.foodType} donation has been delivered and helped feed ${metrics.estimatedMeals} people!`,
      detailedMessage: this.createDetailedMessage(metrics),
      smsMessage: this.createSMSMessage(metrics),
      whatsappMessage: this.createWhatsAppMessage(metrics),
      emailSubject: `✅ Your Food Donation Impact Report - ${metrics.estimatedMeals} Meals Served`,
      emailContent: this.createEmailContent(donation, metrics)
    };

    // Send through all channels
    const results = {
      socket: false,
      sms: false,
      email: false,
      whatsapp: false
    };

    // 1. Real-time notification (Socket.io)
    try {
      io.to(donor._id.toString()).emit("donation-delivered", {
        donationId: donation._id,
        title: notificationContent.title,
        message: notificationContent.shortMessage,
        metrics: metrics,
        timestamp: new Date()
      });
      results.socket = true;
    } catch (error) {
      console.error("Error sending socket notification:", error);
    }

    // 2. SMS Notification (always send for delivery completion)
    if (donor.donorDetails?.phoneNumber && donor.notificationPreferences?.sms !== false) {
      results.sms = await this.sendDeliverySMS(donor, notificationContent.smsMessage);
    }

    // 3. Email Notification (always send for delivery completion)
    if (donor.email && donor.notificationPreferences?.email !== false) {
      results.email = await this.sendDeliveryEmail(donor, notificationContent);
    }

    // 4. WhatsApp Notification (always send for delivery completion)
    if (donor.donorDetails?.phoneNumber && donor.notificationPreferences?.whatsapp !== false) {
      results.whatsapp = await this.sendDeliveryWhatsApp(donor, notificationContent.whatsappMessage);
    }

    // Store persistent notification
    await notificationService.createPersistentNotification({
      userId: donor._id,
      type: "donation-delivered",
      title: notificationContent.title,
      message: notificationContent.detailedMessage,
      data: {
        donationId: donation._id,
        metrics: metrics,
        ngoName: ngo?.name
      },
      priority: "high"
    });

    console.log("Delivery notifications sent:", results);
    return results;
  }

  /**
   * Send SMS notification for delivery completion
   */
  async sendDeliverySMS(donor, message) {
    try {
      if (!this.twilio) return false;

      let phoneNumber = donor.donorDetails.phoneNumber;
      if (!phoneNumber.startsWith('+')) {
        phoneNumber = '+91' + phoneNumber.replace(/^0/, '');
      }

      const sms = await this.twilio.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phoneNumber
      });

      console.log("Delivery SMS sent:", sms.sid);
      return true;
    } catch (error) {
      console.error("Error sending delivery SMS:", error);
      return false;
    }
  }

  /**
   * Send WhatsApp notification for delivery completion
   */
  async sendDeliveryWhatsApp(donor, message) {
    try {
      if (!this.twilio) return false;

      let phoneNumber = donor.donorDetails.phoneNumber;
      if (!phoneNumber.startsWith('+')) {
        phoneNumber = '+91' + phoneNumber.replace(/^0/, '');
      }

      const whatsapp = await this.twilio.messages.create({
        body: message,
        from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
        to: `whatsapp:${phoneNumber}`
      });

      console.log("Delivery WhatsApp sent:", whatsapp.sid);
      return true;
    } catch (error) {
      console.error("Error sending delivery WhatsApp:", error);
      return false;
    }
  }

  /**
   * Send email notification for delivery completion
   */
  async sendDeliveryEmail(donor, content) {
    try {
      if (!this.sendgrid) return false;

      const msg = {
        to: donor.email,
        from: process.env.FROM_EMAIL || 'noreply@foodzero.com',
        subject: content.emailSubject,
        html: content.emailContent
      };

      await this.sendgrid.send(msg);
      console.log("Delivery email sent to:", donor.email);
      return true;
    } catch (error) {
      console.error("Error sending delivery email:", error);
      return false;
    }
  }

  /**
   * Create detailed message for notifications
   */
  createDetailedMessage(metrics) {
    let message = `🎉 Great news! Your ${metrics.foodType} donation has been successfully delivered by ${metrics.ngoName}!\n\n`;
    message += `📊 Impact Summary:\n`;
    message += `• Estimated meals served: ${metrics.estimatedMeals}\n`;
    message += `• CO2 emissions saved: ${metrics.co2Saved}kg\n`;
    message += `• Water saved: ${metrics.waterSaved}L\n`;
    
    if (metrics.deliveryTime) {
      message += `• Delivery completed in: ${Math.round(metrics.deliveryTime / 60)}h ${metrics.deliveryTime % 60}m\n`;
    }
    
    if (metrics.distance) {
      message += `• Distance covered: ${metrics.distance}km\n`;
    }

    if (metrics.recipientCount) {
      message += `• People helped: ${metrics.recipientCount}\n`;
    }

    message += `\nThank you for making a difference! 🙏`;
    return message;
  }

  /**
   * Create SMS message (shorter version)
   */
  createSMSMessage(metrics) {
    return `🎉 FoodZero: Your ${metrics.foodType} donation delivered! ${metrics.estimatedMeals} meals served, ${metrics.co2Saved}kg CO2 saved. Thank you for fighting food waste! 🙏`;
  }

  /**
   * Create WhatsApp message (rich format)
   */
  createWhatsAppMessage(metrics) {
    let message = `🎉 *Donation Delivered Successfully!*\n\n`;
    message += `Your *${metrics.foodType}* donation has been delivered by ${metrics.ngoName}!\n\n`;
    message += `📊 *Your Impact:*\n`;
    message += `🍽️ Meals served: *${metrics.estimatedMeals}*\n`;
    message += `🌱 CO2 saved: *${metrics.co2Saved}kg*\n`;
    message += `💧 Water saved: *${metrics.waterSaved}L*\n`;
    
    if (metrics.recipientCount) {
      message += `👥 People helped: *${metrics.recipientCount}*\n`;
    }

    message += `\n✨ Thank you for making a difference with FoodZero! Together, we're fighting food waste and feeding communities. 🙏\n\n`;
    message += `Track more donations: ${process.env.CLIENT_URL}/donor/dashboard`;
    
    return message;
  }

  /**
   * Create rich HTML email content
   */
  createEmailContent(donation, metrics) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
          .header { background: linear-gradient(135deg, #4CAF50, #45a049); color: white; padding: 30px 20px; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; font-weight: bold; }
          .header p { margin: 10px 0 0 0; font-size: 16px; opacity: 0.9; }
          .content { padding: 30px 20px; }
          .impact-card { background: linear-gradient(135deg, #f8f9fa, #e9ecef); border-radius: 12px; padding: 25px; margin: 20px 0; border-left: 5px solid #4CAF50; }
          .impact-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 20px; margin: 20px 0; }
          .impact-item { text-align: center; padding: 15px; background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .impact-number { font-size: 24px; font-weight: bold; color: #4CAF50; display: block; }
          .impact-label { font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 0.5px; }
          .donation-details { background: #fff3cd; border-radius: 8px; padding: 20px; margin: 20px 0; }
          .ngo-info { background: #d1ecf1; border-radius: 8px; padding: 20px; margin: 20px 0; }
          .cta-button { display: inline-block; background: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; margin: 20px 0; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
          .social-links { margin: 15px 0; }
          .social-links a { display: inline-block; margin: 0 10px; color: #4CAF50; text-decoration: none; }
          @media (max-width: 600px) {
            .impact-grid { grid-template-columns: repeat(2, 1fr); }
            .header h1 { font-size: 24px; }
            .content { padding: 20px 15px; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <!-- Header -->
          <div class="header">
            <h1>🎉 Donation Delivered!</h1>
            <p>Your food donation has made a real impact</p>
          </div>

          <!-- Main Content -->
          <div class="content">
            <h2 style="color: #4CAF50; margin-bottom: 10px;">Thank You, ${donation.donor.name}!</h2>
            <p style="font-size: 16px; margin-bottom: 25px;">
              We're excited to share that your <strong>${metrics.foodType}</strong> donation has been successfully delivered 
              by <strong>${metrics.ngoName}</strong> and is now helping people in need!
            </p>

            <!-- Impact Metrics -->
            <div class="impact-card">
              <h3 style="margin-top: 0; color: #4CAF50; text-align: center;">🌟 Your Impact Summary</h3>
              <div class="impact-grid">
                <div class="impact-item">
                  <span class="impact-number">${metrics.estimatedMeals}</span>
                  <span class="impact-label">Meals Served</span>
                </div>
                <div class="impact-item">
                  <span class="impact-number">${metrics.co2Saved}kg</span>
                  <span class="impact-label">CO2 Saved</span>
                </div>
                <div class="impact-item">
                  <span class="impact-number">${metrics.waterSaved}L</span>
                  <span class="impact-label">Water Saved</span>
                </div>
                ${metrics.recipientCount ? `
                <div class="impact-item">
                  <span class="impact-number">${metrics.recipientCount}</span>
                  <span class="impact-label">People Helped</span>
                </div>
                ` : ''}
              </div>
            </div>

            <!-- Donation Details -->
            <div class="donation-details">
              <h4 style="margin-top: 0; color: #856404;">📦 Donation Details</h4>
              <p><strong>Food Type:</strong> ${metrics.foodType}</p>
              <p><strong>Quantity:</strong> ${metrics.quantity}</p>
              <p><strong>Donated on:</strong> ${new Date(donation.createdAt).toLocaleDateString()}</p>
              <p><strong>Delivered on:</strong> ${new Date().toLocaleDateString()}</p>
              ${metrics.deliveryTime ? `<p><strong>Delivery Time:</strong> ${Math.round(metrics.deliveryTime / 60)}h ${metrics.deliveryTime % 60}m</p>` : ''}
              ${metrics.distance ? `<p><strong>Distance Covered:</strong> ${metrics.distance}km</p>` : ''}
            </div>

            <!-- NGO Information -->
            <div class="ngo-info">
              <h4 style="margin-top: 0; color: #0c5460;">🏥 Delivered by ${metrics.ngoName}</h4>
              <p>This verified NGO partner has successfully collected and distributed your donation to those who need it most.</p>
              ${donation.ngoAssigned?.ngoDetails?.city ? `<p><strong>Location:</strong> ${donation.ngoAssigned.ngoDetails.city}, ${donation.ngoAssigned.ngoDetails.state}</p>` : ''}
            </div>

            <!-- Call to Action -->
            <div style="text-align: center; margin: 30px 0;">
              <p style="font-size: 18px; margin-bottom: 20px;">Ready to make another difference?</p>
              <a href="${process.env.CLIENT_URL}/donor/donate" class="cta-button">Donate More Food</a>
            </div>

            <!-- Environmental Impact -->
            <div style="background: #d4edda; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <h4 style="margin-top: 0; color: #155724;">🌍 Environmental Impact</h4>
              <p>By donating instead of discarding, you've helped:</p>
              <ul style="margin: 10px 0;">
                <li>Reduce methane emissions from landfills</li>
                <li>Save water used in food production</li>
                <li>Decrease the carbon footprint of food waste</li>
                <li>Support sustainable food distribution</li>
              </ul>
            </div>
          </div>

          <!-- Footer -->
          <div class="footer">
            <p><strong>FoodZero</strong> - Fighting Food Waste, Feeding Communities</p>
            <div class="social-links">
              <a href="${process.env.CLIENT_URL}">Visit Website</a> |
              <a href="${process.env.CLIENT_URL}/donor/dashboard">Your Dashboard</a> |
              <a href="${process.env.CLIENT_URL}/donor/tracking">Track Donations</a>
            </div>
            <p style="font-size: 12px; margin-top: 15px;">
              You received this email because you made a food donation through FoodZero.<br>
              You can manage your notification preferences in your account settings.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Estimate meals from donation quantity
   */
  estimateMealsFromDonation(donation) {
    const quantity = donation.quantityNumber || 1;
    const unit = donation.quantityUnit || "";
    
    // Estimation logic based on food type and quantity
    switch (unit.toLowerCase()) {
      case "kg":
      case "kgs":
        return Math.round(quantity * 4); // 1kg ≈ 4 meals
      case "plates":
        return quantity;
      case "servings":
        return quantity;
      case "liters":
      case "l":
        return Math.round(quantity * 2); // 1L ≈ 2 meals
      case "pieces":
        return Math.round(quantity * 0.5); // 2 pieces ≈ 1 meal
      default:
        return Math.max(1, Math.round(quantity / 2)); // Conservative estimate
    }
  }

  /**
   * Calculate CO2 savings from preventing food waste
   */
  calculateCO2Savings(donation) {
    const quantity = donation.quantityNumber || 1;
    const unit = donation.quantityUnit || "";
    
    // CO2 savings in kg (based on food waste carbon footprint)
    let co2PerUnit = 2.5; // Default: 2.5kg CO2 per kg of food
    
    switch (unit.toLowerCase()) {
      case "kg":
      case "kgs":
        co2PerUnit = 2.5;
        break;
      case "plates":
        co2PerUnit = 0.8; // ~0.8kg CO2 per plate
        break;
      case "liters":
      case "l":
        co2PerUnit = 1.2; // ~1.2kg CO2 per liter
        break;
      default:
        co2PerUnit = 1.0;
    }
    
    return Math.round(quantity * co2PerUnit * 10) / 10; // Round to 1 decimal
  }

  /**
   * Calculate water savings from preventing food waste
   */
  calculateWaterSavings(donation) {
    const quantity = donation.quantityNumber || 1;
    const unit = donation.quantityUnit || "";
    
    // Water savings in liters (based on water footprint of food production)
    let waterPerUnit = 1000; // Default: 1000L per kg of food
    
    switch (unit.toLowerCase()) {
      case "kg":
      case "kgs":
        waterPerUnit = 1000;
        break;
      case "plates":
        waterPerUnit = 300; // ~300L per plate
        break;
      case "liters":
      case "l":
        waterPerUnit = 500; // ~500L per liter of food
        break;
      default:
        waterPerUnit = 200;
    }
    
    return Math.round(quantity * waterPerUnit);
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
}

module.exports = new DeliveryNotificationService();