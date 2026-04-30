// server/controllers/matchingController.js

const matchingEngine = require("../services/matchingEngine");
const logisticsService = require("../services/logisticsService");
const Donation = require("../models/Donation");

/**
 * Find best matches for a donation
 * GET /api/matching/find/:donationId
 */
exports.findMatches = async (req, res) => {
  try {
    const { donationId } = req.params;
    const { radius = 10, limit = 10 } = req.query;

    const matches = await matchingEngine.findMatches(
      donationId,
      parseInt(radius),
      parseInt(limit)
    );

    res.json({
      success: true,
      donationId: donationId,
      searchRadius: parseInt(radius),
      matchesFound: matches.length,
      matches: matches
    });
  } catch (error) {
    console.error("Error in findMatches:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Auto-assign donation to best match
 * POST /api/matching/auto-assign/:donationId
 */
exports.autoAssign = async (req, res) => {
  try {
    const { donationId } = req.params;

    const result = await matchingEngine.autoAssign(donationId);

    if (result.success) {
      // Emit Socket.io event
      const io = req.app.get("io");
      if (io && result.match) {
        io.to(result.match.recipient._id.toString()).emit("donation-assigned", {
          message: "A donation has been automatically assigned to you",
          donation: result.donation,
          match: result.match,
          timestamp: new Date()
        });
      }
    }

    res.json(result);
  } catch (error) {
    console.error("Error in autoAssign:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get time slot suggestions for a donation
 * GET /api/matching/time-slots/:donationId
 */
exports.getTimeSlots = async (req, res) => {
  try {
    const { donationId } = req.params;
    const { distance = 0 } = req.query;

    const donation = await Donation.findById(donationId);
    if (!donation) {
      return res.status(404).json({
        success: false,
        message: "Donation not found"
      });
    }

    const timeSlots = logisticsService.suggestTimeSlots(
      donation.expiryTime,
      parseFloat(distance)
    );

    res.json({
      success: true,
      donationId: donationId,
      expiryTime: donation.expiryTime,
      suggestedSlots: timeSlots
    });
  } catch (error) {
    console.error("Error in getTimeSlots:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get batch pickup suggestions for NGO
 * GET /api/matching/batch-suggestions
 */
exports.getBatchSuggestions = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "ngo") {
      return res.status(403).json({
        success: false,
        message: "Only NGOs can access batch suggestions"
      });
    }

    const { radius = 10 } = req.query;

    const suggestions = await logisticsService.getBatchPickupSuggestions(
      req.user._id,
      parseInt(radius)
    );

    res.json({
      success: true,
      ...suggestions
    });
  } catch (error) {
    console.error("Error in getBatchSuggestions:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get optimized pickup sequence for NGO
 * GET /api/matching/pickup-sequence
 */
exports.getPickupSequence = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "ngo") {
      return res.status(403).json({
        success: false,
        message: "Only NGOs can access pickup sequence"
      });
    }

    const sequence = await logisticsService.getPickupSequence(req.user._id);

    res.json({
      success: true,
      ...sequence
    });
  } catch (error) {
    console.error("Error in getPickupSequence:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get smart recommendations for available donations
 * GET /api/matching/recommendations
 */
exports.getRecommendations = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    const { radius = 10 } = req.query;

    // Get all pending donations
    const pendingDonations = await Donation.find({ status: "pending" })
      .populate("donor", "name email location");

    // Score each donation for this user
    const recommendations = [];

    for (const donation of pendingDonations) {
      if (!donation.location) continue;

      const distance = matchingEngine.calculateDistance(
        req.user.location,
        donation.location
      );

      if (distance > parseInt(radius)) continue;

      const score = matchingEngine.calculateMatchScore(
        donation,
        req.user,
        distance
      );

      const urgencyLevel = matchingEngine.getUrgencyLevel(donation.expiryTime);
      const timeSlots = logisticsService.suggestTimeSlots(donation.expiryTime, distance);

      recommendations.push({
        donation: {
          _id: donation._id,
          foodType: donation.foodType,
          quantity: donation.quantity,
          expiryTime: donation.expiryTime,
          location: donation.location,
          pickupAddress: donation.pickupAddress,
          donor: donation.donor
        },
        matchScore: score,
        distance: Math.round(distance * 100) / 100,
        urgencyLevel: urgencyLevel,
        estimatedPickupTime: matchingEngine.estimatePickupTime(distance),
        suggestedTimeSlots: timeSlots.slice(0, 3)
      });
    }

    // Sort by match score
    recommendations.sort((a, b) => b.matchScore - a.matchScore);

    res.json({
      success: true,
      totalRecommendations: recommendations.length,
      searchRadius: parseInt(radius),
      recommendations: recommendations
    });
  } catch (error) {
    console.error("Error in getRecommendations:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
