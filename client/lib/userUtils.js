// client/lib/userUtils.js

import axios from "./axios";

/**
 * Refresh user profile from server and update localStorage
 * @returns {Promise<Object>} Updated user object
 */
export const refreshUserProfile = async () => {
  try {
    const { data } = await axios.get("/auth/profile");
    
    // Update localStorage with fresh data
    localStorage.setItem("user", JSON.stringify(data));
    
    return data;
  } catch (error) {
    console.error("Error refreshing user profile:", error);
    throw error;
  }
};

/**
 * Setup Socket.IO listener for verification status updates
 * @param {Object} socket - Socket.IO client instance
 * @param {Function} onUpdate - Callback function when verification status updates
 */
export const setupVerificationListener = (socket, onUpdate) => {
  if (!socket) return;

  socket.on("verification-status-updated", (data) => {
    console.log("Verification status updated:", data);
    
    // Update localStorage with new user data
    if (data.user) {
      localStorage.setItem("user", JSON.stringify(data.user));
    }
    
    // Call the callback with updated data
    if (onUpdate) {
      onUpdate(data);
    }
    
    // Show notification to user
    if (data.message) {
      alert(data.message);
    }
  });
};

/**
 * Remove verification listener
 * @param {Object} socket - Socket.IO client instance
 */
export const removeVerificationListener = (socket) => {
  if (!socket) return;
  socket.off("verification-status-updated");
};
