# Donor Verification - Quick Start Guide

## What's New? 🎉

Donors can now verify their accounts with a 3-step process:
1. **📱 Phone OTP Verification**
2. **📧 Email Verification**
3. **📍 Location Permission**

Plus, donors can now specify their type:
- 🏠 Household
- 🍽️ Restaurant
- 🏪 Store/Grocery
- 🏨 Hotel

## How to Test (Development Mode)

### Step 1: Register as Donor
1. Go to `/register`
2. Fill in: Name, Email, Password
3. Select role: **Donor**
4. Click "Create Account"

### Step 2: Login
1. Go to `/login`
2. Enter your credentials
3. You'll be redirected to donor dashboard

### Step 3: Start Verification
1. On dashboard, you'll see a blue verification banner
2. Click **"Start Verification"** button
3. Fill in the form:
   - Phone: `+91 1234567890` (or any number)
   - Address: Your full address
   - Donor Type: Choose from dropdown
4. Click **"Save & Continue"**
5. Allow location permission when browser asks

### Step 4: Verify Phone
1. Click **"Send OTP"**
2. You'll see: "OTP sent successfully (Dev OTP: 123456)"
3. Enter OTP: `123456`
4. Click **"Verify Phone"**
5. ✅ Phone verified!

### Step 5: Verify Email
1. Click **"Send Verification Email"**
2. Copy the dev token from success message
3. Paste it in the input field
4. Click **"Verify"**
5. ✅ Email verified!

### Step 6: Verify Location
1. Click **"Allow Location Access"**
2. Browser will ask for permission
3. Click "Allow"
4. ✅ Location verified!

### Step 7: Complete! 🎊
- All three checkmarks turn green
- Verification banner shows "verified" status
- You're now a verified donor!

## API Endpoints (For Testing)

### Base URL: `http://localhost:5000/api/donor`

All endpoints require Bearer token (get from login response).

```bash
# 1. Update Details
POST /update-details
{
  "phoneNumber": "+91 1234567890",
  "address": "123 Main St",
  "donorType": "household",
  "location": { "lat": 19.0760, "lng": 72.8777 }
}

# 2. Send Phone OTP
POST /send-phone-otp
{ "phoneNumber": "+91 1234567890" }

# 3. Verify Phone (Use OTP: 123456)
POST /verify-phone
{ "phoneNumber": "+91 1234567890", "otp": "123456" }

# 4. Send Email Verification
POST /send-email-verification

# 5. Verify Email
POST /verify-email
{ "token": "paste_token_here" }

# 6. Verify Location
POST /verify-location
{ "lat": 19.0760, "lng": 72.8777 }
```

## Development Credentials

**OTP (Phone):** Always use `123456`

**Email Token:** Displayed in success message after sending verification email

## Troubleshooting

**Location permission denied?**
- Check browser settings
- Enable location for localhost
- Try different browser

**OTP not working?**
- Use: `123456` (hardcoded for dev)
- Check console for errors

**Email verification failing?**
- Copy the full token from success message
- Make sure no extra spaces
- Token is case-sensitive

## What Happens After Verification?

- ✅ Verification status changes to "verified"
- ✅ Verification level set to 1 (Basic)
- ✅ All donor features unlocked
- ✅ Can make donations without restrictions
- ✅ NGOs can see verified badge (future feature)

## Files to Check

**Frontend:**
- `client/app/donor/dashboard/page.jsx` - Verification UI

**Backend:**
- `server/controllers/donorController.js` - Verification logic
- `server/routes/donorRoutes.js` - API routes
- `server/models/User.js` - Database schema

## Production Integration

To use in production, integrate:
1. **SMS Service:** Twilio, Firebase, or AWS SNS
2. **Email Service:** SendGrid, AWS SES, or Mailgun

See `DONOR_VERIFICATION_SYSTEM.md` for detailed integration guide.

## Quick Test Script

```bash
# 1. Start server
cd server
npm start

# 2. Start client (new terminal)
cd client
npm run dev

# 3. Open browser
http://localhost:3000/register

# 4. Register → Login → Verify!
```

That's it! You now have a fully functional donor verification system! 🚀
