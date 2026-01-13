
Write-Host "Stopping SolForge Simulation..." -ForegroundColor Yellow
docker-compose -f docker-compose.yml down

Write-Host "Simulation Stopped." -ForegroundColor Green
