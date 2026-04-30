# FoodZero - Comprehensive Tech Stack Documentation

## Project Overview
**FoodZero** is a real-time food waste reduction platform that connects food donors (households, restaurants, hotels, stores) with NGOs to minimize food waste and help those in need. The platform features role-based access control, real-time notifications, location tracking, verification systems, and comprehensive admin management.

---

## Architecture Pattern
**Full-Stack MERN + Next.js Architecture**
- **Pattern**: Monorepo with separate client and server directories
- **Communication**: RESTful API + WebSocket (Socket.io) for real-time features
- **Authentication**: JWT-based stateless authentication
- **Data Flow**: Client → API Gateway → Controllers → Models → Database

---

## Frontend Stack

### 1. **Next.js 15.1.0**
**Where**: `client/` directory  
**Why**: 
- Server-side rendering (SSR) for better SEO and initial load performance
- File-based routing system simplifies navigation structure
- Built-in API routes capability (though not used here)
- Excellent developer experience with hot module replacement
- React 19 support with experimental features

**What it does**:
- Handles all client-side routing (`/donor/dashboard`, `/ngo/requests`, `/admin/users`, etc.)
- Renders pages server-side for faster initial loads
- Manages the build and optimization process
- Provides automatic code splitting for better performance

**Key Configuration**:
```javascript
// next.config.js
- React Strict Mode enabled
- Custom webpack configuration for web3/ethereum externals
- Path aliases (@/) for cleaner imports
- Output file tracing for optimized builds
```

---

### 2. **React 19.2.4**
**Where**: All UI components in `client/app/` and `client/components/`  
**Why**:
- Component-based architecture for reusable UI elements
- Virtual DOM for efficient updates
- Large ecosystem and community support
- Hooks API for state management and side effects
- Latest version with improved concurrent features

**What it does**:
- Powers all interactive UI components
- Manages component state and lifecycle
- Handles user interactions and form submissions
- Renders dynamic content based on data

**Key Components**:
- **Pages**: Dashboard pages for each role (donor, NGO, admin)
- **Shared Components**: Navbar, Sidebar, DonationCard, MapComponent, NotificationBell
- **Utility Components**: ErrorBoundary, VerificationBanner, SubscriptionPlans

---

### 3. **Tailwind CSS 3.3.5**
**Where**: Styling across all components, configured in `client/tailwind.config.js`  
**Why**:
- Utility-first approach speeds up development
- Consistent design system without writing custom CSS
- Small bundle size with PurgeCSS
- Responsive design made simple
- Easy to customize and extend

**What it does**:
- Provides pre-built utility classes for styling
- Handles responsive breakpoints
- Manages colors, spacing, typography
- Enables rapid UI prototyping

**Configuration**:
```javascript
// Scans all pages, components, and app files
// Uses PostCSS for processing
// Autoprefixer for browser compatibility
```

---

### 4. **Axios 1.7.0**
**Where**: `client/lib/axios.js` - HTTP client configuration  
**Why**:
- Promise-based HTTP client with better API than fetch
- Automatic request/response transformation
- Interceptors for global request/response handling
- Better error handling
- Request cancellation support

**What it does**:
- Makes all API calls to backend (`/api/auth`, `/api/donations`, etc.)
- Automatically attaches JWT tokens to requests via interceptors
- Handles API base URL configuration
- Transforms request/response data

**Configuration**:
```javascript
baseURL: http://localhost:5000/api
Headers: Content-Type: application/json
Interceptor: Adds Bearer token from localStorage
```

---

### 5. **Socket.io Client 4.8.0**
**Where**: Real-time features across dashboard pages  
**Why**:
- Enables real-time bidirectional communication
- Automatic reconnection handling
- Room-based event broadcasting
- Fallback to long-polling if WebSocket unavailable
- Cross-browser compatibility

**What it does**:
- Connects to Socket.io server on backend
- Listens for real-time events (donation updates, notifications)
- Emits events (join rooms, status updates)
- Updates UI instantly without page refresh

**Key Events**:
- `join` - User joins their role-based room
- `donation-available` - NGOs notified of new donations
- `donation-update` - Donors get status updates
- `notification` - General notifications to users

---

### 6. **@react-google-maps/api 2.20.8**
**Where**: `client/components/MapComponent.jsx`  
**Why**:
- Official React wrapper for Google Maps JavaScript API
- Declarative component-based API
- TypeScript support
- Optimized for React lifecycle
- Handles map loading and cleanup

**What it does**:
- Displays interactive maps for location selection
- Shows donor and NGO locations
- Enables location-based donation matching
- Provides geocoding and place search
- Renders markers and info windows

**Features Used**:
- Map display with custom markers
- Location picker for donors
- Distance calculation between donor and NGO
- Geolocation API integration

---

### 7. **Lucide React 0.575.0**
**Where**: Icon components throughout the UI  
**Why**:
- Modern, consistent icon set
- Tree-shakeable (only imports used icons)
- Customizable size and color
- Lightweight and performant
- Better than Font Awesome for React

**What it does**:
- Provides SVG icons for UI elements
- Used in navigation, buttons, status indicators
- Enhances visual communication
- Maintains consistent design language

**Common Icons Used**:
- Navigation icons (Home, Users, Package)
- Action icons (Plus, Edit, Trash, Check)
- Status icons (AlertCircle, CheckCircle, Clock)

---

## Backend Stack

### 8. **Node.js + Express 4.21.2**
**Where**: `server/server.js` - Main application server  
**Why**:
- JavaScript runtime for server-side execution
- Non-blocking I/O for handling concurrent requests
- Large ecosystem (npm packages)
- Express provides minimal, flexible web framework
- Easy integration with MongoDB and Socket.io

**What it does**:
- Runs the HTTP server on port 5000
- Handles all API requests
- Serves static files (uploaded documents)
- Manages middleware pipeline
- Integrates Socket.io for WebSocket support

**Middleware Stack**:
```javascript
1. CORS - Cross-origin resource sharing
2. express.json() - Parse JSON request bodies
3. Static file serving - /uploads directory
4. Route handlers - API endpoints
5. Error handler - Global error catching
6. 404 handler - Unknown routes
```

---

### 9. **MongoDB + Mongoose 8.9.5**
**Where**: `server/config/db.js`, `server/models/`  
**Why**:
- NoSQL database for flexible schema design
- JSON-like documents match JavaScript objects
- Horizontal scalability
- Mongoose provides schema validation and ORM features
- Easy to work with nested data structures

**What it does**:
- Stores all application data (users, donations, tracking)
- Provides CRUD operations
- Handles data validation
- Manages relationships between collections
- Supports indexing for fast queries

**Data Models**:

**User Model** (`server/models/User.js`):
- Core fields: name, email, password, role, location
- Donor verification: phone, address, govt ID, FSSAI, AI risk scoring
- NGO verification: registration number, certificates, verification status
- Subscription management: plan, status, payment history
- Indexes on email for fast lookups

**Donation Model** (`server/models/Donation.js`):
- Donation details: food type, quantity, expiry, pickup location
- Status tracking: available, accepted, picked_up, delivered, cancelled
- References to donor and NGO users
- Temperature monitoring data
- Timestamps for audit trail

**Tracking Model** (`server/models/Tracking.js`):
- Real-time location updates
- Status history
- Temperature logs
- Delivery confirmation
- References to donation and users

---

### 10. **Socket.io 4.8.3**
**Where**: `server/socket.js` - WebSocket server configuration  
**Why**:
- Real-time bidirectional event-based communication
- Room-based broadcasting for targeted notifications
- Automatic reconnection and heartbeat
- Scales with Redis adapter (future enhancement)
- Works with HTTP server seamlessly

**What it does**:
- Establishes WebSocket connections with clients
- Manages user rooms (by userId and role)
- Broadcasts events to specific users or groups
- Enables instant notifications without polling
- Handles connection/disconnection events

**Room Structure**:
- Individual rooms: `userId` - Personal notifications
- Role rooms: `donor`, `ngo`, `admin` - Broadcast to all users of a role
- Broadcast: All connected clients

**Event Handlers**:
```javascript
- connection/disconnect - Client lifecycle
- join - User joins their rooms
- new-donation - Notify all NGOs
- ngo-request - Notify all donors
- donation-accepted - Notify specific donor
- status-update - Real-time tracking updates
- send-notification - Targeted notifications
- broadcast - System-wide announcements
```

---

### 11. **JWT (jsonwebtoken 9.0.2)**
**Where**: `server/middleware/authMiddleware.js`, auth controllers  
**Why**:
- Stateless authentication (no server-side sessions)
- Secure token-based authentication
- Contains user claims (id, role)
- Can be verified without database lookup
- Industry standard for API authentication

**What it does**:
- Generates tokens on login/register
- Encodes user information (id, email, role)
- Verifies tokens on protected routes
- Expires after set duration for security
- Enables role-based access control

**Token Structure**:
```javascript
Payload: { id, email, role }
Secret: JWT_SECRET from .env
Expiry: Configurable (typically 7-30 days)
Algorithm: HS256 (HMAC SHA-256)
```

---

### 12. **bcryptjs 2.4.3**
**Where**: `server/controllers/authController.js`  
**Why**:
- Secure password hashing (one-way encryption)
- Salt rounds prevent rainbow table attacks
- Industry standard for password storage
- Pure JavaScript (no C++ dependencies)
- Slow by design to prevent brute force

**What it does**:
- Hashes passwords before storing in database
- Compares plain text passwords with hashed versions
- Generates unique salts for each password
- Protects user credentials from data breaches

**Configuration**:
```javascript
Salt rounds: 10 (balance between security and performance)
Never stores plain text passwords
Automatic salt generation
```

---

### 13. **Multer 1.4.5-lts.1**
**Where**: File upload handling in controllers  
**Why**:
- Handles multipart/form-data for file uploads
- Configurable storage (disk, memory)
- File filtering and validation
- Size limits for security
- Works seamlessly with Express

**What it does**:
- Processes uploaded verification documents
- Stores files in `uploads/` directory
- Validates file types (images, PDFs)
- Generates unique filenames
- Provides file metadata to controllers

**Use Cases**:
- Donor govt ID uploads (front/back)
- FSSAI certificates for businesses
- NGO registration certificates
- Profile pictures (future feature)

---

### 14. **CORS 2.8.5**
**Where**: `server/server.js` middleware  
**Why**:
- Enables cross-origin requests from frontend (port 3000 → 5000)
- Security mechanism to control resource sharing
- Configurable for different environments
- Required for modern web applications

**What it does**:
- Allows frontend (localhost:3000) to call backend (localhost:5000)
- Sets appropriate headers (Access-Control-Allow-Origin)
- Handles preflight OPTIONS requests
- Configures allowed methods and headers

**Configuration**:
```javascript
Origin: http://localhost:3000 (development)
Methods: GET, POST, PUT, DELETE
Credentials: true (for cookies/auth)
```

---

### 15. **dotenv 16.4.7**
**Where**: Loaded in `server/server.js`  
**Why**:
- Separates configuration from code
- Keeps secrets out of version control
- Different configs for dev/staging/production
- Industry best practice (12-factor app)

**What it does**:
- Loads environment variables from `.env` file
- Makes variables available via `process.env`
- Supports different environments
- Protects sensitive data

**Environment Variables**:
```
PORT - Server port (5000)
MONGO_URI - Database connection string
JWT_SECRET - Token signing secret
NODE_ENV - Environment (development/production)
```

---

## Development Tools

### 16. **Nodemon 3.1.14**
**Where**: Development server script  
**Why**:
- Auto-restarts server on file changes
- Improves development workflow
- Watches specific files/directories
- Configurable delay and ignore patterns

**What it does**:
- Monitors server files for changes
- Automatically restarts Node.js process
- Saves time during development
- Provides better error messages

---

### 17. **Concurrently 9.1.0**
**Where**: Root `package.json` dev script  
**Why**:
- Runs multiple npm scripts simultaneously
- Single command to start frontend and backend
- Color-coded output for each process
- Simplifies development workflow

**What it does**:
- Starts backend server (port 5000)
- Starts frontend dev server (port 3000)
- Displays logs from both in one terminal
- Handles process cleanup on exit

**Usage**:
```bash
npm run dev
# Runs: server (nodemon) + client (next dev)
```

---

### 18. **PostCSS + Autoprefixer**
**Where**: `client/postcss.config.js`  
**Why**:
- Processes Tailwind CSS directives
- Adds vendor prefixes for browser compatibility
- Optimizes CSS output
- Required for Tailwind to work

**What it does**:
- Transforms Tailwind utilities to CSS
- Adds -webkit-, -moz- prefixes automatically
- Minifies CSS in production
- Ensures cross-browser compatibility

---

## External Services & APIs

### 19. **Google Maps JavaScript API**
**Where**: MapComponent, location features  
**Why**:
- Industry-standard mapping solution
- Accurate geocoding and place search
- Rich features (markers, directions, places)
- Reliable and well-documented

**What it does**:
- Displays interactive maps
- Geocodes addresses to coordinates
- Calculates distances between locations
- Provides place autocomplete
- Shows donor/NGO locations on map

**API Key Required**: `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`

---

## Security Features

### 20. **Authentication & Authorization**
**Implementation**:
- JWT tokens for stateless auth
- Password hashing with bcrypt
- Protected routes with middleware
- Role-based access control (RBAC)

**Middleware** (`server/middleware/authMiddleware.js`):
```javascript
1. Extract token from Authorization header
2. Verify token signature
3. Decode user information
4. Attach user to request object
5. Check role permissions
6. Allow/deny access
```

---

### 21. **Verification System**
**Multi-Level Verification**:

**Level 1 - Basic Verification**:
- Phone number verification
- Email verification
- Location verification
- Automatic for all donors

**Level 2 - Enhanced Verification**:
- Government ID upload and verification
- FSSAI certificate (for businesses)
- AI risk scoring system
- Admin manual review

**Admin Approval Workflow**:
- Pending → Under Review → Approved/Rejected
- Admin notes and rejection reasons
- Verification timestamps and audit trail

---

## Data Flow Architecture

### User Registration Flow
```
1. User submits form (client)
2. Axios POST to /api/auth/register
3. Express receives request
4. Controller validates data
5. bcrypt hashes password
6. Mongoose saves to MongoDB
7. JWT token generated
8. Token sent to client
9. Client stores in localStorage
10. Redirect to dashboard
```

### Real-Time Donation Flow
```
1. Donor creates donation (client)
2. API POST to /api/donations/create
3. Donation saved to MongoDB
4. Socket.io emits "new-donation" event
5. All NGOs receive notification instantly
6. NGO accepts donation
7. Socket.io notifies donor
8. Status updated in database
9. Both parties see real-time updates
```

### Authentication Flow
```
1. User logs in (client)
2. Credentials sent to /api/auth/login
3. Server validates credentials
4. bcrypt compares passwords
5. JWT token generated
6. Token sent to client
7. Client stores token
8. Axios interceptor adds token to all requests
9. Middleware verifies token on protected routes
10. User data attached to request
```

---

## File Structure & Organization

```
foodzero/
├── client/                    # Frontend Next.js application
│   ├── app/                   # Next.js 13+ app directory
│   │   ├── admin/            # Admin dashboard pages
│   │   ├── donor/            # Donor dashboard pages
│   │   ├── ngo/              # NGO dashboard pages
│   │   ├── login/            # Authentication pages
│   │   ├── register/         # Registration pages
│   │   ├── layout.js         # Root layout component
│   │   ├── page.jsx          # Home page
│   │   └── globals.css       # Global styles
│   ├── components/           # Reusable React components
│   │   ├── DonationCard.jsx  # Donation display component
│   │   ├── MapComponent.jsx  # Google Maps integration
│   │   ├── Navbar.jsx        # Navigation bar
│   │   ├── Sidebar.jsx       # Dashboard sidebar
│   │   └── ...               # Other components
│   ├── lib/                  # Utility libraries
│   │   ├── axios.js          # Axios configuration
│   │   ├── utils.js          # Helper functions
│   │   └── theme.js          # Theme configuration
│   ├── public/               # Static assets
│   ├── .env.local            # Client environment variables
│   ├── next.config.js        # Next.js configuration
│   ├── tailwind.config.js    # Tailwind CSS configuration
│   └── package.json          # Client dependencies
│
├── server/                    # Backend Node.js application
│   ├── config/               # Configuration files
│   │   └── db.js             # MongoDB connection
│   ├── controllers/          # Route controllers (business logic)
│   │   ├── authController.js # Authentication logic
│   │   ├── donationController.js
│   │   ├── donorController.js
│   │   ├── ngoController.js
│   │   └── adminController.js
│   ├── middleware/           # Express middleware
│   │   └── authMiddleware.js # JWT verification
│   ├── models/               # Mongoose schemas
│   │   ├── User.js           # User model
│   │   ├── Donation.js       # Donation model
│   │   └── Tracking.js       # Tracking model
│   ├── routes/               # API route definitions
│   │   ├── authRoutes.js     # /api/auth/*
│   │   ├── donationRoutes.js # /api/donations/*
│   │   ├── donorRoutes.js    # /api/donor/*
│   │   ├── ngoRoutes.js      # /api/ngo/*
│   │   └── adminRoutes.js    # /api/admin/*
│   ├── server.js             # Express server setup
│   └── socket.js             # Socket.io configuration
│
├── uploads/                   # Uploaded files (documents, images)
├── .env                       # Server environment variables
├── package.json               # Root dependencies
└── README.md                  # Project documentation
```

---

## API Endpoints Reference

### Authentication (`/api/auth`)
- `POST /register` - Create new user account
- `POST /login` - Authenticate and get JWT token

### Donations (`/api/donations`)
- `POST /create` - Create new donation (protected)
- `GET /all` - Get all donations
- `GET /:id` - Get specific donation
- `PUT /:id` - Update donation status (protected)
- `DELETE /:id` - Delete donation (protected)

### Donor (`/api/donor`)
- `GET /profile` - Get donor profile (protected)
- `PUT /profile` - Update donor details (protected)
- `POST /verify` - Submit verification documents (protected)
- `GET /donations` - Get donor's donations (protected)

### NGO (`/api/ngo`)
- `GET /donations` - Get available donations (NGO only)
- `PUT /accept/:id` - Accept donation (NGO only)
- `POST /tracking` - Update tracking info (NGO only)
- `GET /profile` - Get NGO profile (protected)
- `POST /verify` - Submit NGO verification (protected)

### Admin (`/api/admin`)
- `GET /users` - Get all users (Admin only)
- `GET /stats` - Get dashboard statistics (Admin only)
- `PUT /verify-donor/:id` - Approve/reject donor (Admin only)
- `PUT /verify-ngo/:id` - Approve/reject NGO (Admin only)
- `DELETE /users/:id` - Delete user (Admin only)
- `GET /donations` - Get all donations with details (Admin only)

---

## Environment Configuration

### Backend (.env)
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/foodzero
JWT_SECRET=your_jwt_secret_key_here_change_in_production
NODE_ENV=development
```

### Frontend (client/.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

---

## Performance Optimizations

### Frontend
- **Code Splitting**: Next.js automatically splits code by route
- **Image Optimization**: Next.js Image component (when used)
- **Tree Shaking**: Unused code removed in production build
- **CSS Purging**: Tailwind removes unused styles
- **Lazy Loading**: Components loaded on demand

### Backend
- **Database Indexing**: Email field indexed for fast lookups
- **Connection Pooling**: Mongoose manages MongoDB connections
- **Compression**: Can add compression middleware
- **Caching**: Can implement Redis for session/data caching

---

## Scalability Considerations

### Current Architecture
- **Monolithic**: Single server handles all requests
- **Vertical Scaling**: Add more CPU/RAM to server
- **Database**: Single MongoDB instance

### Future Enhancements
- **Microservices**: Separate auth, donations, notifications services
- **Load Balancing**: Multiple server instances behind load balancer
- **Redis**: For session management and Socket.io scaling
- **CDN**: For static assets and images
- **Database Sharding**: Horizontal MongoDB scaling
- **Message Queue**: RabbitMQ/Kafka for async processing

---

## Security Best Practices Implemented

1. **Password Security**: bcrypt hashing with salt rounds
2. **JWT Tokens**: Stateless authentication with expiry
3. **CORS**: Restricted to specific origins
4. **Input Validation**: Mongoose schema validation
5. **Error Handling**: No sensitive data in error messages
6. **File Upload Limits**: Multer file size restrictions
7. **Environment Variables**: Secrets not in code
8. **HTTPS**: Should be used in production
9. **Rate Limiting**: Should be added for production
10. **SQL Injection**: Not applicable (NoSQL with Mongoose)

---

## Testing Strategy (Recommended)

### Frontend Testing
- **Unit Tests**: Jest + React Testing Library
- **Component Tests**: Test individual components
- **Integration Tests**: Test page flows
- **E2E Tests**: Cypress or Playwright

### Backend Testing
- **Unit Tests**: Jest for controllers and utilities
- **Integration Tests**: Supertest for API endpoints
- **Database Tests**: MongoDB Memory Server
- **Load Tests**: Artillery or k6

---

## Deployment Architecture

### Development
- **Frontend**: localhost:3000 (Next.js dev server)
- **Backend**: localhost:5000 (Nodemon)
- **Database**: Local MongoDB or MongoDB Atlas

### Production (Recommended)
- **Frontend**: Vercel (Next.js optimized) or Netlify
- **Backend**: AWS EC2, DigitalOcean, or Heroku
- **Database**: MongoDB Atlas (managed)
- **File Storage**: AWS S3 for uploads
- **CDN**: CloudFlare or AWS CloudFront
- **SSL**: Let's Encrypt or cloud provider SSL

---

## Monitoring & Logging (Future)

### Application Monitoring
- **APM**: New Relic, Datadog, or AppDynamics
- **Error Tracking**: Sentry for error reporting
- **Logging**: Winston or Bunyan for structured logs
- **Analytics**: Google Analytics or Mixpanel

### Infrastructure Monitoring
- **Server Metrics**: CPU, memory, disk usage
- **Database Metrics**: Query performance, connections
- **Network Metrics**: Request latency, throughput
- **Uptime Monitoring**: Pingdom or UptimeRobot

---

## Development Workflow

### Local Development
```bash
# Install dependencies
npm run install-all

# Start development servers
npm run dev

# Or run separately
npm run server  # Backend on port 5000
npm run client  # Frontend on port 3000
```

### Git Workflow
- **Main Branch**: Production-ready code
- **Develop Branch**: Integration branch
- **Feature Branches**: feature/feature-name
- **Hotfix Branches**: hotfix/issue-description

### Code Quality
- **Linting**: ESLint for code quality
- **Formatting**: Prettier for consistent style
- **Pre-commit Hooks**: Husky + lint-staged
- **Code Review**: Pull request reviews

---

## Key Takeaways

### Why This Stack?
1. **JavaScript Everywhere**: Same language for frontend and backend
2. **Real-Time Capable**: Socket.io for instant updates
3. **Scalable**: Can grow from MVP to enterprise
4. **Developer Friendly**: Great tooling and documentation
5. **Cost Effective**: Many free tiers available (Vercel, MongoDB Atlas)
6. **Modern**: Latest versions of all major libraries
7. **Community Support**: Large communities for all technologies

### What Makes It Special?
- **Real-time notifications** keep users engaged
- **Multi-level verification** ensures trust and safety
- **Role-based access** provides security and organization
- **Location-based matching** optimizes food distribution
- **Comprehensive admin tools** for platform management
- **Subscription system** enables monetization
- **Document upload** supports verification process

---

## Conclusion

FoodZero uses a modern, scalable tech stack that balances developer experience with performance and security. The MERN stack with Next.js provides a solid foundation for a real-time, data-driven application. The architecture supports the core mission of reducing food waste by connecting donors with NGOs efficiently and securely.

**Total Technologies**: 21 core technologies + external APIs
**Lines of Code**: ~15,000+ (estimated)
**Development Time**: Ongoing
**Maintenance**: Active development with regular updates

---

*Last Updated: February 2026*
*Version: 1.0.0*
