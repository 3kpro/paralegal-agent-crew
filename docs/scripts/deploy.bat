@echo off
REM XELORA Deployment Script for Windows
REM Safely merges feature branch to main and deploys to production via Vercel

setlocal enabledelayedexpansion

REM Get branch name from argument (default: feature/topic-scrapper)
set BRANCH=%1
if "%BRANCH%"=="" set BRANCH=feature/topic-scrapper

echo.
echo ========================================
echo   XELORA Deployment Script
echo ========================================
echo Branch to deploy: %BRANCH%
echo.

REM Step 1: Switch to main
echo [1/4] Switching to main branch...
git checkout main
if %errorlevel% neq 0 (
  echo ERROR: Failed to checkout main
  exit /b 1
)

REM Step 2: Pull latest
echo [2/4] Pulling latest from origin/main...
git pull origin main
if %errorlevel% neq 0 (
  echo ERROR: Failed to pull from origin
  exit /b 1
)

REM Step 3: Merge feature branch
echo [3/4] Merging %BRANCH% into main...
git merge %BRANCH%
if %errorlevel% neq 0 (
  echo ERROR: Merge conflict detected. Resolve manually and try again.
  exit /b 1
)

REM Step 4: Push to main
echo [4/4] Pushing to origin/main...
git push origin main
if %errorlevel% neq 0 (
  echo ERROR: Failed to push to origin
  exit /b 1
)

REM Success
echo.
echo ========================================
echo   DEPLOYMENT COMPLETE!
echo ========================================
echo OK: Changes merged and pushed to main
echo OK: Vercel will auto-deploy in ~2-3 minutes
echo.
echo Monitor: https://vercel.com/3kpro/content-cascade-ai-landing
echo.
pause
