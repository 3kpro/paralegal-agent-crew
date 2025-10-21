# Restart Dev Server - PowerShell Version
# Usage: ./Restart-DevServer.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Cleaning up and restarting dev server" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# [1/4] Kill Node.js processes
Write-Host ""
Write-Host "[1/4] Killing all Node.js processes..." -ForegroundColor Yellow
$nodeProcesses = Get-Process node -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    $nodeProcesses | Stop-Process -Force
    Write-Host "[OK] Node processes killed" -ForegroundColor Green
} else {
    Write-Host "[OK] No Node processes found" -ForegroundColor Green
}

# [2/4] Clean build cache
Write-Host ""
Write-Host "[2/4] Cleaning build cache..." -ForegroundColor Yellow
if (Test-Path .next) {
    Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
    Write-Host "[OK] Removed .next directory" -ForegroundColor Green
} else {
    Write-Host "[OK] No .next directory to remove" -ForegroundColor Green
}

# [3/4] Install dependencies
Write-Host ""
Write-Host "[3/4] Installing dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] npm install failed!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# [4/4] Build application
Write-Host ""
Write-Host "[4/4] Building application..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Build failed!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# [5/5] Start dev server
Write-Host ""
Write-Host "[5/5] Starting dev server on port 3000..." -ForegroundColor Yellow
Write-Host "[OK] Server will be available at http://localhost:3000" -ForegroundColor Green
Write-Host ""
Read-Host "Press Enter to start dev server"
npm run dev
