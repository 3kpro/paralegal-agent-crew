@echo off
REM ============================================
REM TrendPulse Error Capture
REM Run this when you see an error to capture full context
REM ============================================

echo.
echo ========================================
echo TrendPulse Error Capture
echo ========================================
echo.
echo Describe the error you're seeing:
set /p error_desc="Error description: "
echo.

REM Create timestamp
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
set timestamp=%datetime:~0,8%-%datetime:~8,6%

REM Create error report
set output=debug-output\error-%timestamp%.txt

if not exist "debug-output" mkdir debug-output

echo ==================== ERROR REPORT ==================== > %output%
echo Timestamp: %date% %time% >> %output%
echo Description: %error_desc% >> %output%
echo ==================== >> %output%
echo. >> %output%

echo --- CURRENT FILE STATE --- >> %output%
git status >> %output% 2>&1
echo. >> %output%

echo --- LAST COMMAND OUTPUT --- >> %output%
echo (Paste error output below if available) >> %output%
echo. >> %output%

echo --- CHANGED FILES --- >> %output%
git diff --name-only >> %output% 2>&1
echo. >> %output%

echo --- RECENT COMMITS --- >> %output%
git log --oneline -3 >> %output% 2>&1
echo. >> %output%

echo --- PACKAGE.JSON DEV DEPENDENCIES --- >> %output%
type package.json | findstr "devDependencies" -A 20 >> %output% 2>&1
echo. >> %output%

echo ==================== END ERROR REPORT ==================== >> %output%

REM Copy to clipboard
type %output% | clip

echo.
echo Error report created and copied to clipboard!
echo.
echo File saved to: %output%
echo.
echo Next steps:
echo 1. Paste the error message/stack trace below in your AI chat
echo 2. Then paste this report (already in clipboard)
echo 3. AI will have full context to help debug
echo.

REM Open the file for editing (so user can paste error details)
notepad %output%
