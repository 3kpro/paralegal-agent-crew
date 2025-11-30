@echo off
REM ============================================
REM TrendPulse Debug to Clipboard
REM One-click copy debug info to clipboard for AI chat
REM ============================================

echo.
echo ========================================
echo TrendPulse Debug to Clipboard
echo ========================================
echo.

REM Create temp file
set tempfile=%temp%\trendpulse-debug.txt

echo Collecting debug information...
echo.

REM Build debug report
echo ==================== TRENDPULSE DEBUG REPORT ==================== > %tempfile%
echo Generated: %date% %time% >> %tempfile%
echo. >> %tempfile%

echo [1/6] Git status...
echo --- GIT STATUS --- >> %tempfile%
git status -s >> %tempfile% 2>&1
echo. >> %tempfile%

echo [2/6] Current branch...
echo --- CURRENT BRANCH --- >> %tempfile%
git branch --show-current >> %tempfile% 2>&1
echo. >> %tempfile%

echo [3/6] Recent commits...
echo --- RECENT COMMITS --- >> %tempfile%
git log --oneline -5 >> %tempfile% 2>&1
echo. >> %tempfile%

echo [4/6] Dev server status...
echo --- DEV SERVER STATUS --- >> %tempfile%
netstat -ano | findstr ":3000" >> %tempfile% 2>&1
if %errorlevel% neq 0 (
    echo No dev server running on port 3000 >> %tempfile%
)
echo. >> %tempfile%

echo [5/6] Modified files today...
echo --- MODIFIED TODAY --- >> %tempfile%
git diff --name-only HEAD >> %tempfile% 2>&1
echo. >> %tempfile%

echo [6/6] Environment...
echo --- ENVIRONMENT --- >> %tempfile%
echo Node: >> %tempfile%
node --version >> %tempfile% 2>&1
echo NPM: >> %tempfile%
npm --version >> %tempfile% 2>&1
echo. >> %tempfile%

echo ==================== END DEBUG REPORT ==================== >> %tempfile%

REM Copy to clipboard
type %tempfile% | clip

REM Also display
type %tempfile%

echo.
echo ========================================
echo Debug info copied to clipboard!
echo ========================================
echo.
echo You can now paste (Ctrl+V) directly into:
echo  - Claude Code chat
echo  - Gemini chat
echo  - Any text editor
echo.
echo Output also saved to: %tempfile%
echo.

pause
