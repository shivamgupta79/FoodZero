// server/routes/adminRoutes.js

const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  getAllUsers,
  getDashboardStats,
  deleteUser,
  getPendingNGOs,
  verifyNGO
} = require("../controllers/adminController");

router.get("/users", protect, authorize("admin"), getAllUsers);
router.get("/stats", protect, authorize("admin"), getDashboardStats);
router.delete("/users/:id", protect, authorize("admin"), deleteUser);
router.get("/pending-ngos", protect, authorize("admin"), getPendingNGOs);
router.post("/verify-ngo", protect, authorize("admin"), verifyNGO);

module.exports = router;
