# Verification Status Real-Time Update Fix

## Issue
After an admin verifies a donor or NGO, the verification status doesn't update in real-time on the donor/NGO dashboard. Users need to refresh the page or log out/in to see the updated status.

## Root Cause
The dashboards read user data from `localStorage`, which contains stale data. When the admin updates the verification status in the database, the client-side `localStorage` is not automatically updated.

## Solution Overview
Implemented a multi-layered solution:
1. Added a profile refresh API endpoint
2. Enhanced Socket.IO events to include updated user data
3. Created utility functions for profile refresh and Socket.IO listeners
4. Dashboards now listen for verification status changes and auto-update

## Files Modified

### 1. server/routes/authRoutes.js
Added a new route for fetching current user profile:
```javascript
router.get("/profile", protect, getProfile);
```

### 2. server/controllers/authController.js
Added `getProfile` function to fetch fresh user data:
```javascript
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
```

### 3. server/controllers/adminController.js
Updated `verifyNGO` to emit Socket.IO event with updated user data:
```javascript
io.to(ngoId).emit("verification-status-updated", {
  message: status === "verified" 
    ? "🎉 Your NGO has been verified! You can now accept food donations."
    : `❌ Your NGO verification was rejected. Reason: ${rejectionReason}`,
  type: "verification-update",
  status: status,
  user: {
    _id: ngo._id,
    name: ngo.name,
    email: ngo.email,
    role: ngo.role,
    ngoDetails: ngo.ngoDetails,
    location: ngo.location
  },
  timestamp: new Date()
});
```

### 4. server/controllers/donorController.js
Updated `adminApproveDonor` to emit Socket.IO event with updated user data:
```javascript
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
```

### 5. client/lib/userUtils.js (NEW FILE)
Created utility functions for profile management:
- `refreshUserProfile()` - Fetches fresh user data from server
- `setupVerificationListener()` - Sets up Socket.IO listener for verification updates
- `removeVerificationListener()` - Cleans up Socket.IO listener

## How to Implement in Dashboards

### For Donor Dashboard (client/app/donor/dashboard/page.jsx)

Add these imports at the top:
```javascript
import { refreshUserProfile, setupVerificationListener, removeVerificationListener } from "@/lib/userUtils";
import io from "socket.io-client";
```

Add Socket.IO connection in useEffect:
```javascript
useEffect(() => {
  // ... existing code ...

  // Setup Socket.IO connection
  const socket = io(process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || "http://localhost:5000", {
    auth: {
      token: localStorage.getItem("token")
    }
  });

  // Setup verification status listener
  setupVerificationListener(socket, async (data) => {
    // Update local user state with fresh data
    if (data.user) {
      setUser(data.user);
      
      // Optionally refresh dashboard data
      await fetchDashboardData();
    }
  });

  // Cleanup on unmount
  return () => {
    removeVerificationListener(socket);
    socket.disconnect();
  };
}, [router]);
```

### For NGO Dashboard (client/app/ngo/dashboard/page.jsx)

Same implementation as donor dashboard - add the Socket.IO connection and verification listener in the useEffect hook.

## Alternative: Manual Refresh Button

If you prefer a manual refresh approach instead of real-time updates, add a refresh button:

```javascript
const handleRefreshProfile = async () => {
  try {
    const updatedUser = await refreshUserProfile();
    setUser(updatedUser);
    alert("Profile refreshed successfully!");
    await fetchDashboardData();
  } catch (error) {
    console.error("Error refreshing profile:", error);
    alert("Failed to refresh profile");
  }
};

// In your JSX:
<button
  onClick={handleRefreshProfile}
  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
>
  🔄 Refresh Status
</button>
```

## Testing the Fix

1. **Start the server**: Ensure Socket.IO is properly configured
2. **Login as donor/NGO**: Complete verification details
3. **Login as admin**: Verify the donor/NGO
4. **Check donor/NGO dashboard**: Status should update automatically (or click refresh button)

## Benefits

1. **Real-time updates**: Users see verification status changes immediately
2. **Better UX**: No need to log out/in or manually refresh page
3. **Consistent data**: localStorage always has fresh user data
4. **Scalable**: Can be extended for other real-time updates

## Notes

- Socket.IO must be properly configured on the server
- Ensure the Socket.IO client library is installed: `npm install socket.io-client`
- The verification listener automatically updates localStorage
- Users will see an alert notification when their status changes
- The dashboard will automatically refresh to show updated UI

## Fallback for No Socket.IO

If Socket.IO is not available, users can:
1. Use the manual refresh button
2. Log out and log back in
3. Refresh the browser page

The system will still work, just without real-time updates.
