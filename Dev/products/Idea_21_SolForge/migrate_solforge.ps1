#!/usr/bin/env pwsh
<#
.SYNOPSIS
    SolForge Docker Migration Script
    Moves SolForge from current machine to dedicated dev machine using Docker

.DESCRIPTION
    This script automates the complete migration process:
    1. Packages SolForge application with state (database, AI models)
    2. Transfers to target machine (via network or manual copy)
    3. Deploys using Docker containers

    The script can be run in two modes:
    - Export: Create migration package on source machine
    - Import: Deploy migration package on target machine

.PARAMETER Mode
    Operation mode: 'export' or 'import'

.PARAMETER TargetHost
    Target machine hostname/IP for network transfer (optional)

.PARAMETER TargetPath
    Installation path on target machine (default: C:\solforge)

.PARAMETER PackageName
    Name for the migration package (default: solforge_migration)

.EXAMPLE
    # Export from source machine
    .\migrate_solforge.ps1 -Mode export

    # Export and transfer to remote machine
    .\migrate_solforge.ps1 -Mode export -TargetHost dev-server.local

    # Import on target machine
    .\migrate_solforge.ps1 -Mode import -PackageName solforge_migration_20241201_143022

.NOTES
    Author: opencode
    Requires: PowerShell 5.1+, Docker, Docker Compose
    For network transfer: SSH client must be available
#>

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet('export', 'import')]
    [string]$Mode,

    [string]$TargetHost,

    [string]$TargetPath = "C:\solforge",

    [string]$PackageName = "solforge_migration",

    [string]$SshUser = $env:USERNAME,

    [switch]$SkipVerification
)

# Configuration
$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

# Colors for output
$Green = "Green"
$Yellow = "Yellow"
$Cyan = "Cyan"
$Red = "Red"
$Gray = "Gray"

function Write-Step {
    param([string]$Message)
    Write-Host "`n[$(Get-Date -Format 'HH:mm:ss')] $Message" -ForegroundColor $Cyan
}

function Write-Success {
    param([string]$Message)
    Write-Host "  [+] $Message" -ForegroundColor $Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "  [!] $Message" -ForegroundColor $Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "  [-] $Message" -ForegroundColor $Red
}

function Test-Docker {
    Write-Step "Checking Docker installation..."

    try {
        $version = docker --version 2>$null
        Write-Success "Docker: $version"
    } catch {
        Write-Error "Docker not found. Please install Docker Desktop."
        exit 1
    }

    try {
        docker-compose --version >$null 2>&1
        Write-Success "Docker Compose available"
    } catch {
        Write-Error "Docker Compose not found."
        exit 1
    }

    # Test Docker daemon
    try {
        docker info >$null 2>&1
        Write-Success "Docker daemon running"
    } catch {
        Write-Error "Docker daemon not running. Start Docker Desktop."
        exit 1
    }
}

function Export-Migration {
    Write-Host "========================================" -ForegroundColor $Cyan
    Write-Host "SolForge Migration - Export Mode" -ForegroundColor $Cyan
    Write-Host "========================================`n" -ForegroundColor $Cyan

    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $archiveName = "${PackageName}_${timestamp}.zip"
    $tempDir = Join-Path $env:TEMP "solforge_export_$timestamp"

    # Step 1: Stop running containers
    Write-Step "Stopping Docker containers..."
    try {
        docker-compose down 2>$null
        Write-Success "Containers stopped"
    } catch {
        Write-Warning "No running containers found or docker-compose failed"
    }

    # Step 2: Create temporary directory
    Write-Step "Creating migration package..."
    if (Test-Path $tempDir) {
        Remove-Item $tempDir -Recurse -Force
    }
    New-Item -ItemType Directory -Path $tempDir -Force | Out-Null

    # Step 3: Copy project files with exclusions
    Write-Step "Copying project files..."

    $excludePatterns = @(
        '__pycache__',
        '*.pyc',
        '*.pyo',
        '.git',
        '.vscode',
        'venv',
        'env',
        'node_modules',
        '.pytest_cache',
        '*.log',
        'migration_package',
        'solforge_migration*.zip'
    )

    $sourcePath = Get-Location

    # Get all files recursively
    Get-ChildItem -Path $sourcePath -Recurse | Where-Object {
        $item = $_
        $shouldExclude = $false

        foreach ($pattern in $excludePatterns) {
            if ($item.FullName -match [regex]::Escape($pattern)) {
                $shouldExclude = $true
                break
            }
        }

        -not $shouldExclude
    } | ForEach-Object {
        $relativePath = $_.FullName.Substring($sourcePath.Path.Length + 1)
        $targetPath = Join-Path $tempDir $relativePath
        $targetDir = Split-Path $targetPath -Parent

        if (-not (Test-Path $targetDir)) {
            New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
        }

        if (-not $_.PSIsContainer) {
            Copy-Item $_.FullName -Destination $targetPath -Force
        }
    }

    # Step 4: Verify critical files
    Write-Step "Verifying critical files..."
    $criticalFiles = @(
        "requirements.txt",
        "Dockerfile",
        "docker-compose.yml"
    )

    $missingFiles = @()
    foreach ($file in $criticalFiles) {
        $found = Get-ChildItem -Path $tempDir -Filter $file -Recurse -ErrorAction SilentlyContinue
        if ($found) {
            Write-Success "$file found"
        } else {
            Write-Error "$file missing"
            $missingFiles += $file
        }
    }

    if ($missingFiles.Count -gt 0) {
        Write-Error "Critical files missing: $($missingFiles -join ', ')"
        exit 1
    }

    # Check state files
    $dbFiles = Get-ChildItem -Path $tempDir -Include "solforge.db" -Recurse -ErrorAction SilentlyContinue
    if ($dbFiles) {
        $dbSize = ($dbFiles | Measure-Object -Property Length -Sum).Sum / 1MB
        Write-Success "Database found ($([math]::Round($dbSize, 2)) MB)"
    } else {
        Write-Warning "No database found - will start fresh"
    }

    $aiModels = Get-ChildItem -Path $tempDir -Filter "agent_*.pth" -Recurse -ErrorAction SilentlyContinue
    if ($aiModels.Count -gt 0) {
        Write-Success "$($aiModels.Count) AI model(s) found"
    } else {
        Write-Warning "No AI models found - lanes will create new ones"
    }

    # Step 5: Create archive
    Write-Step "Creating ZIP archive..."
    $archivePath = Join-Path (Get-Location) $archiveName

    try {
        Compress-Archive -Path "$tempDir\*" -DestinationPath $archivePath -Force
        $archiveSize = (Get-Item $archivePath).Length / 1MB
        Write-Success "Archive created: $archiveName ($([math]::Round($archiveSize, 2)) MB)"
    } catch {
        Write-Error "Failed to create archive: $_"
        exit 1
    }

    # Cleanup temp directory
    Remove-Item $tempDir -Recurse -Force

    # Step 6: Network transfer (if specified)
    if ($TargetHost) {
        Write-Step "Transferring to target machine..."

        # Check if SSH is available
        try {
            $sshVersion = ssh -V 2>$null
            Write-Success "SSH client available"
        } catch {
            Write-Error "SSH client not found. Install OpenSSH or transfer manually."
            Write-Host "`nManual transfer instructions:" -ForegroundColor $Yellow
            Write-Host "1. Copy $archiveName to target machine" -ForegroundColor $Gray
            Write-Host "2. Run: .\migrate_solforge.ps1 -Mode import -PackageName $archiveName" -ForegroundColor $Gray
            return
        }

        # Transfer via SCP
        try {
            Write-Host "  Transferring via SCP..." -ForegroundColor $Gray
            $remotePath = "/tmp/$archiveName"

            # Use scp to transfer
            $scpCommand = "scp `"$archivePath`" `"${SshUser}@${TargetHost}:$remotePath`""
            Invoke-Expression $scpCommand

            Write-Success "Archive transferred to ${TargetHost}:$remotePath"

            # Provide remote import command
            Write-Host "`nRun on target machine:" -ForegroundColor $Cyan
            Write-Host "ssh ${SshUser}@${TargetHost}" -ForegroundColor $Gray
            Write-Host "powershell -ExecutionPolicy Bypass -File /tmp/migrate_solforge.ps1 -Mode import -PackageName $archiveName" -ForegroundColor $Gray

        } catch {
            Write-Error "Network transfer failed: $_"
            Write-Host "`nManual transfer instructions:" -ForegroundColor $Yellow
            Write-Host "1. Copy $archiveName to target machine" -ForegroundColor $Gray
            Write-Host "2. Run: .\migrate_solforge.ps1 -Mode import -PackageName $archiveName" -ForegroundColor $Gray
        }
    } else {
        # Manual transfer instructions
        Write-Host "`n========================================" -ForegroundColor $Cyan
        Write-Host "Export Complete!" -ForegroundColor $Green
        Write-Host "========================================`n" -ForegroundColor $Cyan

        Write-Host "Next Steps:" -ForegroundColor $Cyan
        Write-Host "1. Transfer $archiveName to target machine" -ForegroundColor $Gray
        Write-Host "   - USB drive, network share, or cloud storage" -ForegroundColor $Gray
        Write-Host "2. On target machine:" -ForegroundColor $Gray
        Write-Host "   .\migrate_solforge.ps1 -Mode import -PackageName $archiveName" -ForegroundColor $Gray
    }
}

function Import-Migration {
    param([string]$PackageName)

    Write-Host "========================================" -ForegroundColor $Cyan
    Write-Host "SolForge Migration - Import Mode" -ForegroundColor $Cyan
    Write-Host "========================================`n" -ForegroundColor $Cyan

    # Find the archive
    $archivePath = Join-Path (Get-Location) "$PackageName.zip"
    if (-not (Test-Path $archivePath)) {
        # Try without .zip extension
        $archivePath = Join-Path (Get-Location) $PackageName
        if (-not (Test-Path $archivePath)) {
            Write-Error "Archive not found: $PackageName.zip or $PackageName"
            exit 1
        }
    }

    Write-Step "Found archive: $(Split-Path $archivePath -Leaf)"

    # Step 1: Backup existing installation
    if (Test-Path $TargetPath) {
        Write-Step "Backing up existing installation..."
        $backupPath = "${TargetPath}_backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
        Move-Item -Path $TargetPath -Destination $backupPath -Force
        Write-Success "Backup created: $backupPath"
    }

    # Step 2: Extract archive
    Write-Step "Extracting archive to $TargetPath..."
    New-Item -ItemType Directory -Path $TargetPath -Force | Out-Null

    try {
        Expand-Archive -Path $archivePath -DestinationPath $TargetPath -Force
        Write-Success "Archive extracted"
    } catch {
        Write-Error "Failed to extract archive: $_"
        exit 1
    }

    # Step 3: Verify extraction
    Write-Step "Verifying extracted files..."
    Set-Location $TargetPath

    $criticalFiles = @(
        "requirements.txt",
        "Dockerfile",
        "docker-compose.yml"
    )

    $missingFiles = @()
    foreach ($file in $criticalFiles) {
        if (Test-Path $file) {
            Write-Success "$file present"
        } else {
            Write-Error "$file missing"
            $missingFiles += $file
        }
    }

    if ($missingFiles.Count -gt 0) {
        Write-Error "Critical files missing: $($missingFiles -join ', ')"
        exit 1
    }

    # Check state files
    Write-Host "`nState Files:" -ForegroundColor $Cyan
    $dbPath = if (Test-Path "data\solforge.db") { "data\solforge.db" }
              elseif (Test-Path "solforge.db") { "solforge.db" }
              else { $null }

    if ($dbPath) {
        $dbSize = (Get-Item $dbPath).Length / 1KB
        Write-Success "Database: $dbPath ($([math]::Round($dbSize, 2)) KB)"
    } else {
        Write-Warning "No database found - will start fresh"
    }

    $aiModels = Get-ChildItem -Filter "agent_*.pth" -ErrorAction SilentlyContinue
    if ($aiModels.Count -gt 0) {
        Write-Success "AI Models: $($aiModels.Count) found"
        foreach ($model in $aiModels) {
            $modelSize = $model.Length / 1KB
            Write-Host "    - $($model.Name) ($([math]::Round($modelSize, 2)) KB)" -ForegroundColor $Gray
        }
    } else {
        Write-Warning "No AI models - lanes will create new ones"
    }

    # Step 4: Check Docker
    Test-Docker

    # Step 5: Build Docker images
    Write-Step "Building Docker images..."
    Write-Host "  This may take 5-15 minutes on first run..." -ForegroundColor $Gray

    try {
        $buildOutput = docker-compose build 2>&1
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Docker build failed"
            Write-Host $buildOutput -ForegroundColor $Red
            exit 1
        }
        Write-Success "Images built successfully"
    } catch {
        Write-Error "Build failed: $_"
        exit 1
    }

    # Step 6: Start services
    Write-Step "Starting SolForge services..."
    try {
        docker-compose up -d 2>&1 | Out-Null
        if ($LASTEXITCODE -ne 0) {
            throw "docker-compose up failed"
        }
        Write-Success "Services started"
    } catch {
        Write-Error "Failed to start services: $_"
        Write-Host "Check logs: docker-compose logs -f backend" -ForegroundColor $Yellow
        exit 1
    }

    # Wait a bit for services to start
    Write-Step "Waiting for services to initialize..."
    Start-Sleep -Seconds 10

    # Step 7: Verify deployment
    if (-not $SkipVerification) {
        Write-Step "Verifying deployment..."

        try {
            $status = Invoke-WebRequest -Uri "http://localhost:8000/api/v1/status" -TimeoutSec 30 -ErrorAction Stop
            $statusData = $status.Content | ConvertFrom-Json
            Write-Success "Backend API responding"
            Write-Host "  Status: $($statusData.status)" -ForegroundColor $Gray
            Write-Host "  Active Lanes: $($statusData.active_lanes)" -ForegroundColor $Gray
            Write-Host "  Total PnL: $($statusData.total_pnl)" -ForegroundColor $Gray
        } catch {
            Write-Warning "Backend API not responding yet"
            Write-Host "  Check logs: docker-compose logs -f backend" -ForegroundColor $Gray
        }
    }

    # Summary
    Write-Host "`n========================================" -ForegroundColor $Cyan
    Write-Host "Migration Complete!" -ForegroundColor $Green
    Write-Host "========================================`n" -ForegroundColor $Cyan

    Write-Host "Service URLs:" -ForegroundColor $Cyan
    Write-Host "  Backend API: http://localhost:8000/api/v1/status" -ForegroundColor $Gray
    Write-Host "  Dashboard:   http://localhost:3000 (if available)" -ForegroundColor $Gray

    Write-Host "`nUseful Commands:" -ForegroundColor $Cyan
    Write-Host "  View logs:       docker-compose logs -f" -ForegroundColor $Gray
    Write-Host "  Stop services:   docker-compose down" -ForegroundColor $Gray
    Write-Host "  Restart:         docker-compose restart" -ForegroundColor $Gray
    Write-Host "  Check readiness: curl http://localhost:8000/api/v1/lanes/{id}/readiness" -ForegroundColor $Gray

    Write-Host "`nNext Steps:" -ForegroundColor $Cyan
    Write-Host "  1. Open dashboard: http://localhost:3000" -ForegroundColor $Gray
    Write-Host "  2. Verify lanes are active" -ForegroundColor $Gray
    Write-Host "  3. Monitor readiness scores" -ForegroundColor $Gray
    Write-Host "  4. Let it run for 2-4 weeks to reach readiness thresholds" -ForegroundColor $Gray

    Write-Host "`nFor troubleshooting, see docs/MIGRATION_GUIDE.md" -ForegroundColor $Cyan
}

# Main execution
switch ($Mode) {
    'export' {
        Export-Migration
    }
    'import' {
        if (-not $PackageName) {
            Write-Error "PackageName parameter required for import mode"
            exit 1
        }
        Import-Migration -PackageName $PackageName
    }
}