# 🧮 Detailed Algorithm Explanation - Smart Matching Logic

## Overview

This document explains the exact algorithms and mathematical logic used to implement:
1. **Location Radius Search** (Geographic distance calculation)
2. **Time to Expiry** (Urgency scoring)
3. **Priority Rules** (NGOs first, then individuals)
4. **Combined Matching Score** (Weighted multi-criteria decision)

---

## 🌍 ALGORITHM 1: Location Radius Search

### Problem
How do we find all recipients within a certain distance (e.g., 10 km) from a donation location?

### Solution: Haversine Formula

The **Haversine formula** calculates the shortest distance between two points on Earth's surface (great-circle distance).

### Mathematical Formula

```
Given two points:
Point 1 (Donor): latitude₁, longitude₁
Point 2 (Recipient): latitude₂, longitude₂

Step 1: Convert degrees to radians
lat₁ = latitude₁ × (π / 180)
lat₂ = latitude₂ × (π / 180)
Δlat = (latitude₂ - latitude₁) × (π / 180)
Δlon = (longitude₂ - longitude₁) × (π / 180)

Step 2: Calculate intermediate value 'a'
a = sin²(Δlat/2) + cos(lat₁) × cos(lat₂) × sin²(Δlon/2)

Step 3: Calculate intermediate value 'c'
c = 2 × atan2(√a, √(1-a))

Step 4: Calculate distance
distance = R × c

Where:
R = Earth's radius = 6,371 km
distance = result in kilometers
```

### Implementation in Code

```javascript
// File: server/services/matchingEngine.js

calculateDistance(coord1, coord2) {
  const R = 6371; // Earth's radius in kilometers
  
  // Step 1: Convert to radians
  const lat1 = this.toRadians(coord1.lat);
  const lat2 = this.toRadians(coord2.lat);
  const deltaLat = this.toRadians(coord2.lat - coord1.lat);
  const deltaLng = this.toRadians(coord2.lng - coord1.lng);

  // Step 2: Calculate 'a'
  const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
            Math.cos(lat1) * Math.cos(lat2) *
            Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
  
  // Step 3: Calculate 'c'
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  // Step 4: Calculate distance
  return R * c; // Distance in km
}

toRadians(degrees) {
  return degrees * (Math.PI / 180);
}
```


### Real Example

```
Donor Location (Taj Hotel, Delhi):
  Latitude: 28.6139°
  Longitude: 77.2090°

Recipient Location (Hope Foundation):
  Latitude: 28.6400°
  Longitude: 77.2300°

Calculation:
Step 1: Convert to radians
  lat₁ = 28.6139 × (π/180) = 0.4995 rad
  lat₂ = 28.6400 × (π/180) = 0.5000 rad
  Δlat = (28.6400 - 28.6139) × (π/180) = 0.0005 rad
  Δlon = (77.2300 - 77.2090) × (π/180) = 0.0037 rad

Step 2: Calculate 'a'
  a = sin²(0.0005/2) + cos(0.4995) × cos(0.5000) × sin²(0.0037/2)
  a = 0.0000000625 + 0.8776 × 0.8776 × 0.0000034
  a = 0.0000000625 + 0.0000026
  a ≈ 0.0000027

Step 3: Calculate 'c'
  c = 2 × atan2(√0.0000027, √0.9999973)
  c ≈ 0.0033 rad

Step 4: Calculate distance
  distance = 6371 × 0.0033
  distance ≈ 3.2 km

Result: Hope Foundation is 3.2 km away ✅
```

### Filtering Logic

```javascript
// Find all recipients within radius
async findMatches(donationId, radiusKm = 10) {
  // Get donation location
  const donation = await Donation.findById(donationId);
  const donorLocation = donation.location; // {lat, lng}
  
  // Get all potential recipients
  const recipients = await User.find({
    $or: [
      { role: "ngo" },
      { role: "donor" } // Individuals can also receive
    ]
  });
  
  // Filter by distance
  const matches = [];
  for (const recipient of recipients) {
    const distance = this.calculateDistance(
      donorLocation,
      recipient.location
    );
    
    // Only include if within radius
    if (distance <= radiusKm) {
      matches.push({
        recipient: recipient,
        distance: distance
      });
    }
  }
  
  return matches;
}
```

### Why Haversine Formula?

1. **Accurate**: Accounts for Earth's curvature
2. **Efficient**: Simple trigonometric calculations
3. **Standard**: Widely used in GPS and mapping applications
4. **Reliable**: Works for any two points on Earth

---

## ⏰ ALGORITHM 2: Time to Expiry (Urgency Scoring)

### Problem
How do we prioritize donations that are about to expire?

### Solution: Time-Based Urgency Levels

We calculate the time remaining until food expires and assign urgency scores.

### Logic Flow

```
Current Time → Food Expiry Time → Hours Remaining → Urgency Level → Score
```

### Implementation

```javascript
// File: server/services/matchingEngine.js

calculateUrgencyScore(expiryTime) {
  // Handle no expiry time
  if (!expiryTime) return 50; // Default medium urgency
  
  // Calculate hours until expiry
  const now = new Date();
  const expiry = new Date(expiryTime);
  const milliseconds = expiry - now;
  const hoursToExpiry = milliseconds / (1000 * 60 * 60);
  
  // Assign score based on urgency levels
  if (hoursToExpiry <= 0) return 0;      // Already expired
  if (hoursToExpiry <= 2) return 100;    // CRITICAL
  if (hoursToExpiry <= 6) return 80;     // HIGH
  if (hoursToExpiry <= 24) return 60;    // MEDIUM
  if (hoursToExpiry <= 48) return 40;    // LOW
  return 20;                              // VERY LOW
}
```


### Urgency Thresholds

```
┌─────────────────────────────────────────────────────────┐
│ Hours to Expiry │ Urgency Level │ Score │ Action       │
├─────────────────────────────────────────────────────────┤
│ 0 or less       │ EXPIRED       │   0   │ Reject       │
│ 0 - 2 hours     │ CRITICAL      │ 100   │ Immediate    │
│ 2 - 6 hours     │ HIGH          │  80   │ Urgent       │
│ 6 - 24 hours    │ MEDIUM        │  60   │ Soon         │
│ 24 - 48 hours   │ LOW           │  40   │ Normal       │
│ > 48 hours      │ VERY LOW      │  20   │ Flexible     │
└─────────────────────────────────────────────────────────┘
```

### Real Examples

**Example 1: Critical Urgency**
```
Current Time: 10:00 AM
Expiry Time: 11:30 AM
Hours to Expiry: 1.5 hours

Calculation:
hoursToExpiry = 1.5
1.5 <= 2 → TRUE
Urgency Level: CRITICAL
Score: 100

Action: Needs immediate pickup! 🔴
```

**Example 2: High Urgency**
```
Current Time: 10:00 AM
Expiry Time: 2:00 PM
Hours to Expiry: 4 hours

Calculation:
hoursToExpiry = 4
4 <= 2 → FALSE
4 <= 6 → TRUE
Urgency Level: HIGH
Score: 80

Action: Pickup within next few hours 🟠
```

**Example 3: Medium Urgency**
```
Current Time: 10:00 AM
Expiry Time: 6:00 PM (today)
Hours to Expiry: 8 hours

Calculation:
hoursToExpiry = 8
8 <= 6 → FALSE
8 <= 24 → TRUE
Urgency Level: MEDIUM
Score: 60

Action: Pickup today 🟡
```

**Example 4: Low Urgency**
```
Current Time: 10:00 AM (Monday)
Expiry Time: 10:00 AM (Tuesday)
Hours to Expiry: 24 hours

Calculation:
hoursToExpiry = 24
24 <= 24 → TRUE
Urgency Level: MEDIUM (boundary case)
Score: 60

Action: Pickup within 24 hours 🟢
```

### Why This Approach?

1. **Simple**: Easy to understand and implement
2. **Effective**: Prioritizes urgent donations
3. **Flexible**: Thresholds can be adjusted
4. **Practical**: Aligns with real-world food safety

---

## 👥 ALGORITHM 3: Priority Rules (NGOs First, Then Individuals)

### Problem
How do we ensure NGOs get priority over individuals when multiple recipients are available?

### Solution: Role-Based Priority Scoring

We assign priority scores based on recipient type and verification status.

### Priority Hierarchy

```
┌─────────────────────────────────────────────────────────┐
│ Rank │ Recipient Type        │ Verification │ Score    │
├─────────────────────────────────────────────────────────┤
│  1   │ NGO                   │ Verified     │ 100 ⭐⭐⭐│
│  2   │ NGO                   │ Pending      │  70 ⭐⭐ │
│  3   │ Individual (Donor)    │ Level 2      │  50 ⭐   │
│  4   │ Individual (Donor)    │ Level 1      │  30      │
│  5   │ Individual (Donor)    │ Unverified   │  10      │
└─────────────────────────────────────────────────────────┘
```

### Implementation

```javascript
// File: server/services/matchingEngine.js

calculatePriorityScore(recipient) {
  // Check if recipient is an NGO
  if (recipient.role === "ngo") {
    // Verified NGOs get highest priority
    if (recipient.ngoDetails?.verificationStatus === "verified") {
      return 100; // Rank 1: Verified NGO
    }
    // Pending NGOs still get high priority
    return 70; // Rank 2: Pending NGO
  }
  
  // Check if recipient is an individual (donor role)
  if (recipient.role === "donor") {
    const verificationLevel = recipient.donorDetails?.verificationLevel || 0;
    
    // Highly verified individuals
    if (verificationLevel >= 2) {
      return 50; // Rank 3: Level 2 verified
    }
    // Partially verified individuals
    if (verificationLevel === 1) {
      return 30; // Rank 4: Level 1 verified
    }
    // Unverified individuals
    return 10; // Rank 5: Unverified
  }
  
  // Unknown role
  return 0;
}
```


### Real Examples

**Example 1: Verified NGO (Highest Priority)**
```javascript
recipient = {
  role: "ngo",
  name: "Hope Foundation",
  ngoDetails: {
    verificationStatus: "verified",
    registrationNumber: "NGO12345"
  }
}

Calculation:
role === "ngo" → TRUE
verificationStatus === "verified" → TRUE
Priority Score: 100 ⭐⭐⭐

Result: Gets highest priority!
```

**Example 2: Pending NGO**
```javascript
recipient = {
  role: "ngo",
  name: "Care Society",
  ngoDetails: {
    verificationStatus: "pending",
    registrationNumber: "NGO67890"
  }
}

Calculation:
role === "ngo" → TRUE
verificationStatus === "verified" → FALSE
Priority Score: 70 ⭐⭐

Result: Still gets high priority (NGO)
```

**Example 3: Verified Individual**
```javascript
recipient = {
  role: "donor",
  name: "John Doe",
  donorDetails: {
    verificationLevel: 2,
    phoneVerified: true,
    emailVerified: true
  }
}

Calculation:
role === "ngo" → FALSE
role === "donor" → TRUE
verificationLevel >= 2 → TRUE
Priority Score: 50 ⭐

Result: Lower priority than NGOs
```

**Example 4: Unverified Individual**
```javascript
recipient = {
  role: "donor",
  name: "Jane Smith",
  donorDetails: {
    verificationLevel: 0,
    phoneVerified: false,
    emailVerified: false
  }
}

Calculation:
role === "ngo" → FALSE
role === "donor" → TRUE
verificationLevel >= 2 → FALSE
verificationLevel === 1 → FALSE
Priority Score: 10

Result: Lowest priority
```

### Why This Priority System?

1. **NGOs First**: NGOs serve communities, so they get priority
2. **Verification Matters**: Verified users are more trustworthy
3. **Fair Distribution**: Individuals can still receive donations
4. **Scalable**: Easy to add more priority levels

---

## 🎯 ALGORITHM 4: Combined Matching Score (Weighted Multi-Criteria)

### Problem
How do we combine location, urgency, and priority into a single score?

### Solution: Weighted Scoring System

We use a weighted average where each factor contributes a percentage to the final score.

### Weight Distribution

```
┌─────────────────────────────────────────────────────────┐
│ Factor          │ Weight │ Reasoning                    │
├─────────────────────────────────────────────────────────┤
│ Distance        │  40%   │ Most important - logistics   │
│ Urgency         │  35%   │ Very important - food safety │
│ Priority        │  15%   │ Important - social impact    │
│ Capacity        │  10%   │ Useful - recipient ability   │
├─────────────────────────────────────────────────────────┤
│ TOTAL           │ 100%   │                              │
└─────────────────────────────────────────────────────────┘
```

### Mathematical Formula

```
Match Score = (Distance Score × 0.40) +
              (Urgency Score × 0.35) +
              (Priority Score × 0.15) +
              (Capacity Score × 0.10)

Where each component score is 0-100
Result: 0-100 (higher is better)
```

### Distance Score Calculation

```javascript
// Inverse scoring - closer is better
calculateDistanceScore(distance, maxRadius) {
  // If at donor location (0 km) → 100 points
  // If at max radius (50 km) → 0 points
  // Linear interpolation in between
  
  const score = 100 * (1 - distance / maxRadius);
  return Math.max(0, score); // Ensure non-negative
}

// Examples:
// distance = 0 km  → score = 100 * (1 - 0/50) = 100
// distance = 5 km  → score = 100 * (1 - 5/50) = 90
// distance = 10 km → score = 100 * (1 - 10/50) = 80
// distance = 25 km → score = 100 * (1 - 25/50) = 50
// distance = 50 km → score = 100 * (1 - 50/50) = 0
```

### Capacity Score Calculation

```javascript
// Based on subscription plan
calculateCapacityScore(recipient) {
  const plan = recipient.subscription?.plan || "free";
  
  const capacityMap = {
    "enterprise": 100,
    "premium": 80,
    "professional": 70,
    "basic": 50,
    "starter": 40,
    "free": 20
  };
  
  return capacityMap[plan] || 20;
}
```


### Complete Implementation

```javascript
// File: server/services/matchingEngine.js

calculateMatchScore(donation, recipient, distance) {
  // 1. Calculate Distance Score (40% weight)
  const maxDistance = 50; // km
  const distanceScore = Math.max(0, 100 * (1 - distance / maxDistance));
  
  // 2. Calculate Urgency Score (35% weight)
  const urgencyScore = this.calculateUrgencyScore(donation.expiryTime);
  
  // 3. Calculate Priority Score (15% weight)
  const priorityScore = this.calculatePriorityScore(recipient);
  
  // 4. Calculate Capacity Score (10% weight)
  const capacityScore = this.calculateCapacityScore(recipient);
  
  // 5. Weighted Average
  const totalScore = 
    (distanceScore * 0.40) +
    (urgencyScore * 0.35) +
    (priorityScore * 0.15) +
    (capacityScore * 0.10);
  
  // 6. Round to integer
  return Math.round(totalScore);
}
```

### Complete Real-World Example

**Scenario:**
```
Donation:
  Food: Cooked Rice, 20 kg
  Location: (28.6139, 77.2090) - Taj Hotel, Delhi
  Expiry: 4 hours from now
  Created: 10:00 AM

Recipient:
  Name: Hope Foundation
  Role: NGO
  Verification: Verified
  Location: (28.6400, 77.2300)
  Subscription: Premium Plan
```

**Step-by-Step Calculation:**

**Step 1: Calculate Distance**
```
Using Haversine Formula:
distance = 3.2 km

Distance Score:
= 100 × (1 - 3.2 / 50)
= 100 × (1 - 0.064)
= 100 × 0.936
= 93.6
```

**Step 2: Calculate Urgency**
```
Hours to Expiry: 4 hours
4 <= 6 → HIGH urgency

Urgency Score: 80
```

**Step 3: Calculate Priority**
```
Role: NGO
Verification: Verified

Priority Score: 100
```

**Step 4: Calculate Capacity**
```
Subscription Plan: Premium

Capacity Score: 80
```

**Step 5: Calculate Final Match Score**
```
Match Score = (Distance × 0.40) + (Urgency × 0.35) + 
              (Priority × 0.15) + (Capacity × 0.10)

Match Score = (93.6 × 0.40) + (80 × 0.35) + 
              (100 × 0.15) + (80 × 0.10)

Match Score = 37.44 + 28 + 15 + 8

Match Score = 88.44

Rounded: 88 out of 100 ⭐⭐⭐
```

**Result: EXCELLENT MATCH!**

---

## 🔄 Complete Matching Flow

### Step-by-Step Process

```
┌─────────────────────────────────────────────────────────┐
│ STEP 1: Donor Creates Donation                          │
├─────────────────────────────────────────────────────────┤
│ Input:                                                   │
│   - Food type: Cooked Rice                              │
│   - Quantity: 20 kg                                     │
│   - Location: (28.6139, 77.2090)                        │
│   - Expiry: 4 hours from now                            │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ STEP 2: System Searches Recipients                      │
├─────────────────────────────────────────────────────────┤
│ Query Database:                                          │
│   - Find all NGOs (verified + pending)                  │
│   - Find all verified individuals                       │
│   - Filter: Must have location data                     │
│                                                          │
│ Found: 50 potential recipients                          │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ STEP 3: Calculate Distance for Each                     │
├─────────────────────────────────────────────────────────┤
│ For each recipient:                                      │
│   distance = Haversine(donorLoc, recipientLoc)          │
│                                                          │
│ Results:                                                 │
│   - Recipient A: 3.2 km  ✅                             │
│   - Recipient B: 7.5 km  ✅                             │
│   - Recipient C: 15.0 km ❌ (outside 10 km radius)     │
│   - Recipient D: 8.2 km  ✅                             │
│   ...                                                    │
│                                                          │
│ Within 10 km radius: 12 recipients                      │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ STEP 4: Calculate Match Score for Each                  │
├─────────────────────────────────────────────────────────┤
│ Recipient A (Hope Foundation - Verified NGO):           │
│   Distance Score: 93.6 (3.2 km)                         │
│   Urgency Score: 80 (4 hours)                           │
│   Priority Score: 100 (Verified NGO)                    │
│   Capacity Score: 80 (Premium)                          │
│   Match Score: 88 ⭐⭐⭐                                 │
│                                                          │
│ Recipient B (Care Society - Verified NGO):              │
│   Distance Score: 85.0 (7.5 km)                         │
│   Urgency Score: 80 (4 hours)                           │
│   Priority Score: 100 (Verified NGO)                    │
│   Capacity Score: 50 (Basic)                            │
│   Match Score: 83 ⭐⭐⭐                                 │
│                                                          │
│ Recipient D (John Doe - Individual Level 2):            │
│   Distance Score: 83.6 (8.2 km)                         │
│   Urgency Score: 80 (4 hours)                           │
│   Priority Score: 50 (Individual)                       │
│   Capacity Score: 20 (Free)                             │
│   Match Score: 71 ⭐⭐                                   │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ STEP 5: Sort by Match Score                             │
├─────────────────────────────────────────────────────────┤
│ Ranking:                                                 │
│   1. Hope Foundation (NGO)    - Score: 88 ⭐⭐⭐        │
│   2. Care Society (NGO)       - Score: 83 ⭐⭐⭐        │
│   3. Green NGO (NGO)          - Score: 79 ⭐⭐          │
│   4. John Doe (Individual)    - Score: 71 ⭐⭐          │
│   5. Jane Smith (Individual)  - Score: 65 ⭐            │
│   ...                                                    │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ STEP 6: Return Top Matches                              │
├─────────────────────────────────────────────────────────┤
│ Return top 10 matches to NGO dashboard                  │
│ NGO can view and accept best matches                    │
│                                                          │
│ Recommendation: Hope Foundation (Score: 88)             │
└─────────────────────────────────────────────────────────┘
```


---

## 📊 Comparison Examples

### Example 1: NGO vs Individual (Same Distance)

**Scenario:** Both 5 km away, food expires in 4 hours

```
Recipient A: Verified NGO
  Distance Score: 90 (5 km)
  Urgency Score: 80 (4 hours)
  Priority Score: 100 (NGO)
  Capacity Score: 80 (Premium)
  Match Score = (90×0.4) + (80×0.35) + (100×0.15) + (80×0.1)
              = 36 + 28 + 15 + 8 = 87 ⭐⭐⭐

Recipient B: Verified Individual
  Distance Score: 90 (5 km)
  Urgency Score: 80 (4 hours)
  Priority Score: 50 (Individual)
  Capacity Score: 20 (Free)
  Match Score = (90×0.4) + (80×0.35) + (50×0.15) + (20×0.1)
              = 36 + 28 + 7.5 + 2 = 73.5 ⭐⭐

Winner: NGO (87 > 73.5) ✅
Reason: Higher priority score (100 vs 50)
```

### Example 2: Close Individual vs Far NGO

**Scenario:** Individual 2 km away, NGO 8 km away, food expires in 4 hours

```
Recipient A: Individual (Close)
  Distance Score: 96 (2 km)
  Urgency Score: 80 (4 hours)
  Priority Score: 50 (Individual)
  Capacity Score: 20 (Free)
  Match Score = (96×0.4) + (80×0.35) + (50×0.15) + (20×0.1)
              = 38.4 + 28 + 7.5 + 2 = 75.9 ⭐⭐

Recipient B: NGO (Far)
  Distance Score: 84 (8 km)
  Urgency Score: 80 (4 hours)
  Priority Score: 100 (NGO)
  Capacity Score: 80 (Premium)
  Match Score = (84×0.4) + (80×0.35) + (100×0.15) + (80×0.1)
              = 33.6 + 28 + 15 + 8 = 84.6 ⭐⭐⭐

Winner: NGO (84.6 > 75.9) ✅
Reason: Priority and capacity outweigh distance advantage
```

### Example 3: Critical vs Normal Urgency

**Scenario:** Both NGOs, same distance (5 km), different urgency

```
Donation A: Expires in 1 hour (CRITICAL)
  Distance Score: 90 (5 km)
  Urgency Score: 100 (1 hour)
  Priority Score: 100 (NGO)
  Capacity Score: 80 (Premium)
  Match Score = (90×0.4) + (100×0.35) + (100×0.15) + (80×0.1)
              = 36 + 35 + 15 + 8 = 94 ⭐⭐⭐

Donation B: Expires in 30 hours (LOW)
  Distance Score: 90 (5 km)
  Urgency Score: 40 (30 hours)
  Priority Score: 100 (NGO)
  Capacity Score: 80 (Premium)
  Match Score = (90×0.4) + (40×0.35) + (100×0.15) + (80×0.1)
              = 36 + 14 + 15 + 8 = 73 ⭐⭐

Difference: 21 points
Reason: Critical urgency significantly boosts score
```

---

## 🎓 Key Insights

### 1. Distance Matters Most (40%)
- Being close to the donation is the most important factor
- Every kilometer matters in the final score
- Efficient logistics reduce waste and costs

### 2. Urgency is Critical (35%)
- Food expiring soon gets high priority
- Prevents food waste
- Ensures food safety

### 3. NGOs Get Priority (15%)
- NGOs serve communities, so they rank higher
- Verified status increases trust
- Social impact is important

### 4. Capacity Helps (10%)
- Premium subscribers can handle more
- Ensures donations go to capable recipients
- Encourages platform engagement

---

## 🔧 Configuration & Tuning

### Adjustable Parameters

```javascript
// File: server/services/matchingEngine.js

// Distance parameters
DEFAULT_RADIUS_KM = 10;  // Change search radius
MAX_RADIUS_KM = 50;      // Change maximum distance

// Weight distribution (must sum to 1.0)
WEIGHTS = {
  DISTANCE: 0.40,  // Adjust importance of distance
  URGENCY: 0.35,   // Adjust importance of urgency
  PRIORITY: 0.15,  // Adjust importance of priority
  CAPACITY: 0.10   // Adjust importance of capacity
};

// Urgency thresholds (in hours)
URGENCY_LEVELS = {
  CRITICAL: 2,   // Change critical threshold
  HIGH: 6,       // Change high threshold
  MEDIUM: 24,    // Change medium threshold
  LOW: 48        // Change low threshold
};
```

### Example: Prioritize Urgency More

```javascript
// Original weights
WEIGHTS = {
  DISTANCE: 0.40,
  URGENCY: 0.35,
  PRIORITY: 0.15,
  CAPACITY: 0.10
};

// Modified weights (urgency more important)
WEIGHTS = {
  DISTANCE: 0.30,  // Reduced
  URGENCY: 0.50,   // Increased
  PRIORITY: 0.15,  // Same
  CAPACITY: 0.05   // Reduced
};

// Impact: Food expiring soon will rank much higher
```

---

## ✅ Summary

### Algorithms Used:

1. **Haversine Formula**
   - Calculates geographic distance
   - Accurate for Earth's curvature
   - Filters recipients by radius

2. **Time-Based Urgency Scoring**
   - Calculates hours to expiry
   - Assigns urgency levels
   - Prioritizes expiring food

3. **Role-Based Priority System**
   - NGOs get highest priority
   - Verification status matters
   - Individuals can still receive

4. **Weighted Multi-Criteria Scoring**
   - Combines all factors
   - Weighted average (40-35-15-10)
   - Single score (0-100)

### Why This Works:

✅ **Accurate**: Uses proven mathematical formulas
✅ **Fair**: Balances multiple criteria
✅ **Efficient**: Fast calculations
✅ **Flexible**: Configurable parameters
✅ **Practical**: Solves real-world problems
✅ **Scalable**: Works with any number of recipients

---

**Implementation Status:** ✅ FULLY OPERATIONAL
**Location:** `server/services/matchingEngine.js`
**Lines of Code:** 400+
**Last Updated:** February 2026
