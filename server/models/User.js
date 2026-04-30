// server/models/User.js

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"]
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [6, "Password must be at least 6 characters"]
  },
  role: { 
    type: String, 
    enum: ["donor", "ngo", "admin"],
    default: "donor",
    required: true
  },
  location: {
    lat: Number,
    lng: Number
  },
  // Donor Verification Fields
  donorDetails: {
    phoneNumber: {
      type: String,
      required: false
    },
    address: {
      type: String,
      required: false
    },
    donorType: {
      type: String,
      enum: ["household", "restaurant", "store", "hotel", ""],
      default: ""
    },
    phoneVerified: {
      type: Boolean,
      default: false
    },
    phoneVerifiedAt: Date,
    emailVerified: {
      type: Boolean,
      default: false
    },
    emailVerifiedAt: Date,
    locationVerified: {
      type: Boolean,
      default: false
    },
    locationVerifiedAt: Date,
    // Level 2 Verification Fields
    govtIdType: {
      type: String,
      enum: ["aadhaar", "pan", "driving_license", "passport", "voter_id", ""],
      default: ""
    },
    govtIdNumber: String,
    govtIdFrontUrl: String, // URL to uploaded front image
    govtIdBackUrl: String, // URL to uploaded back image
    govtIdVerified: {
      type: Boolean,
      default: false
    },
    govtIdVerifiedAt: Date,
    // FSSAI for businesses (restaurant, hotel, store)
    fssaiNumber: String,
    fssaiCertificateUrl: String,
    fssaiVerified: {
      type: Boolean,
      default: false
    },
    fssaiVerifiedAt: Date,
    // AI Risk Detection
    aiRiskScore: {
      type: Number,
      default: 0, // 0-100, higher = more risky
      min: 0,
      max: 100
    },
    aiRiskFlags: [String], // Array of risk indicators
    aiRiskCheckedAt: Date,
    // Admin Approval
    adminApprovalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected", "under_review"],
      default: "pending"
    },
    adminApprovedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    adminApprovedAt: Date,
    adminRejectionReason: String,
    adminNotes: String,
    // Overall Verification
    verificationStatus: {
      type: String,
      enum: ["unverified", "partial", "verified", "pending_admin"],
      default: "unverified"
    },
    verificationLevel: {
      type: Number,
      default: 0 // 0 = unverified, 1 = basic, 2 = enhanced
    },
    verificationSubmittedAt: Date
  },
  // NGO Verification Fields
  ngoDetails: {
    ngoType: {
      type: String,
      enum: ["organization", "individual"],
      default: "organization"
    },
    registrationNumber: {
      type: String,
      required: false
    },
    registrationType: {
      type: String,
      enum: ["Trust", "Society", "Section8", ""],
      default: ""
    },
    registeredAddress: String,
    city: String,
    state: String,
    contactPerson: String,
    contactPhone: String,
    gstNumber: String,
    panNumber: String,
    website: String,
    certificateUrl: String, // URL to uploaded certificate
    verificationStatus: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending"
    },
    verificationDate: Date,
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    rejectionReason: String
  },
  // Subscription Details
  subscription: {
    plan: {
      type: String,
      enum: ["free", "basic", "premium", "enterprise", "starter", "professional"],
      default: "free"
    },
    status: {
      type: String,
      enum: ["active", "inactive", "cancelled", "expired"],
      default: "active"
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: Date,
    autoRenew: {
      type: Boolean,
      default: false
    },
    paymentMethod: String,
    lastPaymentDate: Date,
    nextBillingDate: Date,
    transactionHistory: [{
      amount: Number,
      date: { type: Date, default: Date.now },
      status: String,
      transactionId: String,
      plan: String
    }]
  },
  // Notification Preferences
  notificationPreferences: {
    push: { type: Boolean, default: true },
    sms: { type: Boolean, default: false },
    email: { type: Boolean, default: true },
    whatsapp: { type: Boolean, default: true }, // Default enabled for WhatsApp
    quietHours: {
      start: String, // "22:00"
      end: String    // "08:00"
    },
    // Notification type preferences
    "donation-accepted": { type: Boolean, default: true },
    "donation-delivered": { type: Boolean, default: true },
    "new-donation": { type: Boolean, default: true },
    "geofence-alert": { type: Boolean, default: true },
    "feedback-received": { type: Boolean, default: true },
    "verification-approved": { type: Boolean, default: true },
    "system-alert": { type: Boolean, default: true }
  },
  // FCM Token for push notifications
  fcmToken: String,
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Index for faster email lookups
userSchema.index({ email: 1 });

module.exports = mongoose.model("User", userSchema);