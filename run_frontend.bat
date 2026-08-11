@echo off
title Attendance App Frontend (Expo Port 8081)
echo ===================================================
echo   Starting Attendance Expo React Native Frontend
echo   Port: 8081
echo   URL: http://localhost:8081
echo ===================================================
cd /d "%~dp0attendance-app"
npx expo start --port 8081 --web
pause
