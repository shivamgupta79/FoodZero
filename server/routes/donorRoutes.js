// server/routes/donorRoutes.js

const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  updateDonorDetails,
  verifyPhone,
  sendPhoneOTP,
  verifyEmail,
  sendEmailVerification,
  verifyLocation,
  uploadDocuments,
  adminApproveDonor,
  getPendingDonorVerifications
} = require("../controllers/donorController");

router.put("/update-details", protect, authorize("donor"), updateDonorDetails);
router.post("/send-phone-otp", protect, authorize("donor"), sendPhoneOTP);
router.post("/verify-phone", protect, authorize("donor"), verifyPhone);
router.post("/send-email-verification", protect, authorize("donor"), sendEmailVerification);
router.post("/verify-email", protect, authorize("donor"), verifyEmail);
router.post("/verify-location", protect, authorize("donor"), verifyLocation);
router.post("/upload-documents", protect, authorize("donor"), uploadDocuments);

// Admin routes for donor verification
router.get("/pending-verifications", protect, authorize("admin"), getPendingDonorVerifications);
router.post("/admin-approve", protect, authorize("admin"), adminApproveDonor);

module.exports = router;
