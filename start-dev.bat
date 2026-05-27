@echo off
REM Start Backend and Frontend in parallel

echo Starting Railway Reservation System...
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    pause
    exit /b 1
)

REM Start Backend
echo Starting Backend (FastAPI)...
cd backend
start cmd /k "python -m venv venv && call venv\Scripts\activate.bat && pip install -r requirements.txt && uvicorn main:app --reload --host 0.0.0.0 --port 8000"
cd ..
timeout /t 3 /nobreak

REM Start Frontend
echo Starting Frontend (Next.js)...
cd frontend
start cmd /k "npm install && npm run dev"
cd ..

echo.
echo Both services are starting:
echo - Backend: http://localhost:8000
echo - Frontend: http://localhost:3000
echo - API Docs: http://localhost:8000/docs
echo.
echo Close the command windows to stop the services.
pause
