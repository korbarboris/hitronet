@echo off
echo Starting Hitronet EMS MVP...
echo ==============================

REM Start Backend
start "Backend" cmd /k "cd backend && python main.py"

REM Wait a bit for backend to start
timeout /t 3 /nobreak > nul

REM Start Frontend  

start "Frontend" cmd /k "cd frontend && npm start"

echo ==============================
echo Servers are starting...
echo Frontend: http://localhost:3000
echo Backend API: http://localhost:8000
echo API Docs: http://localhost:8000/docs
echo ==============================
pause