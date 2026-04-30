// server/routes/gps.js

const express = require("express");
const router = express.Router();
const gpsController = require("../controllers/gpsController");
const { protect } = require("../middleware/authMiddleware");

// All routes require authentication
router.use(protect);

// Start GPS tracking for a donation
router.post("/start/:donationId", gpsController.startTracking);

// Update GPS location
router.post("/update/:donationId", gpsController.updateLocation);

// Stop GPS tracking
router.post("/stop/:donationId", gpsController.stopTracking);

// Get tracking details for a donation
router.get("/details/:donationId", gpsController.getTrackingDetails);

// Get tracking history for a donation
router.get("/history/:donationId", gpsController.getTrackingHistory);

// Get all active tracking sessions (Admin only)
router.get("/active-sessions", gpsController.getActiveSessions);

// Simulate GPS tracking (Development/Testing only)
router.post("/simulate/:donationId", gpsController.simulateTracking);

module.exports = router;