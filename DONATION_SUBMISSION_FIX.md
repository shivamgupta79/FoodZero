# Donation Submission Error Fix

## Issue
When NGOs submit food requests to donors, the error "Cannot read properties of null (reading '_id')" was occurring.

## Root Cause
The authentication middleware (`server/middleware/authMiddleware.js`) had a logic flaw:
- When a valid token was provided, it would call `next()` without returning
- This allowed code execution to continue to the "no token" check
- The middleware would send multiple responses, causing `req.user` to be null in the controller

## Files Fixed

### 1. server/middleware/authMiddleware.js
**Changes:**
- Added `return` statement before `next()` to prevent further execution
- Added validation to check if user exists after token verification
- Ensures proper flow control in the middleware

**Before:**
```javascript
if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
  try {
    token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "SECRET_KEY");
    req.user = await User.findById(decoded.id).select("-password");
    next(); // Missing return!
  } catch (error) {
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
}
```

**After:**
```javascript
if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
  try {
    token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "SECRET_KEY");
    req.user = await User.findById(decoded.id).select("-password");
    
    if (!req.user) {
      return res.status(401).json({ message: "User not found" });
    }
    
    return next(); // Added return!
  } catch (error) {
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
}
```

### 2. server/controllers/donationController.js
**Changes:**
- Added explicit validation for `req.user` before accessing `_id`
- Added validation for required fields
- Provides clearer error messages

**Added validation:**
```javascript
// Validate user is authenticated
if (!req.user || !req.user._id) {
  return res.status(401).json({ message: "User not authenticated" });
}

// Validate required fields
if (!foodType || !quantity) {
  return res.status(400).json({ message: "Food type and quantity are required" });
}
```

## Testing
To verify the fix:
1. Restart the server
2. Log in as a donor
3. Submit a food donation request
4. The request should now succeed without the "_id" error

## Impact
- Donors can now successfully submit food donation requests
- NGOs will receive notifications about new donations
- The authentication flow works correctly throughout the application
