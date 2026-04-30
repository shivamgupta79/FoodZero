# FoodZero - Tech Stack Summary

## 🎯 System Overview
**FoodZero** - Real-time food waste reduction platform connecting donors with NGOs

---

## 📱 Frontend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 15.1.0 | React framework with SSR, file-based routing |
| **React** | 19.2.4 | UI component library for interactive interfaces |
| **Tailwind CSS** | 3.3.5 | Utility-first CSS framework for styling |
| **Axios** | 1.7.0 | HTTP client for API requests |
| **Socket.io Client** | 4.8.0 | Real-time bidirectional communication |
| **Google Maps API** | 2.20.8 | Location tracking and mapping features |
| **Lucide React** | 0.575.0 | Modern icon library |

---

## 🔧 Backend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | Latest | JavaScript runtime environment |
| **Express** | 4.21.2 | Web application framework |
| **MongoDB** | Latest | NoSQL database for data storage |
| **Mongoose** | 8.9.5 | MongoDB ODM for schema modeling |
| **Socket.io** | 4.8.3 | WebSocket server for real-time features |
| **JWT** | 9.0.2 | Token-based authentication |
| **bcryptjs** | 2.4.3 | Password hashing and encryption |
| **Multer** | 1.4.5 | File upload handling middleware |
| **CORS** | 2.8.5 | Cross-origin resource sharing |
| **dotenv** | 16.4.7 | Environment variable management |

---

## 🛠️ Development Tools

| Tool | Version | Purpose |
|------|---------|---------|
| **Nodemon** | 3.1.14 | Auto-restart server on file changes |
| **Concurrently** | 9.1.0 | Run multiple npm scripts simultaneously |
| **PostCSS** | 8.4.31 | CSS processing and transformation |
| **Autoprefixer** | 10.4.16 | Add vendor prefixes to CSS |

---

## 🏗️ Architecture Pattern

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT (Port 3000)                    │
│  Next.js + React + Tailwind + Socket.io Client          │
└─────────────────┬───────────────────────────────────────┘
                  │
                  │ HTTP/HTTPS (REST API)
                  │ WebSocket (Real-time)
                  │
┌─────────────────▼───────────────────────────────────────┐
│                    SERVER (Port 5000)                    │
│  Node.js + Express + Socket.io Server                   │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Middleware: CORS, JWT Auth, Multer              │   │
│  └──────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Routes: Auth, Donations, NGO, Donor, Admin     │   │
│  └──────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Controllers: Business Logic                     │   │
│  └──────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Models: User, Donation, Tracking (Mongoose)     │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────┬───────────────────────────────────────┘
                  │
                  │ MongoDB Protocol
                  │
┌─────────────────▼───────────────────────────────────────┐
│              DATABASE (Port 27017)                       │
│  MongoDB - NoSQL Document Database                       │
│  Collections: users, donations, trackings               │
└─────────────────────────────────────────────────────────┘
```

---

## 🔐 Security Stack

| Feature | Technology | Implementation |
|---------|------------|----------------|
| **Authentication** | JWT | Token-based stateless auth |
| **Password Security** | bcryptjs | Hashing with salt rounds |
| **Authorization** | Middleware | Role-based access control (RBAC) |
| **API Security** | CORS | Restricted origins |
| **File Upload** | Multer | Size limits and type validation |
| **Environment** | dotenv | Secret management |

---

## 📊 Database Schema

### Collections:
1. **Users** - Donor, NGO, Admin profiles with verification data
2. **Donations** - Food donation records with status tracking
3. **Trackings** - Real-time location and delivery tracking

### Key Features:
- Schema validation with Mongoose
- Indexed fields for fast queries
- Embedded documents for related data
- References for relationships

---

## 🌐 External APIs & Services

| Service | Purpose | Configuration |
|---------|---------|---------------|
| **Google Maps API** | Location tracking, geocoding, distance calculation | `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` |
| **MongoDB Atlas** | Cloud database hosting (optional) | `MONGO_URI` |

---

## 🚀 Real-Time Features (Socket.io)

### Event System:
```javascript
// Client → Server Events
- join                  // User joins role-based rooms
- new-donation         // Donor creates donation
- ngo-request          // NGO requests food
- donation-accepted    // NGO accepts donation
- status-update        // Update donation status
- tracking-update      // Location updates

// Server → Client Events
- donation-available   // Notify NGOs of new donations
- ngo-needs-food      // Notify donors of NGO requests
- donation-update     // Status change notifications
- tracking-updated    // Real-time tracking updates
- notification        // General notifications
```

### Room Structure:
- **User Rooms**: `userId` - Personal notifications
- **Role Rooms**: `donor`, `ngo`, `admin` - Broadcast to role groups
- **Global**: All connected clients

---

## 📁 Project Structure

```
foodzero/
├── client/                 # Frontend (Next.js)
│   ├── app/               # Pages (App Router)
│   │   ├── admin/        # Admin dashboard
│   │   ├── donor/        # Donor dashboard
│   │   ├── ngo/          # NGO dashboard
│   │   └── login/        # Auth pages
│   ├── components/        # Reusable components
│   ├── lib/              # Utilities (axios, utils)
│   └── public/           # Static assets
│
├── server/                # Backend (Node.js)
│   ├── config/           # Database config
│   ├── controllers/      # Business logic
│   ├── middleware/       # Auth, validation
│   ├── models/           # Mongoose schemas
│   ├── routes/           # API endpoints
│   ├── server.js         # Express app
│   └── socket.js         # Socket.io config
│
├── uploads/              # User uploaded files
├── .env                  # Server environment
└── package.json          # Dependencies
```

---

## 🔄 Data Flow

### Authentication Flow:
```
User Login → Express → Validate → bcrypt Compare → Generate JWT → Client Storage
```

### Donation Creation Flow:
```
Donor Form → API POST → MongoDB Save → Socket.io Emit → NGOs Notified
```

### Real-Time Update Flow:
```
Status Change → Socket.io Event → Room Broadcast → Client Update → UI Refresh
```

---

## 🌍 Environment Variables

### Backend (.env):
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/foodzero
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
```

### Frontend (client/.env.local):
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key
```

---

## 📦 Key Dependencies

### Frontend (client/package.json):
```json
{
  "dependencies": {
    "next": "^15.1.0",
    "react": "^19.2.4",
    "react-dom": "^19.2.4",
    "axios": "^1.7.0",
    "socket.io-client": "^4.8.0",
    "@react-google-maps/api": "^2.20.8",
    "lucide-react": "^0.575.0"
  },
  "devDependencies": {
    "tailwindcss": "^3.3.5",
    "postcss": "^8.4.31",
    "autoprefixer": "^10.4.16"
  }
}
```

### Backend (package.json):
```json
{
  "dependencies": {
    "express": "^4.21.2",
    "mongoose": "^8.9.5",
    "socket.io": "^4.8.3",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.4.7",
    "multer": "^1.4.5-lts.1"
  },
  "devDependencies": {
    "nodemon": "^3.1.14",
    "concurrently": "^9.1.0"
  }
}
```

---

## 🎨 UI/UX Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Styling** | Tailwind CSS | Utility-first responsive design |
| **Icons** | Lucide React | Consistent icon system |
| **Maps** | Google Maps | Interactive location features |
| **Forms** | React State | Form handling and validation |
| **Notifications** | Socket.io | Real-time alerts |
| **Layout** | Next.js Layout | Consistent page structure |

---

## 🔌 API Endpoints

### Authentication:
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Donations:
- `POST /api/donations/create` - Create donation
- `GET /api/donations/all` - List all donations
- `GET /api/donations/:id` - Get donation details
- `PUT /api/donations/:id` - Update donation

### Donor:
- `GET /api/donor/profile` - Get profile
- `PUT /api/donor/profile` - Update profile
- `POST /api/donor/verify` - Submit verification

### NGO:
- `GET /api/ngo/donations` - Available donations
- `PUT /api/ngo/accept/:id` - Accept donation
- `POST /api/ngo/tracking` - Update tracking

### Admin:
- `GET /api/admin/users` - List all users
- `GET /api/admin/stats` - Dashboard statistics
- `PUT /api/admin/verify-donor/:id` - Verify donor
- `PUT /api/admin/verify-ngo/:id` - Verify NGO
- `DELETE /api/admin/users/:id` - Delete user

---

## 🚦 Development Commands

```bash
# Install all dependencies
npm run install-all

# Run both frontend and backend
npm run dev

# Run backend only
npm run server

# Run frontend only
npm run client

# Build frontend for production
cd client && npm run build

# Start production frontend
cd client && npm start
```

---

## 📈 Performance Features

### Frontend:
- ✅ Code splitting by route (Next.js)
- ✅ Tree shaking (unused code removal)
- ✅ CSS purging (Tailwind)
- ✅ Lazy loading components
- ✅ Server-side rendering (SSR)

### Backend:
- ✅ Database indexing (email field)
- ✅ Connection pooling (Mongoose)
- ✅ Async/await for non-blocking I/O
- ✅ Error handling middleware
- ✅ Static file serving

---

## 🔮 Future Enhancements

### Scalability:
- Redis for session management
- Load balancer for multiple servers
- CDN for static assets
- Database sharding
- Microservices architecture

### Features:
- Push notifications (FCM)
- Email service (SendGrid/Nodemailer)
- SMS verification (Twilio)
- Payment gateway (Stripe/Razorpay)
- Analytics dashboard (Chart.js)

---

## 📊 Tech Stack Summary Table

| Layer | Technologies | Count |
|-------|-------------|-------|
| **Frontend** | Next.js, React, Tailwind, Axios, Socket.io Client, Google Maps, Lucide | 7 |
| **Backend** | Node.js, Express, MongoDB, Mongoose, Socket.io, JWT, bcrypt, Multer, CORS, dotenv | 10 |
| **Dev Tools** | Nodemon, Concurrently, PostCSS, Autoprefixer | 4 |
| **Total** | | **21** |

---

## 🎯 Why This Stack?

1. **JavaScript Everywhere** - Same language for frontend and backend
2. **Real-Time Capable** - Socket.io for instant updates
3. **Modern & Scalable** - Latest versions, production-ready
4. **Developer Friendly** - Great tooling and documentation
5. **Cost Effective** - Many free tiers available
6. **Community Support** - Large active communities
7. **Performance** - Fast, efficient, optimized

---

## 📝 Quick Reference

### Ports:
- Frontend: `3000`
- Backend: `5000`
- MongoDB: `27017`

### Key Files:
- Server entry: `server/server.js`
- Client entry: `client/app/page.jsx`
- Database config: `server/config/db.js`
- API config: `client/lib/axios.js`

### Authentication:
- Method: JWT (JSON Web Tokens)
- Storage: localStorage (client)
- Header: `Authorization: Bearer <token>`

---

*Last Updated: February 2026*
*FoodZero Platform v1.0.0*
