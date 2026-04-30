// server/routes/ngoRoutes.js

const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  getAvailableDonations,
  acceptDonation,
  updateTracking,
  updateNGODetails,
  submitFeedback
} = require("../controllers/ngoController");

router.get("/donations", protect, authorize("ngo"), getAvailableDonations);
router.put("/accept/:id", protect, authorize("ngo"), acceptDonation);
router.post("/tracking", protect, authorize("ngo"), updateTracking);
router.put("/update-details", protect, authorize("ngo"), updateNGODetails);
router.post("/feedback", protect, authorize("ngo"), submitFeedback);

module.exports = router;
