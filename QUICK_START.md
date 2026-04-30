# 🚀 Quick Start Guide - Food Donation Platform

## Prerequisites Check ✓

Before starting, make sure you have:
- [ ] Node.js installed (v14 or higher)
- [ ] MongoDB installed and running
- [ ] Git (optional, for cloning)

## Step-by-Step Setup (5 minutes)

### 1. Install Dependencies (2 minutes)

**Windows Users:**
```bash
# Double-click this file or run in terminal:
start.bat
```

**Manual Installation:**
```bash
# Install root dependencies
npm install

# Install client dependencies
cd client
npm install
cd ..
```

### 2. Start MongoDB (30 seconds)

**Windows:**
```bash
# Open a new terminal and run:
mongod
```

**Mac/Linux:**
```bash
# Open a new terminal and run:
sudo mongod
```

**Verify MongoDB is running:**
- You should see "Waiting for connections on port 27017"

### 3. Configure Environment (1 minute)

The `.env` and `client/.env.local` files are already configured with default values. You're ready to go!

**Optional:** If you want Google Maps, add your API key to `client/.env.local`:
```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
```

### 4. Run the Application (30 seconds)

**Option 1: Easy Start (Windows)**
```bash
# Double-click this file or run:
run.bat
```

**Option 2: Manual Start**
```bash
# This starts both backend and frontend:
npm run dev
```

**Option 3: Separate Terminals**
```bash
# Terminal 1 - Backend:
npm run server

# Terminal 2 - Frontend:
cd client
npm run dev
```

### 5. Access the Application (10 seconds)

Open your browser and go to:
```
http://localhost:3000
```

## 🎯 First Time Usage

### Create Test Accounts

1. **Register as Donor**
   - Go to http://localhost:3000/register
   - Name: John Donor
   - Email: donor@test.com
   - Password: password123
   - Role: Donor
   - Click Register

2. **Register as NGO** (open in incognito/another browser)
   - Go to http://localhost:3000/register
   - Name: Hope NGO
   - Email: ngo@test.com
   - Password: password123
   - Role: NGO
   - Click Register

3. **Register as Admin** (optional)
   - Go to http://localhost:3000/register
   - Name: Admin User
   - Email: admin@test.com
   - Password: password123
   - Role: Admin
   - Click Register

### Test the Real-time Features

**Step 1: Create a Donation (as Donor)**
1. Login as donor@test.com
2. Click "Donate Food Now" button
3. Fill in the form:
   - Food Type: "Rice and Curry"
   - Quantity: "10 plates"
   - Click "Submit Donation"
4. You'll see a success message

**Step 2: Receive Notification (as NGO)**
1. In another browser/incognito, login as ngo@test.com
2. You should see a notification bell with a red badge
3. Click the bell to see: "New food donation available: Rice and Curry - X km away"
4. Go to "Available Donations" page
5. You'll see the donation with distance
6. Click "Accept Donation"

**Step 3: Get Update (as Donor)**
1. Switch back to donor browser
2. You should see a notification: "Your donation has been accepted by Hope NGO"
3. Go to "Track Donations" page
4. Click on your donation to see the tracking timeline

**Step 4: Update Status (as NGO)**
1. Switch to NGO browser
2. Go to "Available Donations" → "My Accepted" tab
3. Click "Mark as Picked Up"
4. Then "Mark In Transit"
5. Finally "Mark as Delivered"

**Step 5: See Updates (as Donor)**
1. Switch to donor browser
2. You'll receive notifications for each status change
3. The tracking timeline will update in real-time

## 🎉 You're All Set!

Your Food Donation Platform is now running with:
- ✅ Real-time notifications
- ✅ Distance calculation
- ✅ Complete donation flow
- ✅ All dashboards working
- ✅ Beautiful UI

## 🐛 Troubleshooting

### MongoDB Connection Error
**Problem:** "MongoNetworkError: connect ECONNREFUSED"
**Solution:**
```bash
# Make sure MongoDB is running:
mongod
```

### Port Already in Use
**Problem:** "Error: listen EADDRINUSE: address already in use :::5000"
**Solution:**
```bash
# Windows - Kill process on port 5000:
netstat -ano | findstr :5000
taskkill /PID <process_id> /F

# Or change PORT in .env file
```

### Dependencies Error
**Problem:** "Cannot find module..."
**Solution:**
```bash
# Reinstall dependencies:
npm install
cd client && npm install
```

### Frontend Not Loading
**Problem:** Blank page or errors
**Solution:**
```bash
# Clear Next.js cache:
cd client
rm -rf .next
npm run dev
```

## 📞 Need Help?

If you encounter any issues:
1. Check the console for error messages
2. Make sure MongoDB is running
3. Verify all dependencies are installed
4. Check that ports 3000 and 5000 are available
5. Review the TROUBLESHOOTING.md file

## 🎊 What's Next?

Now that everything is working:
1. Explore all the dashboards
2. Test the real-time notifications
3. Try the tracking features
4. Check out the admin panel
5. Customize the UI to your liking

**Enjoy your Food Donation Platform! 🍱**
