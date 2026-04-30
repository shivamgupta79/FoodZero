// server/controllers/gpsController.js

const gpsTrackingService = require("../services/gpsTrackingService");
const notificationService = require("../services/notificationService");
const Donation = require("../models/Donation");
const Tracking = require("../models/Tracking");

/**
 * Start GPS tracking for a donation
 */
exports.startTracking = async (req, res) => {
  try {
    const { donationId } = req.params;
    
    // Validate user is authenticated NGO
    if (!req.user || req.user.role !== "ngo") {
      return res.status(403).json({ message: "Only NGOs can start GPS tracking" });
    }

    // Check if donation is assigned to this NGO
    const donation = await Donation.findById(donationId);
    if (!donation) {
      return res.status(404).json({ message: "Donation not found" });
    }

    if (donation.ngoAssigned.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You are not assigned to this donation" });
    }

    if (donation.status !== "accepted") {
      return res.status(400).json({ message: "Can only track accepted donations" });
    }

    // Start GPS tracking
    const io = req.app.get("io");
    const result = await gpsTrackingService.startTracking(donationId, req.user._id, io);

    // Notify donor that tracking has started
    await notificationService.sendNotification({
      userId: donation.donor,
      type: "gps-update",
      title: "Live Tracking Started 📍",
      message: "Your donation is now being tracked in real-time",
      data: {
        donationId: donation._id,
        io: io
      },
      channels: ["socket", "push"],
      priority: "normal"
    });

    res.json(result);
  } catch (error) {
    console.error("Error starting GPS tracking:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Update GPS location
 */
exports.updateLocation = async (req, res) => {
  try {
    const { donationId } = req.params;
    const locationData = req.body;

    // Validate required fields
    const { lat, lng, accuracy, timestamp } = locationData;
    if (!lat || !lng || !timestamp) {
      return res.status(400).json({ 
        message: "Missing required location data: lat, lng, timestamp" 
      });
    }

    // Validate user is authenticated NGO
    if (!req.user || req.user.role !== "ngo") {
      return res.status(403).json({ message: "Only NGOs can update GPS location" });
    }

    // Check if donation is assigned to this NGO
    const donation = await Donation.findById(donationId);
    if (!donation) {
      return res.status(404).json({ message: "Donation not found" });
    }

    if (donation.ngoAssigned.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You are not assigned to this donation" });
    }

    // Update GPS location
    const io = req.app.get("io");
    const result = await gpsTrackingService.updateLocation(donationId, locationData, io);

    // Calculate ETA if requested
    let eta = null;
    if (req.query.includeETA === "true") {
      eta = await gpsTrackingService.calculateETA(donationId);
    }

    res.json({
      ...result,
      eta: eta
    });
  } catch (error) {
    console.error("Error updating GPS location:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Stop GPS tracking
 */
exports.stopTracking = async (req, res) => {
  try {
    const { donationId } = req.params;

    // Validate user is authenticated NGO
    if (!req.user || req.user.role !== "ngo") {
      return res.status(403).json({ message: "Only NGOs can stop GPS tracking" });
    }

    // Check if donation is assigned to this NGO
    const donation = await Donation.findById(donationId);
    if (!donation) {
      return res.status(404).json({ message: "Donation not found" });
    }

    if (donation.ngoAssigned.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You are not assigned to this donation" });
    }

    // Stop GPS tracking
    const result = await gpsTrackingService.stopTracking(donationId);

    // Notify donor that tracking has stopped
    const io = req.app.get("io");
    await notificationService.sendNotification({
      userId: donation.donor,
      type: "gps-update",
      title: "Tracking Complete ✅",
      message: `Donation tracking completed. Total distance: ${result.statistics?.totalDistance?.toFixed(1)}km`,
      data: {
        donationId: donation._id,
        statistics: result.statistics,
        io: io
      },
      channels: ["socket"],
      priority: "normal"
    });

    res.json(result);
  } catch (error) {
    console.error("Error stopping GPS tracking:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get tracking session details
 */
exports.getTrackingDetails = async (req, res) => {
  try {
    const { donationId } = req.params;

    // Check if user has access to this donation
    const donation = await Donation.findById(donationId)
      .populate("donor", "_id")
      .populate("ngoAssigned", "_id");

    if (!donation) {
      return res.status(404).json({ message: "Donation not found" });
    }

    // Allow access to donor, assigned NGO, or admin
    const hasAccess = 
      req.user.role === "admin" ||
      (donation.donor && donation.donor._id.toString() === req.user._id.toString()) ||
      (donation.ngoAssigned && donation.ngoAssigned._id.toString() === req.user._id.toString());

    if (!hasAccess) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Get session details
    const sessionDetails = gpsTrackingService.getSessionDetails(donationId);
    
    // Get tracking history from database
    const tracking = await Tracking.findOne({ donation: donationId });

    // Calculate ETA
    const eta = await gpsTrackingService.calculateETA(donationId);

    res.json({
      donation: {
        _id: donation._id,
        foodType: donation.foodType,
        status: donation.status,
        location: donation.location
      },
      session: sessionDetails,
      tracking: tracking,
      eta: eta,
      isActive: !!sessionDetails
    });
  } catch (error) {
    console.error("Error getting tracking details:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get all active tracking sessions (Admin only)
 */
exports.getActiveSessions = async (req, res) => {
  try {
    // Admin only
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const sessions = gpsTrackingService.getActiveSessions();
    
    // Enrich with donation details
    const enrichedSessions = await Promise.all(
      sessions.map(async (session) => {
        const donation = await Donation.findById(session.donationId)
          .populate("donor", "name email")
          .populate("ngoAssigned", "name email");
        
        return {
          ...session,
          donation: donation
        };
      })
    );

    res.json({
      activeSessions: enrichedSessions,
      totalSessions: sessions.length
    });
  } catch (error) {
    console.error("Error getting active sessions:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get tracking history for a donation
 */
exports.getTrackingHistory = async (req, res) => {
  try {
    const { donationId } = req.params;

    // Check if user has access to this donation
    const donation = await Donation.findById(donationId)
      .populate("donor", "_id")
      .populate("ngoAssigned", "_id");

    if (!donation) {
      return res.status(404).json({ message: "Donation not found" });
    }

    // Allow access to donor, assigned NGO, or admin
    const hasAccess = 
      req.user.role === "admin" ||
      (donation.donor && donation.donor._id.toString() === req.user._id.toString()) ||
      (donation.ngoAssigned && donation.ngoAssigned._id.toString() === req.user._id.toString());

    if (!hasAccess) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Get tracking history
    const tracking = await Tracking.findOne({ donation: donationId });

    if (!tracking) {
      return res.status(404).json({ message: "No tracking data found" });
    }

    // Calculate route statistics
    const updates = tracking.updates || [];
    let totalDistance = 0;
    let maxSpeed = 0;
    let avgSpeed = 0;

    for (let i = 1; i < updates.length; i++) {
      const prev = updates[i - 1];
      const curr = updates[i];

      if (prev.location && curr.location && curr.metadata?.speed) {
        const distance = gpsTrackingService.calculateDistance(prev.location, curr.location);
        totalDistance += distance;
        
        if (curr.metadata.speed > maxSpeed) {
          maxSpeed = curr.metadata.speed;
        }
      }
    }

    if (updates.length > 1) {
      const totalTime = (new Date(updates[updates.length - 1].timestamp) - new Date(updates[0].timestamp)) / (1000 * 60 * 60); // hours
      avgSpeed = totalTime > 0 ? totalDistance / totalTime : 0;
    }

    res.json({
      tracking: tracking,
      statistics: {
        totalDistance: Math.round(totalDistance * 100) / 100,
        maxSpeed: Math.round(maxSpeed * 10) / 10,
        avgSpeed: Math.round(avgSpeed * 10) / 10,
        totalUpdates: updates.length,
        duration: updates.length > 1 ? 
          Math.round((new Date(updates[updates.length - 1].timestamp) - new Date(updates[0].timestamp)) / (1000 * 60)) : 0
      }
    });
  } catch (error) {
    console.error("Error getting tracking history:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Simulate GPS tracking (for testing)
 */
exports.simulateTracking = async (req, res) => {
  try {
    if (process.env.NODE_ENV === "production") {
      return res.status(403).json({ message: "Simulation not available in production" });
    }

    const { donationId } = req.params;
    const { route, interval = 5000 } = req.body; // Default 5 second intervals

    if (!route || !Array.isArray(route) || route.length < 2) {
      return res.status(400).json({ message: "Route must be an array of at least 2 coordinates" });
    }

    // Validate user access
    const donation = await Donation.findById(donationId);
    if (!donation) {
      return res.status(404).json({ message: "Donation not found" });
    }

    if (req.user.role !== "admin" && donation.ngoAssigned.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Start simulation
    const io = req.app.get("io");
    let currentIndex = 0;

    const simulationInterval = setInterval(async () => {
      if (currentIndex >= route.length) {
        clearInterval(simulationInterval);
        console.log(`GPS simulation completed for donation ${donationId}`);
        return;
      }

      const point = route[currentIndex];
      const locationData = {
        lat: point.lat,
        lng: point.lng,
        accuracy: 10,
        speed: point.speed || 30,
        heading: point.heading || 0,
        timestamp: new Date().toISOString()
      };

      try {
        await gpsTrackingService.updateLocation(donationId, locationData, io);
        console.log(`Simulated GPS update ${currentIndex + 1}/${route.length} for donation ${donationId}`);
      } catch (error) {
        console.error("Error in GPS simulation:", error);
        clearInterval(simulationInterval);
      }

      currentIndex++;
    }, interval);

    res.json({
      success: true,
      message: "GPS simulation started",
      routePoints: route.length,
      interval: interval
    });
  } catch (error) {
    console.error("Error starting GPS simulation:", error);
    res.status(500).json({ message: error.message });
  }
};