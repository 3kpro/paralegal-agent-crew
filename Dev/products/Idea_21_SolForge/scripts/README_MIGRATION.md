# Migration Scripts

Quick Docker "lift and shift" between machines.

## Usage

### On Source Machine (Current PC)

```powershell
# Export everything to a migration package
.\scripts\migrate_to_dev_machine.ps1

# This creates: solforge_migration_YYYYMMDD_HHMMSS.zip
```

**Transfer the ZIP file** to your dev machine via:
- USB drive
- Network share
- Cloud storage (Google Drive, Dropbox, etc.)

### On Target Machine (Dev Machine)

```powershell
# Import and deploy
.\scripts\import_on_dev_machine.ps1 -ArchivePath "C:\path\to\solforge_migration_20260112_143022.zip"

# Or specify custom install location
.\scripts\import_on_dev_machine.ps1 -ArchivePath ".\solforge_migration.zip" -InstallPath "D:\trading\solforge"
```

The import script will:
1. Extract the archive
2. Verify all files
3. Build Docker images
4. Start the services
5. Verify deployment

## What Gets Transferred

✅ **Preserved State:**
- SQLite database (all trades and lane state)
- AI model checkpoints (3x `.pth` files)
- Configuration (`.env` file)
- Source code
- Docker configuration

✅ **Result:**
- Lanes resume exactly where they left off
- Trade history intact
- AI models continue training from last checkpoint

## Quick Verification

After import, check that everything works:

```powershell
# Check API status
Invoke-RestMethod http://localhost:8000/api/v1/status

# Check lanes
Invoke-RestMethod http://localhost:8000/api/v1/lanes

# View dashboard
Start-Process http://localhost:3000
```

## Troubleshooting

### Port already in use
Edit `docker-compose.yml` and change port mappings:
```yaml
ports:
  - "8001:8000"  # Use 8001 instead of 8000
```

### Database not found
Move database to correct location:
```powershell
New-Item -ItemType Directory -Path data -Force
Move-Item solforge.db data\solforge.db
```

### View logs
```powershell
docker-compose logs -f backend
```

## Full Documentation

See [../docs/MIGRATION_GUIDE.md](../docs/MIGRATION_GUIDE.md) for complete migration documentation including:
- Linux/WSL instructions
- VPS deployment
- Systemd setup
- Production configuration
- Backup strategies
