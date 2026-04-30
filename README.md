# FoodZero

A real-time food waste reduction platform connecting donors with NGOs.

## Features

- User authentication (Donor, NGO, Admin roles)
- Real-time donation tracking with Socket.io
- Google Maps integration for location tracking
- Temperature monitoring for food safety
- Admin dashboard with statistics
- Real-time notifications

## Tech Stack

**Backend:**
- Node.js + Express
- MongoDB + Mongoose
- Socket.io for real-time updates
- JWT authentication
- bcryptjs for password hashing

**Frontend:**
- Next.js 14
- React 18
- Tailwind CSS
- Axios
- Google Maps API

## Installation

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (running locally or connection string)
- Google Maps API key (optional, for maps)

### Setup

1. Install root dependencies:
```bash
npm install
```

2. Install client dependencies:
```bash
cd client
npm install
cd ..
```

3. Configure environment variables:

Create `.env` in root:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/food-donation
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
```

Create `client/.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

4. Start MongoDB:
```bash
mongod
```

5. Run the application:

**Option 1: Run both servers concurrently**
```bash
npm run dev
```

**Option 2: Run separately**

Terminal 1 (Backend):
```bash
npm run server
```

Terminal 2 (Frontend):
```bash
npm run client
```

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login user

### Donations
- POST `/api/donations/create` - Create donation (protected)
- GET `/api/donations/all` - Get all donations
- GET `/api/donations/:id` - Get donation by ID
- PUT `/api/donations/:id` - Update donation status (protected)

### NGO
- GET `/api/ngo/donations` - Get available donations (NGO only)
- PUT `/api/ngo/accept/:id` - Accept donation (NGO only)
- POST `/api/ngo/tracking` - Update tracking info (NGO only)

### Admin
- GET `/api/admin/users` - Get all users (Admin only)
- GET `/api/admin/stats` - Get dashboard statistics (Admin only)
- DELETE `/api/admin/users/:id` - Delete user (Admin only)

## User Roles

1. **Donor**: Can create donations and track their status
2. **NGO**: Can view available donations, accept them, and update tracking
3. **Admin**: Can manage users and view all system statistics

## Project Structure

```
├── server/
│   ├── config/         # Database configuration
│   ├── controllers/    # Route controllers
│   ├── middleware/     # Auth middleware
│   ├── models/         # Mongoose models
│   ├── routes/         # API routes
│   ├── server.js       # Express server
│   └── socket.js       # Socket.io configuration
├── client/
│   ├── app/            # Next.js pages
│   ├── components/     # React components
│   ├── lib/            # Utilities (axios config)
│   └── styles/         # CSS files
└── package.json        # Root dependencies
```

## Development Notes

- Backend runs on port 5000
- Frontend runs on port 3000
- MongoDB default port 27017
- Socket.io enabled for real-time updates

## License

MIT
