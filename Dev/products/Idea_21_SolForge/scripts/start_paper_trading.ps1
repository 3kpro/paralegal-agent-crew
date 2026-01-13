
Write-Host "Starting SolForge Paper Trading Simulation..." -ForegroundColor Cyan

# Check for Docker
if (-not (Get-Command "docker" -ErrorAction SilentlyContinue)) {
    Write-Error "Docker is not installed or not in PATH."
    exit 1
}

# Build and Start
Write-Host "Building and Styling Containers..." -ForegroundColor Yellow
docker-compose -f docker-compose.yml up -d --build

# Wait for healthy
Write-Host "Waiting for services to stabilize (10s)..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Show Status
docker-compose ps

Write-Host "`nSimulation Running!" -ForegroundColor Green
Write-Host "Dashboard: http://localhost:3000"
Write-Host "API: http://localhost:8000/docs"
Write-Host "Logs: docker-compose logs -f backend"

Write-Host "`nTo stop: ./scripts/stop_paper_trading.ps1"
