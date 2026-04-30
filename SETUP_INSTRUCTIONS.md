# Setup Instructions

## Prerequisites Installation

### 1. Install MongoDB

**Option A: MongoDB Community Server (Recommended)**
1. Download from: https://www.mongodb.com/try/download/community
2. Run the installer
3. Choose "Complete" installation
4. Install MongoDB as a Service (check the box)
5. Install MongoDB Compass (optional GUI tool)

**Option B: MongoDB Atlas (Cloud - Free)**
1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Create a free account
3. Create a cluster
4. Get your connection string
5. Update `.env` file with your connection string:
   ```
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/food-donation
   ```

### 2. Verify MongoDB Installation

Open a new terminal and run:
```bash
mongod --version
```

If installed correctly, you should see the MongoDB version.

### 3. Start MongoDB (if installed locally)

```bash
mongod
```

Keep this terminal open while running the application.

## Running the Application

### Option 1: Run Both Servers Together (Recommended)

```bash
npm run dev
```

This will start:
- Backend server on http://localhost:5000
- Frontend server on http://localhost:3000

### Option 2: Run Servers Separately

**Terminal 1 - Backend:**
```bash
npm run server
```

**Terminal 2 - Frontend:**
```bash
npm run client
```

## Access the Application

1. Open your browser and go to: http://localhost:3000
2. Register a new account (choose role: donor, ngo, or admin)
3. Login with your credentials
4. Start using the platform!

## Troubleshooting

### MongoDB Connection Error
- Make sure MongoDB is running
- Check if the connection string in `.env` is correct
- For Windows, MongoDB service might need to be started manually

### Port Already in Use
- Backend (5000): Change PORT in `.env`
- Frontend (3000): Next.js will automatically suggest port 3001

### Module Not Found Errors
- Run `npm install` in root directory
- Run `npm install` in client directory

## Optional: Google Maps Setup

To enable map features:
1. Get a Google Maps API key from: https://console.cloud.google.com/
2. Enable Maps JavaScript API
3. Update `client/.env.local`:
   ```
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
   ```

## Default Test Users

After starting the app, register users with these roles:
- Donor: Can create food donations
- NGO: Can accept and track donations
- Admin: Can manage users and view statistics
