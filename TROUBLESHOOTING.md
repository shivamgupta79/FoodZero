# Troubleshooting Guide

## ✅ Fixed Issues

### 1. Module Not Found: Can't resolve '@/lib/axios'

**Problem**: Next.js couldn't resolve the `@/` path alias.

**Solution Applied**:
- ✅ Created `client/jsconfig.json` with path configuration
- ✅ Updated `client/next.config.js` with webpack alias
- ✅ Restarted the development server

**Files Modified**:
- `client/jsconfig.json` (created)
- `client/next.config.js` (updated)

### 2. Next.js Outdated Warning

**Problem**: Next.js 14.0.0 was outdated.

**Solution Applied**:
- ✅ Updated to Next.js 14.2.0 in `client/package.json`

**To Apply Update** (optional):
```bash
cd client
npm install next@latest
```

## Common Issues & Solutions

### Issue: MongoDB Connection Error

**Symptoms**:
```
Error: connect ECONNREFUSED ::1:27017
```

**Solution**:
1. Install MongoDB: https://www.mongodb.com/try/download/community
2. Start MongoDB:
   ```bash
   mongod
   ```
3. Backend will auto-reconnect

**Alternative**: Use MongoDB Atlas (cloud)
- Sign up: https://www.mongodb.com/cloud/atlas
- Update `.env` with connection string

### Issue: Port Already in Use

**Symptoms**:
```
Port 3000 is in use, trying 3001 instead
```

**Solution**: This is normal! Next.js automatically uses port 3001.
- Access app at: http://localhost:3001

**To Use Port 3000**:
1. Find what's using port 3000:
   ```bash
   netstat -ano | findstr :3000
   ```
2. Kill the process or use port 3001

### Issue: Module Not Found Errors

**Symptoms**:
```
Module not found: Can't resolve 'axios'
```

**Solution**:
```bash
cd client
npm install
```

### Issue: Backend Crashes on Start

**Symptoms**:
```
[nodemon] app crashed - waiting for file changes
```

**Solution**: Usually MongoDB connection issue. See "MongoDB Connection Error" above.

### Issue: Authentication Not Working

**Symptoms**:
- Login fails
- Token not saved

**Solution**:
1. Check if backend is running: http://localhost:5000
2. Check browser console for errors
3. Verify `.env` has correct JWT_SECRET
4. Clear localStorage:
   ```javascript
   localStorage.clear()
   ```

### Issue: Real-time Notifications Not Working

**Symptoms**:
- No notifications appearing
- Socket connection errors

**Solution**:
1. Verify backend Socket.io is running
2. Check `client/.env.local`:
   ```
   NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
   ```
3. Check browser console for Socket.io errors

### Issue: Google Maps Not Loading

**Symptoms**:
- Map component shows blank
- Console error about API key

**Solution**:
1. Get API key: https://console.cloud.google.com/
2. Enable Maps JavaScript API
3. Update `client/.env.local`:
   ```
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_actual_key
   ```

### Issue: Build Errors

**Symptoms**:
```
npm run build fails
```

**Solution**:
1. Clear Next.js cache:
   ```bash
   cd client
   rm -rf .next
   npm run build
   ```

2. Reinstall dependencies:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

## Development Tips

### Hot Reload Not Working

**Solution**:
1. Save the file again
2. Restart dev server:
   ```bash
   # Stop with Ctrl+C
   npm run dev
   ```

### Slow Compilation

**Solution**:
1. Reduce number of open files
2. Disable source maps in development (add to `next.config.js`):
   ```javascript
   productionBrowserSourceMaps: false
   ```

### Database Reset

**To Clear All Data**:
1. Connect to MongoDB:
   ```bash
   mongosh
   ```
2. Drop database:
   ```javascript
   use food-donation
   db.dropDatabase()
   ```

## Verification Checklist

Before reporting issues, verify:

- [ ] MongoDB is running
- [ ] Backend server is running (port 5000)
- [ ] Frontend server is running (port 3001)
- [ ] `.env` file exists in root
- [ ] `client/.env.local` file exists
- [ ] Dependencies installed (`npm install` in both root and client)
- [ ] No syntax errors (check terminal output)
- [ ] Browser console has no errors

## Getting Help

If issues persist:

1. Check terminal output for error messages
2. Check browser console (F12) for frontend errors
3. Review the error message carefully
4. Search for the error online
5. Check Next.js documentation: https://nextjs.org/docs

## Quick Commands Reference

```bash
# Install dependencies
npm install
cd client && npm install

# Start development
npm run dev                    # Both servers
npm run server                 # Backend only
npm run client                 # Frontend only

# Check MongoDB
mongod --version              # Check if installed
mongod                        # Start MongoDB

# Clear cache
cd client
rm -rf .next node_modules
npm install

# Check ports
netstat -ano | findstr :5000  # Backend
netstat -ano | findstr :3001  # Frontend
```

## Status Check

Run these to verify everything is working:

1. **Backend Health**:
   ```bash
   curl http://localhost:5000/api/auth/login
   ```
   Should return: `{"message":"User not found"}` (this is good!)

2. **Frontend Health**:
   Open: http://localhost:3001
   Should show: Login/Register page

3. **MongoDB Health**:
   ```bash
   mongosh
   show dbs
   ```
   Should list databases

## Current Status

✅ **Path Alias Issue**: FIXED
✅ **Next.js Config**: UPDATED
✅ **Frontend Server**: RUNNING on port 3001
✅ **Backend Server**: RUNNING on port 5000
⚠️ **MongoDB**: Needs to be started

**Next Step**: Start MongoDB to enable full functionality!
