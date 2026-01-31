# SolForge Docker Migration Guide

## Overview

This guide provides detailed instructions for migrating your SolForge AI trading application from one machine to another using Docker. The migration process preserves all application state, including the SQLite database and trained AI models.

## Prerequisites

### Source Machine Requirements
- Windows PowerShell 5.1+
- Docker Desktop installed and running
- SolForge application running or stopped

### Target Machine Requirements
- Windows PowerShell 5.1+
- Docker Desktop installed and running
- Sufficient disk space (at least 2GB free)
- Network connectivity (if using automated transfer)

### Optional Requirements
- SSH client (for automated network transfer)
- Administrative privileges

## Migration Process Overview

The migration consists of three main phases:

1. **Export Phase**: Package the application and state from source machine
2. **Transfer Phase**: Move the package to the target machine
3. **Import Phase**: Deploy and verify on the target machine

## Detailed Instructions

### Phase 1: Export from Source Machine

#### Step 1.1: Prepare the Source Machine

1. Open PowerShell as Administrator
2. Navigate to the SolForge project directory:
   ```powershell
   cd C:\DEV\3K-Pro-Services\Dev\products\Idea_21_SolForge
   ```

#### Step 1.2: Stop Running Services

Before creating the migration package, stop any running Docker containers:

```powershell
# Stop SolForge services
docker-compose down

# Verify containers are stopped
docker ps
```

#### Step 1.3: Run the Export Script

Execute the migration script in export mode:

```powershell
# Basic export (creates local package)
.\migrate_solforge.ps1 -Mode export

# Export with automatic network transfer
.\migrate_solforge.ps1 -Mode export -TargetHost "dev-server.local"

# Export with custom package name
.\migrate_solforge.ps1 -Mode export -PackageName "my_solforge_backup"
```

#### Step 1.4: Verify Export Success

The script will:
- ✅ Stop Docker containers
- ✅ Create a timestamped ZIP archive (e.g., `solforge_migration_20241213_120000.zip`)
- ✅ Include all necessary files and exclude development artifacts
- ✅ Display file verification results
- ✅ Optionally transfer via network (if `-TargetHost` specified)

**Expected Output:**
```
=======================================
SolForge Migration - Export Mode
========================================

[12:00:00] Stopping Docker containers...
  [+] Containers stopped

[12:00:02] Creating migration package...
  [+] requirements.txt found
  [+] Dockerfile found
  [+] docker-compose.yml found
  [+] Database found (15.23 MB)
  [+] 3 AI model(s) found

[12:00:05] Creating ZIP archive...
  [+] Archive created: solforge_migration_20241213_120000.zip (245.67 MB)
```

### Phase 2: Transfer to Target Machine

#### Option A: Network Transfer (Automated)

If you specified `-TargetHost` during export, the script handles this automatically using SCP.

#### Option B: Manual Transfer

1. **USB Drive/Network Share:**
   ```batch
   # Copy the archive to USB drive
   copy solforge_migration_20241213_120000.zip d:\
   ```

2. **Cloud Storage:**
   - Upload to Google Drive, Dropbox, or OneDrive
   - Download to target machine

3. **Network Copy:**
   ```batch
   # Using robocopy (if network share available)
   robocopy "\\source-machine\share" "C:\temp" solforge_migration_*.zip
   ```

### Phase 3: Import on Target Machine

#### Step 3.1: Prepare the Target Machine

1. Install Docker Desktop if not already installed
2. Start Docker Desktop and ensure it's running
3. Open PowerShell as Administrator
4. Create the installation directory:
   ```powershell
   mkdir C:\solforge
   cd C:\solforge
   ```

#### Step 3.2: Transfer and Extract

1. Copy the migration archive to the target machine
2. Place it in the installation directory:
   ```powershell
   # Assuming archive is in C:\temp
   copy C:\temp\solforge_migration_20241213_120000.zip .
   ```

#### Step 3.3: Run the Import Script

Execute the migration script in import mode:

```powershell
# Basic import
.\migrate_solforge.ps1 -Mode import -PackageName "solforge_migration_20241213_120000"

# Import to custom path
.\migrate_solforge.ps1 -Mode import -PackageName "solforge_migration_20241213_120000" -TargetPath "D:\applications\solforge"

# Skip verification (faster import)
.\migrate_solforge.ps1 -Mode import -PackageName "solforge_migration_20241213_120000" -SkipVerification
```

#### Step 3.4: Monitor Import Progress

The script will perform these steps automatically:

1. **Backup existing installation** (if any)
2. **Extract archive** to target directory
3. **Verify critical files** are present
4. **Check Docker installation**
5. **Build Docker images** (may take 5-15 minutes)
6. **Start services**
7. **Verify deployment** by testing API endpoints

**Expected Output:**
```
=======================================
SolForge Migration - Import Mode
========================================

[14:30:00] Found archive: solforge_migration_20241213_120000.zip
[14:30:01] Backing up existing installation...
[14:30:02] Extracting archive to C:\solforge...
[14:30:05] Verifying extracted files...
  [+] requirements.txt present
  [+] Dockerfile present
  [+] docker-compose.yml present

State Files:
  [+] Database: data/solforge.db (15234.56 KB)
  [+] AI Models: 3 found
    - agent_4f041e84.pth (1234.56 KB)
    - agent_ab32d59f.pth (2345.67 KB)
    - agent_ea82934b.pth (3456.78 KB)

[14:30:10] Checking Docker installation...
  [+] Docker: Docker version 24.0.6, build ed223bc
  [+] Docker Compose available
  [+] Docker daemon running

[14:30:12] Building Docker images...
  [+] Images built successfully

[14:30:45] Starting SolForge services...
  [+] Services started

[14:30:55] Verifying deployment...
  [+] Backend API responding
  Status: running
  Active Lanes: 3
  Total PnL: 1250.75
```

## Post-Migration Verification

### Step 4.1: Check Service Status

```powershell
# Check running containers
docker ps

# View service logs
docker-compose logs -f backend

# Check specific service
docker-compose logs backend
```

### Step 4.2: Test API Endpoints

```powershell
# Get system status
Invoke-WebRequest http://localhost:8000/api/v1/status

# List active lanes
Invoke-WebRequest http://localhost:8000/api/v1/lanes

# Check lane readiness
Invoke-WebRequest http://localhost:8000/api/v1/lanes/1/readiness
```

### Step 4.3: Access Dashboard

1. Open web browser
2. Navigate to: `http://localhost:3000`
3. Verify dashboard loads and shows correct data

### Step 4.4: Monitor Trading Activity

```powershell
# Watch logs for trading activity
docker-compose logs -f backend | Select-String -Pattern "TRADE|ARBITRAGE|EXECUTED"

# Check database for recent trades
# (Inside container)
docker exec -it solforge_backend_1 sqlite3 /app/data/solforge.db "SELECT * FROM trades ORDER BY timestamp DESC LIMIT 5;"
```

## Troubleshooting

### Common Issues

#### Issue: Docker Build Fails
**Symptoms:** Build step fails with dependency errors
**Solutions:**
```powershell
# Clear Docker cache
docker system prune -f

# Rebuild without cache
docker-compose build --no-cache

# Check build logs
docker-compose build --progress=plain
```

#### Issue: Services Won't Start
**Symptoms:** `docker-compose up` fails or exits immediately
**Solutions:**
```powershell
# Check service logs
docker-compose logs backend

# Validate configuration
docker-compose config

# Check port conflicts
netstat -ano | findstr ":8000"
```

#### Issue: Database Not Found
**Symptoms:** Application starts but shows no trading history
**Solutions:**
```powershell
# Verify database location
ls -la data/solforge.db

# Check file permissions
icacls data/solforge.db

# Restore from backup if needed
cp data/solforge.db.backup data/solforge.db
```

#### Issue: AI Models Not Loading
**Symptoms:** Lanes show "training" status instead of "ready"
**Solutions:**
```powershell
# Verify model files exist
ls -la agent_*.pth

# Check file sizes (should be > 1MB each)
ls -lh agent_*.pth

# Force model reload
docker-compose restart backend
```

#### Issue: Port Conflicts
**Symptoms:** Services fail to start due to port binding errors
**Solutions:**
```powershell
# Find conflicting processes
netstat -ano | findstr ":8000"

# Change ports in docker-compose.yml
# Edit ports section:
# ports:
#   - "8001:8000"  # Change host port from 8000 to 8001
```

### Performance Issues

#### Slow Startup
- **Cause:** Large database or many AI models
- **Solution:** Wait longer during initial startup (up to 5 minutes)

#### High CPU Usage
- **Cause:** AI training or active trading
- **Solution:** Normal behavior; monitor with `docker stats`

#### Memory Issues
- **Cause:** Insufficient RAM for concurrent operations
- **Solution:** Increase Docker memory allocation in Docker Desktop settings

### Network Issues

#### Cannot Connect to External APIs
```powershell
# Test connectivity
curl https://api.mainnet-beta.solana.com

# Check environment variables
cat .env
```

#### Database Connection Errors
```powershell
# Verify database file
ls -la data/solforge.db

# Check SQLite integrity
docker exec solforge_backend_1 sqlite3 /app/data/solforge.db "PRAGMA integrity_check;"
```

## Advanced Configuration

### Custom Environment Variables

Create or edit `.env` file in the project root:

```env
# Solana RPC Configuration
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
HELIUS_API_KEY=your_helius_key_here

# Trading Parameters
MAX_SLIPPAGE=0.005
RISK_PER_TRADE=0.02

# Telegram Notifications (optional)
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id

# Logging
LOG_LEVEL=INFO
LOG_TO_FILE=true
```

### Production Deployment

For 24/7 operation on a dedicated server:

1. Use production compose file:
   ```powershell
   cd deployment
   docker-compose -f production-compose.yml up -d
   ```

2. Enable automatic restarts:
   ```powershell
   docker-compose up -d --scale backend=1
   ```

3. Monitor with health checks:
   ```powershell
   # Add to cron or Task Scheduler
   # Check every 5 minutes
   Invoke-WebRequest http://localhost:8000/api/v1/health
   ```

### Backup Strategy

#### Automated Backups
```powershell
# Create backup script
# Save as backup_solforge.ps1
param(
    [string]$BackupPath = ".\backups"
)

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupDir = Join-Path $BackupPath "solforge_backup_$timestamp"

New-Item -ItemType Directory -Path $backupDir -Force

# Stop services for clean backup
docker-compose down

# Copy database and models
Copy-Item data\solforge.db $backupDir\
Copy-Item agent_*.pth $backupDir\

# Restart services
docker-compose up -d

# Compress backup
Compress-Archive -Path $backupDir -DestinationPath "$backupDir.zip"
```

#### Scheduled Backups
- Use Windows Task Scheduler to run daily backups
- Store backups on separate storage
- Test restoration periodically

## Security Considerations

### API Keys
- Store sensitive keys in `.env` file
- Never commit `.env` to version control
- Use environment-specific keys for different deployments

### Network Security
- Restrict API access with firewall rules
- Use HTTPS in production (see deployment guide)
- Monitor for unauthorized access attempts

### Database Security
- Regular backups of trading data
- Encrypt sensitive database fields if needed
- Monitor database file permissions

## Support and Resources

### Documentation
- `README.md` - General project information
- `docs/MIGRATION_GUIDE.md` - Alternative migration methods
- `docs/ARCHITECTURE.md` - System architecture details
- `DEPLOYMENT_GUIDE.md` - Production deployment

### Logs and Monitoring
```powershell
# View all logs
docker-compose logs -f

# Follow specific service
docker-compose logs -f backend

# Export logs for analysis
docker-compose logs > solforge_logs_$(Get-Date -Format "yyyyMMdd_HHmmss").txt
```

### Getting Help
1. Check the troubleshooting section above
2. Review Docker and application logs
3. Verify system requirements
4. Test with minimal configuration first

### Version Compatibility
- Ensure source and target machines have compatible Docker versions
- Use the same migration script version on both machines
- Verify Python and dependency versions match

---

## Quick Reference Commands

### Export Commands
```powershell
# Stop services
docker-compose down

# Export locally
.\migrate_solforge.ps1 -Mode export

# Export with network transfer
.\migrate_solforge.ps1 -Mode export -TargetHost "dev-server.local"
```

### Import Commands
```powershell
# Basic import
.\migrate_solforge.ps1 -Mode import -PackageName "solforge_migration_20241213_120000"

# Custom location
.\migrate_solforge.ps1 -Mode import -PackageName "solforge_migration_20241213_120000" -TargetPath "D:\solforge"
```

### Monitoring Commands
```powershell
# Check status
docker-compose ps

# View logs
docker-compose logs -f backend

# Test API
Invoke-WebRequest http://localhost:8000/api/v1/status

# Check resource usage
docker stats
```

### Maintenance Commands
```powershell
# Restart services
docker-compose restart

# Update images
docker-compose pull && docker-compose up -d

# Clean up
docker system prune -f
```