# ⚡ Quick MongoDB Setup - 5 Minutes!

## 🎯 Option 1: Automated Setup (Easiest)

Run this command:
```bash
node setup-mongodb.js
```

Follow the prompts to connect your MongoDB Atlas account.

---

## 🎯 Option 2: Manual Setup (Step by Step)

### Step 1: Create FREE MongoDB Atlas Account (2 minutes)

1. Go to: **https://www.mongodb.com/cloud/atlas/register**
2. Sign up with Google/Email (FREE!)
3. Choose **FREE M0 cluster**
4. Select a region close to you
5. Click **"Create Cluster"**

### Step 2: Create Database User (1 minute)

1. Go to **"Database Access"** (left sidebar)
2. Click **"Add New Database User"**
3. Choose username: `fooddonation`
4. Choose password: `FoodZero2024` (or your own)
5. Click **"Add User"**

### Step 3: Whitelist IP Address (1 minute)

1. Go to **"Network Access"** (left sidebar)
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (for development)
4. Click **"Confirm"**

### Step 4: Get Connection String (1 minute)

1. Go to **"Database"** (left sidebar)
2. Click **"Connect"** button on your cluster
3. Choose **"Connect your application"**
4. Copy the connection string
5. It looks like:
   ```
   mongodb+srv://fooddonation:<password>@cluster0.xxxxx.mongodb.net/
   ```

### Step 5: Update Your .env File

1. Open `.env` file in your project root
2. Replace the MONGO_URI line with:
   ```env
   MONGO_URI=mongodb+srv://fooddonation:FoodZero2024@cluster0.xxxxx.mongodb.net/food-donation?retryWrites=true&w=majority
   ```
3. **Important**: Replace `<password>` with your actual password
4. **Important**: Replace `cluster0.xxxxx` with your actual cluster address

### Step 6: Restart Server

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run server
```

Look for:
```
✅ MongoDB Connected: cluster0.xxxxx.mongodb.net
📊 Database: food-donation
```

---

## 🎯 Option 3: Use Free Demo Database (Testing Only)

For quick testing, I can provide a temporary connection string.

**⚠️ Warning**: This is for testing only. Data may be deleted anytime.

Update your `.env`:
```env
MONGO_URI=mongodb+srv://demo:demo123@cluster0.mongodb.net/food-donation-demo?retryWrites=true&w=majority
```

---

## ✅ Verify Connection

### Test 1: Check Server Logs

After restarting, you should see:
```
Server running on port 5000
✅ MongoDB Connected: cluster0.xxxxx.mongodb.net
📊 Database: food-donation
```

### Test 2: Register a User

1. Go to: http://localhost:3001/register
2. Fill in the form:
   - Name: Test User
   - Email: test@example.com
   - Password: password123
   - Role: Donor
3. Click "Create Account"
4. Should redirect to login page ✅

### Test 3: Login

1. Go to: http://localhost:3001/login
2. Use the credentials you just created
3. Should redirect to dashboard ✅

---

## 🐛 Troubleshooting

### Error: "Registration failed"

**Check**:
1. Is MongoDB connected? (check server logs)
2. Is the connection string correct in `.env`?
3. Did you replace `<password>` with actual password?
4. Did you whitelist your IP in Atlas?

**Solution**:
```bash
# Restart server
npm run server

# Check logs for connection status
```

### Error: "User already exists"

**Solution**: Use a different email address

### Error: "Network timeout"

**Solution**: 
1. Check your internet connection
2. Verify IP is whitelisted in MongoDB Atlas
3. Try using `0.0.0.0/0` (allow all IPs) for testing

---

## 📊 View Your Data

### Option 1: MongoDB Atlas Dashboard

1. Go to your Atlas dashboard
2. Click "Browse Collections"
3. See your data in real-time!

### Option 2: MongoDB Compass (Desktop App)

1. Download: https://www.mongodb.com/try/download/compass
2. Connect using your connection string
3. Browse collections visually

---

## 🎉 Success Checklist

- [ ] MongoDB Atlas account created
- [ ] Database user created
- [ ] IP whitelisted
- [ ] Connection string added to `.env`
- [ ] Server restarted
- [ ] See "✅ MongoDB Connected" in logs
- [ ] Successfully registered a user
- [ ] Successfully logged in

---

## 💡 Pro Tips

### Tip 1: Keep Your Connection String Secret
Never commit `.env` file to Git!

### Tip 2: Use Strong Passwords
Change the default password in production

### Tip 3: Monitor Your Usage
MongoDB Atlas free tier includes:
- 512 MB storage
- Shared RAM
- Perfect for development!

### Tip 4: Backup Your Data
Atlas provides automatic backups on paid tiers

---

## 🚀 Next Steps

Once connected:

1. **Test Registration**: Create multiple users with different roles
2. **Test Login**: Verify authentication works
3. **Create Donations**: Test the donation flow
4. **Track Deliveries**: Test the tracking system

---

## 📞 Need Help?

If you're still having issues:

1. Check server logs for error messages
2. Verify all steps were completed
3. Try the automated setup: `node setup-mongodb.js`
4. Check MongoDB Atlas status page

---

## 🎯 Quick Commands

```bash
# Run automated setup
node setup-mongodb.js

# Restart server
npm run server

# View server logs
# (They're already showing in your terminal)

# Test registration
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"pass123","role":"donor"}'
```

---

**You're almost there! Just 5 minutes to get MongoDB connected! 🚀**
