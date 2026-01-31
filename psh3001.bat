@echo off
setlocal enabledelayedexpansion

REM Change to the 3kpro-website directory
cd /d "%~dp0\3kpro-website"

echo ========================================
echo 3kpro.services - Push to Production
echo ========================================
echo.

REM Check current branch
for /f "tokens=*" %%i in ('git rev-parse --abbrev-ref HEAD') do set CURRENT_BRANCH=%%i
echo [INFO] Current branch: %CURRENT_BRANCH%
echo.

REM Show what's changed
echo [1/5] Changes to be committed:
echo ----------------------------------------
git status --short
echo ----------------------------------------
echo.

REM Check if there are changes
git diff-index --quiet HEAD --
if %errorlevel% equ 0 (
    echo [WARNING] No changes detected. Nothing to commit.
    pause
    exit /b 0
)

REM Get commit message
echo [2/5] Enter commit message:
set /p COMMIT_MSG="Message: "
if "%COMMIT_MSG%"=="" (
    echo [ERROR] Commit message cannot be empty.
    pause
    exit /b 1
)
echo.

REM Stage all changes
echo [3/5] Staging all changes...
git add -A
if %errorlevel% neq 0 (
    echo [ERROR] Failed to stage changes.
    pause
    exit /b 1
)
echo [OK] Changes staged
echo.

REM Create commit
echo [4/5] Creating commit...
git commit -m "%COMMIT_MSG%"
if %errorlevel% neq 0 (
    echo [ERROR] Failed to create commit.
    pause
    exit /b 1
)
echo [OK] Commit created
echo.

REM Final confirmation
echo [5/5] Ready to push to: %CURRENT_BRANCH%
set /p CONFIRM="Push to remote? (Y/N): "
if /i not "%CONFIRM%"=="Y" (
    echo [CANCELLED] Push aborted by user.
    pause
    exit /b 0
)
echo.

REM Push to remote
echo [PUSHING] Pushing to origin/%CURRENT_BRANCH%...
git push origin %CURRENT_BRANCH%
if %errorlevel% neq 0 (
    echo [ERROR] Failed to push to remote.
    pause
    exit /b 1
)

echo.
echo ========================================
echo [SUCCESS] Pushed to production!
echo Branch: %CURRENT_BRANCH%
echo ========================================
echo.

pause
exit /b 0
