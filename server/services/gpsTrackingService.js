// server/services/gpsTrackingService.js

/**
 * GPS Tracking Service for Real-time Location Updates
 * 
 * Features:
 * 1. Continuous GPS location streaming
 * 2. Geofencing for pickup/delivery zones
 * 3. Route optimization with live updates
 * 4. ETA calculations
 * 5. Speed and distance monitoring
 */

const Tracking = require("../models/Tracking");
const Donation = require("../models/Donation");
const User = require("../models/User");
const deliveryNotificationService = require("./deliveryNotificationService");

class GPSTrackingService {
  constructor() {
    // Configuration
    this.UPDATE_INTERVAL = 30000; // 30 seconds
    this.GEOFENCE_RADIUS = 100; // 100 meters
    this.SPEED_THRESHOLD = 5; // 5 km/h minimum speed to consider "moving"
    this.MAX_SPEED = 120; // 120 km/h maximum reasonable speed
    
    // Active tracking sessions
    this.activeSessions = new Map();
    
    // Geofence zones
    this.geofenceZones = new Map();
  }

  /**
   * Start GPS tracking session for a donation
   */
  async startTracking(donationId, ngoId, io) {
    try {
      const donation = await Donation.findById(donationId)
        .populate("donor", "name email _id")
        .populate("ngoAssigned", "name email");

      if (!donation) {
        throw new Error("Donation not found");
      }

      // Create tracking session
      const session = {
        donationId,
        ngoId,
        startTime: new Date(),
        lastUpdate: new Date(),
        currentLocation: null,
        previousLocation: null,
        totalDistance: 0,
        averageSpeed: 0,
        isMoving: false,
        geofenceStatus: "outside",
        io: io
      };

      this.activeSessions.set(donationId, session);

      // Set up geofence zones
      await this.setupGeofenceZones(donationId);

      console.log(`GPS tracking started for donation ${donationId}`);
      
      return {
        success: true,
        message: "GPS tracking started",
        sessionId: donationId
      };
    } catch (error) {
      console.error("Error starting GPS tracking:", error);
      throw error;
    }
  }

  /**
   * Update GPS location for active tracking session
   */
  async updateLocation(donationId, locationData, io) {
    try {
      const { lat, lng, accuracy, speed, heading, timestamp } = locationData;

      // Validate location data
      if (!lat || !lng || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
        throw new Error("Invalid GPS coordinates");
      }

      // Validate speed (0-200 km/h reasonable range)
      if (speed !== undefined && (speed < 0 || speed > 200)) {
        throw new Error("Invalid speed value");
      }

      // Validate heading (0-360 degrees)
      if (heading !== undefined && (heading < 0 || heading > 360)) {
        throw new Error("Invalid heading value");
      }

      // Validate accuracy (should be positive)
      if (accuracy !== undefined && accuracy < 0) {
        throw new Error("Invalid accuracy value");
      }

      const session = this.activeSessions.get(donationId);
      if (!session) {
        throw new Error("No active tracking session found");
      }

      // Calculate distance from previous location
      let distanceTraveled = 0;
      if (session.currentLocation) {
        distanceTraveled = this.calculateDistance(
          session.currentLocation,
          { lat, lng }
        );
      }

      // Update session data
      session.previousLocation = session.currentLocation;
      session.currentLocation = { lat, lng, accuracy, timestamp: new Date(timestamp) };
      session.lastUpdate = new Date();
      session.totalDistance += distanceTraveled;

      // Calculate speed and movement status
      const calculatedSpeed = this.calculateSpeed(session, distanceTraveled);
      session.averageSpeed = calculatedSpeed;
      session.isMoving = calculatedSpeed > this.SPEED_THRESHOLD;

      // Check geofence status
      const geofenceUpdate = await this.checkGeofences(donationId, { lat, lng });

      // Update tracking in database
      const tracking = await Tracking.findOne({ donation: donationId });
      if (tracking) {
        tracking.currentLocation = { lat, lng };
        tracking.updates.push({
          status: tracking.status,
          location: { lat, lng },
          timestamp: new Date(),
          note: `GPS Update - Speed: ${calculatedSpeed.toFixed(1)} km/h, Accuracy: ${accuracy}m`,
          metadata: {
            speed: calculatedSpeed,
            heading,
            accuracy,
            isMoving: session.isMoving,
            totalDistance: session.totalDistance
          }
        });
        await tracking.save();
      }

      // Emit real-time updates
      const updateData = {
        donationId,
        location: { lat, lng },
        speed: calculatedSpeed,
        heading,
        accuracy,
        isMoving: session.isMoving,
        totalDistance: session.totalDistance,
        timestamp: new Date(),
        geofenceStatus: session.geofenceStatus
      };

      // Notify donor
      const donation = await Donation.findById(donationId).populate("donor", "_id");
      if (donation && donation.donor) {
        io.to(donation.donor._id.toString()).emit("gps-update", updateData);
      }

      // Notify NGO
      io.to(session.ngoId.toString()).emit("gps-update", updateData);

      // Broadcast to admin dashboard
      io.to("admin").emit("gps-update", updateData);

      return {
        success: true,
        location: { lat, lng },
        speed: calculatedSpeed,
        geofenceUpdate
      };
    } catch (error) {
      console.error("Error updating GPS location:", error);
      throw error;
    }
  }

  /**
   * Setup geofence zones for pickup and delivery locations
   */
  async setupGeofenceZones(donationId) {
    try {
      const donation = await Donation.findById(donationId)
        .populate("ngoAssigned", "location");

      if (!donation) return;

      const zones = [];

      // Pickup zone (donor location)
      if (donation.location) {
        zones.push({
          id: `pickup_${donationId}`,
          type: "pickup",
          center: donation.location,
          radius: this.GEOFENCE_RADIUS,
          donationId
        });
      }

      // Delivery zone (NGO location)
      if (donation.ngoAssigned && donation.ngoAssigned.location) {
        zones.push({
          id: `delivery_${donationId}`,
          type: "delivery",
          center: donation.ngoAssigned.location,
          radius: this.GEOFENCE_RADIUS,
          donationId
        });
      }

      this.geofenceZones.set(donationId, zones);
      console.log(`Geofence zones setup for donation ${donationId}:`, zones.length);
    } catch (error) {
      console.error("Error setting up geofence zones:", error);
    }
  }

  /**
   * Check if current location is within any geofence zones
   */
  async checkGeofences(donationId, currentLocation) {
    try {
      const zones = this.geofenceZones.get(donationId);
      const session = this.activeSessions.get(donationId);
      
      if (!zones || !session) return null;

      let geofenceUpdate = null;

      for (const zone of zones) {
        const distance = this.calculateDistance(currentLocation, zone.center);
        const isInside = distance <= (zone.radius / 1000); // Convert meters to km

        if (isInside && session.geofenceStatus !== zone.type) {
          // Entered geofence
          session.geofenceStatus = zone.type;
          geofenceUpdate = await this.handleGeofenceEntry(donationId, zone);
        } else if (!isInside && session.geofenceStatus === zone.type) {
          // Exited geofence
          session.geofenceStatus = "outside";
          geofenceUpdate = await this.handleGeofenceExit(donationId, zone);
        }
      }

      return geofenceUpdate;
    } catch (error) {
      console.error("Error checking geofences:", error);
      return null;
    }
  }

  /**
   * Handle geofence entry events
   */
  async handleGeofenceEntry(donationId, zone) {
    try {
      const session = this.activeSessions.get(donationId);
      if (!session) return null;

      let newStatus = null;
      let message = "";

      if (zone.type === "pickup") {
        newStatus = "picked_up";
        message = "NGO has arrived at pickup location";
      } else if (zone.type === "delivery") {
        newStatus = "delivered";
        message = "Food has been delivered successfully!";
        
        // Send comprehensive delivery notifications
        setTimeout(async () => {
          await deliveryNotificationService.sendDeliveryCompletionNotifications(donationId, session.io);
        }, 2000); // Small delay to ensure status is updated
      }

      if (newStatus) {
        // Update donation status
        await Donation.findByIdAndUpdate(donationId, { status: newStatus });

        // Update tracking
        const tracking = await Tracking.findOne({ donation: donationId });
        if (tracking) {
          tracking.status = newStatus;
          tracking.updates.push({
            status: newStatus,
            location: zone.center,
            timestamp: new Date(),
            note: `Geofence Alert: ${message}`
          });
          await tracking.save();
        }

        // Notify all parties
        const donation = await Donation.findById(donationId).populate("donor", "_id name");
        if (donation && donation.donor) {
          session.io.to(donation.donor._id.toString()).emit("geofence-alert", {
            donationId,
            type: zone.type,
            message,
            status: newStatus,
            timestamp: new Date()
          });
        }

        session.io.to(session.ngoId.toString()).emit("geofence-alert", {
          donationId,
          type: zone.type,
          message,
          status: newStatus,
          timestamp: new Date()
        });

        console.log(`Geofence entry: ${message} for donation ${donationId}`);
      }

      return {
        type: "entry",
        zone: zone.type,
        message,
        newStatus
      };
    } catch (error) {
      console.error("Error handling geofence entry:", error);
      return null;
    }
  }

  /**
   * Handle geofence exit events
   */
  async handleGeofenceExit(donationId, zone) {
    try {
      const session = this.activeSessions.get(donationId);
      if (!session) return null;

      let newStatus = null;
      let message = "";

      if (zone.type === "pickup") {
        newStatus = "in_transit";
        message = "NGO has left pickup location - Food is in transit";
      }

      if (newStatus) {
        // Update donation status
        await Donation.findByIdAndUpdate(donationId, { status: newStatus });

        // Update tracking
        const tracking = await Tracking.findOne({ donation: donationId });
        if (tracking) {
          tracking.status = newStatus;
          tracking.updates.push({
            status: newStatus,
            timestamp: new Date(),
            note: `Geofence Alert: ${message}`
          });
          await tracking.save();
        }

        // Notify all parties
        const donation = await Donation.findById(donationId).populate("donor", "_id");
        if (donation && donation.donor) {
          session.io.to(donation.donor._id.toString()).emit("geofence-alert", {
            donationId,
            type: zone.type,
            message,
            status: newStatus,
            timestamp: new Date()
          });
        }

        console.log(`Geofence exit: ${message} for donation ${donationId}`);
      }

      return {
        type: "exit",
        zone: zone.type,
        message,
        newStatus
      };
    } catch (error) {
      console.error("Error handling geofence exit:", error);
      return null;
    }
  }

  /**
   * Calculate distance between two coordinates (Haversine formula)
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
   * Calculate speed based on distance and time
   */
  calculateSpeed(session, distanceTraveled) {
    if (!session.previousLocation || !session.currentLocation) {
      return 0;
    }

    const timeDiff = (session.lastUpdate - session.currentLocation.timestamp) / 1000 / 3600; // hours
    if (timeDiff <= 0) return 0;

    const speed = distanceTraveled / timeDiff;
    
    // Filter out unrealistic speeds
    return Math.min(speed, this.MAX_SPEED);
  }

  /**
   * Calculate ETA to destination
   */
  async calculateETA(donationId, destinationType = "delivery") {
    try {
      const session = this.activeSessions.get(donationId);
      if (!session || !session.currentLocation) {
        return null;
      }

      const zones = this.geofenceZones.get(donationId);
      if (!zones) return null;

      const targetZone = zones.find(z => z.type === destinationType);
      if (!targetZone) return null;

      const distance = this.calculateDistance(session.currentLocation, targetZone.center);
      const avgSpeed = session.averageSpeed || 30; // Default 30 km/h

      const etaHours = distance / avgSpeed;
      const etaMinutes = Math.round(etaHours * 60);

      return {
        distance: Math.round(distance * 100) / 100,
        etaMinutes,
        etaFormatted: this.formatETA(etaMinutes),
        averageSpeed: avgSpeed
      };
    } catch (error) {
      console.error("Error calculating ETA:", error);
      return null;
    }
  }

  /**
   * Format ETA in human readable format
   */
  formatETA(minutes) {
    if (minutes < 60) {
      return `${minutes} minutes`;
    } else {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours}h ${mins}m`;
    }
  }

  /**
   * Stop GPS tracking session
   */
  async stopTracking(donationId) {
    try {
      const session = this.activeSessions.get(donationId);
      if (!session) {
        return { success: false, message: "No active session found" };
      }

      // Calculate final statistics
      const duration = (new Date() - session.startTime) / 1000 / 60; // minutes
      const avgSpeed = session.totalDistance / (duration / 60); // km/h

      // Update final tracking record
      const tracking = await Tracking.findOne({ donation: donationId });
      if (tracking) {
        tracking.updates.push({
          status: tracking.status,
          timestamp: new Date(),
          note: `GPS tracking ended - Total distance: ${session.totalDistance.toFixed(2)}km, Duration: ${duration.toFixed(0)}min, Avg speed: ${avgSpeed.toFixed(1)}km/h`
        });
        await tracking.save();
      }

      // Clean up
      this.activeSessions.delete(donationId);
      this.geofenceZones.delete(donationId);

      console.log(`GPS tracking stopped for donation ${donationId}`);

      return {
        success: true,
        message: "GPS tracking stopped",
        statistics: {
          totalDistance: session.totalDistance,
          duration: Math.round(duration),
          averageSpeed: Math.round(avgSpeed * 10) / 10
        }
      };
    } catch (error) {
      console.error("Error stopping GPS tracking:", error);
      throw error;
    }
  }

  /**
   * Get active tracking sessions
   */
  getActiveSessions() {
    const sessions = [];
    for (const [donationId, session] of this.activeSessions) {
      sessions.push({
        donationId,
        ngoId: session.ngoId,
        startTime: session.startTime,
        lastUpdate: session.lastUpdate,
        currentLocation: session.currentLocation,
        totalDistance: session.totalDistance,
        averageSpeed: session.averageSpeed,
        isMoving: session.isMoving,
        geofenceStatus: session.geofenceStatus
      });
    }
    return sessions;
  }

  /**
   * Get tracking session details
   */
  getSessionDetails(donationId) {
    const session = this.activeSessions.get(donationId);
    if (!session) return null;

    return {
      donationId,
      ngoId: session.ngoId,
      startTime: session.startTime,
      lastUpdate: session.lastUpdate,
      currentLocation: session.currentLocation,
      totalDistance: session.totalDistance,
      averageSpeed: session.averageSpeed,
      isMoving: session.isMoving,
      geofenceStatus: session.geofenceStatus,
      geofenceZones: this.geofenceZones.get(donationId) || []
    };
  }
}

module.exports = new GPSTrackingService();