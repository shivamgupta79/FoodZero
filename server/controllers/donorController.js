// server/controllers/donorController.js

const User = require("../models/User");

// Note: Install multer for file uploads: npm install multer
// Uncomment the following lines after installing multer
/*
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure upload directory exists
const uploadDir = 'uploads/verification/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images (JPEG, PNG) and PDF files are allowed!'));
    }
  }
}).fields([
  { name: 'govtIdFront', maxCount: 1 },
  { name: 'govtIdBack', maxCount: 1 },
  { name: 'fssaiCertificate', maxCount: 1 }
]);
*/

exports.updateDonorDetails = async (req, res) => {
  try {
    const {
      phoneNumber,
      address,
      donorType,
      location
    } = req.body;

    // Validate required fields
    if (!phoneNumber || !address || !donorType) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }

    // Update user's donor details
    const updateData = {
      donorDetails: {
        phoneNumber,
        address,
        donorType,
        phoneVerified: false,
        emailVerified: false,
        locationVerified: false,
        verificationStatus: "unverified",
        verificationLevel: 0
      }
    };

    // Update location if provided
    if (location && location.lat && location.lng) {
      updateData.location = {
        lat: location.lat,
        lng: location.lng
      };
      updateData.donorDetails.locationVerified = true;
      updateData.donorDetails.locationVerifiedAt = new Date();
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true }
    ).select("-password");

    res.json({ 
      message: "Donor details updated successfully.",
      donorDetails: user.donorDetails,
      location: user.location
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.verifyPhone = async (req, res) => {
  try {
    const { phoneNumber, otp } = req.body;

    // TODO: Implement actual OTP verification with Twilio/Firebase
    // For now, we'll simulate verification
    
    // Simulate OTP check (in production, verify against sent OTP)
    const isValidOTP = otp === "123456"; // Placeholder

    if (!isValidOTP) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Update user's phone verification status
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        "donorDetails.phoneVerified": true,
        "donorDetails.phoneVerifiedAt": new Date(),
        "donorDetails.phoneNumber": phoneNumber
      },
      { new: true }
    ).select("-password");

    // Check if all verifications are complete (await the promise)
    await updateVerificationStatus(user._id);

    res.json({ 
      message: "Phone number verified successfully!",
      donorDetails: user.donorDetails
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.sendPhoneOTP = async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({ message: "Phone number is required" });
    }

    // TODO: Implement actual OTP sending with Twilio/Firebase
    // For now, we'll simulate sending
    console.log(`Sending OTP to ${phoneNumber}: 123456`);

    res.json({ 
      message: "OTP sent successfully to your phone number",
      // In development, return OTP (remove in production)
      devOTP: "123456"
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;

    // TODO: Implement actual email verification token check
    // For now, we'll simulate verification
    
    const isValidToken = token && token.length > 10; // Placeholder

    if (!isValidToken) {
      return res.status(400).json({ message: "Invalid verification token" });
    }

    // Update user's email verification status
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        "donorDetails.emailVerified": true,
        "donorDetails.emailVerifiedAt": new Date()
      },
      { new: true }
    ).select("-password");

    // Check if all verifications are complete
    await updateVerificationStatus(user._id);

    res.json({ 
      message: "Email verified successfully!",
      donorDetails: user.donorDetails
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.sendEmailVerification = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // TODO: Implement actual email sending with verification link
    // For now, we'll simulate sending
    const verificationToken = generateVerificationToken();
    console.log(`Sending verification email to ${user.email}`);
    console.log(`Verification link: /verify-email?token=${verificationToken}`);

    res.json({ 
      message: "Verification email sent successfully",
      // In development, return token (remove in production)
      devToken: verificationToken
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.verifyLocation = async (req, res) => {
  try {
    const { lat, lng } = req.body;

    if (!lat || !lng) {
      return res.status(400).json({ message: "Location coordinates are required" });
    }

    // Update user's location and verification status
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        location: { lat, lng },
        "donorDetails.locationVerified": true,
        "donorDetails.locationVerifiedAt": new Date()
      },
      { new: true }
    ).select("-password");

    // Check if all verifications are complete
    await updateVerificationStatus(user._id);

    res.json({ 
      message: "Location verified successfully!",
      donorDetails: user.donorDetails,
      location: user.location
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Helper function to update overall verification status
async function updateVerificationStatus(userId) {
  const user = await User.findById(userId);
  
  if (!user || !user.donorDetails) return;

  const { phoneVerified, emailVerified, locationVerified } = user.donorDetails;
  
  let verificationStatus = "unverified";
  let verificationLevel = 0;

  // Check verification level
  if (phoneVerified && emailVerified && locationVerified) {
    verificationStatus = "verified";
    verificationLevel = 1; // Level 1 - Basic Verification
  } else if (phoneVerified || emailVerified || locationVerified) {
    verificationStatus = "partial";
    verificationLevel = 0;
  }

  await User.findByIdAndUpdate(userId, {
    "donorDetails.verificationStatus": verificationStatus,
    "donorDetails.verificationLevel": verificationLevel
  });
}

// Helper function to generate verification token
function generateVerificationToken() {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

module.exports = exports;


// Upload Government ID and FSSAI Certificate
exports.uploadDocuments = async (req, res) => {
  try {
    // TODO: Install multer first: npm install multer
    // Then uncomment the multer code at the top of this file
    
    // For now, accept base64 encoded images or URLs
    const { govtIdType, govtIdNumber, fssaiNumber, govtIdFrontUrl, govtIdBackUrl, fssaiCertificateUrl } = req.body;

    if (!govtIdType || !govtIdNumber) {
      return res.status(400).json({ message: "Government ID type and number are required" });
    }

    if (!govtIdFrontUrl) {
      return res.status(400).json({ message: "Government ID front image is required" });
    }

    const updateData = {
      "donorDetails.govtIdType": govtIdType,
      "donorDetails.govtIdNumber": govtIdNumber,
      "donorDetails.govtIdFrontUrl": govtIdFrontUrl,
    };

    if (govtIdBackUrl) {
      updateData["donorDetails.govtIdBackUrl"] = govtIdBackUrl;
    }

    // FSSAI for businesses
    const user = await User.findById(req.user._id);
    const requiresFSSAI = ["restaurant", "hotel", "store"].includes(user.donorDetails.donorType);

    if (requiresFSSAI) {
      if (!fssaiNumber || !fssaiCertificateUrl) {
        return res.status(400).json({ 
          message: "FSSAI number and certificate are required for businesses" 
        });
      }
      updateData["donorDetails.fssaiNumber"] = fssaiNumber;
      updateData["donorDetails.fssaiCertificateUrl"] = fssaiCertificateUrl;
    }

    // Update verification status to pending admin
    updateData["donorDetails.verificationStatus"] = "pending_admin";
    updateData["donorDetails.verificationSubmittedAt"] = new Date();

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true }
    ).select("-password");

    // Run AI risk detection
    await runAIRiskDetection(req.user._id);

    // Notify admins
    const io = req.app.get("io");
    if (io) {
      io.to("admin").emit("notification", {
        message: `${updatedUser.name} submitted verification documents - Pending review`,
        type: "donor-verification",
        donorId: updatedUser._id,
        timestamp: new Date()
      });
    }

    res.json({
      message: "Documents uploaded successfully. Pending admin approval.",
      donorDetails: updatedUser.donorDetails
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// AI Risk Detection (Simulated - integrate with actual AI service)
async function runAIRiskDetection(userId) {
  try {
    const user = await User.findById(userId);
    
    if (!user || !user.donorDetails) return;

    // TODO: Integrate with actual AI service (e.g., AWS Rekognition, Google Vision API)
    // For now, simulate risk detection
    
    const riskFlags = [];
    let riskScore = 0;

    // Simulate checks
    // 1. Check if ID images are clear (placeholder)
    // 2. Check for duplicate IDs in database
    const duplicateId = await User.findOne({
      "donorDetails.govtIdNumber": user.donorDetails.govtIdNumber,
      "_id": { $ne: userId }
    });

    if (duplicateId) {
      riskFlags.push("duplicate_id");
      riskScore += 50;
    }

    // 3. Check for suspicious patterns (placeholder)
    if (user.donorDetails.phoneNumber && user.donorDetails.phoneNumber.includes("0000")) {
      riskFlags.push("suspicious_phone");
      riskScore += 20;
    }

    // 4. Check location consistency (placeholder)
    // 5. Check document authenticity (placeholder)

    // Update user with AI risk assessment
    await User.findByIdAndUpdate(userId, {
      "donorDetails.aiRiskScore": Math.min(riskScore, 100),
      "donorDetails.aiRiskFlags": riskFlags,
      "donorDetails.aiRiskCheckedAt": new Date()
    });

    return { riskScore, riskFlags };
  } catch (error) {
    console.error("AI Risk Detection Error:", error);
    return { riskScore: 0, riskFlags: [] };
  }
}

// Get nearby NGOs within 5km radius
async function getNearbyNGOs(location, radiusKm = 5) {
  try {
    // Convert km to degrees (approximate)
    const radiusDegrees = radiusKm / 111; // 1 degree ≈ 111 km

    const ngos = await User.find({
      role: "ngo",
      "ngoDetails.verificationStatus": "verified",
      "location.lat": {
        $gte: location.lat - radiusDegrees,
        $lte: location.lat + radiusDegrees
      },
      "location.lng": {
        $gte: location.lng - radiusDegrees,
        $lte: location.lng + radiusDegrees
      }
    }).select("name email location");

    // Filter by actual distance using Haversine formula
    const nearbyNGOs = ngos.filter(ngo => {
      if (!ngo.location || !ngo.location.lat || !ngo.location.lng) return false;
      
      const distance = calculateDistance(
        location.lat,
        location.lng,
        ngo.location.lat,
        ngo.location.lng
      );
      
      return distance <= radiusKm;
    });

    return nearbyNGOs;
  } catch (error) {
    console.error("Get Nearby NGOs Error:", error);
    return [];
  }
}

// Calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Admin: Approve Donor Verification
exports.adminApproveDonor = async (req, res) => {
  try {
    const { donorId, approved, rejectionReason, notes } = req.body;

    if (!donorId) {
      return res.status(400).json({ message: "Donor ID is required" });
    }

    const donor = await User.findById(donorId);

    if (!donor || donor.role !== "donor") {
      return res.status(404).json({ message: "Donor not found" });
    }

    const updateData = {
      "donorDetails.adminApprovalStatus": approved ? "approved" : "rejected",
      "donorDetails.adminApprovedBy": req.user._id,
      "donorDetails.adminApprovedAt": new Date(),
      "donorDetails.adminNotes": notes || ""
    };

    if (approved) {
      // Check if all verifications are complete
      const allVerified = 
        donor.donorDetails.phoneVerified &&
        donor.donorDetails.emailVerified &&
        donor.donorDetails.locationVerified &&
        donor.donorDetails.govtIdFrontUrl;

      if (allVerified) {
        updateData["donorDetails.verificationStatus"] = "verified";
        updateData["donorDetails.verificationLevel"] = 2; // Level 2 - Enhanced
        updateData["donorDetails.govtIdVerified"] = true;
        updateData["donorDetails.govtIdVerifiedAt"] = new Date();

        // Verify FSSAI if applicable
        if (donor.donorDetails.fssaiNumber) {
          updateData["donorDetails.fssaiVerified"] = true;
          updateData["donorDetails.fssaiVerifiedAt"] = new Date();
        }
      }
    } else {
      updateData["donorDetails.verificationStatus"] = "unverified";
      updateData["donorDetails.adminRejectionReason"] = rejectionReason || "Documents not verified";
    }

    const updatedDonor = await User.findByIdAndUpdate(
      donorId,
      updateData,
      { new: true }
    ).select("-password");

    // Notify donor via Socket.io with updated user data
    const io = req.app.get("io");
    if (io) {
      io.to(donorId.toString()).emit("verification-status-updated", {
        message: approved 
          ? "🎉 Your verification has been approved! You're now a verified donor."
          : `❌ Your verification was rejected: ${rejectionReason || "Please resubmit documents"}`,
        type: "verification-update",
        approved: approved,
        user: {
          _id: updatedDonor._id,
          name: updatedDonor.name,
          email: updatedDonor.email,
          role: updatedDonor.role,
          donorDetails: updatedDonor.donorDetails,
          location: updatedDonor.location
        },
        timestamp: new Date()
      });

      // If approved, notify nearby NGOs
      if (approved && updatedDonor.location) {
        const nearbyNGOs = await getNearbyNGOs(updatedDonor.location, 5);
        
        nearbyNGOs.forEach(ngo => {
          io.to(ngo._id.toString()).emit("notification", {
            message: `New verified donor in your area: ${updatedDonor.name} (${updatedDonor.donorDetails.donorType})`,
            type: "new-donor-nearby",
            donorId: updatedDonor._id,
            donorType: updatedDonor.donorDetails.donorType,
            distance: calculateDistance(
              ngo.location.lat,
              ngo.location.lng,
              updatedDonor.location.lat,
              updatedDonor.location.lng
            ).toFixed(2) + " km",
            timestamp: new Date()
          });
        });
      }
    }

    res.json({
      message: approved ? "Donor approved successfully" : "Donor verification rejected",
      donor: updatedDonor
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get pending donor verifications (Admin)
exports.getPendingDonorVerifications = async (req, res) => {
  try {
    const pendingDonors = await User.find({
      role: "donor",
      "donorDetails.adminApprovalStatus": "pending",
      "donorDetails.verificationStatus": "pending_admin"
    }).select("-password").sort({ "donorDetails.verificationSubmittedAt": -1 });

    res.json(pendingDonors);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
