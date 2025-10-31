@echo off
setlocal enabledelayedexpansion

REM Change to the script directory
cd /d "%~dp0"

echo ========================================
echo Restarting dev server
echo ========================================

echo.
echo [1/3] Killing all Node.js processes...
taskkill /F /IM node.exe 2>nul
if %errorlevel% equ 0 (
    echo [OK] Node processes killed
) else (
    echo [OK] No Node processes found
)

REM Also kill any processes using port 3000
echo [INFO] Checking for processes on port 3000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
    taskkill /F /PID %%a 2>nul
    if !errorlevel! equ 0 echo [OK] Killed process %%a on port 3000
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
echo [3/3] Starting dev server on port 3000...
echo [INFO] Dev server uses incremental compilation
echo [INFO] Production build errors won't block dev mode
echo [OK] Server will be available at http://localhost:3000
echo.
echo Press Ctrl+C to stop the server
echo.
call npm run dev

pause
exit /b 0
