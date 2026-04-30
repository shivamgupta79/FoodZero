# FoodZero - User Flow Documentation for PPT

## Project Overview
**FoodZero** is a food donation platform that connects donors (individuals, restaurants, hotels, stores) with NGOs to reduce food waste and fight hunger. The platform features real-time tracking, verification systems, and impact metrics.

---

## 1. Landing Page Flow

### Entry Point
- **URL**: Home page (/)
- **Auto-redirect**: If user is logged in, automatically redirects to their role-specific dashboard

### Key Features
- Hero section with FoodZero branding and mission statement
- Two primary CTAs:
  - "Donate Food" (for donors)
  - "Join as NGO" (for NGOs)
- Features showcase:
  - Real-time donation tracking
  - Verified NGOs and donors
  - Impact analytics
- Statistics display (1000+ users, 5000+ meals, 100+ NGO partners)
- Benefits section highlighting platform features
- Footer with branding

### User Actions
1. Click "Donate Food" → Register page
2. Click "Join as NGO" → Register page
3. Click "Login here" → Login page

---

## 2. Registration Flow

### Registration Page (/register)
**User selects role during registration:**

#### Common Fields
- Full Name
- Email
- Password
- Role Selection (Donor / NGO / Admin)

#### Role-Specific Information

**For Donors:**
- Standard registration
- Post-registration: Directed to donor dashboard
- Must complete verification to donate

**For NGOs:**
- Standard registration
- Post-registration: Directed to NGO dashboard
- Special notice displayed: "After registration, complete NGO verification details from dashboard"
- Warning: Account in "Pending Verification" status until admin approval

**For Admins:**
- Standard registration (typically pre-created)

### Post-Registration
- User redirected to login page
- Success message displayed

---

## 3. Login Flow

### Login Page (/login)
- Email and password authentication
- Animated background with food-related graphics
- Role-based redirect after successful login:
  - Donor → `/donor/dashboard`
  - NGO → `/ngo/dashboard`
  - Admin → `/admin/dashboard`

---

## 4. Donor User Flow

### 4.1 Donor Dashboard (/donor/dashboard)

#### First-Time User Experience
**Verification Banner Displayed** (if not verified)
- Shows verification progress across 4 steps:
  1. Phone Verification
  2. Email Verification
  3. Location Permission
  4. Document Verification (Level 2 - Optional)

#### Verification Process

**Step 1: Basic Details**
- Phone Number
- Full Address
- Donor Type (Household/Restaurant/Store/Hotel)
- Location permission request

**Step 2: Phone Verification**
- OTP sent to phone
- User enters 6-digit OTP
- Phone verified ✓

**Step 3: Email Verification**
- Verification email sent
- User clicks link or enters token
- Email verified ✓

**Step 4: Location Verification**
- GPS location access requested
- Location coordinates captured
- Location verified ✓

**Level 2 Verification (Optional)**
- Upload government ID documents
- Enhanced verification status
- Unlocks premium features

#### Dashboard Features
**Impact Overview Cards:**
- Total Donations Made
- Active Donations
- Completed Pickups
- People Served (Estimated)

**Quick Actions:**
- "Donate Food Now" button
- "Upload Documents" button (if Level 1 complete)

**Recent Donations List:**
- Status indicators (Pending/Accepted/Picked Up/Delivered)
- NGO assignment information
- Tracking links

### 4.2 Donate Food Page (/donor/donate)

#### Donation Form Fields

**Required Information:**
- Food Type (e.g., Rice, Vegetables, Cooked Meals)
- Food Category (Cooked/Raw/Packaged/Fruits/Vegetables/Dairy/Bakery/Other)
- Quantity:
  - Number input
  - Unit selection (kg/grams/plates/servings/liters/pieces/boxes/bags)
- Food Type: Perishable / Non-perishable
- Best Before Date & Time (required for perishable)
- Pickup Address
- GPS Coordinates (auto-detected)

**Optional Information:**
- Storage Temperature (°C)
- Special Instructions

#### Submission Process
1. User fills form
2. Location automatically detected
3. Form validation
4. Submit donation
5. Backend notifies all NGOs via Socket.io
6. Success message displayed
7. Redirect to tracking page

#### What Happens Next (Info Box)
- All registered NGOs notified instantly
- NGOs can see distance from their location
- Nearest NGO can accept donation
- Donor receives updates on pickup status
- Real-time tracking available

### 4.3 Tracking Page (/donor/tracking)

#### Layout
**Left Panel: Donations List**
- All donor's donations
- Status icons and colors
- Click to view details

**Right Panel: Tracking Details**

**Status Timeline:**
1. ✓ Donation Created
2. ✓ Accepted by NGO (shows NGO name)
3. ○ Food Picked Up
4. ○ Delivered Successfully

**Map View:**
- Shows donation location
- Interactive map component

**Donation Details Card:**
- Food type, quantity
- Temperature, expiry time
- Pickup address

**NGO Details Card** (when accepted):
- NGO name and email
- Contact person and phone
- Registered address
- City and state
- Registration number and type
- Verification badge

---

## 5. NGO User Flow

### 5.1 NGO Dashboard (/ngo/dashboard)

#### Verification Status Banner
**Three States:**
1. **Pending**: Details submitted, awaiting admin approval
2. **Rejected**: Admin rejected, reason provided
3. **Verified**: Approved, can accept donations

#### Verification Form (if not verified)

**Required Details:**
- Registration Number
- Registration Type (Trust/Society/Section 8 Company)
- Registered Address
- City and State
- Contact Person Name
- Contact Phone

**Optional Details:**
- GST Number
- PAN Number
- Website

**Submission:**
- Details sent to admin for review
- Status changes to "Pending Verification"
- Cannot accept donations until verified

#### Dashboard Features

**Summary Cards:**
- Available Donations (nearby)
- Accepted Donations
- Pending Pickups
- Total Collected

**Nearby Food Requests Section:**
- Grid of available donations
- Each card shows:
  - Food type and quantity
  - Expiry time
  - Distance from NGO
  - Donor name
  - "Accept Donation" button (disabled if not verified)

**Accepted Donations Section:**
- List of NGO's accepted donations
- Status tracking
- Action buttons based on status

**Feedback System:**
- After delivery, NGO can submit feedback
- Upload images of received food
- Rate donation (1-5 stars)
- Add comments
- Recipient count
- Distribution date

### 5.2 Requests Page (/ngo/requests)

#### Two Tabs

**Tab 1: Available Requests**
- All pending donations in the system
- Card view with:
  - Food details
  - Donor information (name, phone, address, type)
  - Location/GPS coordinates
  - Distance calculation
  - Expiry time
  - Temperature
  - "Accept Donation" button

**Tab 2: My Accepted**
- Donations accepted by this NGO
- Detailed view with:
  - Donor contact information
  - Pickup address/GPS coordinates
  - Interactive map for navigation
  - Status update buttons:
    - "Mark as Picked Up"
    - "Mark In Transit"
    - "Mark as Delivered"
  - "View Tracking" button

#### Status Update Flow
1. NGO clicks status update button
2. System requests current location
3. Location + status sent to backend
4. Tracking history updated
5. Donor notified of status change

#### Tracking Modal
- Donation information summary
- Status timeline with checkmarks
- Map showing pickup location
- Quick actions for status updates

---

## 6. Admin User Flow

### 6.1 Admin Dashboard (/admin/dashboard)

#### Global System Overview Cards
- Total Users
- Total Donations
- Total NGOs
- Active Pickups
- Total Donors

#### Impact Metrics (Highlighted Section)

**Meals Saved Card:**
- Total meals calculated from delivered donations
- Conversion based on quantity and unit
- Success rate percentage
- Number of donations delivered
- Info: "Based on actual donation quantities and serving sizes"

**Waste Diverted Card:**
- Total kg of food waste prevented
- CO₂ emissions saved (0.342 kg CO₂ per kg food)
- Tonnes total
- Environmental impact visualization

#### Analytics Charts

**Chart 1: Donations Per Day**
- Bar chart showing last 7 days
- Hover tooltips with exact counts
- Total donations summary

**Chart 2: NGO Performance**
- Horizontal bar chart
- Top 5 NGOs by deliveries
- Color-coded rankings
- Hover tooltips

#### User Management Panel
**Table View:**
- Name, Email, Role, Status
- Action: Delete user button
- Shows first 10 users

#### Donation Monitoring Panel
**Table View:**
- Food Type, Donor, NGO, Status, Created Date
- Color-coded status badges
- Shows first 10 donations

#### Live Activity Feed
- Real-time notifications
- Recent donation activities
- Time-stamped events

### 6.2 Users Management (/admin/users)
- Complete user list
- Filter by role
- User details
- Delete/Edit actions

### 6.3 Donations Management (/admin/donations)
- All donations list
- Filter by status
- Donation details
- Manual status updates

### 6.4 Verify Donors (/admin/verify-donors)
- List of donors pending verification
- View uploaded documents
- Approve/Reject actions
- Verification history

### 6.5 Verify NGOs (/admin/verify-ngos)
- List of NGOs pending verification
- View registration details
- Verify documents
- Approve/Reject with reason
- Verification status tracking

---

## 7. Key Features Across All Roles

### Navigation Components

**Navbar:**
- FoodZero logo
- User name and role
- Notification bell (real-time updates)
- Logout button

**Sidebar:**
- Role-specific menu items
- Impact metrics display (for donors and NGOs):
  - Total meals saved
  - Total waste diverted (kg)
- Quick navigation links

### Real-Time Features
- Socket.io notifications
- Live donation updates
- Instant NGO notifications when donation created
- Status change notifications

### Verification System

**Donor Verification (2 Levels):**
- Level 1: Phone + Email + Location
- Level 2: Government ID documents

**NGO Verification:**
- Registration details submission
- Admin review and approval
- Verification badge display

### Tracking System
- GPS-based location tracking
- Status timeline visualization
- Real-time updates
- Map integration

### Impact Metrics
- Meals saved calculation
- Waste diverted calculation
- CO₂ emissions saved
- People served estimates

---

## 8. Technical Flow Summary

### Authentication Flow
```
Landing Page → Register/Login → Role-based Dashboard
```

### Donation Flow
```
Donor Creates Donation → 
NGOs Notified (Socket.io) → 
NGO Accepts → 
Status Updates (Accepted → Picked Up → In Transit → Delivered) → 
Feedback Submission
```

### Verification Flow

**Donors:**
```
Register → Dashboard → Start Verification → 
Phone OTP → Email Token → Location Permission → 
(Optional) Upload Documents → Verified
```

**NGOs:**
```
Register → Dashboard → Submit Details → 
Admin Review → Approved/Rejected → 
If Approved: Can Accept Donations
```

### Admin Workflow
```
Login → Dashboard → 
Monitor System → 
Review Verifications → 
Approve/Reject → 
Manage Users/Donations
```

---

## 9. User Journey Examples

### Example 1: Restaurant Donor Journey
1. Restaurant manager visits FoodZero.com
2. Clicks "Donate Food" → Registers as Donor
3. Logs in → Sees verification banner
4. Completes phone, email, location verification
5. Clicks "Donate Food Now"
6. Fills form: "50 kg Cooked Rice, expires in 4 hours"
7. Submits donation
8. Receives notification: "NGO 'Food For All' accepted your donation"
9. Tracks status: Accepted → Picked Up → Delivered
10. Views impact: "Your donation fed 500 people"

### Example 2: NGO Journey
1. NGO representative visits FoodZero.com
2. Clicks "Join as NGO" → Registers
3. Logs in → Sees verification form
4. Submits registration details (Trust Act, Registration #, Address)
5. Waits for admin approval
6. Receives notification: "Your NGO has been verified"
7. Goes to "Requests" page
8. Sees available donation: "50 kg Rice, 2.5 km away"
9. Clicks "Accept Donation"
10. Updates status: Picked Up → In Transit → Delivered
11. Submits feedback with photos
12. Views impact metrics on dashboard

### Example 3: Admin Journey
1. Admin logs in
2. Views dashboard: 150 total donations, 45 active
3. Sees notification: "New NGO verification request"
4. Goes to "Verify NGOs" page
5. Reviews "Food For All" NGO details
6. Verifies registration number
7. Clicks "Approve"
8. NGO receives notification
9. Returns to dashboard
10. Monitors live activity feed
11. Views analytics: 5000 meals saved this month

---

## 10. Mobile Responsiveness
- All pages responsive
- Touch-friendly buttons
- Mobile-optimized forms
- Swipeable cards
- Collapsible sidebars
- Bottom navigation on mobile

---

## 11. Notification System
- Real-time Socket.io notifications
- Email notifications
- SMS notifications (for OTP)
- In-app notification bell
- Status change alerts
- Verification status updates

---

## 12. Security Features
- JWT authentication
- Role-based access control
- OTP verification
- Email verification
- Location verification
- Document verification
- Admin approval system
- Secure password storage

---

## End of User Flow Documentation

**Total User Roles**: 3 (Donor, NGO, Admin)
**Total Pages**: 15+
**Key Features**: Real-time tracking, Multi-level verification, Impact metrics, Admin controls
**Technology**: Next.js, Node.js, Socket.io, MongoDB, JWT, GPS/Maps integration
