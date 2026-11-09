@echo off
title StudyOS - Personal Study Management CRM
echo ============================================================
echo           StudyOS - Cognitive Command Center Launcher
echo ============================================================
echo.

cd /d "%~dp0"

echo [1/3] Checking MySQL Database...
tasklist /FI "IMAGENAME eq mysqld.exe" 2>NUL | find /I /N "mysqld.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo       MySQL service is already running.
) else (
    echo       Starting MySQL daemon from XAMPP...
    start /B "" "C:\xampp\mysql\bin\mysqld.exe" --defaults-file="C:\xampp\mysql\bin\my.ini" --standalone
)

echo [2/3] Launching Laravel API Backend on Port 8000...
start "StudyOS Laravel Backend" cmd /k "cd backend && php artisan serve --port=8000"

echo [3/3] Launching React Vite Frontend on Port 5173...
start "StudyOS React Frontend" cmd /k "cd frontend && npm run dev -- --host --port 5173"

echo.
echo Waiting 3 seconds for servers to warm up...
timeout /t 3 /nobreak >nul

echo Opening StudyOS Command Center in your default browser...
start http://localhost:5173

echo.
echo ============================================================
echo   Desktop URL:           http://localhost:5173
echo   Mobile Phone (Wi-Fi):  http://10.97.162.53:5173
echo   Seeded Account:        engineer@studyos.local
echo   Default Password:      password123
echo ============================================================
echo.
pause

