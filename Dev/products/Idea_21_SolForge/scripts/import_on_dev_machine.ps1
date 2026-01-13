# SolForge Migration Script - Import on Target Machine
# Run this on your DEV MACHINE after transferring the migration package

param(
    [Parameter(Mandatory=$true)]
    [string]$ArchivePath,

    [string]$InstallPath = "C:\solforge"
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "SolForge Migration - Import & Deploy" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Verify archive exists
if (-not (Test-Path $ArchivePath)) {
    Write-Host "Error: Archive not found at $ArchivePath" -ForegroundColor Red
    exit 1
}

# Step 1: Extract archive
Write-Host "[1/6] Extracting archive to $InstallPath..." -ForegroundColor Yellow
if (Test-Path $InstallPath) {
    Write-Host "  Warning: $InstallPath already exists. Creating backup..." -ForegroundColor Yellow
    $backupPath = "${InstallPath}_backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
    Move-Item -Path $InstallPath -Destination $backupPath -Force
    Write-Host "  Backup created: $backupPath" -ForegroundColor Green
}

New-Item -ItemType Directory -Path $InstallPath -Force | Out-Null
Expand-Archive -Path $ArchivePath -DestinationPath $InstallPath -Force

# Step 2: Verify extraction
Write-Host "[2/6] Verifying extracted files..." -ForegroundColor Yellow
Set-Location $InstallPath

$criticalFiles = @(
    "docker-compose.yml",
    "Dockerfile",
    "requirements.txt"
)

$allPresent = $true
foreach ($file in $criticalFiles) {
    if (Test-Path $file) {
        Write-Host "  [OK] $file" -ForegroundColor Green
    } else {
        Write-Host "  [MISSING] $file" -ForegroundColor Red
        $allPresent = $false
    }
}

if (-not $allPresent) {
    Write-Host "`nError: Critical files missing. Extraction may have failed." -ForegroundColor Red
    exit 1
}

# Check for state files
Write-Host "`nState Files:" -ForegroundColor Yellow
$dbPath = if (Test-Path "data\solforge.db") { "data\solforge.db" }
          elseif (Test-Path "solforge.db") { "solforge.db" }
          else { $null }

if ($dbPath) {
    $dbSize = (Get-Item $dbPath).Length / 1KB
    Write-Host "  [OK] Database: $dbPath ($([math]::Round($dbSize, 2)) KB)" -ForegroundColor Green
} else {
    Write-Host "  [WARN] No database found - will start fresh" -ForegroundColor Yellow
}

$aiModels = Get-ChildItem -Filter "agent_*.pth" -ErrorAction SilentlyContinue
if ($aiModels.Count -gt 0) {
    Write-Host "  [OK] AI Models: $($aiModels.Count) found" -ForegroundColor Green
    foreach ($model in $aiModels) {
        $modelSize = $model.Length / 1KB
        Write-Host "    - $($model.Name) ($([math]::Round($modelSize, 2)) KB)" -ForegroundColor Gray
    }
} else {
    Write-Host "  [WARN] No AI models - lanes will create new ones" -ForegroundColor Yellow
}

# Step 3: Check Docker
Write-Host "`n[3/6] Checking Docker..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version
    Write-Host "  [OK] $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "  [ERROR] Docker not found. Please install Docker Desktop." -ForegroundColor Red
    exit 1
}

try {
    docker-compose --version | Out-Null
    Write-Host "  [OK] Docker Compose available" -ForegroundColor Green
} catch {
    Write-Host "  [ERROR] Docker Compose not found." -ForegroundColor Red
    exit 1
}

# Step 4: Build images
Write-Host "`n[4/6] Building Docker images..." -ForegroundColor Yellow
Write-Host "  This may take 5-10 minutes on first run...`n" -ForegroundColor Gray
docker-compose build

if ($LASTEXITCODE -ne 0) {
    Write-Host "`nError: Docker build failed" -ForegroundColor Red
    exit 1
}

# Step 5: Start services
Write-Host "`n[5/6] Starting SolForge services..." -ForegroundColor Yellow
docker-compose up -d

Start-Sleep -Seconds 5

# Step 6: Verify deployment
Write-Host "`n[6/6] Verifying deployment..." -ForegroundColor Yellow

try {
    $status = Invoke-RestMethod -Uri "http://localhost:8000/api/v1/status" -TimeoutSec 10
    Write-Host "  [OK] Backend API responding" -ForegroundColor Green
    Write-Host "  Status: $($status.status)" -ForegroundColor Gray
    Write-Host "  Active Lanes: $($status.active_lanes)" -ForegroundColor Gray
    Write-Host "  Total PnL: $($status.total_pnl)" -ForegroundColor Gray
} catch {
    Write-Host "  [WARN] Backend API not responding yet. Check logs:" -ForegroundColor Yellow
    Write-Host "  docker-compose logs -f backend" -ForegroundColor Gray
}

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Migration Complete!" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Service URLs:" -ForegroundColor White
Write-Host "  Backend API: http://localhost:8000/api/v1/status" -ForegroundColor Gray
Write-Host "  Dashboard:   http://localhost:3000`n" -ForegroundColor Gray

Write-Host "Useful Commands:" -ForegroundColor White
Write-Host "  View logs:       docker-compose logs -f" -ForegroundColor Gray
Write-Host "  Stop services:   docker-compose down" -ForegroundColor Gray
Write-Host "  Restart:         docker-compose restart" -ForegroundColor Gray
Write-Host "  Check readiness: Invoke-RestMethod http://localhost:8000/api/v1/lanes/{id}/readiness`n" -ForegroundColor Gray

Write-Host "Next Steps:" -ForegroundColor White
Write-Host "  1. Open dashboard: http://localhost:3000" -ForegroundColor Gray
Write-Host "  2. Verify lanes are active" -ForegroundColor Gray
Write-Host "  3. Monitor readiness scores" -ForegroundColor Gray
Write-Host "  4. Let it run for 2-4 weeks to reach readiness thresholds`n" -ForegroundColor Gray

Write-Host "For troubleshooting, see docs/MIGRATION_GUIDE.md" -ForegroundColor Cyan
