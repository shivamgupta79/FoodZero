@echo off
echo ========================================
echo Installing FoodZero Dependencies
echo ========================================
echo.

echo Installing root dependencies...
call npm install multer
if %errorlevel% neq 0 (
    echo Error installing root dependencies!
    pause
    exit /b %errorlevel%
)

echo.
echo Creating upload directories...
if not exist "uploads\verification" mkdir uploads\verification
if not exist "uploads\donations" mkdir uploads\donations
if not exist "uploads\profiles" mkdir uploads\profiles

echo.
echo ========================================
echo Installation Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Uncomment multer code in server/controllers/donorController.js
echo 2. Start the server: npm run dev
echo 3. Test the application
echo.
pause
