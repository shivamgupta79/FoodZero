// server/controllers/ngoController.js

const Donation = require("../models/Donation");
const Tracking = require("../models/Tracking");
const User = require("../models/User");
const notificationService = require("../services/notificationService");
const deliveryNotificationService = require("../services/deliveryNotificationService");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = "uploads/feedback";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    cb(null, "feedback-" + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("Only image files are allowed!"));
  }
}).array("images", 5); // Max 5 images

exports.getAvailableDonations = async (req, res) => {
  try {
    const donations = await Donation.find({ status: "pending" })
      .populate("donor", "name email location donorDetails")
      .sort({ createdAt: -1 });
    res.json(donations);
  } catch (error) {
    console.error("Error in getAvailableDonations:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.acceptDonation = async (req, res) => {
  try {
    // Validate user is authenticated
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Check if NGO is verified
    if (req.user.ngoDetails?.verificationStatus !== "verified") {
      return res.status(403).json({ 
        message: "Your NGO must be verified before accepting donations. Please wait for admin approval." 
      });
    }

    // Get the NGO's full details
    const ngo = await User.findById(req.user._id).select("-password");
    
    if (!ngo) {
      return res.status(404).json({ message: "NGO user not found" });
    }

    // Use atomic operation to prevent race condition
    // Only update if status is still "pending"
    const donation = await Donation.findOneAndUpdate(
      { 
        _id: req.params.id,
        status: "pending" // Only update if still pending
      },
      { 
        status: "accepted", 
        ngoAssigned: req.user._id 
      },
      { new: true }
    )
    .populate("donor", "name email location donorDetails")
    .populate("ngoAssigned", "name email location ngoDetails");

    if (!donation) {
      return res.status(400).json({ 
        message: "This donation is no longer available. It may have been accepted by another NGO." 
      });
    }

    // Update or create tracking
    let tracking = await Tracking.findOne({ donation: donation._id });
    if (tracking) {
      tracking.status = "accepted";
      tracking.updates.push({
        status: "accepted",
        note: `NGO ${ngo.name} accepted the donation`,
        timestamp: new Date()
      });
      await tracking.save();
    } else {
      // Create tracking if it doesn't exist
      tracking = await Tracking.create({
        donation: donation._id,
        status: "accepted",
        updates: [{
          status: "accepted",
          note: `NGO ${ngo.name} accepted the donation`,
          timestamp: new Date()
        }]
      });
    }

    // Emit Socket.io event to notify donor with NGO details
    const io = req.app.get("io");
    if (io && donation.donor && donation.donor._id) {
      io.to(donation.donor._id.toString()).emit("donation-update", {
        message: `Your donation has been accepted by ${ngo.name}`,
        donation: donation,
        ngo: {
          name: ngo.name,
          email: ngo.email,
          phone: ngo.ngoDetails?.contactPhone,
          address: ngo.ngoDetails?.registeredAddress,
          city: ngo.ngoDetails?.city,
          state: ngo.ngoDetails?.state,
          contactPerson: ngo.ngoDetails?.contactPerson,
          registrationNumber: ngo.ngoDetails?.registrationNumber,
          registrationType: ngo.ngoDetails?.registrationType
        },
        status: "accepted",
        timestamp: new Date()
      });
    }

    // Send enhanced notification
    await notificationService.sendDonationUpdate(donation._id, "accepted", io);

    res.json({ 
      success: true,
      message: "Donation accepted successfully",
      donation: donation 
    });
  } catch (error) {
    console.error("Error accepting donation:", error);
    res.status(400).json({ 
      message: error.message || "Failed to accept donation",
      error: error.toString()
    });
  }
};

exports.updateTracking = async (req, res) => {
  try {
    const { donationId, status, location, temperature, note } = req.body;

    const tracking = await Tracking.findOne({ donation: donationId });
    
    if (!tracking) {
      return res.status(404).json({ message: "Tracking not found" });
    }

    tracking.status = status;
    tracking.currentLocation = location;
    tracking.temperature = temperature;
    tracking.updates.push({
      status,
      location,
      note
    });

    await tracking.save();

    // Update donation status
    const donation = await Donation.findByIdAndUpdate(
      donationId, 
      { status },
      { new: true }
    ).populate("donor", "name email _id");

    // Emit Socket.io event to notify donor
    const io = req.app.get("io");
    if (io && donation.donor) {
      const statusMessages = {
        "picked_up": "Your donation has been picked up",
        "in_transit": "Your donation is in transit",
        "delivered": "Your donation has been delivered successfully!"
      };

      io.to(donation.donor._id.toString()).emit("donation-update", {
        message: statusMessages[status] || `Donation status updated to ${status}`,
        donation: donation,
        status: status,
        timestamp: new Date()
      });
    }

    // Send enhanced notification
    await notificationService.sendDonationUpdate(donationId, status, io);

    // If status is delivered, send comprehensive delivery notifications
    if (status === "delivered") {
      // Use proper async handling with error catching
      deliveryNotificationService.sendDeliveryCompletionNotifications(donationId, io)
        .catch(error => {
          console.error("Error sending delivery notifications:", error);
          // Don't fail the request if notifications fail
        });
    }

    res.json(tracking);
  } catch (error) {
    console.error("Error in updateTracking:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.updateNGODetails = async (req, res) => {
  try {
    const {
      registrationNumber,
      registrationType,
      registeredAddress,
      city,
      state,
      contactPerson,
      contactPhone,
      gstNumber,
      panNumber,
      website
    } = req.body;

    // Validate required fields
    if (!registrationNumber || !registrationType || !registeredAddress || !city || !state || !contactPerson || !contactPhone) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }

    // Update user's NGO details
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        ngoDetails: {
          registrationNumber,
          registrationType,
          registeredAddress,
          city,
          state,
          contactPerson,
          contactPhone,
          gstNumber,
          panNumber,
          website,
          verificationStatus: "pending" // Reset to pending when details are updated
        }
      },
      { new: true }
    ).select("-password");

    // Notify all admins about NGO verification submission
    const io = req.app.get("io");
    if (io) {
      io.to("admin").emit("notification", {
        message: `${user.name} submitted NGO verification details - Pending review`,
        type: "ngo-verification",
        ngoId: user._id,
        timestamp: new Date()
      });
    }

    res.json({ 
      message: "NGO details updated successfully. Waiting for admin verification.",
      ngoDetails: user.ngoDetails
    });
  } catch (error) {
    console.error("Error in updateNGODetails:", error);
    res.status(500).json({ message: error.message });
  }
};


exports.submitFeedback = async (req, res) => {
  upload(req, res, async function (err) {
    if (err) {
      return res.status(400).json({ message: err.message });
    }

    try {
      const { donationId, rating, comment, recipientCount, distributionDate } = req.body;

      // Validate required fields
      if (!donationId || !rating || !recipientCount || !distributionDate) {
        return res.status(400).json({ message: "Please fill all required fields" });
      }

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "At least one image is required" });
      }

      // Find the donation
      const donation = await Donation.findById(donationId)
        .populate("donor", "name email _id")
        .populate("ngoAssigned", "name email");

      if (!donation) {
        return res.status(404).json({ message: "Donation not found" });
      }

      // Verify the NGO is assigned to this donation
      if (donation.ngoAssigned._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "You are not authorized to submit feedback for this donation" });
      }

      // Verify donation is delivered
      if (donation.status !== "delivered") {
        return res.status(400).json({ message: "Feedback can only be submitted for delivered donations" });
      }

      // Check if feedback already exists
      if (donation.feedback && donation.feedback.submittedAt) {
        return res.status(400).json({ message: "Feedback has already been submitted for this donation" });
      }

      // Get image paths
      const imagePaths = req.files.map(file => `/uploads/feedback/${file.filename}`);

      // Update donation with feedback
      donation.feedback = {
        rating: parseInt(rating),
        comment: comment || "",
        recipientCount: parseInt(recipientCount),
        distributionDate: new Date(distributionDate),
        images: imagePaths,
        submittedBy: req.user._id,
        submittedAt: new Date()
      };

      await donation.save();

      // Notify donor via Socket.io
      const io = req.app.get("io");
      if (io && donation.donor && donation.donor._id) {
        io.to(donation.donor._id.toString()).emit("feedback-received", {
          message: `${donation.ngoAssigned.name} shared feedback on your donation!`,
          donation: donation,
          feedback: donation.feedback,
          timestamp: new Date()
        });
      }

      // Notify all admins
      if (io) {
        io.to("admin").emit("notification", {
          message: `${donation.ngoAssigned.name} submitted feedback for ${donation.foodType} donation`,
          type: "feedback-submitted",
          donationId: donation._id,
          ngoName: donation.ngoAssigned.name,
          timestamp: new Date()
        });
      }

      res.json({
        success: true,
        message: "Feedback submitted successfully",
        feedback: donation.feedback
      });
    } catch (error) {
      console.error("Error submitting feedback:", error);
      res.status(400).json({ message: error.message || "Failed to submit feedback" });
    }
  });
};

// Export the upload middleware for use in routes
exports.uploadFeedbackImages = upload;
