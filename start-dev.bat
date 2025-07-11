@echo off
echo Starting CampusBites Development Servers...
echo.

echo Starting Backend Server (Port 8080)...
start "Backend Server" cmd /k "cd backend && npm start"

timeout /t 3 /nobreak > nul

echo Starting Frontend Server (Port 3000)...
start "Frontend Server" cmd /k "cd frontend && npm run dev"

echo.
echo Both servers are starting...
echo Backend: http://localhost:8080
echo Frontend: http://localhost:3000
echo.
echo Press any key to exit...
pause > nul 