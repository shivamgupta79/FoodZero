@echo off
echo ========================================
echo Food Donation Platform Setup
echo ========================================
echo.

echo Step 1: Installing root dependencies...
call npm install
if %errorlevel% neq 0 (
    echo Failed to install root dependencies
    pause
    exit /b %errorlevel%
)

echo.
echo Step 2: Installing client dependencies...
cd client
call npm install
if %errorlevel% neq 0 (
    echo Failed to install client dependencies
    pause
    exit /b %errorlevel%
)
cd ..

echo.
echo ========================================
echo Installation Complete!
echo ========================================
echo.
echo IMPORTANT: Before running the application:
echo 1. Make sure MongoDB is running on port 27017
echo 2. Update .env file with your configuration
echo 3. Update client/.env.local with your API keys
echo.
echo To start the application, run: npm run dev
echo.
pause
