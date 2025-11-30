@echo off
REM ============================================
REM TrendPulse Debug Log Collector
REM Captures all relevant logs and context for AI debugging
REM ============================================

echo.
echo ========================================
echo TrendPulse Debug Log Collector
echo ========================================
echo.

REM Create a timestamp for the log file
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
set timestamp=%datetime:~0,8%-%datetime:~8,6%

REM Create debug output directory if it doesn't exist
if not exist "debug-output" mkdir debug-output

REM Output file
set output=debug-output\debug-%timestamp%.txt

echo Collecting debug information...
echo Output file: %output%
echo.

REM Start writing to output file
echo ============================================ > %output%
echo TrendPulse Debug Report >> %output%
echo Generated: %date% %time% >> %output%
echo ============================================ >> %output%
echo. >> %output%

REM Git status
echo [1/8] Collecting Git status... >> %output%
echo. >> %output%
echo ==================== GIT STATUS ==================== >> %output%
git status >> %output% 2>&1
echo. >> %output%

REM Recent commits
echo [2/8] Collecting recent commits... >> %output%
echo. >> %output%
echo ==================== RECENT COMMITS ==================== >> %output%
git log --oneline -10 >> %output% 2>&1
echo. >> %output%

REM Check for dev server running
echo [3/8] Checking for running dev server... >> %output%
echo. >> %output%
echo ==================== DEV SERVER STATUS ==================== >> %output%
netstat -ano | findstr ":3000" >> %output% 2>&1
echo. >> %output%

REM Node/NPM versions
echo [4/8] Collecting environment info... >> %output%
echo. >> %output%
echo ==================== ENVIRONMENT ==================== >> %output%
echo Node version: >> %output%
node --version >> %output% 2>&1
echo. >> %output%
echo NPM version: >> %output%
npm --version >> %output% 2>&1
echo. >> %output%

REM Package.json scripts
echo [5/8] Collecting package scripts... >> %output%
echo. >> %output%
echo ==================== AVAILABLE SCRIPTS ==================== >> %output%
type package.json | findstr "\"scripts\"" -A 10 >> %output% 2>&1
echo. >> %output%

REM Check for .next directory (build cache)
echo [6/8] Checking build cache... >> %output%
echo. >> %output%
echo ==================== BUILD CACHE ==================== >> %output%
if exist ".next" (
    echo .next directory exists >> %output%
    dir .next /s /b | findstr /C:".js" /C:".ts" | find /c /v "" >> %output%
) else (
    echo .next directory does not exist - no build cache >> %output%
)
echo. >> %output%

REM Recent browser console errors (if log file exists)
echo [7/8] Looking for error logs... >> %output%
echo. >> %output%
echo ==================== RECENT ERRORS ==================== >> %output%
if exist "error.log" (
    type error.log >> %output%
) else (
    echo No error.log file found >> %output%
)
echo. >> %output%

REM Modified files (last 24 hours)
echo [8/8] Collecting recently modified files... >> %output%
echo. >> %output%
echo ==================== RECENTLY MODIFIED FILES ==================== >> %output%
forfiles /S /M *.tsx /D -1 /C "cmd /c echo @path - @fdate @ftime" 2>nul >> %output%
forfiles /S /M *.ts /D -1 /C "cmd /c echo @path - @fdate @ftime" 2>nul >> %output%
forfiles /S /M *.jsx /D -1 /C "cmd /c echo @path - @fdate @ftime" 2>nul >> %output%
echo. >> %output%

REM Current directory structure
echo ==================== PROJECT STRUCTURE ==================== >> %output%
tree /F /A | findstr /V "node_modules .next" >> %output% 2>&1
echo. >> %output%

echo ============================================ >> %output%
echo End of Debug Report >> %output%
echo ============================================ >> %output%

REM Display the output
echo.
echo ========================================
echo Debug log collected successfully!
echo ========================================
echo.
type %output%

echo.
echo.
echo Output saved to: %output%
echo.
echo To copy to clipboard, run:
echo clip ^< %output%
echo.
pause
