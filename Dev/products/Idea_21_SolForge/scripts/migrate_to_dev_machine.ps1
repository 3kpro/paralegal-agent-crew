# SolForge Migration Script - Export from Source Machine
# Run this on your CURRENT PC to prepare for migration

param(
    [string]$OutputPath = ".\solforge_migration"
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "SolForge Migration - Export Package" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Step 1: Stop running containers
Write-Host "[1/5] Stopping Docker containers..." -ForegroundColor Yellow
docker-compose down
Start-Sleep -Seconds 2

# Step 2: Create migration directory
Write-Host "[2/5] Creating migration package..." -ForegroundColor Yellow
if (Test-Path $OutputPath) {
    Remove-Item -Path $OutputPath -Recurse -Force
}
New-Item -ItemType Directory -Path $OutputPath -Force | Out-Null

# Step 3: Copy project files
Write-Host "[3/5] Copying project files..." -ForegroundColor Yellow
$excludePatterns = @(
    '*.pyc',
    '__pycache__',
    'node_modules',
    '.git',
    '.vscode',
    'venv',
    'env',
    '*.log',
    '.pytest_cache',
    'migration_package'
)

# Copy all files except excluded patterns
Get-ChildItem -Path . -Recurse | Where-Object {
    $item = $_
    $shouldExclude = $false
    foreach ($pattern in $excludePatterns) {
        if ($item.FullName -like "*$pattern*") {
            $shouldExclude = $true
            break
        }
    }
    -not $shouldExclude
} | ForEach-Object {
    $targetPath = Join-Path $OutputPath $_.FullName.Substring((Get-Location).Path.Length + 1)
    $targetDir = Split-Path $targetPath -Parent
    if (-not (Test-Path $targetDir)) {
        New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
    }
    if (-not $_.PSIsContainer) {
        Copy-Item $_.FullName -Destination $targetPath -Force
    }
}

# Step 4: Verify critical files
Write-Host "[4/5] Verifying critical files..." -ForegroundColor Yellow
$criticalFiles = @(
    "solforge.db",
    "data\solforge.db",
    "agent_*.pth",
    "docker-compose.yml",
    "Dockerfile",
    "requirements.txt"
)

$allPresent = $true
foreach ($file in $criticalFiles) {
    $found = Get-ChildItem -Path $OutputPath -Filter $file -Recurse -ErrorAction SilentlyContinue
    if ($found) {
        Write-Host "  [OK] $file found" -ForegroundColor Green
    } else {
        Write-Host "  [WARN] $file not found" -ForegroundColor Yellow
    }
}

# Check for AI models
$aiModels = Get-ChildItem -Path $OutputPath -Filter "agent_*.pth" -ErrorAction SilentlyContinue
if ($aiModels.Count -gt 0) {
    Write-Host "  [OK] $($aiModels.Count) AI model(s) found" -ForegroundColor Green
} else {
    Write-Host "  [WARN] No AI models found (will create new on target)" -ForegroundColor Yellow
}

# Step 5: Create archive
Write-Host "[5/5] Creating ZIP archive..." -ForegroundColor Yellow
$archivePath = "solforge_migration_$(Get-Date -Format 'yyyyMMdd_HHmmss').zip"
Compress-Archive -Path "$OutputPath\*" -DestinationPath $archivePath -Force

$archiveSize = (Get-Item $archivePath).Length / 1MB
Write-Host "`nMigration package created: $archivePath" -ForegroundColor Green
Write-Host "Archive size: $([math]::Round($archiveSize, 2)) MB`n" -ForegroundColor Green

# Instructions
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "1. Transfer $archivePath to your dev machine" -ForegroundColor White
Write-Host "   - USB drive, network share, or cloud storage`n" -ForegroundColor Gray

Write-Host "2. On target machine, extract the archive:" -ForegroundColor White
Write-Host "   Expand-Archive -Path $archivePath -DestinationPath C:\solforge`n" -ForegroundColor Gray

Write-Host "3. Start SolForge:" -ForegroundColor White
Write-Host "   cd C:\solforge" -ForegroundColor Gray
Write-Host "   docker-compose build" -ForegroundColor Gray
Write-Host "   docker-compose up -d`n" -ForegroundColor Gray

Write-Host "4. Verify deployment:" -ForegroundColor White
Write-Host "   Invoke-WebRequest http://localhost:8000/api/v1/status`n" -ForegroundColor Gray

Write-Host "5. Access dashboard:" -ForegroundColor White
Write-Host "   http://localhost:3000`n" -ForegroundColor Gray

Write-Host "For detailed instructions, see docs/MIGRATION_GUIDE.md" -ForegroundColor Cyan
