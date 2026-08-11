@echo off
title Attendance Express Backend (Port 8000)
echo ===================================================
echo   Starting Attendance Express Backend Server
echo   Port: 8000
echo   Database: Supabase PostgreSQL
echo   Health Check: http://localhost:8000/api/health
echo ===================================================
cd /d "%~dp0backend"
node server.js
pause
