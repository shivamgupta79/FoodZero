# Design Document: Codebase Security Upgrade

## Overview

This design outlines a systematic approach to upgrading the food donation platform from its current state to a production-ready system. The upgrade addresses 32 identified issues across four categories: security vulnerabilities, functionality gaps, configuration problems, and user experience deficiencies.

The design follows a layered approach:
1. **Security Layer**: Environment validation, input sanitization, rate limiting, authentication hardening
2. **Middleware Layer**: Error handling, logging, validation, CORS policies
3. **Business Logic Layer**: Enhanced error handling, validation, and defensive programming
4. **Frontend Layer**: Error boundaries, retry logic, loading states, client-side validation
5. **Infrastructure Layer**: Database connection management, Socket.io reliability, environment configuration

## Architecture

### Current Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js 14)                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Pages      │  │  Components  │  │  Axios Client│      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/WebSocket
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend (Node.js/Express)                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Routes     │  │  Controllers │  │  Middleware  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │   Models     │  │  Socket.io   │                        │
│  └──────────────┘  └──────────────┘                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                        ┌──────────┐
                        │ MongoDB  │
                        └──────────┘
```

### Enhanced Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js 14)                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Error        │  │  Validation  │  │  Retry Logic │      │
│  │ Boundaries   │  │  Schemas     │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Pages      │  │  Components  │  │Enhanced Axios│      │
│  │              │  │  + Loading   │  │+ Interceptors│      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/WebSocket + Retry
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend (Node.js/Express)                 │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         Security Middleware Layer                    │   │
│  │  • Rate Limiter  • CORS  • Helmet  • Request Size   │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         Validation & Logging Layer                   │   │
│  │  • Input Validator  • Request Logger  • Sanitizer   │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Routes     │  │  Controllers │  │Auth Middleware│     │
│  │              │  │+ Error Wrap  │  │+ JWT Refresh │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Models     │  │  Socket.io   │  │Error Handler │      │
│  │              │  │+ Auth + Retry│  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │ MongoDB          │
                    │ + Retry Logic    │
                    └──────────────────┘
```

## Components and Interfaces

### 1. Environment Validation Module

**Purpose**: Validate all required environment variables at startup and prevent insecure defaults.

**Location**: `server/config/validateEnv.js`

**Interface**:
```javascript
function validateEnvironment() {
  // Returns: void
  // Throws: Error if validation fails
  // Side effects: Logs validation results, exits process on failure
}

function getConfig() {
  // Returns: {
  //   jwtSecret: string,
  //   mongoUri: string,
  //   nodeEnv: 'development' | 'production',
  //   port: number,
  //   corsOrigin: string,
  //   httpsOnly: boolean
  // }
}
```

**Validation Rules**:
- JWT_SECRET: Required, minimum 32 characters
- MONGO_URI: Required, valid MongoDB connection string format
- NODE_ENV: Optional, defaults to 'development'
- PORT: Optional, defaults to 5000
- CORS_ORIGIN: Required in production
- In production: Enforce HTTPS-only configuration

### 2. Input Validation Middleware

**Purpose**: Validate and sanitize all incoming request data.

**Location**: `server/middleware/validation.js`

**Interface**:
```javascript
function validateRequest(schema) {
  // Parameters: schema - Joi validation schema
  // Returns: Express middleware function
  // Behavior: Validates req.body, req.query, req.params
}

function sanitizeInput(input) {
  // Parameters: input - string or object
  // Returns: sanitized input
  // Behavior: Removes HTML tags, script tags, SQL injection patterns
}
```

**Validation Schemas** (using Joi):
- Registration: email, password (min 8 chars, special char), name, role
- Login: email, password
- Donation: foodType, quantity (positive number), expiryDate, location
- Profile Update: name, phone, address

### 3. Rate Limiting Middleware

**Purpose**: Protect against brute force and DoS attacks.

**Location**: `server/middleware/rateLimiter.js`

**Interface**:
```javascript
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: 'Too many authentication attempts, please try again later'
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests, please try again later'
});
```

**Application**:
- Auth endpoints: 5 requests per 15 minutes
- General API: 100 requests per 15 minutes
- Admin endpoints: 50 requests per 15 minutes

### 4. Enhanced Authentication Middleware

**Purpose**: Secure JWT validation with token refresh and proper error handling.

**Location**: `server/middleware/authMiddleware.js`

**Interface**:
```javascript
async function protect(req, res, next) {
  // Validates JWT token
  // Sets req.user
  // Returns 401 if invalid/expired
}

function authorize(...roles) {
  // Checks user role
  // Returns 403 if unauthorized
}

async function refreshToken(req, res) {
  // Issues new JWT if current token is valid but expiring soon
  // Returns: { token: string, expiresIn: number }
}
```

**Changes**:
- Remove hardcoded JWT_SECRET fallback
- Add token expiration check (24 hours)
- Implement refresh token endpoint
- Generic error messages to prevent user enumeration

### 5. Error Handling System

**Purpose**: Centralized error handling with appropriate logging and user-safe messages.

**Location**: `server/middleware/errorHandler.js`

**Interface**:
```javascript
class AppError extends Error {
  constructor(message, statusCode, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
  }
}

function errorHandler(err, req, res, next) {
  // Logs error details
  // Returns formatted error response
  // Sanitizes error messages for production
}

function asyncHandler(fn) {
  // Wraps async route handlers
  // Catches errors and passes to errorHandler
}
```

**Error Categories**:
- Validation Errors (400): Field-specific messages
- Authentication Errors (401): Generic "Invalid credentials"
- Authorization Errors (403): Generic "Access denied"
- Not Found Errors (404): Resource-specific messages
- Server Errors (500): Generic "Internal server error" (log details server-side)

### 6. Request Logger Middleware

**Purpose**: Log all requests for monitoring and debugging.

**Location**: `server/middleware/logger.js`

**Interface**:
```javascript
function requestLogger(req, res, next) {
  // Logs: timestamp, method, path, IP, user ID
  // On response: status code, duration
  // Redacts: passwords, tokens
}
```

**Log Format**:
```
[2024-01-15T10:30:45.123Z] POST /api/auth/login 192.168.1.1 - 200 45ms
[2024-01-15T10:30:50.456Z] GET /api/donations 192.168.1.1 user:123 - 200 12ms
[2024-01-15T10:31:00.789Z] ERROR POST /api/donations 192.168.1.1 user:123 - 400 8ms - Validation failed
```

### 7. Enhanced Axios Client

**Purpose**: Frontend HTTP client with interceptors for auth, retry, and error handling.

**Location**: `client/lib/axios.js`

**Interface**:
```javascript
// Request interceptor: Add auth token
// Response interceptor: Handle 401/403, retry on network errors

const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000
});

// Retry configuration
axiosRetry(axiosInstance, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    return axiosRetry.isNetworkOrIdempotentRequestError(error) ||
           error.response?.status === 429;
  }
});
```

**Interceptor Behavior**:
- Request: Add Authorization header if token exists
- Response Success: Pass through
- Response Error 401/403: Clear token, redirect to login
- Response Error 429: Retry with exponential backoff
- Network Error: Retry up to 3 times

### 8. Socket.io Enhancement

**Purpose**: Reliable real-time communication with authentication and error handling.

**Location**: `server/socket.js`

**Interface**:
```javascript
function initializeSocket(io) {
  // Middleware: Authenticate connections via JWT
  // Event handlers: join, leave, notification
  // Error handling: Connection failures, room cleanup
}
```

**Client-side** (`client/lib/socket.js`):
```javascript
class SocketClient {
  constructor() {
    this.socket = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }
  
  connect(token) {
    // Connect with auth token
    // Implement exponential backoff retry
    // Handle connection errors
  }
  
  disconnect() {
    // Clean disconnect
  }
  
  on(event, callback) {
    // Event listener with error handling
  }
}
```

**Retry Logic**:
- Initial retry: 1 second
- Exponential backoff: 1s, 2s, 4s, 8s, 16s
- Max attempts: 5
- Display connection status to user

### 9. Database Connection Manager

**Purpose**: Robust MongoDB connection with retry logic and error handling.

**Location**: `server/config/db.js`

**Interface**:
```javascript
async function connectDB(retries = 5) {
  // Attempts connection with exponential backoff
  // Supports MongoDB Atlas and local connections
  // Logs connection status
  // Exits process if all retries fail
}

function handleDisconnection() {
  // Listens for disconnection events
  // Attempts automatic reconnection
}
```

**Connection Options**:
```javascript
{
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  maxPoolSize: 10,
  retryWrites: true,
  retryReads: true
}
```

### 10. Validation Schemas

**Purpose**: Centralized validation rules for all entities.

**Location**: `server/validators/schemas.js`

**Schemas**:

```javascript
// User Registration
const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[!@#$%^&*])/)
    .required()
    .messages({
      'string.pattern.base': 'Password must contain at least one special character'
    }),
  role: Joi.string().valid('donor', 'ngo').required(),
  phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).optional(),
  address: Joi.string().max(200).optional()
});

// Donation Creation
const donationSchema = Joi.object({
  foodType: Joi.string().min(2).max(100).required(),
  quantity: Joi.number().positive().required(),
  unit: Joi.string().valid('kg', 'liters', 'servings', 'items').required(),
  expiryDate: Joi.date().greater('now').required(),
  pickupLocation: Joi.object({
    address: Joi.string().required(),
    coordinates: Joi.object({
      lat: Joi.number().min(-90).max(90).required(),
      lng: Joi.number().min(-180).max(180).required()
    }).required()
  }).required(),
  description: Joi.string().max(500).optional()
});

// Donation Acceptance
const acceptDonationSchema = Joi.object({
  donationId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
  ngoId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required()
});
```

### 11. Frontend Validation

**Purpose**: Client-side validation for immediate feedback.

**Location**: `client/utils/validation.js`

**Interface**:
```javascript
function validateEmail(email) {
  // Returns: { valid: boolean, error: string }
}

function validatePassword(password) {
  // Returns: { valid: boolean, errors: string[] }
  // Checks: length, special characters
}

function validateDonationForm(formData) {
  // Returns: { valid: boolean, errors: object }
  // Validates all donation fields
}
```

### 12. Loading State Management

**Purpose**: Consistent loading states across the application.

**Location**: `client/hooks/useLoadingState.js`

**Interface**:
```javascript
function useLoadingState(initialState = false) {
  // Returns: [isLoading, setLoading, withLoading]
  // withLoading: wraps async functions with loading state
}
```

**Usage Pattern**:
```javascript
const [isLoading, setLoading, withLoading] = useLoadingState();

const handleSubmit = withLoading(async (data) => {
  await api.createDonation(data);
});

// Button automatically shows loading state
<button disabled={isLoading}>
  {isLoading ? 'Submitting...' : 'Submit'}
</button>
```

### 13. Error Boundary Component

**Purpose**: Catch and display React errors gracefully.

**Location**: `client/components/ErrorBoundary.jsx`

**Interface**:
```javascript
class ErrorBoundary extends React.Component {
  // Catches errors in child components
  // Displays fallback UI
  // Logs errors to console (or error tracking service)
}
```

### 14. Confirmation Dialog Component

**Purpose**: Confirm destructive actions before execution.

**Location**: `client/components/ConfirmDialog.jsx`

**Interface**:
```javascript
function ConfirmDialog({ 
  open, 
  title, 
  message, 
  onConfirm, 
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'warning' // 'warning' | 'danger'
}) {
  // Displays modal dialog
  // Calls onConfirm or onCancel based on user action
}
```

### 15. Pagination Component

**Purpose**: Paginate large data sets in admin panels.

**Location**: `client/components/Pagination.jsx`

**Interface**:
```javascript
function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage = 20
}) {
  // Displays page numbers and navigation
  // Calls onPageChange when page changes
}
```

## Data Models

### Enhanced User Model

**Location**: `server/models/User.js`

**Changes**:
- Add `passwordChangedAt` field for token invalidation
- Add `loginAttempts` and `lockUntil` for brute force protection
- Add `isVerified` and `verificationToken` for email verification
- Add indexes on email and role

```javascript
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['donor', 'ngo', 'admin'], required: true, index: true },
  phone: String,
  address: String,
  isVerified: { type: Boolean, default: false },
  verificationToken: String,
  passwordChangedAt: Date,
  loginAttempts: { type: Number, default: 0 },
  lockUntil: Date,
  createdAt: { type: Date, default: Date.now }
});
```

### Enhanced Donation Model

**Location**: `server/models/Donation.js`

**Changes**:
- Add validation for quantity (must be positive)
- Add index on status and expiryDate
- Add `acceptedAt` timestamp
- Add `cancelledAt` and `cancellationReason` fields

```javascript
const DonationSchema = new mongoose.Schema({
  donor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  foodType: { type: String, required: true },
  quantity: { 
    type: Number, 
    required: true,
    min: [0.01, 'Quantity must be positive']
  },
  unit: { type: String, enum: ['kg', 'liters', 'servings', 'items'], required: true },
  expiryDate: { type: Date, required: true },
  pickupLocation: {
    address: { type: String, required: true },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true }
    }
  },
  status: { 
    type: String, 
    enum: ['available', 'accepted', 'completed', 'cancelled', 'expired'], 
    default: 'available',
    index: true
  },
  acceptedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  acceptedAt: Date,
  completedAt: Date,
  cancelledAt: Date,
  cancellationReason: String,
  description: String,
  createdAt: { type: Date, default: Date.now, index: true }
});

// Add index for efficient queries
DonationSchema.index({ status: 1, expiryDate: 1 });
DonationSchema.index({ donor: 1, createdAt: -1 });
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

