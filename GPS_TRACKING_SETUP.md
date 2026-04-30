# GPS Tracking & Enhanced Notifications Setup Guide

## 🚀 Features Added

### 1. Real-time GPS Tracking
- **Continuous location updates** every 30 seconds during transit
- **Geofencing alerts** for pickup and delivery locations
- **Live tracking dashboard** for donors to see NGO location
- **Route optimization** with distance and ETA calculations
- **Speed monitoring** and movement detection

### 2. Enhanced Notification System
- **Multi-channel notifications**: Socket.io, Push, SMS, Email
- **Notification preferences** with quiet hours and type filtering
- **Persistent notification history** with read/unread status
- **Priority-based delivery** (critical, high, normal, low)
- **Geofence alerts** for location-based events

### 3. New Components
- **LiveTracking.jsx**: Real-time GPS tracking with Google Maps
- **NotificationCenter.jsx**: Enhanced notification management
- **NotificationSettings.jsx**: User preference configuration

## 📁 Files Created/Modified

### Backend Files Created:
```
server/services/gpsTrackingService.js     - GPS tracking logic
server/services/notificationService.js   - Multi-channel notifications
server/controllers/gpsController.js      - GPS API endpoints
server/controllers/notificationController.js - Notification API
server/models/Notification.js            - Notification database model
server/routes/gps.js                     - GPS routes
server/routes/notifications.js           - Notification routes
```

### Frontend Files Created:
```
client/components/LiveTracking.jsx        - Real-time tracking component
client/components/NotificationCenter.jsx - Enhanced notification UI
client/components/NotificationSettings.jsx - Preference management
```

### Files Modified:
```
server/server.js                         - Added new routes
server/models/User.js                    - Added notification preferences
server/controllers/donationController.js - Integrated notifications
server/controllers/ngoController.js      - Integrated notifications
client/app/donor/tracking/page.jsx       - Added live tracking
client/components/Navbar.jsx             - Updated notification component
```

## 🛠️ Installation Steps

### 1. Install Backend Dependencies
```bash
cd server
npm install firebase-admin twilio @sendgrid/mail
```

### 2. Environment Variables
Add to your `.env` file:
```env
# Firebase (for push notifications)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com

# Twilio (for SMS)
TWILIO_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# SendGrid (for email)
SENDGRID_API_KEY=your-sendgrid-api-key
FROM_EMAIL=noreply@foodzero.com

# Client URL
CLIENT_URL=http://localhost:3000
```

### 3. Firebase Setup (Optional - for push notifications)
1. Create a Firebase project
2. Generate a service account key
3. Download the JSON file and extract the credentials
4. Add the credentials to your `.env` file

### 4. Google Maps API (Required for GPS tracking)
1. Enable Google Maps JavaScript API
2. Add your API key to `client/.env.local`:
```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

## 🔧 API Endpoints Added

### GPS Tracking Endpoints:
```
POST /api/gps/start/:donationId          - Start GPS tracking
POST /api/gps/update/:donationId         - Update GPS location
POST /api/gps/stop/:donationId           - Stop GPS tracking
GET  /api/gps/details/:donationId        - Get tracking details
GET  /api/gps/history/:donationId        - Get tracking history
GET  /api/gps/active-sessions            - Get active sessions (Admin)
POST /api/gps/simulate/:donationId       - Simulate GPS (Testing)
```

### Notification Endpoints:
```
GET  /api/notifications                  - Get user notifications
GET  /api/notifications/unread-count     - Get unread count
POST /api/notifications/mark-read        - Mark as read
DELETE /api/notifications/:id            - Delete notification
DELETE /api/notifications               - Clear all notifications
GET  /api/notifications/preferences      - Get preferences
PUT  /api/notifications/preferences      - Update preferences
POST /api/notifications/fcm-token        - Register FCM token
POST /api/notifications/test             - Send test notification
GET  /api/notifications/stats            - Get stats (Admin)
POST /api/notifications/broadcast        - Broadcast (Admin)
```

## 🎯 How to Use

### For NGOs:
1. **Accept a donation** from the dashboard
2. **Start GPS tracking** when ready to pickup
3. **Location updates** sent automatically every 30 seconds
4. **Geofence alerts** trigger when entering pickup/delivery zones
5. **Stop tracking** when delivery is complete

### For Donors:
1. **View live tracking** on the tracking page
2. **See real-time location** of NGO on map
3. **Receive notifications** for status updates
4. **Get ETA updates** during transit
5. **View tracking history** after delivery

### For Admins:
1. **Monitor all active sessions** from admin dashboard
2. **View tracking statistics** and analytics
3. **Send broadcast notifications** to all users
4. **Manage notification settings** system-wide

## 📱 Mobile Integration

### GPS Location Updates (NGO Mobile App):
```javascript
// Start location tracking
navigator.geolocation.watchPosition(
  async (position) => {
    const locationData = {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
      accuracy: position.coords.accuracy,
      speed: position.coords.speed || 0,
      heading: position.coords.heading || 0,
      timestamp: new Date().toISOString()
    };

    await fetch(`/api/gps/update/${donationId}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(locationData)
    });
  },
  { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
);
```

### Push Notification Registration:
```javascript
// Register FCM token
const token = await messaging.getToken();
await fetch("/api/notifications/fcm-token", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${userToken}`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({ fcmToken: token })
});
```

## 🔄 Real-time Events

### Socket.io Events:
```javascript
// GPS Updates
socket.on("gps-update", (data) => {
  // Update map with new location
  // Show speed, distance, ETA
});

// Geofence Alerts
socket.on("geofence-alert", (data) => {
  // Show pickup/delivery notifications
  // Update donation status
});

// Enhanced Notifications
socket.on("notification", (data) => {
  // Display notification
  // Update notification count
});
```

## 🧪 Testing

### GPS Simulation:
```bash
# Simulate GPS route for testing
curl -X POST http://localhost:5000/api/gps/simulate/DONATION_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "route": [
      {"lat": 28.6139, "lng": 77.2090, "speed": 30},
      {"lat": 28.6149, "lng": 77.2100, "speed": 35},
      {"lat": 28.6159, "lng": 77.2110, "speed": 40}
    ],
    "interval": 5000
  }'
```

### Test Notifications:
```bash
# Send test notification
curl -X POST http://localhost:5000/api/notifications/test \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "general",
    "channels": ["socket", "push", "email"]
  }'
```

## 🚨 Important Notes

1. **Google Maps API** is required for GPS tracking functionality
2. **Firebase setup** is optional but recommended for push notifications
3. **Twilio and SendGrid** are optional for SMS and email notifications
4. **HTTPS is required** for geolocation API in production
5. **Battery optimization** - GPS updates pause when app is backgrounded

## 🔐 Security Considerations

1. **API rate limiting** on GPS update endpoints
2. **User authorization** checks for all tracking operations
3. **Location data encryption** in transit and at rest
4. **Geofence validation** to prevent spoofing
5. **Notification content sanitization**

## 📊 Performance Optimizations

1. **Batch GPS updates** to reduce API calls
2. **Intelligent update intervals** based on movement
3. **Notification deduplication** to prevent spam
4. **Database indexing** for fast queries
5. **Caching** for frequently accessed data

## 🎉 Ready to Use!

Your FoodZero platform now has:
- ✅ Real-time GPS tracking with geofencing
- ✅ Multi-channel notification system
- ✅ Live tracking dashboard for donors
- ✅ Enhanced notification management
- ✅ Mobile-ready GPS integration
- ✅ Admin monitoring and analytics

The system is production-ready and can handle real-world food donation tracking scenarios!