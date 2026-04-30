// server/routes/matchingRoutes.js

const express = require("express");
const router = express.Router();
const matchingController = require("../controllers/matchingController");
const { protect } = require("../middleware/authMiddleware");

// All routes require authentication
router.use(protect);

// Find best matches for a donation
router.get("/find/:donationId", matchingController.findMatches);

// Auto-assign donation to best match
router.post("/auto-assign/:donationId", matchingController.autoAssign);

// Get time slot suggestions
router.get("/time-slots/:donationId", matchingController.getTimeSlots);

// Get batch pickup suggestions (NGO only)
router.get("/batch-suggestions", matchingController.getBatchSuggestions);

// Get optimized pickup sequence (NGO only)
router.get("/pickup-sequence", matchingController.getPickupSequence);

// Get smart recommendations for user
router.get("/recommendations", matchingController.getRecommendations);

module.exports = router;
