# Quick Reference Card

## 🚀 Start Application

```bash
# Terminal 1 - Backend
cd server
npm start

# Terminal 2 - Frontend  
cd client
npm run dev

# Browser
http://localhost:3000
```

## 🧪 Test Credentials

**Development OTP:** `123456`
**Email Token:** Copy from success message
**Location:** Allow browser permission

## 📍 Key URLs

- Registration: `http://localhost:3000/register`
- Login: `http://localhost:3000/login`
- Donor Dashboard: `http://localhost:3000/donor/dashboard`
- NGO Dashboard: `http://localhost:3000/ngo/dashboard`
- Admin Dashboard: `http://localhost:3000/admin/dashboard`

## 🔌 API Endpoints

### Donor Verification
```
PUT  /api/donor/update-details
POST /api/donor/send-phone-otp
POST /api/donor/verify-phone
POST /api/donor/send-email-verification
POST /api/donor/verify-email
POST /api/donor/verify-location
```

### NGO Verification
```
PUT /api/ngo/update-details
```

## 🎯 Quick Test Steps

### Donor Verification (2 min)
1. Register as Donor
2. Login → Dashboard
3. Click "Start Verification"
4. Fill form → Allow location
5. OTP: `123456` → Verify
6. Copy email token → Verify
7. Allow location → Done! ✅

### NGO Verification (1 min)
1. Register as NGO
2. Login → Dashboard
3. Click "Submit Details"
4. Fill form → Submit
5. Wait for admin approval

## 🏷️ Donor Types

- 🏠 Household
- 🍽️ Restaurant
- 🏪 Store/Grocery
- 🏨 Hotel

## 📊 Verification Status

- ❌ Unverified (Level 0)
- 🟡 Partial (Level 0)
- ✅ Verified (Level 1)

## 📚 Documentation Files

1. `IMPLEMENTATION_COMPLETE_FINAL.md` - Complete summary
2. `DONOR_VERIFICATION_SYSTEM.md` - Technical docs
3. `DONOR_VERIFICATION_QUICK_START.md` - Quick guide
4. `DONOR_VERIFICATION_VISUAL_GUIDE.md` - Visual flows
5. `NGO_VERIFICATION_MOVED.md` - NGO changes
6. `CHANGES_SUMMARY.md` - All changes

## 🐛 Troubleshooting

**Location not working?**
- Enable location in browser settings
- Use HTTPS in production

**OTP not working?**
- Use: `123456` (dev mode)
- Check console for errors

**Email verification failing?**
- Copy full token (no spaces)
- Token is case-sensitive

## 📞 Quick Commands

```bash
# Check server status
curl http://localhost:5000/api/auth/

# Test donor endpoint
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/donor/send-phone-otp

# View logs
# Check terminal running server
```

## ✅ Verification Checklist

- [ ] Phone verified
- [ ] Email verified
- [ ] Location verified
- [ ] All green checkmarks
- [ ] Status: "verified"
- [ ] Level: 1

## 🎨 Status Colors

- Red/Gray: Unverified
- Yellow: Partial
- Green: Verified

---

**Need Help?** Check documentation files or console logs!
