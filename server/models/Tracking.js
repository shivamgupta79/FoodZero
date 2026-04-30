// server/models/Tracking.js

const mongoose = require("mongoose");

const trackingSchema = new mongoose.Schema({
  donation: { type: mongoose.Schema.Types.ObjectId, ref: "Donation", required: true },
  status: { 
    type: String, 
    enum: ["pending", "accepted", "picked_up", "in_transit", "delivered", "cancelled"],
    default: "pending"
  },
  currentLocation: {
    lat: Number,
    lng: Number
  },
  temperature: Number,
  estimatedDelivery: Date,
  updates: [{
    status: String,
    timestamp: { type: Date, default: Date.now },
    location: {
      lat: Number,
      lng: Number
    },
    note: String
  }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Tracking", trackingSchema);
