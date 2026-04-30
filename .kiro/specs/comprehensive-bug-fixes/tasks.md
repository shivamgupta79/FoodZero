# Implementation Plan: Comprehensive Bug Fixes

## Overview

This implementation plan systematically addresses 28 identified issues in the FoodZero application. The fixes are organized in dependency order, starting with foundational infrastructure (environment validation, logging, error handling), then security fixes (authentication, input validation, CORS), followed by database improvements, API enhancements, and finally frontend fixes.

The implementation follows a layered approach to ensure that foundational components are in place before building higher-level features. Each task includes specific file references and builds incrementally on previous work.

## Tasks

- [ ] 1. Set up foundational infrastructure
  - [ ] 1.1 Create environment validator module
    - Create `server/config/envValidator.js`
    - Implement validation for required variables: PORT, MONGODB_URI, JWT_SECRET, NODE_ENV, FRONTEND_URL
    - Validate JWT_SECRET is at least 32 characters
    - Validate MONGODB_URI format, PORT range, NODE_ENV enum
    - Call validator at the start of `server/server.js` before any other initialization
    - _Requirements: 1.1, 1.2, 11.1, 11.2, 11.3_
  
  - [ ]* 1.2 Write property test for environment validation
    - **Property 1: Environment validation at startup**
    - **Property 31: Required environment variable validation**
    - **Validates: Requirements 1.1, 1.2, 11.1, 11.2**
  
  - [ ] 1.3 Create .env.example file
    - Document all required and optional environment variables
    - Include descriptions and example values
    - Add CORS_ORIGINS, RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX_REQUESTS, EMAIL_SERVICE_API_KEY, LOG_LEVEL
    - _Requirements: 11.5_
  
  - [ ] 1.4 Set up Winston logging service
    - Install Winston: `npm install winston`
    - Create `server/services/logger.js`
    - Configure transports: Console (always), File (production)
    - Set up log levels: error, warn, info, debug
    - Use JSON format in production, pretty-print in development
    - Default to info level in production
    - _Requirements: 12.1, 12.5, 12.6, 12.7_
  
  - [ ]* 1.5 Write property tests for logging service
    - **Property 35: Log level configuration**
    - **Validates: Requirements 12.5**
  
  - [ ] 1.6 Create request logger middleware
    - Create `server/middleware/requestLogger.js`
    - Generate UUID for each request
    - Log: timestamp, method, path, query params, userId, IP, user agent
    - Capture response status code and time using response finish event
    - Integrate into `server/server.js` before routes
    - _Requirements: 12.2, 12.3_
  
  - [ ]* 1.7 Write property test for request logging
    - **Property 32: API request logging**
    - **Validates: Requirements 12.2**

- [ ] 2. Standardize error handling
  - [ ] 2.1 Create error response formatter
    - Create `server/middleware/errorHandler.js`
    - Implement ApiError class with statusCode, message, errorType
    - Implement global error handler middleware
    - Create successResponse helper function
    - Filter sensitive data from error messages in production (no stack traces, connection strings, file paths)
    - _Requirements: 6.1, 6.2, 6.3, 6.5_
  
  - [ ]* 2.2 Write property tests for error response format
    - **Property 18: Success response format**
    - **Property 19: Error response format**
    - **Property 20: No sensitive data in error messages**
    - **Validates: Requirements 6.1, 6.2, 6.3, 6.5**
  
  - [ ] 2.3 Update server.js to use new error handler
    - Replace existing global error handler with new errorHandler middleware
    - Update 404 handler to use standardized format
    - Add error logging using logger service
    - _Requirements: 6.1, 6.2, 12.4_
  
  - [ ]* 2.4 Write property test for error event logging
    - **Property 34: Error event logging**
    - **Validates: Requirements 12.4**

- [ ] 3. Fix authentication security vulnerabilities
  - [ ] 3.1 Remove hardcoded JWT secret fallbacks
    - Update `server/middleware/auth.js` to remove "SECRET_KEY" fallback
    - Use only process.env.JWT_SECRET (validated at startup)
    - Update `server/controllers/authController.js` to remove any fallbacks
    - Fix token validation logic to prevent security bypass
    - _Requirements: 1.3, 1.4_
  
  - [ ]* 3.2 Write property tests for authentication
    - **Property 2: No hardcoded authentication secrets**
    - **Property 3: JWT token validation correctness**
    - **Validates: Requirements 1.3, 1.4**
  
  - [ ] 3.3 Fix authentication HTTP status codes
    - Update auth middleware to return 401 for invalid/missing tokens
    - Update authController login to return 401 for invalid credentials (not 400)
    - Return 400 only for malformed requests (missing required fields)
    - Use ApiError class for consistent error responses
    - _Requirements: 1.5, 1.6_
  
  - [ ]* 3.4 Write property test for authentication status codes
    - **Property 4: Authentication failure status codes**
    - **Validates: Requirements 1.5, 1.6**
  
  - [ ]* 3.5 Write property test for authentication event logging
    - **Property 33: Authentication event logging**
    - **Validates: Requirements 12.3**

- [ ] 4. Implement input validation and sanitization
  - [ ] 4.1 Create input sanitizer utility
    - Install dependencies: `npm install joi`
    - Create `server/utils/sanitizer.js`
    - Implement sanitizeObject to remove MongoDB operators ($, .)
    - Implement sanitizeString to escape HTML special characters
    - Handle nested objects and arrays recursively
    - _Requirements: 2.3, 2.4_
  
  - [ ]* 4.2 Write property tests for sanitization
    - **Property 7: NoSQL injection prevention**
    - **Property 8: XSS prevention**
    - **Validates: Requirements 2.3, 2.4**
  
  - [ ] 4.3 Create request validation middleware
    - Create `server/middleware/validator.js`
    - Implement validateRequest function that accepts Joi schema
    - Validate req.body, req.query, req.params
    - Return 400 with field-specific errors on validation failure
    - Apply sanitization after validation
    - _Requirements: 2.1, 2.2_
  
  - [ ]* 4.4 Write property tests for validation middleware
    - **Property 5: Universal request validation**
    - **Property 6: Validation failure response format**
    - **Validates: Requirements 2.1, 2.2, 6.4**
  
  - [ ] 4.5 Create validation schemas for all endpoints
    - Create `server/schemas/donationSchema.js` with foodType, quantity, location validation
    - Create `server/schemas/userSchema.js` with email, password, role validation
    - Create `server/schemas/authSchema.js` for login/register
    - Apply schemas to routes using validateRequest middleware
    - _Requirements: 2.5_
  
  - [ ]* 4.6 Write property test for donation validation
    - **Property 9: Donation data validation**
    - **Validates: Requirements 2.5**
  
  - [ ] 4.7 Implement password validation utility
    - Create `server/utils/passwordValidator.js`
    - Enforce minimum 8 characters, uppercase, lowercase, number, special character
    - Return detailed validation errors
    - Integrate into user registration schema
    - _Requirements: 2.6_
  
  - [ ]* 4.8 Write property test for password validation
    - **Property 10: Password complexity enforcement**
    - **Validates: Requirements 2.6**

- [ ] 5. Configure API security
  - [ ] 5.1 Fix CORS configuration
    - Update `server/server.js` CORS configuration
    - Read whitelist from process.env.CORS_ORIGINS (comma-separated)
    - Implement origin validation function
    - Allow requests with no origin (mobile apps, Postman)
    - Enable credentials: true
    - _Requirements: 3.1_
  
  - [ ]* 5.2 Write property test for CORS
    - **Property 11: CORS origin restriction**
    - **Validates: Requirements 3.1**
  
  - [ ] 5.3 Implement rate limiting
    - Install express-rate-limit: `npm install express-rate-limit`
    - Create `server/middleware/rateLimiter.js`
    - Configure authRateLimiter: 100 requests per 15 minutes
    - Configure apiRateLimiter: 1000 requests per 15 minutes
    - Configure feedbackRateLimiter: 5 requests per hour
    - Apply to appropriate routes in server.js
    - Return 429 status code with Retry-After header
    - _Requirements: 3.2, 3.3, 3.4, 3.5_
  
  - [ ]* 5.4 Write unit tests for rate limiting
    - Test auth endpoint rejects 101st request
    - Test API endpoint rejects 1001st request
    - Test feedback endpoint rejects 6th request
    - **Validates: Requirements 3.2, 3.3, 3.4**
  
  - [ ]* 5.5 Write property test for rate limit status code
    - **Property 12: Rate limit enforcement**
    - **Validates: Requirements 3.5**
  
  - [ ] 5.6 Add security headers
    - Install helmet: `npm install helmet`
    - Add helmet middleware to server.js
    - Configure Strict-Transport-Security, X-Content-Type-Options, X-Frame-Options, Content-Security-Policy
    - _Requirements: 3.7_
  
  - [ ]* 5.7 Write property test for security headers
    - **Property 13: Security headers presence**
    - **Validates: Requirements 3.7**
  
  - [ ] 5.8 Implement HTTPS enforcement for production
    - Create `server/middleware/httpsRedirect.js`
    - Check NODE_ENV === 'production' and req.protocol !== 'https'
    - Redirect HTTP to HTTPS with 301 status
    - Apply middleware in server.js before routes
    - _Requirements: 3.6_
  
  - [ ]* 5.9 Write unit test for HTTPS enforcement
    - **Validates: Requirements 3.6**

- [ ] 6. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. Update database models and add indexes
  - [ ] 7.1 Update Donation model with indexes
    - Update `server/models/Donation.js`
    - Add single field indexes: status, createdAt
    - Add compound indexes: (donorId, status), (ngoId, status)
    - Add geospatial index: location (2dsphere)
    - Ensure timestamps: true is set for createdAt/updatedAt
    - _Requirements: 4.1, 4.2, 4.3, 4.4_
  
  - [ ]* 7.2 Write unit tests for database indexes
    - Verify indexes exist using collection.getIndexes()
    - **Validates: Requirements 4.1, 4.2, 4.3, 4.4**
  
  - [ ] 7.3 Define and enforce donation status enum
    - Create DONATION_STATUS constant object in Donation model
    - Define enum: available, accepted, picked_up, delivered, cancelled
    - Add enum constraint to status field in schema
    - Export DONATION_STATUS for use in controllers
    - _Requirements: 5.1, 5.2_
  
  - [ ]* 7.4 Write property test for status enum enforcement
    - **Property 16: Donation status enum enforcement**
    - **Validates: Requirements 5.2**
  
  - [ ] 7.5 Update all controllers to use DONATION_STATUS enum
    - Update `server/controllers/donationController.js`
    - Update `server/controllers/ngoController.js`
    - Update `server/controllers/adminController.js`
    - Replace all hardcoded status strings with DONATION_STATUS constants
    - _Requirements: 5.3, 5.4_
  
  - [ ]* 7.6 Write property test for case-sensitive status matching
    - **Property 17: Case-sensitive status matching**
    - **Validates: Requirements 5.5**
  
  - [ ] 7.7 Update Tracking model with timestamps
    - Update `server/models/Tracking.js`
    - Add timestamps: true to schema options
    - Verify updatedAt field is automatically managed
    - _Requirements: 4.5_
  
  - [ ]* 7.8 Write property test for tracking timestamps
    - **Property 14: Tracking model timestamp updates**
    - **Validates: Requirements 4.5**
  
  - [ ] 7.9 Create OTP model
    - Create `server/models/OTP.js`
    - Define schema: userId, otp, purpose (enum), expiresAt, attempts, verified
    - Add TTL index on expiresAt with expireAfterSeconds: 0
    - Add compound index: (userId, purpose, verified)
    - _Requirements: 13.5, 13.6_
  
  - [ ] 7.10 Update User model for email verification
    - Update `server/models/User.js`
    - Add fields: emailVerified (boolean), verificationToken, verificationTokenExpires
    - Ensure timestamps: true is set
    - _Requirements: 13.2_

- [ ] 8. Implement duplicate donation acceptance prevention
  - [ ] 8.1 Fix acceptDonation controller logic
    - Update `server/controllers/donationController.js` or `ngoController.js`
    - Use findOneAndUpdate with status: DONATION_STATUS.AVAILABLE condition
    - If update returns null, check if donation exists
    - Return 404 if not found, 409 if already accepted
    - Add acceptedAt timestamp when accepting
    - _Requirements: 4.6, 4.7_
  
  - [ ]* 8.2 Write property test for duplicate prevention
    - **Property 15: Duplicate donation acceptance prevention**
    - **Validates: Requirements 4.6, 4.7**

- [ ] 9. Implement pagination for list endpoints
  - [ ] 9.1 Create pagination utility
    - Create `server/utils/pagination.js`
    - Implement paginate function with page, limit parameters
    - Implement paginatedResponse function with metadata
    - Default page=1, limit=20, max limit=100
    - Return metadata: total, page, limit, totalPages, hasNextPage, hasPrevPage
    - _Requirements: 7.1, 7.2_
  
  - [ ]* 9.2 Write property tests for pagination
    - **Property 21: Pagination parameter handling**
    - **Property 22: Pagination metadata format**
    - **Validates: Requirements 7.1, 7.2**
  
  - [ ] 9.3 Add pagination to GET /donations endpoint
    - Update donationController.js getDonations function
    - Accept page and limit query parameters
    - Use paginatedResponse utility
    - Return results with pagination metadata
    - _Requirements: 7.3_
  
  - [ ] 9.4 Add pagination to GET /users endpoint (admin)
    - Update adminController.js getUsers function
    - Accept page and limit query parameters
    - Use paginatedResponse utility
    - _Requirements: 7.4_
  
  - [ ] 9.5 Add pagination to GET /ngos endpoint
    - Update ngoController.js or adminController.js getNGOs function
    - Accept page and limit query parameters
    - Use paginatedResponse utility
    - _Requirements: 7.5_
  
  - [ ]* 9.6 Write unit test for pagination edge case
    - Test requesting page beyond available data returns empty array
    - **Validates: Requirements 7.6**

- [ ] 10. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 11. Implement frontend error handling
  - [ ] 11.1 Create ErrorBoundary component
    - Create `client/components/ErrorBoundary.jsx`
    - Implement getDerivedStateFromError and componentDidCatch
    - Display user-friendly error message with retry and home buttons
    - Log errors to console (or error reporting service)
    - _Requirements: 8.1, 8.2_
  
  - [ ]* 11.2 Write property test for error boundary
    - **Property 23: Error boundary error display**
    - **Validates: Requirements 8.2**
  
  - [ ] 11.3 Wrap application with ErrorBoundary
    - Update `client/app/layout.jsx` or main app component
    - Wrap major component trees with ErrorBoundary
    - Apply to donor dashboard, NGO dashboard, admin dashboard
    - _Requirements: 8.1_
  
  - [ ] 11.4 Create useAsync hook for loading states
    - Create `client/hooks/useAsync.js`
    - Manage loading, data, error state
    - Provide execute function for async operations
    - _Requirements: 8.5_
  
  - [ ]* 11.5 Write property test for loading states
    - **Property 25: Loading state display**
    - **Validates: Requirements 8.5**
  
  - [ ] 11.6 Add null checks to frontend components
    - Review and update `client/app/donor/dashboard/page.jsx`
    - Review and update `client/app/ngo/dashboard/page.jsx`
    - Review and update `client/app/admin/*/page.jsx` files
    - Add optional chaining (?.) and nullish coalescing (??) operators
    - Add default values for potentially undefined data
    - _Requirements: 8.3_
  
  - [ ] 11.7 Implement API error message display
    - Update axios interceptors in `client/lib/axios.js` or API utility
    - Extract error messages from standardized error responses
    - Display error messages using toast notifications or error states
    - _Requirements: 8.4_
  
  - [ ]* 11.8 Write property test for API error display
    - **Property 24: API error message display**
    - **Validates: Requirements 8.4**
  
  - [ ] 11.9 Add loading indicators to async operations
    - Update all components using useAsync hook
    - Display loading spinners during data fetching
    - Disable buttons during form submissions
    - _Requirements: 8.6_

- [ ] 12. Fix geolocation handling
  - [ ] 12.1 Update frontend to use browser Geolocation API
    - Update donation creation component in `client/app/donor/dashboard/page.jsx`
    - Use navigator.geolocation.getCurrentPosition()
    - Send coordinates in donation creation request
    - Handle geolocation errors gracefully
    - _Requirements: 9.1, 9.2_
  
  - [ ]* 12.2 Write property test for geolocation data transmission
    - **Property 26: Geolocation data transmission**
    - **Validates: Requirements 9.2**
  
  - [ ] 12.3 Update backend to accept location parameters
    - Update `server/controllers/donationController.js`
    - Remove any browser API references (if present)
    - Accept location from req.body
    - Validate location coordinates exist and are valid
    - Return 400 if location missing or invalid
    - _Requirements: 9.3, 9.4_
  
  - [ ] 12.4 Ensure location stored as GeoJSON
    - Update Donation model location field
    - Use type: Point and coordinates: [longitude, latitude]
    - Verify geospatial index is configured
    - _Requirements: 9.5_
  
  - [ ]* 12.5 Write property test for location storage format
    - **Property 27: Location storage format**
    - **Validates: Requirements 9.5**

- [ ] 13. Fix Socket.io room management
  - [ ] 13.1 Update Socket.io connection handler
    - Update `server/socket.js`
    - Create userSockets Map to track user connections
    - Track socket IDs per user
    - Join user-specific rooms: `user:${userId}`
    - _Requirements: 10.1, 10.2_
  
  - [ ] 13.2 Implement proper disconnect cleanup
    - Add disconnect event handler
    - Remove socket from userSockets Map
    - Leave all rooms on disconnect
    - Clean up empty user entries in Map
    - Log disconnect events
    - _Requirements: 10.1, 10.2, 10.4_
  
  - [ ]* 13.3 Write property tests for socket cleanup
    - **Property 28: Socket cleanup on disconnect**
    - **Property 29: Socket event logging**
    - **Validates: Requirements 10.1, 10.2, 10.4**
  
  - [ ] 13.4 Add connection timeout
    - Configure socket timeout: 60 seconds
    - Handle timeout events
    - _Requirements: 10.3_
  
  - [ ] 13.5 Add room existence verification
    - Before emitting to rooms, verify room exists
    - Use io.sockets.adapter.rooms.has(roomName)
    - Log warnings for non-existent rooms
    - _Requirements: 10.5_
  
  - [ ]* 13.6 Write property test for room verification
    - **Property 30: Room existence verification**
    - **Validates: Requirements 10.5**

- [ ] 14. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 15. Implement email service and OTP
  - [ ] 15.1 Set up email service integration
    - Install email service SDK: `npm install @sendgrid/mail` or `npm install nodemailer`
    - Create `server/services/emailService.js`
    - Configure email service with API key from environment
    - Implement sendVerificationEmail function
    - Implement sendOTP function
    - _Requirements: 13.1, 13.2, 13.4_
  
  - [ ]* 15.2 Write unit test for email service integration
    - **Validates: Requirements 13.1**
  
  - [ ] 15.3 Implement OTP generation
    - Add generateOTP method to emailService
    - Use crypto.randomInt(100000, 999999) for 6-digit OTP
    - Ensure cryptographically secure randomness
    - _Requirements: 13.3_
  
  - [ ]* 15.4 Write property test for OTP generation
    - **Property 37: OTP generation security**
    - **Validates: Requirements 13.3**
  
  - [ ] 15.5 Implement OTP request endpoint
    - Create POST /api/auth/request-otp endpoint
    - Generate OTP and store in OTP model
    - Set expiresAt to 10 minutes from now
    - Check attempts limit (max 3 per hour)
    - Send OTP via email
    - _Requirements: 13.4, 13.5, 13.6_
  
  - [ ]* 15.6 Write property tests for OTP
    - **Property 38: OTP delivery**
    - **Property 39: OTP expiration**
    - **Validates: Requirements 13.4, 13.5**
  
  - [ ]* 15.7 Write unit test for OTP rate limiting
    - Test 4th OTP request within hour is rejected
    - **Validates: Requirements 13.6**
  
  - [ ] 15.8 Implement OTP verification endpoint
    - Create POST /api/auth/verify-otp endpoint
    - Find OTP by userId and purpose
    - Check OTP not expired and not already verified
    - Check OTP matches and attempts < 3
    - Mark OTP as verified and invalidate
    - _Requirements: 13.7_
  
  - [ ]* 15.9 Write property test for OTP single-use
    - **Property 40: OTP single-use enforcement**
    - **Validates: Requirements 13.7**
  
  - [ ] 15.10 Update registration to send verification email
    - Update authController register function
    - Generate verification token
    - Send verification email with token
    - Set emailVerified to false initially
    - _Requirements: 13.2_
  
  - [ ]* 15.11 Write property test for registration email
    - **Property 36: Registration email sending**
    - **Validates: Requirements 13.2**

- [ ] 16. Add API documentation
  - [ ] 16.1 Set up Swagger/OpenAPI
    - Install dependencies: `npm install swagger-jsdoc swagger-ui-express`
    - Create `server/config/swagger.js`
    - Configure OpenAPI 3.0 specification
    - Set up Swagger UI at /api-docs endpoint
    - Add to server.js
    - _Requirements: 14.1, 14.2_
  
  - [ ]* 16.2 Write unit test for API documentation endpoint
    - Verify /api-docs is accessible
    - **Validates: Requirements 14.2**
  
  - [ ] 16.3 Add JSDoc annotations to routes
    - Document all endpoints in `server/routes/*.js`
    - Include: description, parameters, request body, responses, security
    - Add example requests and responses
    - Document error codes
    - _Requirements: 14.3, 14.4_
  
  - [ ]* 16.4 Write property test for documentation completeness
    - **Property 41: API documentation completeness**
    - **Validates: Requirements 14.3**

- [ ] 17. Remove hardcoded API URLs from frontend
  - [ ] 17.1 Update frontend environment configuration
    - Update `client/.env.local` with NEXT_PUBLIC_API_URL
    - Create `client/lib/config.js` to export API URL
    - Remove hardcoded fallback URLs from axios configuration
    - _Requirements: 11.4_
  
  - [ ]* 17.2 Write unit test for frontend configuration
    - **Validates: Requirements 11.4**

- [ ] 18. Create database migration scripts
  - [ ] 18.1 Create migration script for donation status normalization
    - Create `server/migrations/normalizeDonationStatus.js`
    - Update any non-standard status values to enum values
    - Log migration results
    - _Requirements: 15.4_
  
  - [ ] 18.2 Create migration script for adding indexes
    - Create `server/migrations/addDonationIndexes.js`
    - Check if indexes exist before creating
    - Create all required indexes
    - Log index creation results
    - _Requirements: 15.4_
  
  - [ ]* 18.3 Write unit test for migration scripts
    - **Validates: Requirements 15.4**

- [ ] 19. Update documentation
  - [ ] 19.1 Create CHANGELOG.md
    - Document all bug fixes by category
    - Note any breaking changes (if any)
    - Include migration instructions
    - _Requirements: 15.5_
  
  - [ ]* 19.2 Write unit test for CHANGELOG existence
    - **Validates: Requirements 15.5**
  
  - [ ] 19.3 Update README with new environment variables
    - Document new required variables
    - Document new optional variables
    - Add setup instructions for email service
    - Add instructions for running migrations
    - _Requirements: 11.5_

- [ ] 20. Final integration and testing
  - [ ] 20.1 Run all property-based tests
    - Execute full test suite with minimum 100 iterations per property test
    - Verify all 43 properties pass
    - _Requirements: All_
  
  - [ ] 20.2 Run all unit tests
    - Execute unit test suite
    - Verify all edge cases and examples pass
    - _Requirements: All_
  
  - [ ]* 20.3 Write property tests for backward compatibility
    - **Property 42: API endpoint compatibility**
    - **Property 43: Response format compatibility**
    - **Validates: Requirements 15.1, 15.2**
  
  - [ ] 20.4 Manual testing of critical flows
    - Test user registration with email verification
    - Test donation creation with geolocation
    - Test NGO accepting donation (verify duplicate prevention)
    - Test rate limiting on auth endpoints
    - Test error boundaries in frontend
    - Test Socket.io notifications and cleanup
    - _Requirements: All_

- [ ] 21. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional property-based and unit tests that can be skipped for faster implementation
- Each task references specific requirements for traceability
- The implementation follows a dependency-aware order: infrastructure → security → database → API → frontend
- Property tests validate universal correctness properties across all inputs (minimum 100 iterations)
- Unit tests validate specific examples, edge cases, and configuration thresholds
- Migration scripts ensure existing data is compatible with schema changes
- All fixes maintain backward compatibility with existing API contracts
