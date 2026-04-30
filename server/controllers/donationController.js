// server/controllers/donationController.js

const Donation = require("../models/Donation");
const Tracking = require("../models/Tracking");
const notificationService = require("../services/notificationService");

exports.createDonation = async (req, res) => {
  try {
    // Validate user is authenticated
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const { foodType, quantity, expiryTime, location, temperature } = req.body;

    // Validate required fields
    if (!foodType || !quantity) {
      return res.status(400).json({ message: "Food type and quantity are required" });
    }

    // Validate location structure
    if (location && (!location.lat || !location.lng || typeof location.lat !== 'number' || typeof location.lng !== 'number')) {
      return res.status(400).json({ message: "Invalid location format. Location must have valid lat and lng coordinates" });
    }

    const donation = await Donation.create({
      donor: req.user._id,
      foodType,
      quantity,
      expiryTime,
      location,
      temperature,
      status: "pending"
    });

    // Populate donor information
    await donation.populate("donor", "name email");

    // Create tracking record
    await Tracking.create({
      donation: donation._id,
      status: "pending",
      currentLocation: location
    });

    // Emit Socket.io event to notify all NGOs
    const io = req.app.get("io");
    if (io) {
      io.to("ngo").emit("donation-available", {
        donation: donation,
        donor: req.user,
        message: `New food donation available: ${foodType}`,
        timestamp: new Date()
      });
    }

    // Send enhanced notifications to nearby NGOs
    await notificationService.sendNewDonationAlert(donation, io);

    res.status(201).json(donation);
  } catch (error) {
    console.error("Error in createDonation:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.getAllDonations = async (req, res) => {
  try {
    // Add pagination support
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const total = await Donation.countDocuments();
    const donations = await Donation.find()
      .populate("donor", "name email location donorDetails")
      .populate("ngoAssigned", "name email location ngoDetails")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    res.json({
      donations,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Error in getAllDonations:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.getDonationById = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id)
      .populate("donor", "name email location donorDetails")
      .populate("ngoAssigned", "name email location ngoDetails");
    
    if (!donation) {
      return res.status(404).json({ message: "Donation not found" });
    }

    res.json(donation);
  } catch (error) {
    console.error("Error in getDonationById:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.updateDonationStatus = async (req, res) => {
  try {
    const { status, ngoAssigned } = req.body;

    // Validate status transitions
    const validTransitions = {
      "pending": ["accepted", "cancelled"],
      "accepted": ["picked_up", "cancelled"],
      "picked_up": ["in_transit", "cancelled"],
      "in_transit": ["delivered", "cancelled"],
      "delivered": [], // Terminal state
      "cancelled": [] // Terminal state
    };

    const donation = await Donation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ message: "Donation not found" });
    }

    // Check if transition is valid
    const allowedTransitions = validTransitions[donation.status] || [];
    if (!allowedTransitions.includes(status)) {
      return res.status(400).json({ 
        message: `Invalid status transition from ${donation.status} to ${status}` 
      });
    }

    // Update donation
    donation.status = status;
    if (ngoAssigned) {
      donation.ngoAssigned = ngoAssigned;
    }
    await donation.save();

    res.json(donation);
  } catch (error) {
    console.error("Error in updateDonationStatus:", error);
    res.status(500).json({ message: error.message });
  }
};
