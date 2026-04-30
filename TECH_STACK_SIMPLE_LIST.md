# FoodZero - Tech Stack Simple List

## 📱 FRONTEND (7 Technologies)

### 1. **Next.js** (v15.1.0)
**What it does:** Framework that builds and runs the website
- Creates web pages automatically from files
- Makes pages load faster with server-side rendering
- Handles navigation between pages
- Optimizes the website for production

### 2. **React** (v19.2.4)
**What it does:** Library for building user interfaces
- Creates interactive buttons, forms, and components
- Updates the screen when data changes
- Manages what users see on each page
- Powers all the dashboards (donor, NGO, admin)

### 3. **Tailwind CSS** (v3.3.5)
**What it does:** Styling framework for design
- Makes the website look good with colors, spacing, fonts
- Creates responsive design (works on mobile, tablet, desktop)
- Provides pre-built style classes
- Keeps design consistent across all pages

### 4. **Axios** (v1.7.0)
**What it does:** Sends requests to the backend server
- Fetches data from the database (users, donations)
- Sends form data to the server (login, create donation)
- Automatically adds authentication tokens
- Handles errors when requests fail

### 5. **Socket.io Client** (v4.8.0)
**What it does:** Real-time communication with server
- Shows instant notifications without refreshing
- Updates donation status in real-time
- Notifies NGOs when new donations are available
- Notifies donors when NGO accepts their donation

### 6. **Google Maps API** (v2.20.8)
**What it does:** Shows maps and locations
- Displays interactive maps on the website
- Shows donor and NGO locations with markers
- Calculates distance between donor and NGO
- Helps users pick their location on the map

### 7. **Lucide React** (v0.575.0)
**What it does:** Provides icons for the interface
- Shows icons for buttons (home, user, settings)
- Displays status icons (checkmark, warning, clock)
- Makes the UI more visual and intuitive
- Keeps icon style consistent

---

## 🔧 BACKEND (10 Technologies)

### 1. **Node.js**
**What it does:** Runs JavaScript code on the server
- Executes all backend logic
- Handles multiple user requests at the same time
- Connects to the database
- Runs the Express server

### 2. **Express** (v4.21.2)
**What it does:** Web server framework
- Creates API endpoints (/api/auth/login, /api/donations/create)
- Receives requests from the frontend
- Sends responses back to the frontend
- Organizes routes and middleware

### 3. **MongoDB**
**What it does:** Database that stores all data
- Stores user accounts (donors, NGOs, admins)
- Stores donation records
- Stores tracking information
- Saves verification documents and status

### 4. **Mongoose** (v8.9.5)
**What it does:** Makes working with MongoDB easier
- Defines data structure (schemas) for users, donations
- Validates data before saving to database
- Provides easy methods to create, read, update, delete data
- Ensures data consistency

### 5. **Socket.io Server** (v4.8.3)
**What it does:** Enables real-time features
- Sends instant notifications to users
- Broadcasts donation updates to all NGOs
- Notifies specific users about status changes
- Manages user rooms (donor room, NGO room, admin room)

### 6. **JWT (jsonwebtoken)** (v9.0.2)
**What it does:** Handles user authentication
- Creates secure login tokens when users log in
- Verifies tokens on protected routes
- Contains user information (id, email, role)
- Expires after a set time for security

### 7. **bcryptjs** (v2.4.3)
**What it does:** Secures passwords
- Encrypts passwords before saving to database
- Never stores plain text passwords
- Compares login passwords with encrypted versions
- Protects user accounts from hackers

### 8. **Multer** (v1.4.5)
**What it does:** Handles file uploads
- Processes uploaded verification documents
- Saves government ID images
- Saves FSSAI certificates
- Validates file types and sizes

### 9. **CORS** (v2.8.5)
**What it does:** Allows frontend to talk to backend
- Enables requests from localhost:3000 to localhost:5000
- Sets security headers
- Prevents unauthorized access from other websites
- Required for modern web applications

### 10. **dotenv** (v16.4.7)
**What it does:** Manages secret configuration
- Loads environment variables from .env file
- Keeps database passwords and secrets secure
- Separates configuration from code
- Different settings for development and production

---

## 🛠️ DEVELOPMENT TOOLS (4 Technologies)

### 1. **Nodemon** (v3.1.14)
**What it does:** Auto-restarts server during development
- Watches backend files for changes
- Automatically restarts the server when you save a file
- Saves time during development
- Shows better error messages

### 2. **Concurrently** (v9.1.0)
**What it does:** Runs multiple commands at once
- Starts both frontend and backend with one command
- Shows logs from both servers in one terminal
- Color-codes output for easy reading
- Simplifies development workflow

### 3. **PostCSS** (v8.4.31)
**What it does:** Processes CSS files
- Transforms Tailwind CSS into regular CSS
- Optimizes CSS for production
- Required for Tailwind to work
- Minifies CSS to reduce file size

### 4. **Autoprefixer** (v10.4.16)
**What it does:** Makes CSS work on all browsers
- Adds browser-specific prefixes (-webkit-, -moz-)
- Ensures styles work on Chrome, Firefox, Safari, Edge
- Automatically handles browser compatibility
- No manual prefix writing needed

---

## 📊 SUMMARY BY CATEGORY

### Frontend (User Interface)
1. **Next.js** - Website framework
2. **React** - UI components
3. **Tailwind CSS** - Styling
4. **Axios** - API requests
5. **Socket.io Client** - Real-time updates
6. **Google Maps** - Location features
7. **Lucide React** - Icons

### Backend (Server & Database)
1. **Node.js** - Server runtime
2. **Express** - Web server
3. **MongoDB** - Database
4. **Mongoose** - Database helper
5. **Socket.io Server** - Real-time server
6. **JWT** - Authentication
7. **bcryptjs** - Password security
8. **Multer** - File uploads
9. **CORS** - Cross-origin requests
10. **dotenv** - Environment config

### Development Tools (Helper Tools)
1. **Nodemon** - Auto-restart server
2. **Concurrently** - Run multiple commands
3. **PostCSS** - CSS processing
4. **Autoprefixer** - Browser compatibility

---

## 🎯 WHAT EACH LAYER DOES

### Frontend Layer (What Users See)
- Displays web pages and dashboards
- Shows forms for login, registration, donations
- Displays maps and locations
- Shows real-time notifications
- Handles user interactions (clicks, form submissions)

### Backend Layer (Behind the Scenes)
- Processes user requests
- Validates and saves data to database
- Checks user authentication
- Sends real-time notifications
- Handles file uploads
- Manages business logic

### Database Layer (Data Storage)
- Stores user accounts
- Stores donation records
- Stores tracking information
- Stores verification documents
- Retrieves data when needed

### Development Layer (Developer Tools)
- Makes development faster
- Auto-restarts servers
- Processes CSS
- Ensures browser compatibility

---

## 💡 SIMPLE EXPLANATION

**Frontend (7)** = What users see and interact with
**Backend (10)** = Server that processes requests and manages data
**Dev Tools (4)** = Helper tools that make development easier

**Total: 21 technologies working together to create FoodZero!**

---

*This is a simplified explanation. For detailed technical information, see TECH_STACK_DETAILED.md*
