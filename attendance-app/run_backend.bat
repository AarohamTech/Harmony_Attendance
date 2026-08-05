@echo off
title Attendance Service Backend (Port 8002)
echo ===================================================
echo   Starting Attendance FastAPI Backend Service
echo   Port: 8002
echo   Docs: http://127.0.0.1:8002/docs
echo ===================================================
cd /d "F:\attendance-service"
call venv\Scripts\activate.bat
python -m app.seed
python -m uvicorn app.main:app --host 0.0.0.0 --port 8002 --reload
pause
