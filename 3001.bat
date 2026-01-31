@echo off
setlocal enabledelayedexpansion

REM Change to the 3kpro-website directory
cd /d "%~dp0\3kpro-website"

echo ========================================
echo Starting 3kpro.services dev server (port 3001)
echo ========================================

echo.
echo [1/3] Killing processes on port 3001...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001') do (
    taskkill /F /PID %%a 2>nul
    if !errorlevel! equ 0 echo [OK] Killed process %%a on port 3001
)

echo.
echo [2/3] Cleaning build cache...
if exist .next (
    rmdir /S /Q .next 2>nul
    echo [OK] Removed .next directory
) else (
    echo [OK] No .next directory to remove
)

echo.
echo [3/3] Starting 3kpro.services dev server on port 3001...
echo [OK] Server will be available at http://localhost:3001
echo.
echo Press Ctrl+C to stop the server
echo.
call npm run dev

pause
exit /b 0
