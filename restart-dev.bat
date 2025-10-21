@echo off
setlocal enabledelayedexpansion

REM Change to the script directory
cd /d "%~dp0"

echo ========================================
echo Cleaning up and restarting dev server
echo ========================================

echo.
echo [1/4] Killing all Node.js processes...
taskkill /F /IM node.exe 2>nul
if %errorlevel% equ 0 (
    echo [OK] Node processes killed
) else (
    echo [OK] No Node processes found
)

echo.
echo [2/4] Cleaning build cache...
if exist .next (
    rmdir /S /Q .next 2>nul
    echo [OK] Removed .next directory
) else (
    echo [OK] No .next directory to remove
)

echo.
echo [3/4] Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] npm install failed!
    pause
    exit /b 1
)

echo.
echo [4/4] Building application...
call npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Build failed!
    pause
    exit /b 1
)

echo.
echo [5/5] Starting dev server on port 3000...
echo [OK] Server will be available at http://localhost:3000
echo.
pause
call npm run dev

pause
exit /b 0
