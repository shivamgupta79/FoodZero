# 🗄️ MongoDB Connection Guide - Your Project

## 📋 How Your Project Connects to MongoDB

### Connection Flow Diagram

```
1. server/server.js (Entry Point)
   ↓
2. Loads .env file (dotenv)
   ↓
3. Imports connectDB from server/config/db.js
   ↓
4. Calls connectDB()
   ↓
5. Mongoose connects to MongoDB
   ↓
6. Success ✅ or Error ❌
```

---

## 🔧 Configuration Files

### 1. Environment Variables (`.env`)

**Location**: Root directory `.env`

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/food-donation
JWT_SECRET=your_jwt_secret_key_here_change_in_production
NODE_ENV=development
```

**What it does**:
- `MONGO_URI`: MongoDB connection string
- Default: `mongodb://localhost:27017/food-donation`
- Database name: `food-donation`

---

### 2. Database Configuration (`server/config/db.js`)

**Location**: `server/config/db.js`

```javascript
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGO_URI || "mongodb://localhost:27017/food-donation",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000
      }
    );
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.error(`\n⚠️  MongoDB is not running!`);
    console.error(`\nPlease install and start MongoDB:`);
    console.error(`1. Download from: https://www.mongodb.com/try/download/community`);
    console.error(`2. Or use MongoDB Atlas (cloud): https://www.mongodb.com/cloud/atlas`);
    console.error(`3. Update .env with your connection string\n`);
    process.exit(1);
  }
};

module.exports = connectDB;
```

**What it does**:
- Imports Mongoose (MongoDB ODM)
- Creates async function `connectDB()`
- Reads connection string from `process.env.MONGO_URI`
- Fallback to local MongoDB if env variable not set
- Connection options:
  - `useNewUrlParser`: Use new URL parser
  - `useUnifiedTopology`: Use new topology engine
  - `serverSelectionTimeoutMS`: 5 second timeout
- Success: Logs connected host
- Error: Shows helpful error message and exits

---

### 3. Server Entry Point (`server/server.js`)

**Location**: `server/server.js`

```javascript
const express = require("express");
require("dotenv").config(); // Load .env file

// ... other imports ...

// Database connection
const connectDB = require("./config/db");
connectDB(); // ← This connects to MongoDB

// ... rest of server setup ...
```

**What it does**:
- Loads environment variables with `dotenv`
- Imports `connectDB` function
- Calls `connectDB()` to establish connection
- Connection happens when server starts

---

## 📊 Database Models

Your project uses these MongoDB collections:

### 1. User Model (`server/models/User.js`)

```javascript
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: { type: String, enum: ["donor", "ngo", "admin"] },
  location: {
    lat: Number,
    lng: Number
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("User", userSchema);
```

**Collection**: `users`

---

### 2. Donation Model (`server/models/Donation.js`)

```javascript
const donationSchema = new mongoose.Schema({
  donor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  foodType: String,
  quantity: Number,
  expiryTime: Date,
  status: { type: String, default: "pending" },
  temperature: Number,
  ngoAssigned: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  location: {
    lat: Number,
    lng: Number
  },
  createdAt: { type: Date, default: Date.now }
});
```

**Collection**: `donations`

---

### 3. Tracking Model (`server/models/Tracking.js`)

```javascript
const trackingSchema = new mongoose.Schema({
  donation: { type: mongoose.Schema.Types.ObjectId, ref: "Donation", required: true },
  status: { 
    type: String, 
    enum: ["pending", "picked_up", "in_transit", "delivered"],
    default: "pending"
  },
  currentLocation: {
    lat: Number,
    lng: Number
  },
  temperature: Number,
  estimatedDelivery: Date,
  updates: [{
    status: String,
    timestamp: { type: Date, default: Date.now },
    location: {
      lat: Number,
      lng: Number
    },
    note: String
  }],
  createdAt: { type: Date, default: Date.now }
});
```

**Collection**: `trackings`

---

## 🚀 How to Connect MongoDB

### Option 1: Local MongoDB (Recommended for Development)

#### Step 1: Install MongoDB

**Windows**:
1. Download: https://www.mongodb.com/try/download/community
2. Run installer
3. Choose "Complete" installation
4. Install as Windows Service (recommended)

**Mac**:
```bash
brew tap mongodb/brew
brew install mongodb-community
```

**Linux**:
```bash
sudo apt-get install mongodb
```

#### Step 2: Start MongoDB

**Windows** (if installed as service):
- MongoDB starts automatically
- Or manually: `net start MongoDB`

**Mac/Linux**:
```bash
mongod
```

#### Step 3: Verify Connection

Your `.env` file already has:
```env
MONGO_URI=mongodb://localhost:27017/food-donation
```

This will connect to:
- Host: `localhost`
- Port: `27017` (default)
- Database: `food-donation`

#### Step 4: Restart Your Server

The backend will automatically connect when you start it:
```bash
npm run server
```

Look for:
```
✅ MongoDB Connected: localhost
```

---

### Option 2: MongoDB Atlas (Cloud - Free)

#### Step 1: Create Account
1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Sign up for free account

#### Step 2: Create Cluster
1. Click "Build a Database"
2. Choose "Free" tier (M0)
3. Select region closest to you
4. Click "Create Cluster"

#### Step 3: Create Database User
1. Go to "Database Access"
2. Click "Add New Database User"
3. Choose username and password
4. Save credentials!

#### Step 4: Whitelist IP Address
1. Go to "Network Access"
2. Click "Add IP Address"
3. Choose "Allow Access from Anywhere" (for development)
4. Or add your specific IP

#### Step 5: Get Connection String
1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy the connection string
4. It looks like:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/food-donation
   ```

#### Step 6: Update .env File

Replace in your `.env`:
```env
MONGO_URI=mongodb+srv://your_username:your_password@cluster.mongodb.net/food-donation?retryWrites=true&w=majority
```

**Important**: Replace:
- `your_username` with your database username
- `your_password` with your database password

#### Step 7: Restart Server

```bash
npm run server
```

Look for:
```
✅ MongoDB Connected: cluster.mongodb.net
```

---

## 🔍 Verify Connection

### Method 1: Check Server Logs

When you run `npm run server`, you should see:

**Success**:
```
Server running on port 5000
✅ MongoDB Connected: localhost
```

**Failure**:
```
Server running on port 5000
❌ MongoDB Connection Error: connect ECONNREFUSED ::1:27017
⚠️  MongoDB is not running!
```

### Method 2: Test API Endpoint

Try registering a user:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123","role":"donor"}'
```

If MongoDB is connected, you'll get a user object back.

### Method 3: MongoDB Compass (GUI)

1. Download: https://www.mongodb.com/try/download/compass
2. Connect to: `mongodb://localhost:27017`
3. Look for `food-donation` database
4. Check collections: `users`, `donations`, `trackings`

---

## 📦 Dependencies

Your project uses:

```json
{
  "mongoose": "^7.6.3",  // MongoDB ODM
  "dotenv": "^16.3.1"    // Environment variables
}
```

**Mongoose**: Object Data Modeling (ODM) library
- Provides schema validation
- Simplifies MongoDB operations
- Handles connections and queries

---

## 🛠️ Connection String Format

### Local MongoDB
```
mongodb://localhost:27017/food-donation
```

**Parts**:
- `mongodb://` - Protocol
- `localhost` - Host
- `27017` - Port (default)
- `food-donation` - Database name

### MongoDB Atlas (Cloud)
```
mongodb+srv://username:password@cluster.mongodb.net/food-donation?retryWrites=true&w=majority
```

**Parts**:
- `mongodb+srv://` - Protocol (SRV record)
- `username:password` - Credentials
- `@cluster.mongodb.net` - Host
- `food-donation` - Database name
- `?retryWrites=true&w=majority` - Options

---

## 🔐 Security Best Practices

### 1. Environment Variables
✅ **Good**: Store in `.env` file
❌ **Bad**: Hardcode in source code

### 2. .gitignore
Make sure `.env` is in `.gitignore`:
```
.env
```

### 3. Production
For production, use:
- Strong passwords
- IP whitelisting
- MongoDB Atlas with authentication
- Environment-specific connection strings

---

## 🐛 Troubleshooting

### Error: "ECONNREFUSED ::1:27017"

**Problem**: MongoDB is not running

**Solution**:
```bash
# Windows
net start MongoDB

# Mac/Linux
mongod
```

### Error: "Authentication failed"

**Problem**: Wrong username/password in connection string

**Solution**: Check credentials in MongoDB Atlas

### Error: "Network timeout"

**Problem**: IP not whitelisted in MongoDB Atlas

**Solution**: Add your IP in Network Access

### Error: "Database not found"

**Problem**: Database doesn't exist yet

**Solution**: MongoDB creates it automatically on first write

---

## 📊 Current Status

**Your Configuration**:
- ✅ Connection code: Implemented
- ✅ Models: Defined (User, Donation, Tracking)
- ✅ Environment variables: Configured
- ⚠️ MongoDB: Needs to be started

**Next Step**: Start MongoDB!

---

## 🎯 Quick Start Checklist

- [ ] Install MongoDB locally OR create MongoDB Atlas account
- [ ] Start MongoDB service (if local)
- [ ] Update `.env` with connection string (if using Atlas)
- [ ] Run `npm run server`
- [ ] Look for "✅ MongoDB Connected" message
- [ ] Test by registering a user at http://localhost:3001/register

---

## 📞 Need Help?

Check these files:
- `START_HERE.md` - Quick start guide
- `TROUBLESHOOTING.md` - Common issues
- `CURRENT_STATUS.md` - Current state

**MongoDB is the only missing piece to make your app fully functional!** 🚀
