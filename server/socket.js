// server/socket.js

const jwt = require("jsonwebtoken");
const User = require("./models/User");

module.exports = (io) => {
  // Socket.io authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(" ")[1];
      
      if (!token) {
        return next(new Error("Authentication error: No token provided"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("-password");
      
      if (!user) {
        return next(new Error("Authentication error: User not found"));
      }

      socket.user = user;
      next();
    } catch (error) {
      console.error("Socket authentication error:", error);
      next(new Error("Authentication error: Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    console.log("New client connected:", socket.id, "User:", socket.user.name);

    // Join room based on user role and ID
    socket.on("join", (userData) => {
      if (socket.user._id) {
        socket.join(socket.user._id.toString());
        console.log(`User ${socket.user._id} joined their room`);
      }
      if (socket.user.role) {
        socket.join(socket.user.role); // Join role-based room (donor, ngo, admin)
        console.log(`User joined ${socket.user.role} room`);
      }
    });

    // New donation created - notify all NGOs
    socket.on("new-donation", (data) => {
      console.log("New donation created, notifying NGOs");
      // Broadcast to all NGOs
      io.to("ngo").emit("donation-available", {
        donation: data.donation,
        donor: data.donor,
        message: data.message,
        timestamp: new Date()
      });
    });

    // NGO food request - notify all donors
    socket.on("ngo-request", (data) => {
      try {
        console.log("NGO food request, notifying donors");
        // Broadcast to all donors
        io.to("donor").emit("ngo-needs-food", {
          ngo: data.ngo,
          request: data.request,
          message: data.message,
          timestamp: new Date()
        });
      } catch (error) {
        console.error("Error handling ngo-request:", error);
        socket.emit("error", { message: "Failed to process request" });
      }
    });

    // Donation accepted - notify donor
    socket.on("donation-accepted", (data) => {
      try {
        console.log("Donation accepted, notifying donor");
        if (data.donorId) {
          io.to(data.donorId).emit("donation-update", {
            message: `Your donation has been accepted by ${data.ngoName}`,
            donation: data.donation,
            status: "accepted",
            timestamp: new Date()
          });
        }
      } catch (error) {
        console.error("Error handling donation-accepted:", error);
        socket.emit("error", { message: "Failed to send notification" });
      }
    });

    // Status update - notify donor
    socket.on("status-update", (data) => {
      try {
        console.log("Status updated, notifying donor");
        if (data.donorId) {
          io.to(data.donorId).emit("donation-update", {
            message: data.message,
            donation: data.donation,
            status: data.status,
            timestamp: new Date()
          });
        }
      } catch (error) {
        console.error("Error handling status-update:", error);
        socket.emit("error", { message: "Failed to send update" });
      }
    });

    // Donation updates (legacy support)
    socket.on("donation-update", (data) => {
      try {
        io.emit("donation-updated", data);
      } catch (error) {
        console.error("Error handling donation-update:", error);
      }
    });

    // Tracking updates
    socket.on("tracking-update", (data) => {
      try {
        // Emit to donor and NGO
        if (data.donorId) {
          io.to(data.donorId).emit("tracking-updated", data);
        }
        if (data.ngoId) {
          io.to(data.ngoId).emit("tracking-updated", data);
        }
      } catch (error) {
        console.error("Error handling tracking-update:", error);
        socket.emit("error", { message: "Failed to send tracking update" });
      }
    });

    // General notifications
    socket.on("send-notification", (data) => {
      try {
        if (data.userId) {
          io.to(data.userId).emit("notification", {
            message: data.message,
            type: data.type || "info",
            timestamp: new Date()
          });
        }
      } catch (error) {
        console.error("Error handling send-notification:", error);
        socket.emit("error", { message: "Failed to send notification" });
      }
    });

    // Broadcast to all users
    socket.on("broadcast", (data) => {
      try {
        io.emit("notification", {
          message: data.message,
          type: data.type || "info",
          timestamp: new Date()
        });
      } catch (error) {
        console.error("Error handling broadcast:", error);
      }
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });

    // Handle socket errors
    socket.on("error", (error) => {
      console.error("Socket error:", error);
    });
  });
};
