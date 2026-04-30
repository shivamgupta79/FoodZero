# Smart Matching & Logistics System - FoodZero Platform

## Overview

The FoodZero platform now includes an intelligent matching engine and logistics service that automatically connects food donations with the most suitable recipients (NGOs and verified individuals) based on multiple factors.

---

## 🎯 Key Features

### 1. Smart Matching Engine
- **Location-based matching** using radius search
- **Time-to-expiry urgency** scoring
- **Priority rules** (NGOs first, then individuals)
- **Capacity-based** allocation
- **Auto-assignment** capability

### 2. Logistics Service
- **Route optimization** for multiple pickups
- **Time slot suggestions** based on urgency
- **Batch pickup planning** for NGOs
- **Estimated travel time** calculations
- **Pickup sequence** optimization

---

## 🔧 How It Works

### Matching Algorithm

The matching engine uses a **weighted scoring system** to find the best recipient for each donation:

```
Match Score = (Distance × 40%) + (Urgency × 35%) + (Priority × 15%) + (Capacity × 10%)
```

#### 1. Distance Score (40% weight)
- Calculates distance using **Haversine formula**
- Closer recipients get higher scores
- Default search radius: **10 km**
- Maximum search radius: **50 km**

#### 2. Urgency Score (35% weight)
Based on time to expiry:
- **CRITICAL** (< 2 hours): Score 100
- **HIGH** (2-6 hours): Score 80
- **MEDIUM** (6-24 hours): Score 60
- **LOW** (24-48 hours): Score 40
- **Very Low** (> 48 hours): Score 20

#### 3. Priority Score (15% weight)
Recipient type priority:
- **Verified NGOs**: Score 100
- **Pending NGOs**: Score 70
- **Verified Individuals (Level 2)**: Score 50
- **Verified Individuals (Level 1)**: Score 30
- **Unverified**: Score 10

#### 4. Capacity Score (10% weight)
Based on subscription plan:
- **Enterprise**: Score 100
- **Premium/Professional**: Score 70-80
- **Basic/Starter**: Score 40-50
- **Free**: Score 20

---

## 📍 Location-Based Matching

### How Location Matching Works:

1. **Donation Created**: When a donor creates a donation, they provide:
   - Food location (latitude, longitude)
   - Pickup address
   - Food expiry time

2. **Radius Search**: The system searches for recipients within a specified radius:
   ```javascript
   // Default: 10 km radius
   // Can be adjusted: 5 km, 15 km, 20 km, etc.
   ```

3. **Distance Calculation**: Uses Haversine formula to calculate accurate distances:
   ```
   Distance = 2 × R × arcsin(√(sin²(Δlat/2) + cos(lat1) × cos(lat2) × sin²(Δlng/2)))
   Where R = Earth's radius (6371 km)
   ```

4. **Filtering**: Only recipients within the radius are considered

5. **Scoring**: Closer recipients get higher scores

---

## ⏰ Time-Based Urgency

### Urgency Levels:

| Level | Time to Expiry | Action Required |
|-------|---------------|-----------------|
| **CRITICAL** | < 2 hours | Immediate pickup |
| **HIGH** | 2-6 hours | Pickup within hours |
| **MEDIUM** | 6-24 hours | Pickup today |
| **LOW** | 24-48 hours | Pickup tomorrow |
| **Very Low** | > 48 hours | Flexible timing |

### Time Slot Suggestions:

The system suggests optimal pickup time slots based on:
- Current time
- Food expiry time
- Distance to pickup location
- Travel time estimation

**Available Time Slots:**
1. Morning (8 AM - 10 AM)
2. Late Morning (10 AM - 12 PM)
3. Afternoon (12 PM - 2 PM)
4. Mid Afternoon (2 PM - 4 PM)
5. Evening (4 PM - 6 PM)
6. Late Evening (6 PM - 8 PM)

---

## 🚚 Route Optimization

### Nearest Neighbor Algorithm:

For NGOs picking up multiple donations, the system optimizes the route:

1. **Start Point**: NGO's location
2. **Find Nearest**: Identify closest donation
3. **Add to Route**: Add to pickup sequence
4. **Repeat**: Continue until all pickups are added
5. **Calculate**: Total distance and time

### Route Information Provided:

- **Pickup Order**: Optimized sequence
- **Total Distance**: Sum of all segments
- **Estimated Time**: Travel + pickup time
- **Per-Stop Details**: Distance, address, food type

**Example Route:**
```
NGO Location → Donation 1 (2.3 km) → Donation 2 (1.8 km) → Donation 3 (3.1 km)
Total Distance: 7.2 km
Estimated Time: 1 hour 15 minutes
```

---

## 🎯 Priority Rules

### Recipient Priority Order:

1. **Verified NGOs** (Highest Priority)
   - Registered organizations
   - Admin-verified
   - Can handle large quantities
   - Serve multiple beneficiaries

2. **Pending NGOs** (Medium-High Priority)
   - Submitted verification
   - Awaiting admin approval
   - Limited access

3. **Verified Individuals - Level 2** (Medium Priority)
   - Government ID verified
   - FSSAI verified (for businesses)
   - Trusted recipients

4. **Verified Individuals - Level 1** (Low-Medium Priority)
   - Basic verification (phone, email, location)
   - Limited capacity

5. **Unverified** (Lowest Priority)
   - No verification
   - Minimal access

---

## 📊 API Endpoints

### 1. Find Matches for Donation
```
GET /api/matching/find/:donationId?radius=10&limit=10
```
**Response:**
```json
{
  "success": true,
  "donationId": "...",
  "searchRadius": 10,
  "matchesFound": 5,
  "matches": [
    {
      "recipient": { ... },
      "distance": 2.5,
      "score": 85,
      "urgencyLevel": "HIGH",
      "estimatedPickupTime": "25 minutes"
    }
  ]
}
```

### 2. Auto-Assign Donation
```
POST /api/matching/auto-assign/:donationId
```
Automatically assigns donation to the best match.

### 3. Get Time Slot Suggestions
```
GET /api/matching/time-slots/:donationId?distance=5
```
**Response:**
```json
{
  "success": true,
  "suggestedSlots": [
    {
      "id": 1,
      "label": "Morning (8 AM - 10 AM)",
      "score": 95,
      "estimatedArrival": "08:25",
      "travelTime": "25 minutes",
      "urgency": "HIGH"
    }
  ]
}
```

### 4. Get Batch Pickup Suggestions (NGO Only)
```
GET /api/matching/batch-suggestions?radius=10
```
**Response:**
```json
{
  "success": true,
  "totalDonationsAvailable": 8,
  "suggestions": [
    {
      "priority": "URGENT",
      "description": "Immediate pickup required",
      "route": [...],
      "totalDistance": 7.2,
      "estimatedTime": { ... },
      "numberOfStops": 3
    }
  ]
}
```

### 5. Get Pickup Sequence (NGO Only)
```
GET /api/matching/pickup-sequence
```
Returns optimized sequence for accepted donations.

### 6. Get Smart Recommendations
```
GET /api/matching/recommendations?radius=10
```
Returns personalized donation recommendations for the user.

---

## 💡 Usage Examples

### For Donors:

1. **Create Donation**: Donor submits food donation with location
2. **Auto-Matching**: System finds best recipients within radius
3. **Notification**: Top matches are notified
4. **Acceptance**: NGO/Individual accepts the donation
5. **Tracking**: Real-time tracking of pickup and delivery

### For NGOs:

1. **View Recommendations**: See donations sorted by match score
2. **Batch Planning**: Get suggestions for multiple pickups
3. **Route Optimization**: Receive optimized pickup sequence
4. **Time Slots**: Choose best time slots for pickup
5. **Accept & Track**: Accept donations and update status

### For Admins:

1. **Monitor Matching**: View matching statistics
2. **Adjust Parameters**: Configure radius, weights, priorities
3. **Analytics**: Track matching efficiency
4. **Optimization**: Identify bottlenecks

---

## 🔍 Technical Details

### Distance Calculation:
```javascript
// Haversine Formula Implementation
calculateDistance(coord1, coord2) {
  const R = 6371; // Earth's radius in km
  const lat1 = toRadians(coord1.lat);
  const lat2 = toRadians(coord2.lat);
  const deltaLat = toRadians(coord2.lat - coord1.lat);
  const deltaLng = toRadians(coord2.lng - coord1.lng);

  const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
            Math.cos(lat1) * Math.cos(lat2) *
            Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return R * c;
}
```

### Match Score Calculation:
```javascript
calculateMatchScore(donation, recipient, distance) {
  // Distance score (inverse - closer is better)
  const distanceScore = 100 * (1 - distance / MAX_RADIUS);
  
  // Urgency score
  const urgencyScore = calculateUrgencyScore(donation.expiryTime);
  
  // Priority score
  const priorityScore = calculatePriorityScore(recipient);
  
  // Capacity score
  const capacityScore = calculateCapacityScore(recipient);
  
  // Weighted total
  return (distanceScore * 0.4) + 
         (urgencyScore * 0.35) + 
         (priorityScore * 0.15) + 
         (capacityScore * 0.10);
}
```

---

## 🎨 Frontend Integration

### Example: Display Recommendations

```javascript
// Fetch recommendations
const response = await axios.get('/api/matching/recommendations?radius=10', {
  headers: { Authorization: `Bearer ${token}` }
});

const recommendations = response.data.recommendations;

// Display sorted by match score
recommendations.forEach(rec => {
  console.log(`
    Food: ${rec.donation.foodType}
    Match Score: ${rec.matchScore}/100
    Distance: ${rec.distance} km
    Urgency: ${rec.urgencyLevel}
    Pickup Time: ${rec.estimatedPickupTime}
  `);
});
```

### Example: Show Route Optimization

```javascript
// Get pickup sequence
const response = await axios.get('/api/matching/pickup-sequence', {
  headers: { Authorization: `Bearer ${token}` }
});

const route = response.data.optimizedRoute;

console.log(`
  Total Stops: ${route.numberOfStops}
  Total Distance: ${route.totalDistance} km
  Estimated Time: ${route.estimatedTime.formatted}
`);

// Display route on map
route.route.forEach((stop, index) => {
  addMarkerToMap(stop.location, index + 1);
});
```

---

## 📈 Benefits

### For Donors:
- ✅ Faster donation acceptance
- ✅ Matched with nearest recipients
- ✅ Reduced food waste
- ✅ Better tracking

### For NGOs:
- ✅ Optimized pickup routes
- ✅ Time-saving batch planning
- ✅ Priority for urgent donations
- ✅ Better resource utilization

### For Platform:
- ✅ Increased efficiency
- ✅ Better user experience
- ✅ Reduced response time
- ✅ Higher success rate

---

## 🚀 Future Enhancements

1. **Machine Learning**: Learn from past matches to improve scoring
2. **Real-time Traffic**: Integrate traffic data for better time estimates
3. **Weather Integration**: Consider weather in route planning
4. **Predictive Analytics**: Predict donation patterns
5. **Multi-vehicle Routing**: Optimize for multiple vehicles
6. **Carbon Footprint**: Calculate and minimize environmental impact

---

## 📞 Support

For questions or issues with the matching and logistics system:
- Check API documentation
- Review error logs
- Contact development team

---

**Last Updated**: February 2026
**Version**: 1.0.0
