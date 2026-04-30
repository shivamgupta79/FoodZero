// server/controllers/authController.js

const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, role, ngoType } = req.body;

    // Validation
    if (!name || !email || !password || !role) {
      return res.status(400).json({ 
        message: "Please provide all required fields: name, email, password, role" 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        message: "User with this email already exists" 
      });
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // Create user data
    const userData = {
      name,
      email,
      password: hashed,
      role
    };

    // Initialize empty NGO details if role is NGO
    if (role === "ngo") {
      userData.ngoDetails = {
        ngoType: ngoType || "organization", // Default to organization if not specified
        verificationStatus: "pending" // Default status, details to be filled later
      };
    }

    // Initialize donor details if role is donor
    if (role === "donor") {
      userData.donorDetails = {
        verificationStatus: "unverified",
        verificationLevel: 0,
        phoneVerified: false,
        emailVerified: false,
        locationVerified: false
      };
    }

    // Create user
    const user = await User.create(userData);

    // Return user without password
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      ngoDetails: user.ngoDetails,
      donorDetails: user.donorDetails,
      createdAt: user.createdAt
    };

    const accountTypeMessage = role === "ngo" 
      ? (ngoType === "individual" 
        ? "Individual volunteer account created successfully. Please complete your verification details from your dashboard."
        : "NGO account created successfully. Please complete your verification details from your dashboard.")
      : "User registered successfully";

    res.status(201).json({ 
      message: accountTypeMessage,
      user: userResponse 
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ 
      message: "Registration failed. Please try again.",
      error: error.message 
    });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ 
        message: "Please provide email and password" 
      });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ 
        message: "Invalid email or password" 
      });
    }

    // Check password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ 
        message: "Invalid email or password" 
      });
    }

    // Generate token
    const token = jwt.sign(
      { id: user._id, role: user.role }, 
      process.env.JWT_SECRET || "SECRET_KEY",
      { expiresIn: "7d" }
    );

    // Return user without password
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      ngoDetails: user.ngoDetails,
      donorDetails: user.donorDetails
    };

    res.json({ 
      message: "Login successful",
      token, 
      user: userResponse 
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ 
      message: "Login failed. Please try again.",
      error: error.message 
    });
  }
};


// Get current user profile (for refreshing user data)
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      ngoDetails: user.ngoDetails,
      donorDetails: user.donorDetails,
      location: user.location
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ 
      message: "Failed to fetch profile",
      error: error.message 
    });
  }
};
