# 🧮 FoodZero - Complete Calculation Formulas & Logic Guide

## 📋 ALL FORMULAS USED IN THE PROJECT

This document explains every mathematical formula and calculation logic used in FoodZero.

---

## 1️⃣ DISTANCE CALCULATION (HAVERSINE FORMULA)

### Purpose
Calculate the shortest distance between two points on Earth (donor and NGO locations).

### Formula
```javascript
function calculateDistance(coord1, coord2) {
  const R = 6371; // Earth's radius in kilometers
  
  const lat1 = coord1.lat * (Math.PI / 180);
  const lat2 = coord2.lat * (Math.PI / 180);
  const deltaLat = (coord2.lat - coord1.lat) * (Math.PI / 180);
  const deltaLng = (coord2.lng - coord1.lng) * (Math.PI / 180);
  
  const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
            Math.cos(lat1) * Math.cos(lat2) *
            Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return R * c; // Distance in km
}
```

### Mathematical Steps
```
1. Convert degrees to radians: radians = degrees × (π / 180)
2. Calculate differences: Δlat = lat2 - lat1, Δlng = lng2 - lng1
3. Apply formula: a = sin²(Δlat/2) + cos(lat1) × cos(lat2) × sin²(Δlng/2)
4. Angular distance: c = 2 × atan2(√a, √(1-a))
5. Actual distance: distance = R × c (R = 6371 km)
```

### Example
```
Mumbai (19.0760°N, 72.8777°E) to Pune (18.5204°N, 73.8567°E)
Result: 118.34 km
```

---

## 2️⃣ RADIUS MEASUREMENT

### Default Settings
```javascript
const DEFAULT_RADIUS_KM = 10;  // 10 kilometers
const MAX_RADIUS_KM = 50;      // Maximum 50 kilometers
```

### Filtering Logic
```javascript
function findNGOsInRadius(donorLocation, radiusKm = 10) {
  return ngos.filter(ngo => {
    const distance = calculateDistance(donorLocation, ngo.location);
    return distance <= radiusKm;
  });
}
```

### Dynamic Expansion
```
Start: 10km → No NGOs found
Expand: 20km → No NGOs found
Expand: 30km → Found 3 NGOs ✅
Stop searching
```

---

## 3️⃣ TIME CALCULATIONS

### A. Pickup Time Estimation
```javascript
function estimatePickupTime(distanceKm) {
  const AVG_SPEED = 30; // km/h in city
  const PREP_TIME = 15; // minutes
  
  const travelMinutes = (distanceKm / AVG_SPEED) * 60;
  const totalMinutes = travelMinutes + PREP_TIME;
  
  if (totalMinutes < 60) {
    return `${totalMinutes} minutes`;
  } else {
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    return `${hours}h ${mins}m`;
  }
}
```

### Examples
```
5km: (5/30)×60 + 15 = 10 + 15 = 25 minutes
15km: (15/30)×60 + 15 = 30 + 15 = 45 minutes
40km: (40/30)×60 + 15 = 80 + 15 = 95 minutes = 1h 35m
```

---

## 4️⃣ EXPIRY TIME LOGIC

### A. Time Until Expiry
```javascript
function calculateTimeToExpiry(expiryTime) {
  const now = new Date();
  const expiry = new Date(expiryTime);
  const diffMs = expiry - now;
  const hoursToExpiry = diffMs / (1000 * 60 * 60);
  return hoursToExpiry;
}
```

### B. Urgency Classification
```javascript
function getUrgencyLevel(expiryTime) {
  const hours = calculateTimeToExpiry(expiryTime);
  
  if (hours <= 0) return "EXPIRED";
  if (hours <= 2) return "CRITICAL";   // < 2 hours
  if (hours <= 6) return "HIGH";       // 2-6 hours
  if (hours <= 24) return "MEDIUM";    // 6-24 hours
  if (hours <= 48) return "LOW";       // 24-48 hours
  return "VERY_LOW";                   // > 48 hours
}
```

### C. Urgency Score (0-100)
```javascript
function calculateUrgencyScore(expiryTime) {
  const hours = calculateTimeToExpiry(expiryTime);
  
  if (hours <= 0) return 0;
  if (hours <= 2) return 100;
  if (hours <= 6) return 80;
  if (hours <= 24) return 60;
  if (hours <= 48) return 40;
  return 20;
}
```

---

## 5️⃣ MEALS SERVED CALCULATION

### Conversion Rates (Industry Standard)
```javascript
const conversionRates = {
  // Weight-based
  'kg': {
    'cooked': 4,        // 1kg cooked = 4 meals
    'raw': 3,           // 1kg raw = 3 meals
    'rice': 10,         // 1kg rice = 10 meals
    'vegetables': 5,    // 1kg vegetables = 5 meals
    'meat': 4,          // 1kg meat = 4 meals
    'default': 4
  },
  'grams': 0.004,       // 250g = 1 meal
  
  // Volume-based
  'liters': {
    'soup': 4,          // 1 liter = 4 meals
    'curry': 5,         // 1 liter = 5 meals
    'default': 4
  },
  
  // Count-based
  'plates': 1,          // 1 plate = 1 meal
  'servings': 1,        // 1 serving = 1 meal
  'pieces': {
    'bread': 0.5,       // 2 pieces = 1 meal
    'roti': 0.33,       // 3 rotis = 1 meal
    'default': 1
  },
  'boxes': 1,           // 1 box = 1 meal
  'bags': 2             // 1 bag = 2 meals
};
```

### Calculation Function
```javascript
function calculateMealsServed(quantity, unit, foodType) {
  let meals = 0;
  
  if (unit === 'kg') {
    const rate = conversionRates.kg[foodType] || conversionRates.kg.default;
    meals = quantity * rate;
  } else if (unit === 'grams') {
    meals = quantity * conversionRates.grams;
  } else if (unit === 'liters') {
    const rate = conversionRates.liters[foodType] || conversionRates.liters.default;
    meals = quantity * rate;
  } else if (unit === 'plates' || unit === 'servings') {
    meals = quantity;
  } else if (unit === 'pieces') {
    const rate = conversionRates.pieces[foodType] || conversionRates.pieces.default;
    meals = quantity * rate;
  } else if (unit === 'boxes') {
    meals = quantity;
  } else if (unit === 'bags') {
    meals = quantity * 2;
  }
  
  return Math.round(meals);
}
```

### Examples
```
10kg cooked food: 10 × 4 = 40 meals
15kg vegetables: 15 × 5 = 75 meals
20 liters soup: 20 × 4 = 80 meals
50 plates: 50 × 1 = 50 meals
100 bread pieces: 100 × 0.5 = 50 meals
5kg rice: 5 × 10 = 50 meals
```

### People Served
```javascript
function estimatePeopleServed(totalMeals) {
  const MEALS_PER_PERSON = 1.5; // Average
  return Math.round(totalMeals / MEALS_PER_PERSON);
}

// Example: 100 meals = 100 / 1.5 = 67 people
```

---

## 6️⃣ CARBON SAVINGS CALCULATION

### CO2 Emission Factors (kg CO2 per kg food)
```javascript
const emissionFactors = {
  'meat': 27.0,         // Beef, pork, chicken
  'dairy': 5.3,         // Milk, cheese
  'rice': 2.7,          // Rice and grains
  'vegetables': 2.0,    // Fresh vegetables
  'fruits': 1.1,        // Fresh fruits
  'bread': 1.6,         // Bakery items
  'cooked': 2.5,        // Mixed cooked food
  'packaged': 3.0,      // Processed food
  'default': 2.5        // Average
};
```

### Calculation Function
```javascript
function calculateCarbonSaved(quantityKg, foodType) {
  const factor = emissionFactors[foodType] || emissionFactors.default;
  const co2SavedKg = quantityKg * factor;
  
  return {
    kg: Math.round(co2SavedKg * 100) / 100,
    tons: Math.round(co2SavedKg / 1000 * 100) / 100
  };
}
```

### Examples
```
10kg cooked food: 10 × 2.5 = 25 kg CO2 saved
50kg vegetables: 50 × 2.0 = 100 kg CO2 saved
5kg meat: 5 × 27 = 135 kg CO2 saved
20kg rice: 20 × 2.7 = 54 kg CO2 saved
```

### CO2 Equivalents
```javascript
function calculateCO2Equivalents(co2Kg) {
  return {
    trees: Math.round(co2Kg / 21),           // 1 tree absorbs 21kg/year
    carKm: Math.round(co2Kg / 0.12),         // Car emits 0.12kg/km
    phoneCharges: Math.round(co2Kg / 0.008), // 1 charge = 0.008kg
    lightBulbHours: Math.round(co2Kg / 0.05) // 1 hour = 0.05kg
  };
}
```

### Example
```
25 kg CO2 saved =
- 1 tree for 1 year
- 208 km of car driving
- 3,125 phone charges
- 500 hours of light bulb
```

---

## 7️⃣ WATER CONSERVATION CALCULATION

### Water Footprint (liters per kg)
```javascript
const waterFootprints = {
  'meat': 15400,        // Beef (highest)
  'chicken': 4300,      // Chicken meat
  'dairy': 1000,        // Milk products
  'rice': 2500,         // Rice
  'wheat': 1800,        // Wheat/bread
  'vegetables': 322,    // Average vegetables
  'fruits': 962,        // Average fruits
  'cooked': 2000,       // Mixed cooked
  'default': 1500       // Average
};
```

### Calculation Function
```javascript
function calculateWaterSaved(quantityKg, foodType) {
  const footprint = waterFootprints[foodType] || waterFootprints.default;
  const waterSavedLiters = quantityKg * footprint;
  
  return {
    liters: Math.round(waterSavedLiters),
    cubicMeters: Math.round(waterSavedLiters / 1000 * 100) / 100,
    gallons: Math.round(waterSavedLiters * 0.264)
  };
}
```

### Examples
```
10kg vegetables: 10 × 322 = 3,220 liters
5kg meat: 5 × 15,400 = 77,000 liters
20kg rice: 20 × 2,500 = 50,000 liters
15kg cooked: 15 × 2,000 = 30,000 liters
```

### Water Equivalents
```javascript
function calculateWaterEquivalents(liters) {
  return {
    showers: Math.round(liters / 65),        // 1 shower = 65 liters
    bathtubs: Math.round(liters / 300),      // 1 bathtub = 300 liters
    daysOfDrinking: Math.round(liters / 2),  // 2 liters/day
    bottles: Math.round(liters / 0.5)        // 500ml bottles
  };
}
```

### Example
```
3,220 liters =
- 49 showers
- 11 bathtubs
- 1,610 days of drinking water
- 6,440 water bottles
```

---

## 8️⃣ SMART MATCHING SCORE

### Four-Factor Scoring System

#### 1. Distance Score (40% weight)
```javascript
function calculateDistanceScore(distance, maxRadius = 50) {
  return Math.max(0, 100 * (1 - distance / maxRadius));
}

// Example: 5km distance, 50km max
// Score = 100 × (1 - 5/50) = 100 × 0.9 = 90
```

#### 2. Urgency Score (35% weight)
```javascript
function calculateUrgencyScore(expiryTime) {
  const hours = calculateTimeToExpiry(expiryTime);
  
  if (hours <= 0) return 0;
  if (hours <= 2) return 100;
  if (hours <= 6) return 80;
  if (hours <= 24) return 60;
  if (hours <= 48) return 40;
  return 20;
}
```

#### 3. Priority Score (15% weight)
```javascript
function calculatePriorityScore(recipient) {
  if (recipient.role === "ngo") {
    if (recipient.ngoDetails?.verificationStatus === "verified") {
      return 100;  // Verified NGO
    }
    return 70;     // Pending NGO
  }
  
  if (recipient.role === "donor") {
    if (recipient.donorDetails?.verificationLevel >= 2) {
      return 50;   // Verified individual
    }
    if (recipient.donorDetails?.verificationLevel === 1) {
      return 30;   // Partially verified
    }
    return 10;     // Unverified
  }
  
  return 0;
}
```

#### 4. Capacity Score (10% weight)
```javascript
function calculateCapacityScore(recipient) {
  const plan = recipient.subscription?.plan || "free";
  
  const capacityMap = {
    "free": 20,
    "starter": 40,
    "basic": 50,
    "professional": 70,
    "premium": 80,
    "enterprise": 100
  };
  
  return capacityMap[plan] || 20;
}
```

### Final Match Score
```javascript
function calculateMatchScore(donation, recipient, distance) {
  const distanceScore = calculateDistanceScore(distance);
  const urgencyScore = calculateUrgencyScore(donation.expiryTime);
  const priorityScore = calculatePriorityScore(recipient);
  const capacityScore = calculateCapacityScore(recipient);
  
  const totalScore = 
    (distanceScore * 0.40) +
    (urgencyScore * 0.35) +
    (priorityScore * 0.15) +
    (capacityScore * 0.10);
  
  return Math.round(totalScore);
}
```

### Example Calculation
```
NGO A:
- Distance: 5km → Score: 90
- Urgency: 3 hours → Score: 80
- Priority: Verified NGO → Score: 100
- Capacity: Premium plan → Score: 80

Match Score = (90 × 0.4) + (80 × 0.35) + (100 × 0.15) + (80 × 0.1)
            = 36 + 28 + 15 + 8
            = 87 (Excellent Match!)
```

---

## 9️⃣ IMPACT SCORE CALCULATION

### Overall Impact Score (0-100)
```javascript
function calculateImpactScore(donation) {
  const meals = calculateMealsServed(
    donation.quantityNumber,
    donation.quantityUnit,
    donation.foodCategory
  );
  
  const co2 = calculateCarbonSaved(
    donation.quantityNumber,
    donation.foodCategory
  );
  
  const water = calculateWaterSaved(
    donation.quantityNumber,
    donation.foodCategory
  );
  
  // Normalize to 0-100
  const mealScore = Math.min(meals / 100 * 100, 100);
  const co2Score = Math.min(co2.kg / 50 * 100, 100);
  const waterScore = Math.min(water.liters / 10000 * 100, 100);
  
  // Weighted average
  const impactScore = (
    mealScore * 0.5 +
    co2Score * 0.3 +
    waterScore * 0.2
  );
  
  return Math.round(impactScore);
}
```

### Impact Level
```javascript
function getImpactLevel(score) {
  if (score >= 80) return "EXCEPTIONAL";
  if (score >= 60) return "HIGH";
  if (score >= 40) return "MEDIUM";
  if (score >= 20) return "LOW";
  return "MINIMAL";
}
```

---

## 🔟 ADDITIONAL CALCULATIONS

### A. Donation Value Estimation
```javascript
function estimateDonationValue(quantity, unit, foodType) {
  // Average food prices (₹ per kg)
  const prices = {
    'meat': 400,
    'chicken': 200,
    'vegetables': 40,
    'rice': 50,
    'fruits': 80,
    'cooked': 100,
    'default': 80
  };
  
  const pricePerKg = prices[foodType] || prices.default;
  const quantityKg = convertToKg(quantity, unit);
  
  return quantityKg * pricePerKg;
}

// Example: 10kg vegetables = 10 × 40 = ₹400
```

### B. Landfill Space Saved
```javascript
function calculateLandfillSpaceSaved(quantityKg) {
  // 1 kg food waste = 0.001 cubic meters in landfill
  const cubicMeters = quantityKg * 0.001;
  
  return {
    cubicMeters: Math.round(cubicMeters * 100) / 100,
    truckLoads: Math.round(cubicMeters / 10 * 100) / 100 // 1 truck = 10 m³
  };
}

// Example: 1000kg = 1 cubic meter = 0.1 truck loads
```

### C. Methane Emissions Prevented
```javascript
function calculateMethanePrevented(quantityKg) {
  // Food waste in landfill produces methane
  // 1 kg food waste = 0.5 kg CO2-equivalent methane
  const methaneCO2Equivalent = quantityKg * 0.5;
  
  return {
    kg: Math.round(methaneCO2Equivalent * 100) / 100,
    // Methane is 25x more potent than CO2
    actualMethaneKg: Math.round(methaneCO2Equivalent / 25 * 100) / 100
  };
}

// Example: 100kg food = 50kg CO2-eq = 2kg actual methane
```

### D. Economic Impact
```javascript
function calculateEconomicImpact(donations) {
  let totalValue = 0;
  let totalDisposalCostSaved = 0;
  
  donations.forEach(donation => {
    // Food value
    totalValue += estimateDonationValue(
      donation.quantityNumber,
      donation.quantityUnit,
      donation.foodCategory
    );
    
    // Disposal cost saved (₹5 per kg)
    totalDisposalCostSaved += donation.quantityNumber * 5;
  });
  
  return {
    foodValue: totalValue,
    disposalCostSaved: totalDisposalCostSaved,
    totalEconomicBenefit: totalValue + totalDisposalCostSaved
  };
}
```

### E. Social Impact Score
```javascript
function calculateSocialImpactScore(donations) {
  const totalMeals = donations.reduce((sum, d) => {
    return sum + calculateMealsServed(d.quantityNumber, d.quantityUnit, d.foodCategory);
  }, 0);
  
  const totalPeople = estimatePeopleServed(totalMeals);
  
  return {
    meals: totalMeals,
    people: totalPeople,
    // Assume 3 meals/day, calculate days of food security provided
    daysOfFoodSecurity: Math.round(totalMeals / 3),
    // Social impact score (0-100)
    score: Math.min(totalPeople / 1000 * 100, 100)
  };
}
```

---

## 📊 SUMMARY TABLE

| Metric | Formula | Example |
|--------|---------|---------|
| Distance | Haversine formula | 5km |
| Pickup Time | (distance/30)×60 + 15 min | 25 min |
| Meals | quantity × conversion rate | 10kg × 4 = 40 meals |
| CO2 Saved | quantity × emission factor | 10kg × 2.5 = 25kg CO2 |
| Water Saved | quantity × water footprint | 10kg × 2000 = 20,000L |
| Match Score | Weighted sum of 4 factors | 87/100 |
| Impact Score | Weighted sum of 3 metrics | 90/100 |

---

## 🎯 QUICK REFERENCE

### Standard Assumptions
- Average city speed: 30 km/h
- Preparation time: 15 minutes
- 1 meal = 250 grams
- 1 person = 1.5 meals
- Earth radius: 6371 km
- Default search radius: 10 km
- Maximum search radius: 50 km

### Conversion Factors
- 1 kg cooked food = 4 meals
- 1 kg vegetables = 5 meals
- 1 kg rice = 10 meals
- 1 liter soup = 4 meals
- 1 plate = 1 meal

### Environmental Factors
- 1 kg food waste = 2.5 kg CO2 (average)
- 1 kg food = 2000 liters water (average)
- 1 tree absorbs 21 kg CO2/year
- 1 km car = 0.12 kg CO2

---

**All formulas are based on industry standards, FAO reports, and scientific research. 🌱**
