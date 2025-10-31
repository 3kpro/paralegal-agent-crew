# Restart Dev Server - PowerShell Version
# Usage: ./Restart-DevServer.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Restarting dev server" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# [1/3] Kill Node.js processes
Write-Host ""
Write-Host "[1/3] Killing all Node.js processes..." -ForegroundColor Yellow
$nodeProcesses = Get-Process node -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    $nodeProcesses | Stop-Process -Force
    Write-Host "[OK] Node processes killed" -ForegroundColor Green
} else {
    Write-Host "[OK] No Node processes found" -ForegroundColor Green
}

# [2/3] Clean build cache
Write-Host ""
Write-Host "[2/3] Cleaning build cache..." -ForegroundColor Yellow
if (Test-Path .next) {
    Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
    Write-Host "[OK] Removed .next directory" -ForegroundColor Green
} else {
    Write-Host "[OK] No .next directory to remove" -ForegroundColor Green
}

# [3/3] Start dev server
Write-Host ""
Write-Host "[3/3] Starting dev server on port 3000..." -ForegroundColor Yellow
Write-Host "[INFO] Dev server uses incremental compilation" -ForegroundColor Cyan
Write-Host "[INFO] Production build errors won't block dev mode" -ForegroundColor Cyan
Write-Host "[OK] Server will be available at http://localhost:3000" -ForegroundColor Green
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""
npm run dev
