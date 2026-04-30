# Donor Verification - Visual Flow Guide

## 🎯 Complete Verification Journey

```
┌─────────────────────────────────────────────────────────────┐
│                    DONOR REGISTRATION                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Name: John Doe                                       │  │
│  │  Email: john@example.com                              │  │
│  │  Password: ••••••••                                   │  │
│  │  Role: 🤲 Donor                                       │  │
│  │                                                        │  │
│  │  [Create Account] ────────────────────────────────►   │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    LOGIN & DASHBOARD                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Welcome back, John! 👋                               │  │
│  │                                                        │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │  ✅ Donor Verification - Level 1 (Basic)       │  │  │
│  │  │  Complete verification to unlock full features  │  │  │
│  │  │                                                  │  │  │
│  │  │  📱 Phone Verification    ❌ Pending            │  │  │
│  │  │  📧 Email Verification    ❌ Pending            │  │  │
│  │  │  📍 Location Permission   ❌ Pending            │  │  │
│  │  │                                                  │  │  │
│  │  │  [Start Verification] ──────────────────────►   │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              STEP 1: BASIC INFORMATION                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Phone Number: +91 1234567890                         │  │
│  │                                                        │  │
│  │  Full Address: 123 Main Street, Mumbai               │  │
│  │                                                        │  │
│  │  I am donating from:                                  │  │
│  │  ┌────────────────────────────────────────┐          │  │
│  │  │ 🏠 Household                            │          │  │
│  │  │ 🍽️ Restaurant                          │          │  │
│  │  │ 🏪 Store/Grocery                       │          │  │
│  │  │ 🏨 Hotel                               │          │  │
│  │  └────────────────────────────────────────┘          │  │
│  │                                                        │  │
│  │  📍 Location Permission: We'll request your location  │  │
│  │                                                        │  │
│  │  [Save & Continue] ────────────────────────────────►  │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
                  [Browser Location Popup]
                  Allow "FoodZero" to access
                  your location?
                  [Block] [Allow] ◄─── Click Allow
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              STEP 2: PHONE VERIFICATION                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Phone: +91 1234567890 ✓                              │  │
│  │                                                        │  │
│  │  [Send OTP] ──────────────────────────────────────►   │  │
│  │                                                        │  │
│  │  ✅ OTP sent successfully (Dev OTP: 123456)          │  │
│  │                                                        │  │
│  │  Enter OTP: [1][2][3][4][5][6]                       │  │
│  │                                                        │  │
│  │  [Verify Phone] ──────────────────────────────────►   │  │
│  │                                                        │  │
│  │  ✅ Phone number verified successfully!              │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              STEP 3: EMAIL VERIFICATION                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Email: john@example.com ✓                            │  │
│  │                                                        │  │
│  │  [Send Verification Email] ───────────────────────►   │  │
│  │                                                        │  │
│  │  ✅ Verification email sent successfully              │  │
│  │  (Dev Token: abc123xyz456...)                         │  │
│  │                                                        │  │
│  │  Or enter verification token manually:                │  │
│  │  [abc123xyz456...] [Verify] ──────────────────────►   │  │
│  │                                                        │  │
│  │  ✅ Email verified successfully!                      │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              STEP 4: LOCATION VERIFICATION                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  📍 Why we need location:                             │  │
│  │  • Accurate pickup coordinates for NGOs               │  │
│  │  • Calculate distance to nearby NGOs                  │  │
│  │  • Ensure food reaches the right location            │  │
│  │                                                        │  │
│  │  [📍 Allow Location Access] ──────────────────────►   │  │
│  │                                                        │  │
│  │  ✅ Location verified successfully!                   │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  ✅ VERIFICATION COMPLETE!                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  🎉 All verifications complete!                       │  │
│  │  You're now a verified donor.                         │  │
│  │                                                        │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │  ✅ Donor Verification - Level 1 (Basic)       │  │  │
│  │  │  Status: VERIFIED                               │  │  │
│  │  │                                                  │  │  │
│  │  │  📱 Phone Verification    ✅ Verified           │  │  │
│  │  │  📧 Email Verification    ✅ Verified           │  │  │
│  │  │  📍 Location Permission   ✅ Verified           │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  │                                                        │  │
│  │  [➕ Donate Food Now] ────────────────────────────►   │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## 📊 Verification Status Indicators

### Unverified State
```
┌─────────────────────────────────────┐
│  📱 Phone Verification    ❌ Pending │
│  📧 Email Verification    ❌ Pending │
│  📍 Location Permission   ❌ Pending │
└─────────────────────────────────────┘
Status: unverified (Level 0)
```

### Partial Verification
```
┌─────────────────────────────────────┐
│  📱 Phone Verification    ✅ Verified│
│  📧 Email Verification    ✅ Verified│
│  📍 Location Permission   ❌ Pending │
└─────────────────────────────────────┘
Status: partial (Level 0)
```

### Fully Verified
```
┌─────────────────────────────────────┐
│  📱 Phone Verification    ✅ Verified│
│  📧 Email Verification    ✅ Verified│
│  📍 Location Permission   ✅ Verified│
└─────────────────────────────────────┘
Status: verified (Level 1)
```

## 🏷️ Donor Types

```
┌──────────────────────────────────────────────────────┐
│  Select Your Donor Type:                             │
│                                                       │
│  🏠 Household                                         │
│     Individual or family donors                      │
│     Typical: Leftover home-cooked food               │
│                                                       │
│  🍽️ Restaurant                                       │
│     Food service establishments                      │
│     Typical: Excess prepared meals                   │
│                                                       │
│  🏪 Store/Grocery                                    │
│     Retail stores and grocery shops                  │
│     Typical: Near-expiry packaged food               │
│                                                       │
│  🏨 Hotel                                            │
│     Hotels and hospitality businesses                │
│     Typical: Buffet leftovers, bulk food             │
└──────────────────────────────────────────────────────┘
```

## 🔄 API Flow Diagram

```
Client                          Server                      Database
  │                               │                            │
  │  1. PUT /donor/update-details │                            │
  ├──────────────────────────────►│                            │
  │                               │  Save details              │
  │                               ├───────────────────────────►│
  │                               │◄───────────────────────────┤
  │◄──────────────────────────────┤                            │
  │  Details saved ✓              │                            │
  │                               │                            │
  │  2. POST /donor/send-phone-otp│                            │
  ├──────────────────────────────►│                            │
  │                               │  Generate OTP              │
  │                               │  Send SMS (Twilio)         │
  │◄──────────────────────────────┤                            │
  │  OTP sent ✓                   │                            │
  │                               │                            │
  │  3. POST /donor/verify-phone  │                            │
  ├──────────────────────────────►│                            │
  │                               │  Verify OTP                │
  │                               │  Update phoneVerified      │
  │                               ├───────────────────────────►│
  │                               │◄───────────────────────────┤
  │◄──────────────────────────────┤                            │
  │  Phone verified ✓             │                            │
  │                               │                            │
  │  4. POST /donor/send-email-verification                    │
  ├──────────────────────────────►│                            │
  │                               │  Generate token            │
  │                               │  Send email (SendGrid)     │
  │◄──────────────────────────────┤                            │
  │  Email sent ✓                 │                            │
  │                               │                            │
  │  5. POST /donor/verify-email  │                            │
  ├──────────────────────────────►│                            │
  │                               │  Verify token              │
  │                               │  Update emailVerified      │
  │                               ├───────────────────────────►│
  │                               │◄───────────────────────────┤
  │◄──────────────────────────────┤                            │
  │  Email verified ✓             │                            │
  │                               │                            │
  │  6. POST /donor/verify-location                            │
  ├──────────────────────────────►│                            │
  │                               │  Save coordinates          │
  │                               │  Update locationVerified   │
  │                               │  Calculate verification    │
  │                               ├───────────────────────────►│
  │                               │◄───────────────────────────┤
  │◄──────────────────────────────┤                            │
  │  All verified ✓               │                            │
  │  Status: verified, Level: 1   │                            │
```

## 🎨 UI Color Coding

```
Unverified:  🔴 Red/Gray borders, white background
Partial:     🟡 Yellow borders, light yellow background
Verified:    🟢 Green borders, light green background
```

## 📱 Mobile Responsive View

```
┌─────────────────────┐
│  ✅ Verification    │
│  Level 1 (Basic)    │
│                     │
│  [Start] ──────►    │
│                     │
│  ┌─────────────┐   │
│  │ 📱 Phone    │   │
│  │ ❌ Pending  │   │
│  └─────────────┘   │
│                     │
│  ┌─────────────┐   │
│  │ 📧 Email    │   │
│  │ ❌ Pending  │   │
│  └─────────────┘   │
│                     │
│  ┌─────────────┐   │
│  │ 📍 Location │   │
│  │ ❌ Pending  │   │
│  └─────────────┘   │
└─────────────────────┘
```

## 🚀 Quick Test Path

```
1. Register → 2. Login → 3. Click "Start Verification"
                              ↓
4. Fill form → 5. Allow location → 6. Send OTP (123456)
                              ↓
7. Verify phone → 8. Send email → 9. Paste token
                              ↓
10. Verify email → 11. Allow location → 12. ✅ DONE!
```

## 💡 Tips

- **Phone OTP**: Always `123456` in development
- **Email Token**: Copy from success message
- **Location**: Must allow browser permission
- **Donor Type**: Choose based on your use case
- **Progress**: Saved automatically at each step

---

That's the complete visual journey! Follow the flow and you'll be verified in minutes! 🎉
