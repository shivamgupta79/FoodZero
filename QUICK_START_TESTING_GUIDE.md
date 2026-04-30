# Quick Start Testing Guide - Smart Matching & Logistics

## 🚀 Getting Started

This guide will help you test the new Smart Matching and Logistics features in your FoodZero platform.

---

## ✅ Prerequisites

Before testing, ensure:

1. ✅ MongoDB is running on `localhost:27017`
2. ✅ Backend server is running on `http://localhost:5000`
3. ✅ Frontend client is running on `http://localhost:3000`
4. ✅ You have at least one NGO account and one Donor account

---

## 📋 Test Scenarios

### Scenario 1: Test Smart Recommendations for NGO

**Objective**: View personalized donation recommendations with match scores

**Steps**:

1. **Login as NGO**
   - Go to `http://localhost:3000/login`
   - Login with NGO credentials
   - Ensure NGO is verified (check with admin if needed)

2. **Set NGO Location** (if not already set)
   - Go to NGO Dashboard
   - Update profile with location coordinates
   - Example: `lat: 28.6139, lng: 77.2090` (Delhi)

3. **Navigate to Smart Matching**
   - Go to `http://localhost:3000/ngo/smart-matching`
   - You should see the Smart Matching dashboard

4. **View Recommendations**
   - Click on "Recommendations" tab
   - Adjust search radius (try 10 km, 20 km, 30 km)
   - Observe:
     - Match scores (0-100)
     - Distance to each donation
     - Urgency levels (CRITICAL, HIGH, MEDIUM, LOW)
     - Estimated pickup times
     - Suggested time slots

5. **Verify Match Scoring**
   - Donations closer to you should have higher scores
   - Urgent donations (expiring soon) should rank higher
   - Check that all information is displayed correctly

**Expected Results**:
- ✅ Recommendations sorted by match score
- ✅ Distance calculated accurately
- ✅ Urgency levels displayed correctly
- ✅ Time slots suggested based on expiry time

---

### Scenario 2: Test Batch Pickup Suggestions

**Objective**: Get optimized routes for multiple donations grouped by urgency

**Steps**:

1. **Ensure Multiple Donations Exist**
   - Login as different donors
   - Create 3-5 donations with different:
     - Locations (within 10-20 km of NGO)
     - Expiry times (some urgent, some not)
     - Food types

2. **Login as NGO**
   - Go to `http://localhost:3000/ngo/smart-matching`

3. **View Batch Suggestions**
   - Click on "Batch Suggestions" tab
   - Observe the groupings:
     - **URGENT** - Donations expiring in < 2 hours
     - **MODERATE** - Donations expiring in 2-12 hours
     - **NORMAL** - Donations expiring in > 12 hours

4. **Check Route Details**
   - For each priority group, verify:
     - Total distance
     - Estimated time
     - Number of stops
     - Recommended time slot
     - Route sequence (numbered stops)

5. **Verify Route Optimization**
   - Check that stops are ordered logically
   - Nearest donations should be picked up first
   - Total distance should be reasonable

**Expected Results**:
- ✅ Donations grouped by urgency
- ✅ Routes optimized using nearest neighbor
- ✅ Total distance and time calculated
- ✅ Time slots suggested appropriately

---

### Scenario 3: Test Pickup Sequence for Accepted Donations

**Objective**: Get optimized sequence for donations already accepted by NGO

**Steps**:

1. **Accept Multiple Donations**
   - As NGO, go to available donations
   - Accept 2-3 donations in different locations

2. **View Pickup Sequence**
   - Go to `http://localhost:3000/ngo/smart-matching`
   - Click on "Pickup Sequence" tab

3. **Verify Sequence Details**
   - Check that accepted donations are listed
   - Verify pickup order (numbered 1, 2, 3...)
   - Check donor contact information
   - Verify distances between stops

4. **Check Summary Information**
   - Total pickups count
   - Total distance
   - Estimated time

**Expected Results**:
- ✅ Only accepted donations shown
- ✅ Optimized pickup order
- ✅ Donor contact details displayed
- ✅ Accurate distance and time estimates

---

### Scenario 4: Test API Endpoints Directly

**Objective**: Test the matching and logistics APIs using tools like Postman or curl

#### 4.1 Find Matches for a Donation

```bash
# Get authentication token first
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ngo@example.com","password":"password123"}'

# Use the token to find matches
curl -X GET "http://localhost:5000/api/matching/find/DONATION_ID?radius=10&limit=5" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response**:
```json
{
  "success": true,
  "donationId": "...",
  "searchRadius": 10,
  "matchesFound": 3,
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

#### 4.2 Get Time Slot Suggestions

```bash
curl -X GET "http://localhost:5000/api/matching/time-slots/DONATION_ID?distance=5" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response**:
```json
{
  "success": true,
  "donationId": "...",
  "expiryTime": "2026-02-24T18:00:00.000Z",
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

#### 4.3 Get Recommendations

```bash
curl -X GET "http://localhost:5000/api/matching/recommendations?radius=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response**:
```json
{
  "success": true,
  "totalRecommendations": 5,
  "searchRadius": 10,
  "recommendations": [
    {
      "donation": { ... },
      "matchScore": 87,
      "distance": 3.2,
      "urgencyLevel": "HIGH",
      "estimatedPickupTime": "30 minutes",
      "suggestedTimeSlots": [ ... ]
    }
  ]
}
```

#### 4.4 Get Batch Suggestions (NGO Only)

```bash
curl -X GET "http://localhost:5000/api/matching/batch-suggestions?radius=15" \
  -H "Authorization: Bearer YOUR_NGO_TOKEN"
```

**Expected Response**:
```json
{
  "success": true,
  "totalDonationsAvailable": 8,
  "suggestions": [
    {
      "priority": "URGENT",
      "description": "Immediate pickup required",
      "route": [ ... ],
      "totalDistance": 7.2,
      "estimatedTime": { ... },
      "numberOfStops": 3
    }
  ]
}
```

#### 4.5 Get Pickup Sequence (NGO Only)

```bash
curl -X GET "http://localhost:5000/api/matching/pickup-sequence" \
  -H "Authorization: Bearer YOUR_NGO_TOKEN"
```

**Expected Response**:
```json
{
  "success": true,
  "totalPickups": 3,
  "optimizedRoute": {
    "route": [ ... ],
    "totalDistance": 8.5,
    "estimatedTime": { ... }
  },
  "summary": {
    "totalDistance": 8.5,
    "estimatedTime": "1 hour 20 minutes",
    "numberOfStops": 3
  }
}
```

#### 4.6 Auto-Assign Donation

```bash
curl -X POST "http://localhost:5000/api/matching/auto-assign/DONATION_ID" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

**Expected Response**:
```json
{
  "success": true,
  "message": "Donation auto-assigned successfully",
  "donation": { ... },
  "match": {
    "recipient": { ... },
    "distance": 2.5,
    "score": 85
  }
}
```

---

## 🧪 Test Data Setup

### Create Test Donations with Different Scenarios

#### Urgent Donation (Expires in 1 hour)
```javascript
{
  "foodType": "Cooked Rice",
  "quantity": "10 kg",
  "expiryTime": new Date(Date.now() + 1 * 60 * 60 * 1000), // 1 hour from now
  "location": { lat: 28.6139, lng: 77.2090 },
  "pickupAddress": "123 Main Street, Delhi"
}
```

#### Moderate Urgency (Expires in 6 hours)
```javascript
{
  "foodType": "Fresh Vegetables",
  "quantity": "5 kg",
  "expiryTime": new Date(Date.now() + 6 * 60 * 60 * 1000), // 6 hours from now
  "location": { lat: 28.6200, lng: 77.2150 },
  "pickupAddress": "456 Park Avenue, Delhi"
}
```

#### Low Urgency (Expires in 24 hours)
```javascript
{
  "foodType": "Packaged Snacks",
  "quantity": "20 packets",
  "expiryTime": new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
  "location": { lat: 28.6100, lng: 77.2000 },
  "pickupAddress": "789 Garden Road, Delhi"
}
```

### Create Test NGO with Location

```javascript
{
  "name": "Food Relief NGO",
  "email": "ngo@example.com",
  "password": "password123",
  "role": "ngo",
  "location": { lat: 28.6139, lng: 77.2090 },
  "ngoDetails": {
    "verificationStatus": "verified",
    "registrationNumber": "NGO12345",
    "registrationType": "Trust"
  }
}
```

---

## 🔍 What to Verify

### Match Scoring
- [ ] Closer donations have higher scores
- [ ] Urgent donations rank higher
- [ ] Verified NGOs get priority over individuals
- [ ] Premium subscribers get better capacity scores

### Distance Calculation
- [ ] Distances are accurate (use Google Maps to verify)
- [ ] Haversine formula working correctly
- [ ] Radius filtering works (donations outside radius excluded)

### Route Optimization
- [ ] Routes follow logical order (nearest first)
- [ ] Total distance is sum of all segments
- [ ] Estimated time includes travel + pickup time
- [ ] No duplicate stops in route

### Time Slot Suggestions
- [ ] Only future time slots suggested
- [ ] Urgent donations get earlier slots
- [ ] Travel time considered in suggestions
- [ ] Slots before expiry time only

### UI/UX
- [ ] Match scores displayed prominently
- [ ] Urgency levels color-coded correctly
- [ ] Distance and time estimates visible
- [ ] Donor contact info shown in sequence
- [ ] Radius selector works smoothly

---

## 🐛 Common Issues & Solutions

### Issue 1: No Recommendations Shown
**Possible Causes**:
- No donations within search radius
- NGO location not set
- All donations already accepted

**Solutions**:
- Increase search radius
- Set NGO location in profile
- Create new test donations

### Issue 2: Match Scores All Zero
**Possible Causes**:
- Donation has no expiry time
- Recipient has no location
- Distance calculation error

**Solutions**:
- Add expiry time to donations
- Set recipient location
- Check console for errors

### Issue 3: Route Optimization Not Working
**Possible Causes**:
- Less than 2 donations
- Donations have no location
- NGO location not set

**Solutions**:
- Create multiple donations
- Ensure all have valid coordinates
- Set NGO location

### Issue 4: API Returns 401 Unauthorized
**Possible Causes**:
- Token expired
- Token not included in request
- User not authenticated

**Solutions**:
- Login again to get new token
- Include Authorization header
- Check token format: `Bearer YOUR_TOKEN`

### Issue 5: API Returns 403 Forbidden
**Possible Causes**:
- Wrong user role (e.g., donor accessing NGO-only endpoint)
- NGO not verified

**Solutions**:
- Use correct user role
- Verify NGO through admin panel

---

## 📊 Performance Benchmarks

### Expected Performance:

| Operation | Expected Time | Acceptable Range |
|-----------|--------------|------------------|
| Find Matches | < 100ms | 50-200ms |
| Route Optimization | < 500ms | 200-1000ms |
| Time Slot Calculation | < 50ms | 20-100ms |
| API Response | < 1s | 500ms-2s |

### Load Testing:

Test with:
- 10 donations → Should work smoothly
- 50 donations → Should work with slight delay
- 100+ donations → May need pagination

---

## 📝 Test Checklist

### Basic Functionality
- [ ] Login as NGO works
- [ ] Smart Matching page loads
- [ ] Recommendations tab shows data
- [ ] Batch Suggestions tab shows data
- [ ] Pickup Sequence tab shows data
- [ ] Radius selector works

### Matching Logic
- [ ] Match scores calculated correctly
- [ ] Distance calculation accurate
- [ ] Urgency levels correct
- [ ] Priority rules applied
- [ ] Capacity scoring works

### Logistics Features
- [ ] Time slots suggested appropriately
- [ ] Routes optimized logically
- [ ] Batch grouping by urgency works
- [ ] Pickup sequence ordered correctly
- [ ] Distance and time estimates accurate

### API Endpoints
- [ ] /find/:donationId works
- [ ] /auto-assign/:donationId works
- [ ] /time-slots/:donationId works
- [ ] /batch-suggestions works
- [ ] /pickup-sequence works
- [ ] /recommendations works

### Error Handling
- [ ] Invalid donation ID handled
- [ ] Missing location handled
- [ ] No matches found handled
- [ ] Authentication errors handled
- [ ] Authorization errors handled

---

## 🎯 Success Criteria

The implementation is successful if:

✅ NGOs can view personalized recommendations
✅ Match scores reflect proximity, urgency, and priority
✅ Routes are optimized for efficiency
✅ Time slots are suggested intelligently
✅ Batch suggestions group by urgency
✅ Pickup sequences are ordered logically
✅ All API endpoints respond correctly
✅ UI is intuitive and informative
✅ Performance is acceptable (< 1s response)
✅ No critical bugs or errors

---

## 📞 Support

If you encounter issues:

1. Check browser console for errors
2. Check server logs for backend errors
3. Verify MongoDB is running
4. Ensure all services are started
5. Review API responses for error messages

---

## 🚀 Next Steps

After successful testing:

1. **Production Deployment**
   - Configure production database
   - Set up environment variables
   - Deploy to production server

2. **Monitoring**
   - Set up logging
   - Track API performance
   - Monitor match success rates

3. **Optimization**
   - Fine-tune scoring weights
   - Adjust radius defaults
   - Optimize database queries

4. **Enhancements**
   - Add machine learning
   - Integrate real-time traffic
   - Implement multi-vehicle routing

---

**Happy Testing! 🎉**

**Last Updated**: February 2026
**Version**: 1.0.0
