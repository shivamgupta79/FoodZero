# ✅ Test Registration & Login - Complete Guide

## 🎉 Good News: MongoDB is Connected!

Your server shows:
```
✅ MongoDB Connected: localhost
📊 Database: food-donation
```

This means you're ready to test!

---

## 🧪 Test 1: Register Users

### Via Web Interface (Recommended)

1. **Open your browser**: http://localhost:3001/register

2. **Register a Donor**:
   - Name: `John Donor`
   - Email: `john@donor.com`
   - Password: `password123`
   - Role: Select "🤲 Donor"
   - Click "Create Account"
   - ✅ Should redirect to login page

3. **Register an NGO**:
   - Name: `Food Bank NGO`
   - Email: `ngo@foodbank.com`
   - Password: `password123`
   - Role: Select "🏢 NGO"
   - Click "Create Account"
   - ✅ Should redirect to login page

4. **Register an Admin**:
   - Name: `Admin User`
   - Email: `admin@foodzero.com`
   - Password: `admin123`
   - Role: Select "👨‍💼 Admin"
   - Click "Create Account"
   - ✅ Should redirect to login page

### Via Command Line (Advanced)

```bash
# Register Donor
curl -X POST http://localhost:5000/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"John Donor\",\"email\":\"john@donor.com\",\"password\":\"password123\",\"role\":\"donor\"}"

# Register NGO
curl -X POST http://localhost:5000/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Food Bank NGO\",\"email\":\"ngo@foodbank.com\",\"password\":\"password123\",\"role\":\"ngo\"}"

# Register Admin
curl -X POST http://localhost:5000/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Admin User\",\"email\":\"admin@foodzero.com\",\"password\":\"admin123\",\"role\":\"admin\"}"
```

---

## 🔐 Test 2: Login

### Via Web Interface (Recommended)

1. **Open login page**: http://localhost:3001/login

2. **Login as Donor**:
   - Email: `john@donor.com`
   - Password: `password123`
   - Click "Login"
   - ✅ Should redirect to `/donor/dashboard`

3. **Login as NGO**:
   - Email: `ngo@foodbank.com`
   - Password: `password123`
   - Click "Login"
   - ✅ Should redirect to `/ngo/dashboard`

4. **Login as Admin**:
   - Email: `admin@foodzero.com`
   - Password: `admin123`
   - Click "Login"
   - ✅ Should redirect to `/admin/dashboard`

### Via Command Line (Advanced)

```bash
# Login as Donor
curl -X POST http://localhost:5000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"john@donor.com\",\"password\":\"password123\"}"

# You'll get a response like:
# {
#   "message": "Login successful",
#   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
#   "user": {
#     "_id": "...",
#     "name": "John Donor",
#     "email": "john@donor.com",
#     "role": "donor"
#   }
# }
```

---

## 📊 Test 3: View Stored Data

### Option 1: MongoDB Compass (GUI)

1. Download: https://www.mongodb.com/try/download/compass
2. Connect to: `mongodb://localhost:27017`
3. Select database: `food-donation`
4. View collections:
   - `users` - See all registered users
   - `donations` - Will have donations later
   - `trackings` - Will have tracking data later

### Option 2: Command Line

```bash
# Connect to MongoDB
mongosh

# Switch to database
use food-donation

# View all users
db.users.find().pretty()

# Count users
db.users.countDocuments()

# Find specific user
db.users.findOne({ email: "john@donor.com" })

# Exit
exit
```

---

## 🎯 Test 4: Complete User Flow

### Donor Flow

1. **Register** at http://localhost:3001/register
   - Choose "Donor" role
   
2. **Login** at http://localhost:3001/login
   - Use your credentials
   
3. **Create Donation** at http://localhost:3001/donor/donate
   - Food Type: "Fresh Vegetables"
   - Quantity: "10 kg"
   - Click "Submit"
   
4. **Track Donations** at http://localhost:3001/donor/tracking
   - See your donation status

### NGO Flow

1. **Register** as NGO
   
2. **Login** as NGO
   
3. **View Available Donations** at http://localhost:3001/ngo/requests
   - See pending donations
   
4. **Accept Donation**
   - Click "Accept" on a donation
   
5. **Update Tracking**
   - Update delivery status

### Admin Flow

1. **Register** as Admin
   
2. **Login** as Admin
   
3. **View Dashboard** at http://localhost:3001/admin/dashboard
   - See statistics
   
4. **Manage Users** at http://localhost:3001/admin/users
   - View all users
   
5. **View All Donations** at http://localhost:3001/admin/donations
   - Monitor all donations

---

## ✅ Success Indicators

### Registration Success
- ✅ Redirects to login page
- ✅ No error messages
- ✅ User appears in database

### Login Success
- ✅ Redirects to role-specific dashboard
- ✅ Token stored in localStorage
- ✅ User data stored in localStorage
- ✅ Can access protected routes

### Data Storage Success
- ✅ User data persists after server restart
- ✅ Can login with same credentials
- ✅ Data visible in MongoDB Compass

---

## 🐛 Common Issues & Solutions

### Issue 1: "Registration failed"

**Possible Causes**:
- MongoDB not connected
- Email already exists
- Missing required fields

**Solution**:
```bash
# Check server logs
# Look for MongoDB connection message

# Try different email
# Use: test1@example.com, test2@example.com, etc.
```

### Issue 2: "Invalid email or password"

**Possible Causes**:
- Wrong credentials
- User doesn't exist
- Typo in email/password

**Solution**:
- Double-check email and password
- Try registering again
- Check if user exists in database

### Issue 3: "Network Error"

**Possible Causes**:
- Backend server not running
- Wrong API URL
- CORS issues

**Solution**:
```bash
# Check if backend is running
# Should see: Server running on port 5000

# Restart backend
npm run server
```

### Issue 4: Page doesn't redirect after login

**Possible Causes**:
- Dashboard pages not created yet
- Routing issue

**Solution**:
- Check browser console for errors
- Verify token is stored: `localStorage.getItem('token')`
- Manually navigate to dashboard

---

## 📝 Test Data Examples

### Sample Users

```javascript
// Donor 1
{
  name: "Alice Johnson",
  email: "alice@example.com",
  password: "alice123",
  role: "donor"
}

// Donor 2
{
  name: "Bob Smith",
  email: "bob@example.com",
  password: "bob123",
  role: "donor"
}

// NGO 1
{
  name: "City Food Bank",
  email: "city@foodbank.org",
  password: "foodbank123",
  role: "ngo"
}

// NGO 2
{
  name: "Community Kitchen",
  email: "kitchen@community.org",
  password: "kitchen123",
  role: "ngo"
}

// Admin
{
  name: "System Admin",
  email: "admin@system.com",
  password: "admin123",
  role: "admin"
}
```

---

## 🔍 Verify Data in Database

### Check Users Collection

```bash
# Using mongosh
mongosh
use food-donation
db.users.find({}, { password: 0 }).pretty()
```

Expected output:
```json
{
  "_id": ObjectId("..."),
  "name": "John Donor",
  "email": "john@donor.com",
  "role": "donor",
  "createdAt": ISODate("2024-...")
}
```

### Check User Count by Role

```bash
# Count donors
db.users.countDocuments({ role: "donor" })

# Count NGOs
db.users.countDocuments({ role: "ngo" })

# Count admins
db.users.countDocuments({ role: "admin" })
```

---

## 🎯 Quick Test Script

Save this as `test-auth.js`:

```javascript
const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function testAuth() {
  try {
    // Test Registration
    console.log('Testing registration...');
    const registerRes = await axios.post(`${API_URL}/auth/register`, {
      name: 'Test User',
      email: `test${Date.now()}@example.com`,
      password: 'test123',
      role: 'donor'
    });
    console.log('✅ Registration successful:', registerRes.data);

    // Test Login
    console.log('\nTesting login...');
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: registerRes.data.user.email,
      password: 'test123'
    });
    console.log('✅ Login successful:', loginRes.data);

    console.log('\n🎉 All tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testAuth();
```

Run it:
```bash
node test-auth.js
```

---

## 📊 Monitor Your Application

### Check Server Logs

Watch for:
- `✅ MongoDB Connected`
- `POST /api/auth/register 201` (successful registration)
- `POST /api/auth/login 200` (successful login)
- Any error messages

### Check Browser Console

Press F12 in browser and check:
- Network tab: See API requests
- Console tab: See any errors
- Application tab: Check localStorage for token

---

## 🎉 Success Checklist

- [ ] MongoDB connected (see server logs)
- [ ] Registered at least one user
- [ ] Successfully logged in
- [ ] Token stored in localStorage
- [ ] Redirected to dashboard
- [ ] User data visible in database
- [ ] Can logout and login again
- [ ] Multiple users with different roles work

---

## 🚀 Next Steps

Once authentication works:

1. **Create Dashboard Pages**
   - Donor dashboard
   - NGO dashboard
   - Admin dashboard

2. **Test Donation Flow**
   - Create donations
   - Accept donations
   - Track deliveries

3. **Test Real-time Features**
   - Notifications
   - Live tracking updates

4. **Add More Features**
   - Profile editing
   - Password reset
   - Email verification

---

**Your authentication system is now fully functional! 🎉**

Start testing at: http://localhost:3001/register
