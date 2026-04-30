// server/services/matchingEngine.js

/**
 * Smart Matching Engine for FoodZero Platform
 * 
 * This service implements intelligent matching between food donations and recipients (NGOs/Individuals)
 * based on multiple factors:
 * 1. Location proximity (radius-based)
 * 2. Time to expiry (urgency)
 * 3. Priority rules (NGOs first, then individuals)
 * 4. Recipient capacity and preferences
 */

const User = require("../models/User");
const Donation = require("../models/Donation");

class MatchingEngine {
  constructor() {
    // Configuration constants
    this.DEFAULT_RADIUS_KM = 10; // Default search radius in kilometers
    this.MAX_RADIUS_KM = 50; // Maximum search radius
    this.EARTH_RADIUS_KM = 6371; // Earth's radius in kilometers
    
    // Priority weights for scoring
    this.WEIGHTS = {
      DISTANCE: 0.4,      // 40% weight for proximity
      URGENCY: 0.35,      // 35% weight for time to expiry
      PRIORITY: 0.15,     // 15% weight for recipient priority
      CAPACITY: 0.10      // 10% weight for recipient capacity
    };
    
    // Urgency thresholds (in hours)
    this.URGENCY_LEVELS = {
      CRITICAL: 2,   // Less than 2 hours
      HIGH: 6,       // 2-6 hours
      MEDIUM: 24,    // 6-24 hours
      LOW: 48        // 24-48 hours
    };
  }

  /**
   * Calculate distance between two coordinates using Haversine formula
   * @param {Object} coord1 - {lat, lng}
   * @param {Object} coord2 - {lat, lng}
   * @returns {number} Distance in kilometers
   */
  calculateDistance(coord1, coord2) {
    // Validate coordinates
    if (!coord1 || !coord2 || 
        typeof coord1.lat !== 'number' || typeof coord1.lng !== 'number' ||
        typeof coord2.lat !== 'number' || typeof coord2.lng !== 'number') {
      console.error('Invalid coordinates provided to calculateDistance');
      return Infinity; // Return large distance for invalid coords
    }

    const lat1 = this.toRadians(coord1.lat);
    const lat2 = this.toRadians(coord2.lat);
    const deltaLat = this.toRadians(coord2.lat - coord1.lat);
    const deltaLng = this.toRadians(coord2.lng - coord1.lng);

    const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    
    return this.EARTH_RADIUS_KM * c;
  }

  /**
   * Convert degrees to radians
   */
  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  /**
   * Calculate urgency score based on time to expiry
   * @param {Date} expiryTime - Expiry time of the donation
   * @returns {number} Urgency score (0-100)
   */
  calculateUrgencyScore(expiryTime) {
    if (!expiryTime) return 50; // Default medium urgency if no expiry time

    const now = new Date();
    const hoursToExpiry = (new Date(expiryTime) - now) / (1000 * 60 * 60);

    if (hoursToExpiry <= 0) return 0; // Already expired
    if (hoursToExpiry <= this.URGENCY_LEVELS.CRITICAL) return 100; // Critical
    if (hoursToExpiry <= this.URGENCY_LEVELS.HIGH) return 80; // High
    if (hoursToExpiry <= this.URGENCY_LEVELS.MEDIUM) return 60; // Medium
    if (hoursToExpiry <= this.URGENCY_LEVELS.LOW) return 40; // Low
    return 20; // Very low urgency
  }

  /**
   * Calculate priority score based on recipient type
   * @param {Object} recipient - User object
   * @returns {number} Priority score (0-100)
   */
  calculatePriorityScore(recipient) {
    // NGOs get higher priority than individuals
    if (recipient.role === "ngo") {
      // Verified NGOs get highest priority
      if (recipient.ngoDetails?.verificationStatus === "verified") {
        return 100;
      }
      // Pending NGOs get medium priority
      return 70;
    }
    
    // Individual donors can also receive (lower priority)
    if (recipient.role === "donor") {
      // Verified individuals
      if (recipient.donorDetails?.verificationLevel >= 2) {
        return 50;
      }
      // Partially verified individuals
      if (recipient.donorDetails?.verificationLevel === 1) {
        return 30;
      }
      return 10;
    }
    
    return 0;
  }

  /**
   * Calculate capacity score based on subscription plan
   * @param {Object} recipient - User object
   * @returns {number} Capacity score (0-100)
   */
  calculateCapacityScore(recipient) {
    const plan = recipient.subscription?.plan || "free";
    
    const capacityMap = {
      "free": 20,
      "starter": 40,
      "basic": 50,
      "professional": 70,
      "premium": 80,
      "enterprise": 100
    };
    
    return capacityMap[plan] || 20;
  }

  /**
   * Calculate overall match score
   * @param {Object} donation - Donation object
   * @param {Object} recipient - User object
   * @param {number} distance - Distance in km
   * @returns {number} Match score (0-100)
   */
  calculateMatchScore(donation, recipient, distance) {
    // Distance score (inverse - closer is better)
    const maxDistance = this.MAX_RADIUS_KM;
    const distanceScore = Math.max(0, 100 * (1 - distance / maxDistance));
    
    // Urgency score
    const urgencyScore = this.calculateUrgencyScore(donation.expiryTime);
    
    // Priority score
    const priorityScore = this.calculatePriorityScore(recipient);
    
    // Capacity score
    const capacityScore = this.calculateCapacityScore(recipient);
    
    // Weighted total score
    const totalScore = 
      (distanceScore * this.WEIGHTS.DISTANCE) +
      (urgencyScore * this.WEIGHTS.URGENCY) +
      (priorityScore * this.WEIGHTS.PRIORITY) +
      (capacityScore * this.WEIGHTS.CAPACITY);
    
    return Math.round(totalScore);
  }

  /**
   * Find best matches for a donation
   * @param {string} donationId - Donation ID
   * @param {number} radiusKm - Search radius in kilometers
   * @param {number} limit - Maximum number of matches to return
   * @returns {Array} Array of matched recipients with scores
   */
  async findMatches(donationId, radiusKm = this.DEFAULT_RADIUS_KM, limit = 10) {
    try {
      // Get donation details
      const donation = await Donation.findById(donationId);
      if (!donation) {
        throw new Error("Donation not found");
      }

      if (!donation.location || !donation.location.lat || !donation.location.lng) {
        throw new Error("Donation location not available");
      }

      // Find all potential recipients (NGOs and verified individuals)
      const recipients = await User.find({
        $or: [
          { role: "ngo", "ngoDetails.verificationStatus": "verified" },
          { role: "donor", "donorDetails.verificationLevel": { $gte: 1 } }
        ],
        location: { $exists: true, $ne: null }
      }).select("-password");

      // Calculate matches
      const matches = [];
      
      for (const recipient of recipients) {
        if (!recipient.location || !recipient.location.lat || !recipient.location.lng) {
          continue;
        }

        // Calculate distance
        const distance = this.calculateDistance(
          donation.location,
          recipient.location
        );

        // Skip if outside radius
        if (distance > radiusKm) {
          continue;
        }

        // Calculate match score
        const score = this.calculateMatchScore(donation, recipient, distance);

        matches.push({
          recipient: {
            _id: recipient._id,
            name: recipient.name,
            email: recipient.email,
            role: recipient.role,
            location: recipient.location,
            ngoDetails: recipient.ngoDetails,
            donorDetails: recipient.donorDetails,
            subscription: recipient.subscription
          },
          distance: Math.round(distance * 100) / 100, // Round to 2 decimals
          score: score,
          urgencyLevel: this.getUrgencyLevel(donation.expiryTime),
          estimatedPickupTime: this.estimatePickupTime(distance)
        });
      }

      // Sort by score (highest first)
      matches.sort((a, b) => b.score - a.score);

      // Return top matches
      return matches.slice(0, limit);
    } catch (error) {
      console.error("Error in findMatches:", error);
      throw error;
    }
  }

  /**
   * Get urgency level as string
   */
  getUrgencyLevel(expiryTime) {
    if (!expiryTime) return "MEDIUM";
    
    const now = new Date();
    const hoursToExpiry = (new Date(expiryTime) - now) / (1000 * 60 * 60);

    if (hoursToExpiry <= 0) return "EXPIRED";
    if (hoursToExpiry <= this.URGENCY_LEVELS.CRITICAL) return "CRITICAL";
    if (hoursToExpiry <= this.URGENCY_LEVELS.HIGH) return "HIGH";
    if (hoursToExpiry <= this.URGENCY_LEVELS.MEDIUM) return "MEDIUM";
    return "LOW";
  }

  /**
   * Estimate pickup time based on distance
   * @param {number} distance - Distance in km
   * @returns {string} Estimated time
   */
  estimatePickupTime(distance) {
    // Assume average speed of 30 km/h in city
    const avgSpeed = 30;
    const hours = distance / avgSpeed;
    const minutes = Math.round(hours * 60);
    
    if (minutes < 60) {
      return `${minutes} minutes`;
    } else {
      const hrs = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hrs}h ${mins}m`;
    }
  }

  /**
   * Auto-assign donation to best match
   * @param {string} donationId - Donation ID
   * @returns {Object} Assignment result
   */
  async autoAssign(donationId) {
    try {
      const matches = await this.findMatches(donationId, this.DEFAULT_RADIUS_KM, 1);
      
      if (matches.length === 0) {
        return {
          success: false,
          message: "No suitable recipients found within range"
        };
      }

      const bestMatch = matches[0];
      
      // Update donation with assignment
      const donation = await Donation.findByIdAndUpdate(
        donationId,
        {
          ngoAssigned: bestMatch.recipient._id,
          status: "accepted"
        },
        { new: true }
      );

      return {
        success: true,
        message: "Donation auto-assigned successfully",
        donation: donation,
        match: bestMatch
      };
    } catch (error) {
      console.error("Error in autoAssign:", error);
      throw error;
    }
  }
}

module.exports = new MatchingEngine();
