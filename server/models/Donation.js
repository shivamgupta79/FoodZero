// server/models/Donation.js

const mongoose = require("mongoose");

const donationSchema = new mongoose.Schema({
  donor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  foodType: {
    type: String,
    required: [true, "Food type is required"]
  },
  quantity: {
    type: String, // Changed to String to accept "10kgs", "5 plates", etc.
    required: [true, "Quantity is required"]
  },
  quantityNumber: {
    type: Number, // Numeric value for calculations
    default: 0
  },
  quantityUnit: {
    type: String, // kg, plates, servings, liters, etc.
    enum: ["kg", "grams", "plates", "servings", "liters", "pieces", "boxes", "bags", ""],
    default: ""
  },
  expiryTime: Date,
  status: { 
    type: String, 
    enum: ["pending", "accepted", "picked_up", "in_transit", "delivered", "cancelled"],
    default: "pending" 
  },
  temperature: Number,
  ngoAssigned: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  location: {
    lat: {
      type: Number,
      required: [true, "Location latitude is required"]
    },
    lng: {
      type: Number,
      required: [true, "Location longitude is required"]
    }
  },
  pickupAddress: String, // Human-readable address
  specialInstructions: String, // Additional notes from donor
  foodCategory: {
    type: String,
    enum: ["cooked", "raw", "packaged", "fruits", "vegetables", "dairy", "bakery", "other"],
    default: "other"
  },
  perishable: {
    type: Boolean,
    default: true
  },
  feedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    recipientCount: Number,
    distributionDate: Date,
    images: [String], // Array of image URLs
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    submittedAt: Date
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
donationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Parse quantity string to extract number and unit
donationSchema.pre('save', function(next) {
  if (this.quantity && typeof this.quantity === 'string') {
    // Extract number from quantity string
    const match = this.quantity.match(/(\d+\.?\d*)/);
    if (match) {
      this.quantityNumber = parseFloat(match[1]);
    }
    
    // Extract unit from quantity string
    const unitMatch = this.quantity.toLowerCase().match(/(kg|kgs|gram|grams|g|plate|plates|serving|servings|liter|liters|l|piece|pieces|box|boxes|bag|bags)/);
    if (unitMatch) {
      const unit = unitMatch[1];
      // Normalize units
      if (unit.includes('kg')) this.quantityUnit = 'kg';
      else if (unit.includes('gram') || unit === 'g') this.quantityUnit = 'grams';
      else if (unit.includes('plate')) this.quantityUnit = 'plates';
      else if (unit.includes('serving')) this.quantityUnit = 'servings';
      else if (unit.includes('liter') || unit === 'l') this.quantityUnit = 'liters';
      else if (unit.includes('piece')) this.quantityUnit = 'pieces';
      else if (unit.includes('box')) this.quantityUnit = 'boxes';
      else if (unit.includes('bag')) this.quantityUnit = 'bags';
    }
  }
  next();
});

// Add indexes for frequently queried fields
donationSchema.index({ status: 1 });
donationSchema.index({ donor: 1 });
donationSchema.index({ ngoAssigned: 1 });
donationSchema.index({ createdAt: -1 });
donationSchema.index({ status: 1, createdAt: -1 }); // Compound index for status + date queries
donationSchema.index({ 'location.lat': 1, 'location.lng': 1 }); // Geospatial queries

module.exports = mongoose.model("Donation", donationSchema);