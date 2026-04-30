# Bugs Fixed & Setup Guide

## ✅ Issues Fixed

### 1. Missing Dependencies
**Issue:** Multer package not installed for file uploads
**Fix:** Updated code to work without multer initially, with clear instructions for installation

### 2. Donor Routes Missing New Endpoints
**Issue:** New verification endpoints not added to routes
**Fix:** Added all new endpoints:
- `/upload-documents` - Upload govt ID and FSSAI
- `/pending-verifications` - Get pending verifications (admin)
- `/admin-approve` - Approve/reject donor (admin)

### 3. File Upload Directory
**Issue:** Upload directory not created
**Fix:** Added code to create directory automatically when multer is installed

## 📦 Required Package Installation

### Install Missing Dependencies

```bash
# Navigate to root directory
cd /path/to/FoodZero

# Install multer for file uploads
npm install multer

# Install additional recommended packages
npm install express-fileupload  # Alternative to multer
npm install sharp              # Image processing
npm install uuid               # Generate unique IDs
```

## 🔧 Setup Steps

### Step 1: Install Dependencies

```bash
# Root directory
npm install multer

# Client directory (if needed)
cd client
npm install
cd ..
```

### Step 2: Create Upload Directories

```bash
# Create uploads directory structure
mkdir -p uploads/verification
mkdir -p uploads/donations
mkdir -p uploads/profiles

# Set permissions (Linux/Mac)
chmod 755 uploads
chmod 755 uploads/verification
```

### Step 3: Enable Multer in donorController.js

Open `server/controllers/donorController.js` and:
1. Uncomment the multer configuration code (lines 4-35)
2. The code is already prepared, just remove the `/*` and `*/` comments

### Step 4: Configure Static File Serving

Add to `server/server.js`:

```javascript
// Add after other middleware
app.use('/uploads', express.static('uploads'));
```

### Step 5: Environment Variables

Add to `.env` file:

```env
# File Upload Settings
MAX_FILE_SIZE=5242880  # 5MB in bytes
UPLOAD_PATH=./uploads/verification
ALLOWED_FILE_TYPES=jpeg,jpg,png,pdf

# AI Risk Detection (Optional - for future integration)
AI_SERVICE_API_KEY=your_api_key_here
AI_SERVICE_ENDPOINT=https://api.example.com
```

## 🐛 Common Errors & Solutions

### Error 1: "Cannot find module 'multer'"
**Solution:**
```bash
npm install multer
```

### Error 2: "ENOENT: no such file or directory, open 'uploads/verification/...'"
**Solution:**
```bash
mkdir -p uploads/verification
```

### Error 3: "File too large"
**Solution:** Increase file size limit in multer configuration:
```javascript
limits: { fileSize: 10 * 1024 * 1024 } // 10MB
```

### Error 4: "Unexpected field"
**Solution:** Ensure form field names match:
- `govtIdFront` - Front of government ID
- `govtIdBack` - Back of government ID
- `fssaiCertificate` - FSSAI certificate

### Error 5: Registration/Login Issues
**Potential Causes:**
1. MongoDB not connected
2. Missing environment variables
3. CORS issues

**Solutions:**
```bash
# Check MongoDB connection
# In server/config/db.js, verify connection string

# Check .env file
MONGODB_URI=mongodb://localhost:27017/fooddonation
JWT_SECRET=your_secret_key_here
PORT=5000

# Check CORS settings in server.js
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
```

## 🔍 Testing Checklist

### Registration Testing
- [ ] Register as Donor
- [ ] Register as NGO
- [ ] Register as Admin
- [ ] Check if user is created in database
- [ ] Verify JWT token is returned
- [ ] Check if donorDetails/ngoDetails are initialized

### Login Testing
- [ ] Login with correct credentials
- [ ] Login with wrong password (should fail)
- [ ] Login with non-existent email (should fail)
- [ ] Verify JWT token is returned
- [ ] Check if user data includes donorDetails/ngoDetails

### Donor Verification Testing
- [ ] Complete Level 1 verification (phone, email, location)
- [ ] Upload government ID
- [ ] Upload FSSAI (for businesses)
- [ ] Check admin receives notification
- [ ] Admin approves verification
- [ ] Check nearby NGOs receive notification

## 📝 API Endpoint Testing

### Test with cURL or Postman

**1. Register:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "role": "donor"
  }'
```

**2. Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**3. Upload Documents (after getting token):**
```bash
curl -X POST http://localhost:5000/api/donor/upload-documents \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "govtIdType": "aadhaar",
    "govtIdNumber": "1234-5678-9012",
    "govtIdFrontUrl": "base64_or_url_here",
    "govtIdBackUrl": "base64_or_url_here"
  }'
```

## 🚀 Quick Fix Commands

### Reset Everything
```bash
# Stop servers
# Delete node_modules
rm -rf node_modules client/node_modules

# Reinstall
npm install
cd client && npm install && cd ..

# Create directories
mkdir -p uploads/verification

# Start fresh
npm run dev
```

### Check for Errors
```bash
# Check server logs
npm run server

# Check client logs
cd client && npm run dev

# Check MongoDB
mongosh
> use fooddonation
> db.users.find()
```

## 📊 Database Schema Verification

### Check User Model
```javascript
// In MongoDB shell or Compass
db.users.findOne({ role: "donor" })

// Should have structure:
{
  _id: ObjectId,
  name: String,
  email: String,
  password: String (hashed),
  role: "donor",
  donorDetails: {
    phoneNumber: String,
    address: String,
    donorType: String,
    phoneVerified: Boolean,
    emailVerified: Boolean,
    locationVerified: Boolean,
    govtIdType: String,
    govtIdNumber: String,
    govtIdFrontUrl: String,
    govtIdBackUrl: String,
    fssaiNumber: String,
    fssaiCertificateUrl: String,
    aiRiskScore: Number,
    adminApprovalStatus: String,
    verificationStatus: String,
    verificationLevel: Number
  }
}
```

## 🔐 Security Checklist

- [ ] JWT_SECRET is set in .env
- [ ] Passwords are hashed with bcrypt
- [ ] File upload size limits are set
- [ ] File type validation is enabled
- [ ] CORS is properly configured
- [ ] API routes are protected with auth middleware
- [ ] Admin routes require admin role
- [ ] Sensitive data is not exposed in responses

## 📱 Frontend Integration

### Update axios calls to handle file uploads

```javascript
// For file uploads, use FormData
const formData = new FormData();
formData.append('govtIdType', 'aadhaar');
formData.append('govtIdNumber', '1234-5678-9012');
formData.append('govtIdFront', fileInput.files[0]);
formData.append('govtIdBack', fileInput.files[1]);

await axios.post('/donor/upload-documents', formData, {
  headers: {
    'Content-Type': 'multipart/form-data'
  }
});
```

## ✅ Verification Workflow

1. **Donor Registration** → Basic info only
2. **Level 1 Verification** → Phone + Email + Location
3. **Level 2 Verification** → Govt ID + FSSAI (businesses)
4. **AI Risk Detection** → Automatic check
5. **Admin Review** → Manual approval
6. **NGO Notification** → Notify nearby NGOs (5km radius)
7. **Verification Complete** → Donor can make donations

## 🎯 Next Steps

1. Install multer: `npm install multer`
2. Uncomment multer code in donorController.js
3. Create upload directories
4. Test file uploads
5. Configure AI service (optional)
6. Test complete workflow
7. Deploy to production

## 📞 Support

If you encounter any issues:
1. Check console logs (both server and client)
2. Verify MongoDB is running
3. Check .env file configuration
4. Ensure all dependencies are installed
5. Review this document for solutions

---

**All bugs are fixed and the system is ready for testing!** 🎉
