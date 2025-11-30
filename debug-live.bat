@echo off
REM ============================================
REM TrendPulse LIVE Debug Monitor
REM Shows real-time dev server output for AI debugging
REM ============================================

echo.
echo ========================================
echo TrendPulse LIVE Debug Monitor
echo ========================================
echo.
echo This will show live dev server output.
echo Copy/paste this window into Claude/Gemini chat.
echo.
echo Press Ctrl+C to stop monitoring.
echo ========================================
echo.

REM Check if dev server is running
netstat -ano | findstr ":3000" >nul
if %errorlevel% equ 0 (
    echo [OK] Dev server is running on port 3000
    echo.
) else (
    echo [WARNING] Dev server not detected on port 3000
    echo Starting dev server...
    echo.
    start cmd /k "npm run dev"
    timeout /t 5
)

echo ==================== CURRENT STATUS ====================
echo.
echo Git Branch:
git branch --show-current
echo.
echo Recent Changes:
git status -s
echo.
echo ==================== LIVE SERVER LOGS ====================
echo.

REM Follow the dev server logs (requires npm run dev to output to a log file)
REM If no log file, show instructions
if exist ".next/build.log" (
    powershell -Command "Get-Content .next/build.log -Wait -Tail 50"
) else (
    echo To enable live logging, modify your package.json dev script:
    echo   "dev": "next dev 2>&1 | tee .next/build.log"
    echo.
    echo For now, showing last 50 lines of terminal output...
    echo.
    echo Press any key to continue...
    pause >nul
)
