// server/server.js

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

// Validate environment variables before starting
const validateEnv = require("./config/validateEnv");
validateEnv();

const authRoutes = require("./routes/authRoutes");
const donationRoutes = require("./routes/donationRoutes");
const ngoRoutes = require("./routes/ngoRoutes");
const adminRoutes = require("./routes/adminRoutes");
const donorRoutes = require("./routes/donorRoutes");
const matchingRoutes = require("./routes/matchingRoutes");
const gpsRoutes = require("./routes/gps");
const notificationRoutes = require("./routes/notifications");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true
}));
app.use(express.json());

// Add input sanitization and validation
const { sanitizeInput, validateInputLength } = require("./middleware/sanitize");
app.use(sanitizeInput);
app.use(validateInputLength);

// Serve uploaded files statically
app.use("/uploads", express.static("uploads"));

// Database connection
const connectDB = require("./config/db");
connectDB();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/donations", donationRoutes);
app.use("/api/ngo", ngoRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/donor", donorRoutes);
app.use("/api/matching", matchingRoutes);
app.use("/api/gps", gpsRoutes);
app.use("/api/notifications", notificationRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error("Global error handler:", err);
  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
    error: process.env.NODE_ENV === "development" ? err : {}
  });
});

// 404 handler
app.use((req, res) => {
  console.log("404 - Route not found:", req.method, req.url);
  res.status(404).json({ message: "Route not found" });
});

// Socket.io setup
require("./socket")(io);

// Make io available to controllers
app.set("io", io);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { app, io };
