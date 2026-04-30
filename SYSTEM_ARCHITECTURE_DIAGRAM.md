# Smart Matching & Logistics System Architecture

## System Overview Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         FOODZERO PLATFORM                                │
│                    Smart Matching & Logistics System                     │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                           FRONTEND LAYER                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                  │
│  │   Donor      │  │     NGO      │  │    Admin     │                  │
│  │  Dashboard   │  │  Dashboard   │  │  Dashboard   │                  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘                  │
│         │                 │                  │                           │
│         │                 │                  │                           │
│  ┌──────▼─────────────────▼──────────────────▼───────┐                  │
│  │         Smart Matching Interface                   │                  │
│  │  - Recommendations Tab                             │                  │
│  │  - Batch Suggestions Tab                           │                  │
│  │  - Pickup Sequence Tab                             │                  │
│  │  - Radius Selector                                 │                  │
│  │  - Match Score Visualization                       │                  │
│  └────────────────────────────────────────────────────┘                  │
│                                                                           │
└───────────────────────────────┬───────────────────────────────────────────┘
                                │
                                │ HTTP/REST API
                                │
┌───────────────────────────────▼───────────────────────────────────────────┐
│                            API LAYER                                       │
├───────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │              Matching Routes (/api/matching)                        │ │
│  ├─────────────────────────────────────────────────────────────────────┤ │
│  │  GET  /find/:donationId          - Find best matches                │ │
│  │  POST /auto-assign/:donationId   - Auto-assign donation             │ │
│  │  GET  /time-slots/:donationId    - Get time slot suggestions        │ │
│  │  GET  /batch-suggestions         - Get batch pickup suggestions     │ │
│  │  GET  /pickup-sequence           - Get optimized pickup sequence    │ │
│  │  GET  /recommendations           - Get personalized recommendations │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
│                                                                            │
└───────────────────────────────┬────────────────────────────────────────────┘
                                │
                                │
┌───────────────────────────────▼────────────────────────────────────────────┐
│                         BUSINESS LOGIC LAYER                               │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐ │
│  │                    Matching Engine Service                           │ │
│  ├──────────────────────────────────────────────────────────────────────┤ │
│  │                                                                       │ │
│  │  📍 Distance Calculation (Haversine Formula)                         │ │
│  │     • Calculate great-circle distance                                │ │
│  │     • Accuracy: ±0.5%                                                │ │
│  │                                                                       │ │
│  │  🎯 Match Scoring Algorithm                                          │ │
│  │     • Distance Score (40%)                                           │ │
│  │     • Urgency Score (35%)                                            │ │
│  │     • Priority Score (15%)                                           │ │
│  │     • Capacity Score (10%)                                           │ │
│  │                                                                       │ │
│  │  🔍 Recipient Filtering                                              │ │
│  │     • Radius-based search                                            │ │
│  │     • Verification status check                                      │ │
│  │     • Capacity validation                                            │ │
│  │                                                                       │ │
│  │  ⚡ Auto-Assignment                                                   │ │
│  │     • Find best match                                                │ │
│  │     • Update donation status                                         │ │
│  │     • Notify recipient                                               │ │
│  │                                                                       │ │
│  └──────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐ │
│  │                   Logistics Service                                  │ │
│  ├──────────────────────────────────────────────────────────────────────┤ │
│  │                                                                       │ │
│  │  🕐 Time Slot Suggestions                                            │ │
│  │     • 6 predefined time slots                                        │ │
│  │     • Urgency-based scoring                                          │ │
│  │     • Travel time consideration                                      │ │
│  │                                                                       │ │
│  │  🗺️ Route Optimization (Nearest Neighbor)                            │ │
│  │     • Start from NGO location                                        │ │
│  │     • Find nearest unvisited donation                                │ │
│  │     • Build optimal sequence                                         │ │
│  │     • Calculate total distance/time                                  │ │
│  │                                                                       │ │
│  │  📦 Batch Pickup Planning                                            │ │
│  │     • Group by urgency (URGENT/MODERATE/NORMAL)                      │ │
│  │     • Optimize route per group                                       │ │
│  │     • Suggest time slots                                             │ │
│  │                                                                       │ │
│  │  📊 Pickup Sequence Generation                                       │ │
│  │     • For accepted donations                                         │ │
│  │     • Optimized order                                                │ │
│  │     • Donor contact details                                          │ │
│  │                                                                       │ │
│  └──────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
└───────────────────────────────┬─────────────────────────────────────────────┘
                                │
                                │
┌───────────────────────────────▼─────────────────────────────────────────────┐
│                           DATA LAYER                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐               │
│  │   Donation     │  │     User       │  │   Tracking     │               │
│  │   Collection   │  │   Collection   │  │   Collection   │               │
│  ├────────────────┤  ├────────────────┤  ├────────────────┤               │
│  │ • foodType     │  │ • name         │  │ • donation     │               │
│  │ • quantity     │  │ • email        │  │ • status       │               │
│  │ • location     │  │ • role         │  │ • updates      │               │
│  │ • expiryTime   │  │ • location     │  │ • location     │               │
│  │ • status       │  │ • ngoDetails   │  │ • temperature  │               │
│  │ • ngoAssigned  │  │ • donorDetails │  │                │               │
│  │ • donor        │  │ • subscription │  │                │               │
│  └────────────────┘  └────────────────┘  └────────────────┘               │
│                                                                              │
│                        MongoDB Database                                     │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagram

### 1. Donation Matching Flow

```
┌─────────┐
│  Donor  │
│ Creates │
│Donation │
└────┬────┘
     │
     │ 1. Submit donation with location
     │
     ▼
┌────────────────────────────────────────┐
│      Matching Engine                   │
│                                        │
│  2. Search recipients within radius    │
│     ↓                                  │
│  3. Calculate distance for each        │
│     ↓                                  │
│  4. Calculate match scores             │
│     ↓                                  │
│  5. Sort by score (highest first)      │
│     ↓                                  │
│  6. Return top matches                 │
└────┬───────────────────────────────────┘
     │
     │ 7. Notify top matches
     │
     ▼
┌─────────────────────────────────────────┐
│  NGOs / Verified Individuals            │
│                                          │
│  • View recommendations                  │
│  • See match scores                      │
│  • Check distances                       │
│  • Review time slots                     │
│  • Accept donation                       │
└──────────────────────────────────────────┘
```

### 2. Route Optimization Flow

```
┌─────────┐
│   NGO   │
│ Requests│
│  Route  │
└────┬────┘
     │
     │ 1. Request batch suggestions
     │
     ▼
┌────────────────────────────────────────┐
│      Logistics Service                 │
│                                        │
│  2. Get all pending donations          │
│     ↓                                  │
│  3. Filter by radius                   │
│     ↓                                  │
│  4. Group by urgency:                  │
│     • URGENT (< 2 hours)               │
│     • MODERATE (2-12 hours)            │
│     • NORMAL (> 12 hours)              │
│     ↓                                  │
│  5. For each group:                    │
│     • Start at NGO location            │
│     • Find nearest donation            │
│     • Add to route                     │
│     • Repeat                           │
│     ↓                                  │
│  6. Calculate:                         │
│     • Total distance                   │
│     • Estimated time                   │
│     • Suggested time slots             │
└────┬───────────────────────────────────┘
     │
     │ 7. Return optimized routes
     │
     ▼
┌─────────────────────────────────────────┐
│  NGO Dashboard                           │
│                                          │
│  • View route map                        │
│  • See pickup order                      │
│  • Check distances                       │
│  • Review time estimates                 │
│  • Accept batch                          │
└──────────────────────────────────────────┘
```

## Algorithm Visualization

### Match Scoring Algorithm

```
Input: Donation, Recipient, Distance

┌─────────────────────────────────────────┐
│  Calculate Component Scores             │
├─────────────────────────────────────────┤
│                                         │
│  Distance Score (40% weight)            │
│  ┌─────────────────────────────────┐   │
│  │ Score = 100 × (1 - d/max_d)     │   │
│  │ Closer = Higher Score           │   │
│  └─────────────────────────────────┘   │
│           ↓                             │
│  Urgency Score (35% weight)             │
│  ┌─────────────────────────────────┐   │
│  │ < 2h  → 100 (CRITICAL)          │   │
│  │ 2-6h  → 80  (HIGH)              │   │
│  │ 6-24h → 60  (MEDIUM)            │   │
│  │ > 24h → 40  (LOW)               │   │
│  └─────────────────────────────────┘   │
│           ↓                             │
│  Priority Score (15% weight)            │
│  ┌─────────────────────────────────┐   │
│  │ Verified NGO      → 100         │   │
│  │ Pending NGO       → 70          │   │
│  │ Verified Indiv L2 → 50          │   │
│  │ Verified Indiv L1 → 30          │   │
│  └─────────────────────────────────┘   │
│           ↓                             │
│  Capacity Score (10% weight)            │
│  ┌─────────────────────────────────┐   │
│  │ Enterprise  → 100               │   │
│  │ Premium     → 80                │   │
│  │ Basic       → 50                │   │
│  │ Free        → 20                │   │
│  └─────────────────────────────────┘   │
│           ↓                             │
├─────────────────────────────────────────┤
│  Weighted Sum                           │
│  ┌─────────────────────────────────┐   │
│  │ Total = (D×0.4) + (U×0.35) +    │   │
│  │         (P×0.15) + (C×0.1)      │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
           ↓
    Match Score (0-100)
```

### Route Optimization Algorithm (Nearest Neighbor)

```
Input: NGO Location, List of Donations

┌─────────────────────────────────────────┐
│  Initialize                             │
│  • route = []                           │
│  • current = NGO location               │
│  • remaining = all donations            │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│  While remaining donations exist:       │
│                                         │
│  1. Find nearest donation               │
│     ┌─────────────────────────────┐    │
│     │ For each donation:          │    │
│     │   Calculate distance from   │    │
│     │   current location          │    │
│     │ Select minimum distance     │    │
│     └─────────────────────────────┘    │
│           ↓                             │
│  2. Add to route                        │
│     ┌─────────────────────────────┐    │
│     │ route.push(nearest)         │    │
│     │ totalDistance += distance   │    │
│     └─────────────────────────────┘    │
│           ↓                             │
│  3. Update state                        │
│     ┌─────────────────────────────┐    │
│     │ current = nearest.location  │    │
│     │ remaining.remove(nearest)   │    │
│     └─────────────────────────────┘    │
│           ↓                             │
│  4. Repeat                              │
└─────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│  Calculate Totals                       │
│  • Total distance                       │
│  • Travel time (distance / avg_speed)  │
│  • Pickup time (stops × avg_pickup)    │
│  • Total time = travel + pickup        │
└─────────────────────────────────────────┘
             │
             ▼
    Optimized Route
```

## Component Interaction Diagram

```
┌──────────────────────────────────────────────────────────────────────┐
│                        User Interactions                              │
└──────────────────────────────────────────────────────────────────────┘
                                 │
                    ┌────────────┼────────────┐
                    │            │            │
                    ▼            ▼            ▼
            ┌───────────┐ ┌───────────┐ ┌───────────┐
            │   Donor   │ │    NGO    │ │   Admin   │
            └─────┬─────┘ └─────┬─────┘ └─────┬─────┘
                  │             │             │
                  │             │             │
┌─────────────────┼─────────────┼─────────────┼─────────────────┐
│                 │             │             │                  │
│  ┌──────────────▼─────────────▼─────────────▼──────────────┐  │
│  │              API Gateway / Routes                        │  │
│  │  • Authentication Middleware                             │  │
│  │  • Request Validation                                    │  │
│  │  • Response Formatting                                   │  │
│  └──────────────┬─────────────┬─────────────┬──────────────┘  │
│                 │             │             │                  │
│  ┌──────────────▼─────────────▼─────────────▼──────────────┐  │
│  │           Matching Controller                            │  │
│  │  • findMatches()                                         │  │
│  │  • autoAssign()                                          │  │
│  │  • getTimeSlots()                                        │  │
│  │  • getBatchSuggestions()                                 │  │
│  │  • getPickupSequence()                                   │  │
│  │  • getRecommendations()                                  │  │
│  └──────────────┬─────────────┬─────────────┬──────────────┘  │
│                 │             │             │                  │
│  ┌──────────────▼─────────────▼─────────────▼──────────────┐  │
│  │                    Services Layer                        │  │
│  │  ┌────────────────────┐  ┌────────────────────┐         │  │
│  │  │ Matching Engine    │  │ Logistics Service  │         │  │
│  │  │ • Distance calc    │  │ • Time slots       │         │  │
│  │  │ • Score calc       │  │ • Route optimize   │         │  │
│  │  │ • Find matches     │  │ • Batch planning   │         │  │
│  │  │ • Auto-assign      │  │ • Sequence gen     │         │  │
│  │  └────────────────────┘  └────────────────────┘         │  │
│  └──────────────┬─────────────┬─────────────┬──────────────┘  │
│                 │             │             │                  │
│  ┌──────────────▼─────────────▼─────────────▼──────────────┐  │
│  │                  Database Layer                          │  │
│  │  • Donation Model                                        │  │
│  │  • User Model                                            │  │
│  │  • Tracking Model                                        │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Technology Stack

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend Stack                          │
├─────────────────────────────────────────────────────────────┤
│  • Next.js 14         - React framework                     │
│  • React 18           - UI library                          │
│  • Tailwind CSS       - Styling                             │
│  • Axios              - HTTP client                         │
│  • Lucide Icons       - Icon library                        │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      Backend Stack                           │
├─────────────────────────────────────────────────────────────┤
│  • Node.js            - Runtime                             │
│  • Express.js         - Web framework                       │
│  • MongoDB            - Database                            │
│  • Mongoose           - ODM                                 │
│  • Socket.io          - Real-time communication             │
│  • JWT                - Authentication                      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    Algorithms & Math                         │
├─────────────────────────────────────────────────────────────┤
│  • Haversine Formula  - Distance calculation                │
│  • Weighted Scoring   - Match ranking                       │
│  • Nearest Neighbor   - Route optimization                  │
│  • Greedy Algorithm   - Time slot selection                 │
└─────────────────────────────────────────────────────────────┘
```

---

**Last Updated**: February 2026
**Version**: 1.0.0
