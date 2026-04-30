# ✅ Testing Checklist - Food Donation Platform

Use this checklist to verify all features are working correctly.

---

## 🚀 Pre-Testing Setup

### 1. Start the Application
- [ ] MongoDB is running (`mongod`)
- [ ] Backend server is running (port 5000)
- [ ] Frontend client is running (port 3000)
- [ ] No errors in console

### 2. Open Browsers
- [ ] Browser 1: Regular mode (for Donor)
- [ ] Browser 2: Incognito/Private mode (for NGO)
- [ ] Browser 3: Another incognito (for Admin) - Optional

---

## 👤 Authentication Tests

### Registration
- [ ] Navigate to http://localhost:3000/register
- [ ] See beautiful animated page with food theme
- [ ] Register as Donor (donor@test.com / password123)
- [ ] Redirected to donor dashboard
- [ ] Logout

- [ ] Register as NGO (ngo@test.com / password123)
- [ ] Redirected to NGO dashboard
- [ ] Logout

- [ ] Register as Admin (admin@test.com / password123)
- [ ] Redirected to admin dashboard

### Login
- [ ] Navigate to http://localhost:3000/login
- [ ] See beautiful animated page
- [ ] Login with wrong credentials → See error
- [ ] Login with correct credentials → Redirected to dashboard
- [ ] Refresh page → Still logged in (JWT working)

---

## 🍱 Donor Features Tests

### Donor Dashboard
- [ ] Login as donor@test.com
- [ ] See 4 impact cards (Total, Active, Completed, People Served)
- [ ] See "Donate Food Now" button
- [ ] See "Recent Donations" section
- [ ] Sidebar shows: Dashboard, Donate Food, Track Donations
- [ ] Navbar shows notification bell and logout button

### Create Donation
- [ ] Click "Donate Food Now" or navigate to /donor/donate
- [ ] See complete form with all fields
- [ ] Location automatically detected (or default Delhi)
- [ ] Fill in form:
  - Food Type: "Rice and Curry"
  - Quantity: "10 plates"
  - Expiry Time: Tomorrow's date
  - Temperature: 25
- [ ] Click "Submit Donation"
- [ ] See success message
- [ ] Redirected to tracking page after 1.5 seconds

### Track Donations
- [ ] Navigate to /donor/tracking
- [ ] See list of donations on left
- [ ] Click on a donation
- [ ] See tracking timeline on right
- [ ] See status indicators (pending, accepted, picked up, delivered)
- [ ] See map with donation location
- [ ] See donation details (food type, quantity, temperature, expiry)

---

## 🏥 NGO Features Tests

### NGO Dashboard
- [ ] Login as ngo@test.com (in incognito browser)
- [ ] See 4 summary cards (Available, Accepted, Pending, Total)
- [ ] See "Nearby Food Requests" section
- [ ] See donations with distance (e.g., "~2.5 km")
- [ ] See donor name and food details
- [ ] See "Accept Donation" button

### Real-time Notification (CRITICAL TEST)
- [ ] Keep NGO browser open
- [ ] In donor browser, create a new donation
- [ ] **Within 1 second**, NGO should see:
  - Notification bell badge turns red with number
  - Click bell to see notification
  - Message: "New food donation available: [Food Type] - X km away"
- [ ] Notification shows distance from NGO location
- [ ] Notification has food icon 🍱

### Accept Donation
- [ ] In NGO browser, go to /ngo/requests
- [ ] See "Available Requests" tab with donations
- [ ] Click "Accept Donation" on one
- [ ] See success message
- [ ] Donation moves to "My Accepted" tab
- [ ] **Check donor browser**: Should see notification "Your donation has been accepted by [NGO Name]"

### Update Status
- [ ] In NGO browser, go to "My Accepted" tab
- [ ] See accepted donation with status buttons
- [ ] Click "Mark as Picked Up"
  - [ ] Success message appears
  - [ ] **Check donor browser**: Notification "Your donation has been picked up"
  - [ ] **Check tracking page**: Timeline updates to show picked up
- [ ] Click "Mark In Transit"
  - [ ] **Check donor browser**: Notification "Your donation is in transit"
  - [ ] **Check tracking page**: Timeline updates
- [ ] Click "Mark as Delivered"
  - [ ] **Check donor browser**: Notification "Your donation has been delivered successfully!"
  - [ ] **Check tracking page**: Timeline shows all steps complete

---

## 👨‍💼 Admin Features Tests

### Admin Dashboard
- [ ] Login as admin@test.com
- [ ] See 5 system overview cards (Users, Donations, NGOs, Active Pickups, Alerts)
- [ ] See user management table
- [ ] See donation monitoring table
- [ ] See live activity feed
- [ ] All statistics are accurate

### User Management
- [ ] Navigate to /admin/users
- [ ] See user statistics cards
- [ ] See complete user table with all users
- [ ] See search/filter functionality
- [ ] Click delete button on a test user
- [ ] Confirm deletion
- [ ] User removed from table
- [ ] User cannot login anymore

### Donation Monitoring
- [ ] Navigate to /admin/donations
- [ ] See donation statistics by status
- [ ] See all donations in table
- [ ] See temperature monitoring
- [ ] See status filters working
- [ ] Temperature alerts show if any food is above threshold

---

## 🔔 Real-time Notification Tests

### Test 1: Donor → NGO Notification
- [ ] Donor creates donation
- [ ] NGO receives notification within 1 second
- [ ] Notification shows correct food type
- [ ] Notification shows distance
- [ ] Notification bell badge shows count

### Test 2: NGO → Donor Notification (Acceptance)
- [ ] NGO accepts donation
- [ ] Donor receives notification within 1 second
- [ ] Notification shows NGO name
- [ ] Notification shows acceptance message

### Test 3: NGO → Donor Notification (Status Updates)
- [ ] NGO updates status to "picked_up"
- [ ] Donor receives notification
- [ ] NGO updates status to "in_transit"
- [ ] Donor receives notification
- [ ] NGO updates status to "delivered"
- [ ] Donor receives notification
- [ ] All notifications appear within 1 second

### Test 4: Multiple Notifications
- [ ] Create multiple donations
- [ ] Notification count increases
- [ ] Click bell to see all notifications
- [ ] Each notification has correct icon and color
- [ ] Click "Clear All" to remove notifications

---

## 📍 Distance Calculation Tests

### Test 1: Notification Distance
- [ ] Create donation as donor
- [ ] NGO receives notification with distance
- [ ] Distance is in format "X.X km"
- [ ] Distance is reasonable (not 0 or 99999)

### Test 2: Dashboard Distance
- [ ] NGO dashboard shows distance for each donation
- [ ] Distance updates when new donations added
- [ ] Distance is calculated from NGO's location

---

## 🗺️ Map Integration Tests

### Donor Tracking Map
- [ ] Go to donor tracking page
- [ ] Select a donation
- [ ] Map loads successfully
- [ ] Marker shows donation location
- [ ] Map is centered on donation location
- [ ] Can zoom in/out

### NGO Requests Map
- [ ] Go to NGO requests → My Accepted tab
- [ ] See map for each accepted donation
- [ ] Map shows pickup location
- [ ] Marker is visible

---

## 🎨 UI/UX Tests

### Animations
- [ ] Login page has animated elements (truck, mountains, food icons)
- [ ] Register page has animated elements
- [ ] Smooth transitions between pages
- [ ] Hover effects on buttons
- [ ] Loading states show properly

### Responsive Design
- [ ] Resize browser window
- [ ] Layout adjusts for mobile (< 768px)
- [ ] Layout adjusts for tablet (768px - 1024px)
- [ ] Layout adjusts for desktop (> 1024px)
- [ ] All features accessible on mobile

### Visual Feedback
- [ ] Buttons change color on hover
- [ ] Forms show validation errors
- [ ] Success messages appear
- [ ] Loading spinners show during operations
- [ ] Status badges have correct colors

---

## 🔒 Security Tests

### Authentication
- [ ] Cannot access donor pages without login
- [ ] Cannot access NGO pages without login
- [ ] Cannot access admin pages without login
- [ ] Logout clears token
- [ ] Cannot access after logout

### Authorization
- [ ] Donor cannot access NGO pages
- [ ] NGO cannot access donor pages
- [ ] Non-admin cannot access admin pages
- [ ] API returns 401 for unauthorized requests

---

## 🐛 Error Handling Tests

### Network Errors
- [ ] Stop backend server
- [ ] Try to create donation → See error message
- [ ] Try to login → See error message
- [ ] Start backend → Everything works again

### Invalid Data
- [ ] Submit donation form with empty fields → See validation error
- [ ] Login with invalid email format → See error
- [ ] Register with existing email → See error message

---

## ✅ Final Verification

### All Features Working
- [ ] Authentication (register, login, logout)
- [ ] Donor dashboard with statistics
- [ ] Create donation with geolocation
- [ ] Track donations with timeline
- [ ] NGO dashboard with distance
- [ ] Accept donations
- [ ] Update donation status
- [ ] Real-time notifications (< 1 second)
- [ ] Distance calculation
- [ ] Admin user management
- [ ] Admin donation monitoring
- [ ] Maps integration
- [ ] Beautiful UI with animations
- [ ] Responsive design

### No Errors
- [ ] No console errors in browser
- [ ] No errors in backend terminal
- [ ] No errors in frontend terminal
- [ ] All API calls successful
- [ ] Socket.io connected

### Performance
- [ ] Pages load quickly (< 2 seconds)
- [ ] Notifications appear instantly (< 1 second)
- [ ] No lag when navigating
- [ ] Maps load smoothly
- [ ] Forms submit quickly

---

## 🎉 Test Results

**Total Tests**: 100+
**Expected Pass Rate**: 100%

If all checkboxes are checked, your Food Donation Platform is **FULLY FUNCTIONAL** and ready for production!

---

## 📝 Notes

- If any test fails, check the console for errors
- Make sure MongoDB is running for all tests
- Use different browsers/incognito for multi-user tests
- Real-time notifications require both users to be online
- Distance calculation requires geolocation permission

---

**Happy Testing! 🎊**
