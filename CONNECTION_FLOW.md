# 🔄 MongoDB Connection Flow - Visual Guide

## Complete Connection Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    START SERVER                              │
│                  npm run server                              │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              server/server.js                                │
│  ┌────────────────────────────────────────────────────┐    │
│  │  const express = require("express");                │    │
│  │  require("dotenv").config(); ← Load .env file      │    │
│  │  const connectDB = require("./config/db");         │    │
│  │  connectDB(); ← Call connection function           │    │
│  └────────────────────────────────────────────────────┘    │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    .env File                                 │
│  ┌────────────────────────────────────────────────────┐    │
│  │  PORT=5000                                          │    │
│  │  MONGO_URI=mongodb://localhost:27017/food-donation │    │
│  │  JWT_SECRET=your_jwt_secret_key                    │    │
│  └────────────────────────────────────────────────────┘    │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│            server/config/db.js                               │
│  ┌────────────────────────────────────────────────────┐    │
│  │  const mongoose = require("mongoose");             │    │
│  │                                                      │    │
│  │  const connectDB = async () => {                   │    │
│  │    try {                                            │    │
│  │      const conn = await mongoose.connect(          │    │
│  │        process.env.MONGO_URI,                      │    │
│  │        { options }                                  │    │
│  │      );                                             │    │
│  │      console.log("✅ MongoDB Connected");          │    │
│  │    } catch (error) {                                │    │
│  │      console.error("❌ Connection Error");         │    │
│  │      process.exit(1);                               │    │
│  │    }                                                 │    │
│  │  };                                                  │    │
│  └────────────────────────────────────────────────────┘    │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                  Mongoose Library                            │
│         (MongoDB Object Data Modeling)                       │
│  ┌────────────────────────────────────────────────────┐    │
│  │  • Validates connection string                      │    │
│  │  • Establishes TCP connection                       │    │
│  │  • Authenticates (if required)                      │    │
│  │  • Maintains connection pool                        │    │
│  └────────────────────────────────────────────────────┘    │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
         ┌───────────┴───────────┐
         │                       │
         ▼                       ▼
┌──────────────────┐    ┌──────────────────┐
│  Local MongoDB   │    │  MongoDB Atlas   │
│  localhost:27017 │    │  (Cloud)         │
└────────┬─────────┘    └────────┬─────────┘
         │                       │
         └───────────┬───────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              MongoDB Database                                │
│                food-donation                                 │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Collections:                                       │    │
│  │  • users                                            │    │
│  │  • donations                                        │    │
│  │  • trackings                                        │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## Data Flow: User Registration Example

```
┌─────────────────────────────────────────────────────────────┐
│  1. User fills registration form                            │
│     http://localhost:3001/register                          │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  2. Frontend sends POST request                             │
│     axios.post("/auth/register", {                          │
│       name, email, password, role                           │
│     })                                                       │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  3. Backend receives request                                │
│     server/routes/authRoutes.js                             │
│     router.post("/register", registerUser)                  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  4. Controller processes request                            │
│     server/controllers/authController.js                    │
│     • Hash password with bcrypt                             │
│     • Create user object                                    │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  5. Mongoose Model saves to MongoDB                         │
│     server/models/User.js                                   │
│     await User.create({ name, email, password, role })      │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  6. MongoDB stores document                                 │
│     Database: food-donation                                 │
│     Collection: users                                       │
│     Document: { _id, name, email, password, role, ... }     │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  7. Response sent back to frontend                          │
│     { user: { _id, name, email, role } }                    │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  8. User redirected to login page                           │
│     router.push("/login")                                   │
└─────────────────────────────────────────────────────────────┘
```

---

## File Structure & Connections

```
FoodZero/
│
├── .env ─────────────────────┐
│   └── MONGO_URI             │ (Connection String)
│                              │
├── server/                    │
│   │                          │
│   ├── server.js ─────────────┤
│   │   ├── require("dotenv") │ (Loads .env)
│   │   └── connectDB() ──────┤
│   │                          │
│   ├── config/                │
│   │   └── db.js ◄────────────┘
│   │       └── mongoose.connect(MONGO_URI)
│   │
│   ├── models/ ───────────────┐
│   │   ├── User.js            │
│   │   ├── Donation.js        │ (Define Schemas)
│   │   └── Tracking.js        │
│   │                           │
│   ├── controllers/ ──────────┤
│   │   ├── authController.js  │
│   │   ├── donationController │ (Use Models)
│   │   ├── ngoController.js   │
│   │   └── adminController.js │
│   │                           │
│   └── routes/ ───────────────┘
│       ├── authRoutes.js
│       ├── donationRoutes.js
│       ├── ngoRoutes.js
│       └── adminRoutes.js
│
└── MongoDB ◄─────────────────── (Database)
    └── food-donation
        ├── users
        ├── donations
        └── trackings
```

---

## Connection States

```
┌─────────────────────────────────────────────────────────────┐
│                    Connection States                         │
└─────────────────────────────────────────────────────────────┘

State 0: DISCONNECTED
┌──────────────────────┐
│  No connection       │
│  MongoDB not started │
└──────────────────────┘
         │
         │ mongoose.connect()
         ▼
State 1: CONNECTING
┌──────────────────────┐
│  Attempting to       │
│  establish           │
│  connection          │
└──────────────────────┘
         │
         ├─── Success ───┐
         │               │
         │               ▼
         │      State 2: CONNECTED
         │      ┌──────────────────────┐
         │      │  ✅ Ready to use     │
         │      │  Can perform queries │
         │      └──────────────────────┘
         │
         └─── Failure ───┐
                         │
                         ▼
                State 99: ERROR
                ┌──────────────────────┐
                │  ❌ Connection failed│
                │  Server exits        │
                └──────────────────────┘
```

---

## Environment Variables Flow

```
┌─────────────────────────────────────────────────────────────┐
│  .env file (Root directory)                                 │
│  ┌────────────────────────────────────────────────────┐    │
│  │  PORT=5000                                          │    │
│  │  MONGO_URI=mongodb://localhost:27017/food-donation │    │
│  │  JWT_SECRET=your_secret                            │    │
│  │  NODE_ENV=development                               │    │
│  └────────────────────────────────────────────────────┘    │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ require("dotenv").config()
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  process.env (Node.js Environment)                          │
│  ┌────────────────────────────────────────────────────┐    │
│  │  process.env.PORT = "5000"                          │    │
│  │  process.env.MONGO_URI = "mongodb://..."           │    │
│  │  process.env.JWT_SECRET = "your_secret"            │    │
│  │  process.env.NODE_ENV = "development"               │    │
│  └────────────────────────────────────────────────────┘    │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ Used in code
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  Application Code                                           │
│  ┌────────────────────────────────────────────────────┐    │
│  │  mongoose.connect(process.env.MONGO_URI)           │    │
│  │  jwt.sign(payload, process.env.JWT_SECRET)         │    │
│  │  server.listen(process.env.PORT)                   │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## Connection Options Explained

```javascript
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,      // ← Use new URL string parser
  useUnifiedTopology: true,   // ← Use new Server Discovery engine
  serverSelectionTimeoutMS: 5000  // ← Wait 5 seconds before timeout
})
```

**What each option does**:

1. **useNewUrlParser: true**
   - Uses MongoDB's new connection string parser
   - Handles modern connection string formats
   - Required for MongoDB 4.0+

2. **useUnifiedTopology: true**
   - Uses new topology engine for server discovery
   - Better connection management
   - Automatic failover and reconnection

3. **serverSelectionTimeoutMS: 5000**
   - Maximum time to wait for server selection
   - 5000ms = 5 seconds
   - Fails fast if MongoDB is not available

---

## Summary

**Your MongoDB Connection**:
1. ✅ Configuration file: `server/config/db.js`
2. ✅ Connection string: `.env` file
3. ✅ Called from: `server/server.js`
4. ✅ Uses: Mongoose library
5. ✅ Database: `food-donation`
6. ✅ Collections: `users`, `donations`, `trackings`

**Status**: Ready to connect! Just need to start MongoDB.

**Next Step**: 
```bash
# Install MongoDB, then:
mongod

# Or use MongoDB Atlas (cloud)
```

Once MongoDB is running, your connection will work automatically! 🚀
