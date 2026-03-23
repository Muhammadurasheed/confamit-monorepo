@echo off
TITLE ConfirmIT Stack Launcher
color 0B

echo =======================================================
echo          ConfirmIT Local Development Launcher
echo =======================================================
echo.
echo Launching 3 services in separate windows...
echo.

echo [1/3] Starting AI Service (Port 8000)...
start "ConfirmIT AI Service" cmd /k "cd ai-service && color 0A && echo Activated AI Service environment && call conda activate base && uvicorn app.main:app --reload --port 8000"

echo [2/3] Starting Backend API Gateway (Port 8080)...
start "ConfirmIT Backend" cmd /k "cd backend && color 0E && echo Starting NestJS Backend... && npm run start:dev"

echo [3/3] Starting Frontend Dashboard (Port 5173)...
start "ConfirmIT Frontend" cmd /k "color 0D && echo Starting React/Vite Frontend... && npm run dev"

echo.
echo All services have been launched!
echo - AI Service: http://localhost:8000
echo - Backend: http://localhost:8080
echo - Frontend: http://localhost:5173
echo.
echo Close this window to keep the services running.
pause
