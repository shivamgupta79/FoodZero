// server/routes/donationRoutes.js

const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  createDonation,
  getAllDonations,
  getDonationById,
  updateDonationStatus
} = require("../controllers/donationController");

router.post("/create", protect, createDonation);
router.get("/all", getAllDonations);
router.get("/:id", getDonationById);
router.put("/:id", protect, updateDonationStatus);

module.exports = router;