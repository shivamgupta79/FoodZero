# 🚀 FoodZero Project - Startup Guide

## 📊 Current Status: READY TO RUN

### ✅ Dependencies Status
- **Root Dependencies**: ✅ Installed
- **Client Dependencies**: ✅ Installed (with React version warnings - safe to ignore)
- **Upload Directories**: ✅ Created

### 🗄️ Database Options

**Option 1: MongoDB Atlas (Recommended - Cloud)**
```
1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Create FREE M0 cluster
3. Get connection string
4. Update .env: MONGO_URI=your_atlas_connection_string
```

**Option 2: Local MongoDB**
```
1. Install MongoDB Community Server
2. Start MongoDB service
3. Keep current .env: MONGO_URI=mongodb://localhost:27017/foodzero
```

**Option 3: Run Without Database (Demo Mode)**
```
- Frontend will work
- Data won't persist
- Good for UI testing
```

### 🔧 Environment Configuration

**Backend (.env)** ✅ Configured
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/foodzero
JWT_SECRET=foodzero_super_secret_key_2024
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

**Frontend (client/.env.local)** ⚠️ Needs Google Maps API Key
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

### 🚀 How to Start

**Method 1: Using npm scripts**
```bash
npm run dev
```
This starts both backend (port 5000) and frontend (port 3000)

**Method 2: Using batch file**
```bash
run.bat
```

**Method 3: Separate terminals**
```bash
# Terminal 1 - Backend
npm run server

# Terminal 2 - Frontend  
npm run client
```

### 🌐 Access URLs
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **Socket.io**: http://localhost:5000

### 🧪 Test Accounts (After Registration)
```
Donor: donor@test.com
NGO: ngo@test.com  
Admin: admin@test.com
Password: password123
```

### 📱 Features Available
- ✅ User Registration/Login
- ✅ Role-based Dashboards (Donor/NGO/Admin)
- ✅ Food Donation Creation
- ✅ Smart Matching Algorithm
- ✅ Real-time Notifications
- ✅ Tracking System
- ✅ Verification System
- ✅ Impact Analytics
- ⚠️ Google Maps (needs API key)

### 🔍 Troubleshooting

**Port Already in Use:**
```bash
# Kill processes on ports
npx kill-port 3000
npx kill-port 5000
```

**MongoDB Connection Issues:**
- Server will start without DB
- Frontend works in demo mode
- Check MongoDB Atlas setup

**React Version Warnings:**
- Safe to ignore
- App will work normally

### 📊 Project Statistics
- **Total Files**: 100+
- **Lines of Code**: 5,000+
- **Components**: 15+
- **API Endpoints**: 25+
- **Database Models**: 5+

## 🎯 Ready to Launch!

Your FoodZero project is ready to run. Choose your database option and start the servers!