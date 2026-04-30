// server/controllers/adminController.js

const User = require("../models/User");
const Donation = require("../models/Donation");

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    console.error("Error in getAllUsers:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalDonations = await Donation.countDocuments();
    const pendingDonations = await Donation.countDocuments({ status: "pending" });
    const completedDonations = await Donation.countDocuments({ status: "delivered" });
    const activePickups = await Donation.countDocuments({ status: "accepted" });
    
    const totalDonors = await User.countDocuments({ role: "donor" });
    const totalNGOs = await User.countDocuments({ role: "ngo" });
    const pendingNGOs = await User.countDocuments({ 
      role: "ngo",
      "ngoDetails.verificationStatus": "pending"
    });

    res.json({
      totalUsers,
      totalDonations,
      pendingDonations,
      completedDonations,
      activePickups,
      totalDonors,
      totalNGOs,
      pendingNGOs
    });
  } catch (error) {
    console.error("Error in getDashboardStats:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error in deleteUser:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get pending NGO verifications
exports.getPendingNGOs = async (req, res) => {
  try {
    const pendingNGOs = await User.find({ 
      role: "ngo",
      "ngoDetails.verificationStatus": "pending"
    }).select("-password");
    res.json(pendingNGOs);
  } catch (error) {
    console.error("Error in getPendingNGOs:", error);
    res.status(500).json({ message: error.message });
  }
};

// Verify NGO
exports.verifyNGO = async (req, res) => {
  try {
    const { ngoId, status, rejectionReason } = req.body;

    const updateData = {
      "ngoDetails.verificationStatus": status,
      "ngoDetails.verificationDate": new Date(),
      "ngoDetails.verifiedBy": req.user._id
    };

    if (status === "rejected" && rejectionReason) {
      updateData["ngoDetails.rejectionReason"] = rejectionReason;
    }

    const ngo = await User.findByIdAndUpdate(
      ngoId,
      updateData,
      { new: true }
    ).select("-password");

    if (!ngo) {
      return res.status(404).json({ message: "NGO not found" });
    }

    // Notify NGO via Socket.io with updated user data
    const io = req.app.get("io");
    if (io) {
      io.to(ngoId).emit("verification-status-updated", {
        message: status === "verified" 
          ? "🎉 Your NGO has been verified! You can now accept food donations."
          : `❌ Your NGO verification was rejected. Reason: ${rejectionReason}`,
        type: "verification-update",
        status: status,
        user: {
          _id: ngo._id,
          name: ngo.name,
          email: ngo.email,
          role: ngo.role,
          ngoDetails: ngo.ngoDetails,
          location: ngo.location
        },
        timestamp: new Date()
      });
    }

    res.json({ 
      message: `NGO ${status} successfully`,
      ngo 
    });
  } catch (error) {
    console.error("Error in verifyNGO:", error);
    res.status(500).json({ message: error.message });
  }
};
