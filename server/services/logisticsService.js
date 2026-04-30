// server/services/logisticsService.js

/**
 * Logistics Service for FoodZero Platform
 * 
 * This service provides:
 * 1. Route optimization for pickup
 * 2. Time slot suggestions
 * 3. Batch pickup planning
 * 4. Delivery scheduling
 */

const Donation = require("../models/Donation");
const User = require("../models/User");

class LogisticsService {
  constructor() {
    // Time slot configuration (24-hour format)
    this.TIME_SLOTS = [
      { id: 1, start: "08:00", end: "10:00", label: "Morning (8 AM - 10 AM)" },
      { id: 2, start: "10:00", end: "12:00", label: "Late Morning (10 AM - 12 PM)" },
      { id: 3, start: "12:00", end: "14:00", label: "Afternoon (12 PM - 2 PM)" },
      { id: 4, start: "14:00", end: "16:00", label: "Mid Afternoon (2 PM - 4 PM)" },
      { id: 5, start: "16:00", end: "18:00", label: "Evening (4 PM - 6 PM)" },
      { id: 6, start: "18:00", end: "20:00", label: "Late Evening (6 PM - 8 PM)" }
    ];

    // Average speed in city (km/h)
    this.AVG_SPEED_KMH = 30;
    
    // Average pickup time per location (minutes)
    this.AVG_PICKUP_TIME_MIN = 15;
    
    // Maximum pickups per route
    this.MAX_PICKUPS_PER_ROUTE = 5;
  }

  /**
   * Calculate distance between two coordinates using Haversine formula
   */
  calculateDistance(coord1, coord2) {
    // Validate coordinates
    if (!coord1 || !coord2 || 
        typeof coord1.lat !== 'number' || typeof coord1.lng !== 'number' ||
        typeof coord2.lat !== 'number' || typeof coord2.lng !== 'number') {
      console.error('Invalid coordinates provided to calculateDistance');
      return Infinity; // Return large distance for invalid coords
    }

    const R = 6371; // Earth's radius in km
    const lat1 = this.toRadians(coord1.lat);
    const lat2 = this.toRadians(coord2.lat);
    const deltaLat = this.toRadians(coord2.lat - coord1.lat);
    const deltaLng = this.toRadians(coord2.lng - coord1.lng);

    const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    
    return R * c;
  }

  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  /**
   * Suggest optimal time slots for pickup based on urgency and current time
   * @param {Date} expiryTime - Food expiry time
   * @param {number} distance - Distance to pickup location (km)
   * @returns {Array} Suggested time slots
   */
  suggestTimeSlots(expiryTime, distance = 0) {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    // Calculate travel time
    const travelTimeHours = distance / this.AVG_SPEED_KMH;
    const travelTimeMinutes = Math.ceil(travelTimeHours * 60);
    
    // Calculate hours to expiry
    let hoursToExpiry = Infinity;
    if (expiryTime) {
      hoursToExpiry = (new Date(expiryTime) - now) / (1000 * 60 * 60);
    }

    // Filter and score time slots
    const availableSlots = this.TIME_SLOTS.map(slot => {
      const [startHour, startMinute] = slot.start.split(":").map(Number);
      const [endHour, endMinute] = slot.end.split(":").map(Number);
      
      // Check if slot is in the future
      const slotStartTime = startHour + startMinute / 60;
      const currentTime = currentHour + currentMinute / 60;
      
      if (slotStartTime <= currentTime) {
        return null; // Slot has passed
      }

      // Calculate if pickup can be completed before expiry
      const hoursUntilSlotStart = slotStartTime - currentTime;
      const totalTimeNeeded = hoursUntilSlotStart + travelTimeHours + (this.AVG_PICKUP_TIME_MIN / 60);
      
      if (totalTimeNeeded > hoursToExpiry) {
        return null; // Not enough time before expiry
      }

      // Score the slot (prefer earlier slots for urgent items)
      let score = 100;
      if (hoursToExpiry < 4) {
        // Very urgent - prefer immediate slots
        score = 100 - (hoursUntilSlotStart * 20);
      } else if (hoursToExpiry < 12) {
        // Moderately urgent
        score = 80 - (hoursUntilSlotStart * 10);
      } else {
        // Not urgent - any slot is fine
        score = 60;
      }

      return {
        ...slot,
        score: Math.max(0, score),
        estimatedArrival: this.calculateArrivalTime(startHour, startMinute, travelTimeMinutes),
        travelTime: `${travelTimeMinutes} minutes`,
        urgency: hoursToExpiry < 4 ? "HIGH" : hoursToExpiry < 12 ? "MEDIUM" : "LOW"
      };
    }).filter(slot => slot !== null);

    // Sort by score (highest first)
    availableSlots.sort((a, b) => b.score - a.score);

    return availableSlots;
  }

  /**
   * Calculate estimated arrival time
   */
  calculateArrivalTime(slotHour, slotMinute, travelTimeMinutes) {
    const arrivalMinutes = slotMinute + travelTimeMinutes;
    const arrivalHour = slotHour + Math.floor(arrivalMinutes / 60);
    const finalMinute = arrivalMinutes % 60;
    const finalHour = arrivalHour % 24;

    return `${String(finalHour).padStart(2, '0')}:${String(finalMinute).padStart(2, '0')}`;
  }

  /**
   * Optimize route for multiple pickups using nearest neighbor algorithm
   * @param {Object} startLocation - Starting location {lat, lng}
   * @param {Array} donations - Array of donation objects with locations
   * @returns {Object} Optimized route information
   */
  optimizeRoute(startLocation, donations) {
    if (!donations || donations.length === 0) {
      return {
        route: [],
        totalDistance: 0,
        estimatedTime: 0,
        pickupOrder: []
      };
    }

    // Limit to maximum pickups per route
    const pickups = donations.slice(0, this.MAX_PICKUPS_PER_ROUTE);
    
    // Nearest neighbor algorithm
    const route = [];
    const remaining = [...pickups];
    let currentLocation = startLocation;
    let totalDistance = 0;

    while (remaining.length > 0) {
      // Find nearest donation
      let nearestIndex = 0;
      let nearestDistance = Infinity;

      remaining.forEach((donation, index) => {
        const distance = this.calculateDistance(currentLocation, donation.location);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestIndex = index;
        }
      });

      // Add to route
      const nearest = remaining[nearestIndex];
      route.push({
        donationId: nearest._id,
        location: nearest.location,
        address: nearest.pickupAddress,
        foodType: nearest.foodType,
        quantity: nearest.quantity,
        distance: Math.round(nearestDistance * 100) / 100,
        expiryTime: nearest.expiryTime
      });

      totalDistance += nearestDistance;
      currentLocation = nearest.location;
      remaining.splice(nearestIndex, 1);
    }

    // Calculate estimated time
    const travelTimeHours = totalDistance / this.AVG_SPEED_KMH;
    const pickupTimeHours = (route.length * this.AVG_PICKUP_TIME_MIN) / 60;
    const totalTimeHours = travelTimeHours + pickupTimeHours;

    return {
      route: route,
      totalDistance: Math.round(totalDistance * 100) / 100,
      estimatedTime: {
        hours: Math.floor(totalTimeHours),
        minutes: Math.round((totalTimeHours % 1) * 60),
        formatted: this.formatTime(totalTimeHours)
      },
      pickupOrder: route.map((r, index) => ({
        order: index + 1,
        donationId: r.donationId,
        foodType: r.foodType
      })),
      numberOfStops: route.length
    };
  }

  /**
   * Format time in hours and minutes
   */
  formatTime(hours) {
    const h = Math.floor(hours);
    const m = Math.round((hours % 1) * 60);
    
    if (h === 0) {
      return `${m} minutes`;
    } else if (m === 0) {
      return `${h} hour${h > 1 ? 's' : ''}`;
    } else {
      return `${h} hour${h > 1 ? 's' : ''} ${m} minutes`;
    }
  }

  /**
   * Get batch pickup suggestions for an NGO
   * @param {string} ngoId - NGO user ID
   * @param {number} radiusKm - Search radius
   * @returns {Object} Batch pickup suggestions
   */
  async getBatchPickupSuggestions(ngoId, radiusKm = 10) {
    try {
      // Get NGO details
      const ngo = await User.findById(ngoId);
      if (!ngo || !ngo.location) {
        throw new Error("NGO location not available");
      }

      // Find pending donations within radius
      const allDonations = await Donation.find({ 
        status: "pending" 
      }).populate("donor", "name email location");

      // Filter by distance
      const nearbyDonations = allDonations.filter(donation => {
        if (!donation.location) return false;
        const distance = this.calculateDistance(ngo.location, donation.location);
        return distance <= radiusKm;
      });

      if (nearbyDonations.length === 0) {
        return {
          suggestions: [],
          message: "No donations available within range"
        };
      }

      // Group by urgency
      const urgent = nearbyDonations.filter(d => {
        if (!d.expiryTime) return false;
        const hours = (new Date(d.expiryTime) - new Date()) / (1000 * 60 * 60);
        return hours <= 4;
      });

      const moderate = nearbyDonations.filter(d => {
        if (!d.expiryTime) return true;
        const hours = (new Date(d.expiryTime) - new Date()) / (1000 * 60 * 60);
        return hours > 4 && hours <= 12;
      });

      const normal = nearbyDonations.filter(d => {
        if (!d.expiryTime) return false;
        const hours = (new Date(d.expiryTime) - new Date()) / (1000 * 60 * 60);
        return hours > 12;
      });

      // Create route suggestions
      const suggestions = [];

      if (urgent.length > 0) {
        const urgentRoute = this.optimizeRoute(ngo.location, urgent);
        suggestions.push({
          priority: "URGENT",
          description: "Immediate pickup required - Food expiring soon",
          ...urgentRoute,
          recommendedTimeSlot: this.TIME_SLOTS[0] // Earliest slot
        });
      }

      if (moderate.length > 0) {
        const moderateRoute = this.optimizeRoute(ngo.location, moderate);
        suggestions.push({
          priority: "MODERATE",
          description: "Pickup recommended within next few hours",
          ...moderateRoute,
          recommendedTimeSlot: this.TIME_SLOTS[1]
        });
      }

      if (normal.length > 0) {
        const normalRoute = this.optimizeRoute(ngo.location, normal);
        suggestions.push({
          priority: "NORMAL",
          description: "Flexible pickup timing",
          ...normalRoute,
          recommendedTimeSlot: this.TIME_SLOTS[2]
        });
      }

      return {
        ngoLocation: ngo.location,
        totalDonationsAvailable: nearbyDonations.length,
        suggestions: suggestions,
        searchRadius: radiusKm
      };
    } catch (error) {
      console.error("Error in getBatchPickupSuggestions:", error);
      throw error;
    }
  }

  /**
   * Calculate optimal pickup sequence for accepted donations
   * @param {string} ngoId - NGO user ID
   * @returns {Object} Pickup sequence
   */
  async getPickupSequence(ngoId) {
    try {
      // Get NGO details
      const ngo = await User.findById(ngoId);
      if (!ngo || !ngo.location) {
        throw new Error("NGO location not available");
      }

      // Find accepted donations assigned to this NGO
      const acceptedDonations = await Donation.find({
        ngoAssigned: ngoId,
        status: "accepted"
      }).populate("donor", "name email location donorDetails");

      if (acceptedDonations.length === 0) {
        return {
          message: "No accepted donations to pickup",
          sequence: []
        };
      }

      // Optimize route
      const optimizedRoute = this.optimizeRoute(ngo.location, acceptedDonations);

      // Add time slot suggestions for each pickup
      const sequenceWithTimeSlots = optimizedRoute.route.map((stop, index) => {
        const donation = acceptedDonations.find(d => d._id.toString() === stop.donationId.toString());
        const timeSlots = this.suggestTimeSlots(donation.expiryTime, stop.distance);
        
        return {
          ...stop,
          order: index + 1,
          donor: {
            name: donation.donor.name,
            phone: donation.donor.donorDetails?.phoneNumber,
            address: donation.pickupAddress
          },
          suggestedTimeSlots: timeSlots.slice(0, 3) // Top 3 slots
        };
      });

      return {
        ngoLocation: ngo.location,
        totalPickups: acceptedDonations.length,
        optimizedRoute: {
          ...optimizedRoute,
          route: sequenceWithTimeSlots
        },
        summary: {
          totalDistance: optimizedRoute.totalDistance,
          estimatedTime: optimizedRoute.estimatedTime.formatted,
          numberOfStops: optimizedRoute.numberOfStops
        }
      };
    } catch (error) {
      console.error("Error in getPickupSequence:", error);
      throw error;
    }
  }
}

module.exports = new LogisticsService();
