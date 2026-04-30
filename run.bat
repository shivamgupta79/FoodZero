@echo off
echo ========================================
echo Food Donation Platform - Starting...
echo ========================================
echo.

REM Check if MongoDB is running
echo Checking MongoDB connection...
timeout /t 2 /nobreak >nul

REM Start the backend server
echo.
echo Starting Backend Server (Port 5000)...
start "Backend Server" cmd /k "cd /d %~dp0 && npm run server"

REM Wait a bit for backend to start
timeout /t 3 /nobreak >nul

REM Start the frontend client
echo.
echo Starting Frontend Client (Port 3000)...
start "Frontend Client" cmd /k "cd /d %~dp0client && npm run dev"

echo.
echo ========================================
echo Application Started!
echo ========================================
echo.
echo Backend Server: http://localhost:5000
echo Frontend Client: http://localhost:3000
echo.
echo Press any key to stop all servers...
pause >nul

REM Kill all node processes (this will stop both servers)
taskkill /F /IM node.exe /T >nul 2>&1
echo.
echo All servers stopped.
pause
