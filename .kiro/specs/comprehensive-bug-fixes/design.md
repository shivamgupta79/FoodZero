# Design Document: Comprehensive Bug Fixes

## Overview

This design addresses 28 identified issues in the FoodZero application through systematic fixes organized by system layer. The fixes prioritize security vulnerabilities (authentication, input validation, CORS), then performance issues (database indexes, pagination), and finally developer experience improvements (logging, documentation, error handling).

The implementation strategy follows a layered approach:
1. **Foundation Layer**: Environment validation, logging infrastructure, error response standardization
2. **Security Layer**: Authentication hardening, input validation, rate limiting, CORS configuration
3. **Data Layer**: Database indexes, schema updates, duplicate prevention
4. **API Layer**: Pagination, request validation middleware, proper HTTP status codes
5. **Frontend Layer**: Error boundaries, null checks, loading states, geolocation handling
6. **Infrastructure Layer**: Socket.io cleanup, email integration, API documentation

This approach ensures that foundational fixes (like logging and error handling) are in place before implementing higher-level features, and that security fixes are prioritized appropriately.

## Architecture

### System Layers

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend Application                     │
│  (Next.js React - Error Boundaries, Validation, Loading)   │
└─────────────────────────┬───────────────────────────────────┘
                          │ HTTPS
┌─────────────────────────┴───────────────────────────────────┐
│                      API Gateway Layer                       │
│     (CORS, Rate Limiting, Request Validation, HTTPS)        │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────┴───────────────────────────────────┐
│                    Authentication Layer                      │
│        (JWT Validation, Secure Secrets, Middleware)         │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────┴───────────────────────────────────┐
│                     Business Logic Layer                     │
│   (Controllers, Services, Input Sanitization, Logging)      │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────┴───────────────────────────────────┐
│                      Database Layer                          │
│        (MongoDB with Indexes, Schema Validation)            │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    Socket.io Service                         │
│         (Real-time Notifications, Room Management)          │
└─────────────────────────────────────────────────────────────┘
```

### Fix Dependencies

The fixes have the following dependency relationships:

1. **Environment Validation** → Must be first (all other fixes depend on proper configuration)
2. **Logging Infrastructure** → Must be early (needed to verify other fixes)
3. **Error Response Standardization** → Must be before API fixes (provides consistent error handling)
4. **Input Validation Middleware** → Must be before business logic fixes (protects all endpoints)
5. **Database Indexes** → Independent (can be applied anytime)
6. **Authentication Fixes** → Must be before rate limiting (rate limiting needs auth context)
7. **Frontend Fixes** → Can be parallel with backend fixes

## Components and Interfaces

### 1. Environment Validator

**Purpose**: Validate required environment variables at application startup

**Location**: `server/config/envValidator.js`

**Interface**:
```javascript
function validateEnvironment() {
  // Returns: void
  // Throws: Error if validation fails
  // Side effects: Terminates process if required vars missing
}

const requiredVars = [
  'PORT',
  'MONGODB_URI', 
  'JWT_SECRET',
  'NODE_ENV',
  'FRONTEND_URL'
];

const optionalVars = [
  'CORS_ORIGINS',
  'RATE_LIMIT_WINDOW_MS',
  'RATE_LIMIT_MAX_REQUESTS',
  'EMAIL_SERVICE_API_KEY',
  'LOG_LEVEL'
];
```

**Validation Rules**:
- JWT_SECRET must be at least 32 characters
- MONGODB_URI must be valid MongoDB connection string format
- PORT must be valid integer between 1-65535
- NODE_ENV must be one of: development, production, test
- FRONTEND_URL must be valid URL format

### 2. Logger Service

**Purpose**: Centralized structured logging with multiple transports

**Location**: `server/services/logger.js`

**Interface**:
```javascript
class Logger {
  info(message, metadata)
  warn(message, metadata)
  error(message, metadata)
  debug(message, metadata)
}

// Usage
logger.info('User logged in', { userId, timestamp });
logger.error('Database connection failed', { error, connectionString });
```

**Configuration**:
- Uses Winston library
- Transports: Console (always), File (production only)
- Format: JSON in production, pretty-print in development
- Log levels: error, warn, info, debug
- Includes: timestamp, level, message, metadata, requestId (if available)

### 3. Request Logger Middleware

**Purpose**: Log all incoming HTTP requests

**Location**: `server/middleware/requestLogger.js`

**Interface**:
```javascript
function requestLogger(req, res, next) {
  // Logs: method, path, statusCode, responseTime, userId, ip
}
```

**Logged Fields**:
- Request ID (generated UUID)
- Timestamp
- HTTP method
- Request path
- Query parameters (sanitized)
- User ID (if authenticated)
- IP address
- User agent
- Response status code
- Response time (ms)

### 4. Error Response Formatter

**Purpose**: Standardize all API error responses

**Location**: `server/middleware/errorHandler.js`

**Interface**:
```javascript
class ApiError extends Error {
  constructor(statusCode, message, errorType) {
    this.statusCode = statusCode;
    this.message = message;
    this.errorType = errorType;
  }
}

function errorHandler(err, req, res, next) {
  // Returns standardized error response
}

// Success response helper
function successResponse(data, message = null) {
  return {
    success: true,
    data,
    message
  };
}

// Error response format
{
  success: false,
  error: 'VALIDATION_ERROR' | 'AUTH_ERROR' | 'NOT_FOUND' | 'SERVER_ERROR',
  message: 'Human readable message',
  details: {} // Optional field-specific errors
}
```

### 5. Input Validation Middleware

**Purpose**: Validate and sanitize all incoming requests

**Location**: `server/middleware/validator.js`

**Interface**:
```javascript
function validateRequest(schema) {
  // Returns Express middleware
  // Validates req.body, req.query, req.params against schema
}

// Uses Joi for schema validation
const donationSchema = Joi.object({
  foodType: Joi.string().required().trim(),
  quantity: Joi.number().positive().required(),
  location: Joi.object({
    latitude: Joi.number().min(-90).max(90).required(),
    longitude: Joi.number().min(-180).max(180).required()
  }).required()
});
```

**Sanitization**:
- Trim whitespace from strings
- Remove MongoDB operators ($, .) from object keys
- Escape HTML special characters
- Validate data types match schema

### 6. Input Sanitizer

**Purpose**: Prevent NoSQL injection and XSS attacks

**Location**: `server/utils/sanitizer.js`

**Interface**:
```javascript
function sanitizeObject(obj) {
  // Recursively removes MongoDB operators
  // Returns sanitized copy
}

function sanitizeString(str) {
  // Escapes HTML special characters
  // Returns sanitized string
}
```

**Sanitization Rules**:
- Remove keys starting with `$` (MongoDB operators)
- Remove keys containing `.` (nested property access)
- Escape `<`, `>`, `&`, `"`, `'` in string values
- Recursively process nested objects and arrays

### 7. Authentication Middleware (Fixed)

**Purpose**: Validate JWT tokens securely

**Location**: `server/middleware/auth.js`

**Current Issues**:
- Hardcoded "SECRET_KEY" fallback
- Logic error in token validation

**Fixed Implementation**:
```javascript
function authenticateToken(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    throw new ApiError(401, 'Authentication required', 'AUTH_ERROR');
  }
  
  try {
    // No fallback - JWT_SECRET validated at startup
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    throw new ApiError(401, 'Invalid or expired token', 'AUTH_ERROR');
  }
}
```

### 8. Rate Limiter Middleware

**Purpose**: Prevent brute force and DDoS attacks

**Location**: `server/middleware/rateLimiter.js`

**Interface**:
```javascript
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: 'Too many authentication attempts'
});

const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: 'Too many requests'
});

const feedbackRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: 'Too many feedback submissions'
});
```

**Configuration**:
- Uses express-rate-limit library
- Storage: Memory (development), Redis (production recommended)
- Key: IP address + user ID (if authenticated)
- Response: 429 status code with Retry-After header

### 9. CORS Configuration (Fixed)

**Purpose**: Restrict cross-origin requests to whitelisted domains

**Location**: `server/config/cors.js`

**Fixed Implementation**:
```javascript
const corsOptions = {
  origin: function (origin, callback) {
    const whitelist = process.env.CORS_ORIGINS?.split(',') || [];
    
    // Allow requests with no origin (mobile apps, Postman)
    if (!origin) return callback(null, true);
    
    if (whitelist.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};
```

### 10. Database Index Manager

**Purpose**: Create performance indexes on Donation model

**Location**: `server/models/Donation.js`

**Indexes to Add**:
```javascript
// Single field indexes
donationSchema.index({ status: 1 });
donationSchema.index({ createdAt: -1 });

// Compound indexes
donationSchema.index({ donorId: 1, status: 1 });
donationSchema.index({ ngoId: 1, status: 1 });

// Geospatial index for location-based queries
donationSchema.index({ location: '2dsphere' });
```

**Index Strategy**:
- Status index: Supports filtering by donation status
- Compound indexes: Optimize user-specific queries with status filter
- CreatedAt index: Supports time-based sorting and pagination
- Geospatial index: Enables location-based donation discovery

### 11. Donation Status Enum

**Purpose**: Enforce consistent status values across codebase

**Location**: `server/models/Donation.js`

**Implementation**:
```javascript
const DONATION_STATUS = {
  AVAILABLE: 'available',
  ACCEPTED: 'accepted',
  PICKED_UP: 'picked_up',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
};

const donationSchema = new Schema({
  status: {
    type: String,
    enum: Object.values(DONATION_STATUS),
    default: DONATION_STATUS.AVAILABLE
  }
});

// Export for use in controllers
module.exports = { Donation, DONATION_STATUS };
```

**Migration Strategy**:
- Update all controller files to import and use DONATION_STATUS
- Update all frontend components to use consistent status values
- Run data migration script to normalize existing database records

### 12. Duplicate Acceptance Prevention

**Purpose**: Prevent NGOs from accepting already-accepted donations

**Location**: `server/controllers/donationController.js`

**Implementation**:
```javascript
async function acceptDonation(req, res) {
  const { donationId } = req.params;
  const ngoId = req.user.id;
  
  // Use findOneAndUpdate with status condition
  const donation = await Donation.findOneAndUpdate(
    { 
      _id: donationId,
      status: DONATION_STATUS.AVAILABLE // Only update if available
    },
    { 
      status: DONATION_STATUS.ACCEPTED,
      ngoId: ngoId,
      acceptedAt: new Date()
    },
    { new: true }
  );
  
  if (!donation) {
    // Either doesn't exist or already accepted
    const existing = await Donation.findById(donationId);
    if (!existing) {
      throw new ApiError(404, 'Donation not found', 'NOT_FOUND');
    }
    throw new ApiError(409, 'Donation already accepted', 'CONFLICT');
  }
  
  return successResponse(donation, 'Donation accepted successfully');
}
```

### 13. Pagination Helper

**Purpose**: Standardize pagination across list endpoints

**Location**: `server/utils/pagination.js`

**Interface**:
```javascript
function paginate(query, page = 1, limit = 20) {
  const maxLimit = 100;
  const sanitizedLimit = Math.min(limit, maxLimit);
  const skip = (page - 1) * sanitizedLimit;
  
  return {
    query: query.skip(skip).limit(sanitizedLimit),
    skip,
    limit: sanitizedLimit
  };
}

async function paginatedResponse(model, filter, page, limit, sort = {}) {
  const total = await model.countDocuments(filter);
  const { query, limit: sanitizedLimit } = paginate(
    model.find(filter).sort(sort),
    page,
    limit
  );
  const results = await query;
  
  return {
    results,
    pagination: {
      total,
      page: parseInt(page),
      limit: sanitizedLimit,
      totalPages: Math.ceil(total / sanitizedLimit),
      hasNextPage: page * sanitizedLimit < total,
      hasPrevPage: page > 1
    }
  };
}
```

### 14. Password Validation

**Purpose**: Enforce strong password requirements

**Location**: `server/utils/passwordValidator.js`

**Implementation**:
```javascript
function validatePassword(password) {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  const errors = [];
  if (password.length < minLength) {
    errors.push(`Password must be at least ${minLength} characters`);
  }
  if (!hasUpperCase) errors.push('Password must contain uppercase letter');
  if (!hasLowerCase) errors.push('Password must contain lowercase letter');
  if (!hasNumber) errors.push('Password must contain number');
  if (!hasSpecialChar) errors.push('Password must contain special character');
  
  return {
    valid: errors.length === 0,
    errors
  };
}
```

### 15. Frontend Error Boundary

**Purpose**: Catch and handle React component errors gracefully

**Location**: `client/components/ErrorBoundary.jsx`

**Implementation**:
```javascript
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error, errorInfo) {
    // Log to error reporting service
    console.error('Error boundary caught:', error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="error-container">
          <h2>Something went wrong</h2>
          <p>We're sorry for the inconvenience.</p>
          <button onClick={() => window.location.href = '/'}>
            Return Home
          </button>
          <button onClick={() => this.setState({ hasError: false })}>
            Try Again
          </button>
        </div>
      );
    }
    
    return this.props.children;
  }
}
```

### 16. Frontend Loading State Hook

**Purpose**: Standardize loading state management

**Location**: `client/hooks/useAsync.js`

**Implementation**:
```javascript
function useAsync(asyncFunction) {
  const [state, setState] = useState({
    loading: false,
    data: null,
    error: null
  });
  
  const execute = useCallback(async (...params) => {
    setState({ loading: true, data: null, error: null });
    try {
      const data = await asyncFunction(...params);
      setState({ loading: false, data, error: null });
      return data;
    } catch (error) {
      setState({ loading: false, data: null, error });
      throw error;
    }
  }, [asyncFunction]);
  
  return { ...state, execute };
}
```

### 17. Socket.io Connection Manager (Fixed)

**Purpose**: Properly manage Socket.io connections and prevent memory leaks

**Location**: `server/services/socketService.js`

**Fixed Implementation**:
```javascript
class SocketService {
  constructor(io) {
    this.io = io;
    this.userSockets = new Map(); // userId -> Set of socket IDs
  }
  
  handleConnection(socket) {
    const userId = socket.handshake.auth.userId;
    
    // Track user's sockets
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }
    this.userSockets.get(userId).add(socket.id);
    
    // Join user-specific room
    socket.join(`user:${userId}`);
    
    socket.on('disconnect', () => {
      this.handleDisconnect(socket, userId);
    });
  }
  
  handleDisconnect(socket, userId) {
    // Remove from tracking
    const userSocketSet = this.userSockets.get(userId);
    if (userSocketSet) {
      userSocketSet.delete(socket.id);
      if (userSocketSet.size === 0) {
        this.userSockets.delete(userId);
      }
    }
    
    // Leave all rooms
    socket.rooms.forEach(room => {
      socket.leave(room);
    });
    
    logger.info('Socket disconnected', { socketId: socket.id, userId });
  }
  
  notifyUser(userId, event, data) {
    this.io.to(`user:${userId}`).emit(event, data);
  }
}
```

### 18. Email Service

**Purpose**: Send verification emails and OTP codes

**Location**: `server/services/emailService.js`

**Interface**:
```javascript
class EmailService {
  async sendVerificationEmail(email, token) {
    // Sends email with verification link
  }
  
  async sendOTP(email, otp) {
    // Sends email with OTP code
  }
  
  generateOTP() {
    // Returns 6-digit cryptographically secure random number
    return crypto.randomInt(100000, 999999).toString();
  }
}
```

**OTP Storage**:
```javascript
const otpSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, required: true },
  otp: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  attempts: { type: Number, default: 0 },
  verified: { type: Boolean, default: false }
});

otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
```

### 19. API Documentation Setup

**Purpose**: Generate interactive API documentation

**Location**: `server/config/swagger.js`

**Implementation**:
```javascript
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'FoodZero API',
      version: '1.0.0',
      description: 'Food donation platform API documentation'
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:5000',
        description: 'API Server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: ['./routes/*.js', './models/*.js']
};

const specs = swaggerJsdoc(options);

// Usage in server.js
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
```

**Documentation Annotations Example**:
```javascript
/**
 * @swagger
 * /api/donations:
 *   get:
 *     summary: Get paginated list of donations
 *     tags: [Donations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 */
```

## Data Models

### Updated Donation Model

```javascript
const donationSchema = new Schema({
  donorId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  ngoId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  foodType: {
    type: String,
    required: true,
    trim: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  status: {
    type: String,
    enum: ['available', 'accepted', 'picked_up', 'delivered', 'cancelled'],
    default: 'available',
    index: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  acceptedAt: Date,
  pickedUpAt: Date,
  deliveredAt: Date
}, {
  timestamps: true // Adds createdAt and updatedAt
});

// Compound indexes
donationSchema.index({ donorId: 1, status: 1 });
donationSchema.index({ ngoId: 1, status: 1 });
donationSchema.index({ location: '2dsphere' });
donationSchema.index({ createdAt: -1 });
```

### Updated Tracking Model

```javascript
const trackingSchema = new Schema({
  donationId: {
    type: Schema.Types.ObjectId,
    ref: 'Donation',
    required: true
  },
  status: {
    type: String,
    required: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: [Number]
  },
  notes: String
}, {
  timestamps: true // Adds createdAt and updatedAt
});
```

### OTP Model (New)

```javascript
const otpSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  otp: {
    type: String,
    required: true
  },
  purpose: {
    type: String,
    enum: ['email_verification', 'password_reset', 'login'],
    required: true
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expireAfterSeconds: 0 }
  },
  attempts: {
    type: Number,
    default: 0,
    max: 3
  },
  verified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

otpSchema.index({ userId: 1, purpose: 1, verified: false });
```

### Updated User Model

```javascript
const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  role: {
    type: String,
    enum: ['donor', 'ngo', 'admin'],
    required: true
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  verificationTokenExpires: Date
}, {
  timestamps: true
});
```

## Correctness Properties


A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

### Property Reflection

After analyzing all acceptance criteria, the following redundancies were identified and consolidated:

- **Requirement 1.1 and 1.2**: Both test environment validation at startup. Combined into Property 1.
- **Requirement 8.5 and 8.6**: Both test loading state display. 8.6 is redundant with 8.5.
- **Requirement 10.1 and 10.2**: Both test cleanup on disconnect. Combined into Property 18.
- **Rate limiting criteria 3.2, 3.3, 3.4**: All test rate limiting behavior. Consolidated into examples rather than separate properties.
- **Database index criteria 4.1-4.4**: All test index existence. Grouped as examples rather than properties.

### Authentication and Security Properties

**Property 1: Environment validation at startup**
*For any* system startup attempt, if JWT_SECRET is missing or less than 32 characters, the system should terminate with a descriptive error message before accepting any requests.
**Validates: Requirements 1.1, 1.2**

**Property 2: No hardcoded authentication secrets**
*For any* authentication attempt without a valid JWT_SECRET environment variable, the authentication should fail rather than falling back to a hardcoded secret.
**Validates: Requirements 1.3**

**Property 3: JWT token validation correctness**
*For any* JWT token, the authentication middleware should accept it if and only if it was signed with the current JWT_SECRET and has not expired.
**Validates: Requirements 1.4**

**Property 4: Authentication failure status codes**
*For any* authentication request with invalid credentials, the API should return HTTP status code 401, and for any malformed authentication request, the API should return HTTP status code 400.
**Validates: Requirements 1.5, 1.6**

### Input Validation Properties

**Property 5: Universal request validation**
*For any* API request, the system should validate the request body, query parameters, and path parameters against the defined schema before processing.
**Validates: Requirements 2.1**

**Property 6: Validation failure response format**
*For any* request that fails validation, the API should return HTTP status code 400 with a response containing {success: false, error, message} and field-specific error details.
**Validates: Requirements 2.2, 6.4**

**Property 7: NoSQL injection prevention**
*For any* user input containing MongoDB operators (keys starting with $ or containing .), the system should sanitize the input by removing these operators before executing database queries.
**Validates: Requirements 2.3**

**Property 8: XSS prevention**
*For any* user input containing HTML special characters (<, >, &, ", '), the system should escape these characters before storing or returning the data.
**Validates: Requirements 2.4**

**Property 9: Donation data validation**
*For any* donation creation request, the system should validate that all required fields (foodType, quantity, location) exist and conform to expected types (string, positive number, valid coordinates).
**Validates: Requirements 2.5**

**Property 10: Password complexity enforcement**
*For any* password submitted during registration, the system should accept it if and only if it has at least 8 characters with at least one uppercase letter, one lowercase letter, one number, and one special character.
**Validates: Requirements 2.6**

### API Security Properties

**Property 11: CORS origin restriction**
*For any* cross-origin request, the API should accept it if and only if the origin is in the CORS_ORIGINS whitelist or the request has no origin header.
**Validates: Requirements 3.1**

**Property 12: Rate limit enforcement**
*For any* IP address or user that exceeds the configured rate limit for an endpoint, the API should return HTTP status code 429 and reject subsequent requests until the time window resets.
**Validates: Requirements 3.5**

**Property 13: Security headers presence**
*For any* API response, the response should include security headers: Strict-Transport-Security, X-Content-Type-Options, X-Frame-Options, and Content-Security-Policy.
**Validates: Requirements 3.7**

### Database Properties

**Property 14: Tracking model timestamp updates**
*For any* tracking record update, the updatedAt field should automatically be set to the current timestamp.
**Validates: Requirements 4.5**

**Property 15: Duplicate donation acceptance prevention**
*For any* donation that is already accepted, when an NGO attempts to accept it, the system should return HTTP status code 409 and not modify the donation.
**Validates: Requirements 4.6, 4.7**

**Property 16: Donation status enum enforcement**
*For any* attempt to create or update a donation with a status value not in the enum ["available", "accepted", "picked_up", "delivered", "cancelled"], the database should reject the operation.
**Validates: Requirements 5.2**

**Property 17: Case-sensitive status matching**
*For any* donation status query, the system should only return donations where the status exactly matches the query value (case-sensitive).
**Validates: Requirements 5.5**

### API Response Properties

**Property 18: Success response format**
*For any* successful API request, the response should have the format {success: true, data: <result>, message: <optional>} with appropriate Content-Type header.
**Validates: Requirements 6.1, 6.5**

**Property 19: Error response format**
*For any* failed API request, the response should have the format {success: false, error: <error_type>, message: <description>} with appropriate Content-Type header.
**Validates: Requirements 6.2, 6.5**

**Property 20: No sensitive data in error messages**
*For any* error response in production mode, the message should not contain database connection strings, file system paths, or stack traces.
**Validates: Requirements 6.3**

### Pagination Properties

**Property 21: Pagination parameter handling**
*For any* list endpoint request, the system should accept page and limit query parameters, defaulting to page=1 and limit=20, and capping limit at maximum 100.
**Validates: Requirements 7.1**

**Property 22: Pagination metadata format**
*For any* paginated response, the response should include metadata with fields: total, page, limit, totalPages, hasNextPage, hasPrevPage.
**Validates: Requirements 7.2**

### Frontend Properties

**Property 23: Error boundary error display**
*For any* rendering error caught by an error boundary, the frontend should display a user-friendly error message with options to retry or return home, rather than crashing.
**Validates: Requirements 8.2**

**Property 24: API error message display**
*For any* failed API request, the frontend should display a specific error message to the user based on the error response.
**Validates: Requirements 8.4**

**Property 25: Loading state display**
*For any* asynchronous operation (API request, data loading), the frontend should display a loading indicator while the operation is in progress.
**Validates: Requirements 8.5**

**Property 26: Geolocation data transmission**
*For any* donation creation request from the frontend, the request payload should include location coordinates obtained from the browser Geolocation API.
**Validates: Requirements 9.2**

**Property 27: Location storage format**
*For any* donation with location data, the database should store the location in GeoJSON format with type "Point" and coordinates array [longitude, latitude].
**Validates: Requirements 9.5**

### Socket.io Properties

**Property 28: Socket cleanup on disconnect**
*For any* user disconnect event, the Socket service should remove the user from all rooms and clean up all user-specific data structures.
**Validates: Requirements 10.1, 10.2**

**Property 29: Socket event logging**
*For any* socket connection or disconnection event, the system should create a log entry with timestamp, socket ID, and user ID.
**Validates: Requirements 10.4**

**Property 30: Room existence verification**
*For any* notification emission to a room, the Socket service should verify the room exists before emitting the event.
**Validates: Requirements 10.5**

### Configuration Properties

**Property 31: Required environment variable validation**
*For any* system startup, if any required environment variable (PORT, MONGODB_URI, JWT_SECRET, NODE_ENV, FRONTEND_URL) is missing, the system should terminate with an error listing all missing variables.
**Validates: Requirements 11.1, 11.2**

### Logging Properties

**Property 32: API request logging**
*For any* API request, the system should create a log entry containing timestamp, method, path, status code, response time, and user ID (if authenticated).
**Validates: Requirements 12.2**

**Property 33: Authentication event logging**
*For any* authentication event (login attempt, token validation failure, logout), the system should create a log entry with event type and relevant context.
**Validates: Requirements 12.3**

**Property 34: Error event logging**
*For any* error, the system should create a log entry containing timestamp, error type, error message, and request context (stack trace only in development mode).
**Validates: Requirements 12.4**

**Property 35: Log level configuration**
*For any* log message, the system should only output it if its level (error, warn, info, debug) is at or above the configured log level.
**Validates: Requirements 12.5**

### Email and OTP Properties

**Property 36: Registration email sending**
*For any* user registration, the system should send a verification email to the user's email address with a unique verification token.
**Validates: Requirements 13.2**

**Property 37: OTP generation security**
*For any* OTP generation request, the system should generate a cryptographically secure random 6-digit number.
**Validates: Requirements 13.3**

**Property 38: OTP delivery**
*For any* OTP request, the system should send the OTP via email to the user's registered email address.
**Validates: Requirements 13.4**

**Property 39: OTP expiration**
*For any* OTP, after 10 minutes from generation, the system should reject verification attempts with that OTP.
**Validates: Requirements 13.5**

**Property 40: OTP single-use enforcement**
*For any* OTP that has been successfully verified, subsequent verification attempts with the same OTP should be rejected.
**Validates: Requirements 13.7**

### Documentation Properties

**Property 41: API documentation completeness**
*For any* API endpoint, the documentation should include description, request parameters, request body schema, response schema, authentication requirements, and example requests/responses.
**Validates: Requirements 14.3**

### Backward Compatibility Properties

**Property 42: API endpoint compatibility**
*For any* existing API endpoint, after bug fixes are applied, the endpoint path and request format should remain unchanged.
**Validates: Requirements 15.1**

**Property 43: Response format compatibility**
*For any* API endpoint, after bug fixes are applied, the response format should remain compatible with the previous format or be versioned.
**Validates: Requirements 15.2**

## Error Handling

### Error Classification

All errors are classified into the following categories:

1. **Validation Errors** (400)
   - Invalid request format
   - Missing required fields
   - Type mismatches
   - Constraint violations

2. **Authentication Errors** (401)
   - Missing token
   - Invalid token
   - Expired token
   - Invalid credentials

3. **Authorization Errors** (403)
   - Insufficient permissions
   - Resource access denied

4. **Not Found Errors** (404)
   - Resource does not exist
   - Endpoint not found

5. **Conflict Errors** (409)
   - Duplicate resource
   - State conflict (e.g., donation already accepted)

6. **Rate Limit Errors** (429)
   - Too many requests
   - Rate limit exceeded

7. **Server Errors** (500)
   - Database connection failures
   - Unexpected exceptions
   - Third-party service failures

### Error Response Format

All errors follow the standardized format:

```javascript
{
  success: false,
  error: 'ERROR_TYPE',
  message: 'Human-readable description',
  details: {
    // Optional field-specific errors for validation
    field: 'error message'
  }
}
```

### Error Handling Strategy

1. **Input Validation**: Validate early at the API boundary before business logic
2. **Sanitization**: Sanitize all inputs before database operations
3. **Graceful Degradation**: Log errors and return user-friendly messages
4. **Security**: Never expose sensitive information in error messages (production)
5. **Logging**: Log all errors with full context for debugging
6. **Recovery**: Provide actionable error messages to help users recover

### Frontend Error Handling

1. **Error Boundaries**: Catch React rendering errors and display fallback UI
2. **API Error Display**: Show specific error messages from API responses
3. **Null Safety**: Check for null/undefined before accessing nested properties
4. **Loading States**: Show loading indicators during async operations
5. **Retry Mechanisms**: Provide retry options for failed operations

## Testing Strategy

### Dual Testing Approach

The testing strategy employs both unit tests and property-based tests as complementary approaches:

- **Unit Tests**: Verify specific examples, edge cases, and error conditions
- **Property Tests**: Verify universal properties across all inputs

Both are necessary for comprehensive coverage. Unit tests catch concrete bugs in specific scenarios, while property tests verify general correctness across a wide range of inputs.

### Property-Based Testing Configuration

**Library Selection**: Use `fast-check` for JavaScript/TypeScript property-based testing

**Test Configuration**:
- Minimum 100 iterations per property test (due to randomization)
- Each property test must reference its design document property
- Tag format: `// Feature: comprehensive-bug-fixes, Property {number}: {property_text}`

**Example Property Test**:
```javascript
// Feature: comprehensive-bug-fixes, Property 7: NoSQL injection prevention
test('sanitizes MongoDB operators from all inputs', () => {
  fc.assert(
    fc.property(
      fc.object(), // Generate random objects
      (input) => {
        const sanitized = sanitizeObject(input);
        const hasOperators = JSON.stringify(sanitized).includes('$');
        expect(hasOperators).toBe(false);
      }
    ),
    { numRuns: 100 }
  );
});
```

### Unit Testing Focus

Unit tests should focus on:

1. **Specific Examples**: Concrete test cases demonstrating correct behavior
2. **Edge Cases**: Boundary conditions, empty inputs, maximum values
3. **Error Conditions**: Invalid inputs, missing data, constraint violations
4. **Integration Points**: Component interactions, API contracts
5. **Configuration**: Rate limits, environment validation, specific thresholds

**Example Unit Test**:
```javascript
// Test specific rate limit threshold
test('auth endpoint rejects 101st request within 15 minutes', async () => {
  const requests = Array(101).fill().map(() => 
    request(app).post('/api/auth/login').send(credentials)
  );
  
  const responses = await Promise.all(requests);
  const lastResponse = responses[100];
  
  expect(lastResponse.status).toBe(429);
  expect(lastResponse.body.error).toBe('RATE_LIMIT_ERROR');
});
```

### Test Coverage Requirements

1. **Authentication**: Token validation, secret handling, status codes
2. **Input Validation**: Schema validation, sanitization, error responses
3. **Security**: CORS, rate limiting, HTTPS enforcement, security headers
4. **Database**: Indexes, duplicate prevention, status enum, timestamps
5. **API Responses**: Format standardization, error handling, pagination
6. **Frontend**: Error boundaries, loading states, null checks
7. **Socket.io**: Connection cleanup, room management, event logging
8. **Configuration**: Environment validation, logging, email integration
9. **Backward Compatibility**: Existing endpoints, response formats

### Testing Execution

1. **Pre-commit**: Run unit tests and linting
2. **CI/CD Pipeline**: Run full test suite including property tests
3. **Manual Testing**: Test UI flows, email delivery, real-time notifications
4. **Performance Testing**: Verify database indexes improve query performance
5. **Security Testing**: Verify injection prevention, rate limiting effectiveness

### Migration Testing

For database schema changes:

1. Create test database with existing data format
2. Run migration script
3. Verify all data migrated correctly
4. Verify application works with migrated data
5. Test rollback procedure

### Regression Testing

After each bug fix:

1. Run existing test suite to verify no regressions
2. Add new tests for the fixed bug
3. Verify related functionality still works
4. Check API contracts remain unchanged
5. Test frontend integration with backend changes
