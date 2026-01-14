# SolForge Migration Guide

## Lift and Shift Between Machines Using Docker

This guide shows how to move your running SolForge instance from one machine to another while preserving all state, trades, and AI models.

---

## Step 1: Package on Source Machine

### 1.1 Stop Running Containers (if any)

```bash
cd c:\DEV\3K-Pro-Services\Dev\products\Idea_21_SolForge
docker-compose down
```

### 1.2 Create Migration Package

```bash
# Create migration directory
mkdir migration_package
cd migration_package

# Copy entire project
xcopy ..\* . /E /I /H /EXCLUDE:.dockerignore

# Verify critical files are present
dir data\solforge.db
dir agent_*.pth
dir .env
```

### 1.3 Archive for Transfer

```bash
# Create ZIP archive
tar -czf solforge_migration.tar.gz .

# Or use 7zip on Windows
7z a -tzip solforge_migration.zip *
```

**What's Included:**
- ✅ SQLite database (`data/solforge.db` or `solforge.db`)
- ✅ AI model checkpoints (`agent_*.pth`)
- ✅ Source code
- ✅ Docker configuration
- ✅ Environment variables (`.env`)

---

## Step 2: Transfer to Target Machine

### Option A: Network Transfer

```bash
# Using SCP (Linux/WSL)
scp solforge_migration.tar.gz user@target-machine:/home/user/

# Using SFTP (Windows)
# Use WinSCP or FileZilla to transfer the .tar.gz file
```

### Option B: USB Drive / Cloud Storage

```bash
# Copy to USB drive
copy solforge_migration.zip d:\

# Or upload to cloud
# - Google Drive
# - Dropbox
# - OneDrive
```

---

## Step 3: Deploy on Target Machine

### 3.1 Extract Package

```bash
# On Linux/WSL target machine
cd ~/solforge
tar -xzf solforge_migration.tar.gz

# On Windows target machine
7z x solforge_migration.zip -o"C:\solforge"
cd C:\solforge
```

### 3.2 Verify State Files

```bash
# Check database exists
ls -lh data/solforge.db  # or ls -lh solforge.db

# Check AI models exist
ls -lh agent_*.pth

# Verify environment file
cat .env
```

### 3.3 Update Environment Variables (if needed)

```bash
# Edit .env file for new machine
nano .env  # or vim, notepad, etc.
```

Update these if changed:
- `SOLANA_RPC_URL` (if using different RPC endpoint)
- `HELIUS_API_KEY` (if applicable)
- `TELEGRAM_BOT_TOKEN` (if applicable)

---

## Step 4: Start with Docker Compose

### 4.1 Build and Start

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# Check logs
docker-compose logs -f backend
```

### 4.2 Verify Migration Success

```bash
# Check backend is running
curl http://localhost:8000/api/v1/status

# Access dashboard
open http://localhost:3000  # or visit in browser
```

---

## Production Deployment (Always-On Server)

For 24/7 operation on a VPS or dedicated server:

### Option 1: Using Production Compose

```bash
cd deployment
docker-compose -f production-compose.yml up -d
```

### Option 2: Using Systemd (Linux)

Create `/etc/systemd/system/solforge.service`:

```ini
[Unit]
Description=SolForge AI Trading Bot
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/home/user/solforge
ExecStart=/usr/bin/docker-compose up -d
ExecStop=/usr/bin/docker-compose down
Restart=always

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl daemon-reload
sudo systemctl enable solforge
sudo systemctl start solforge
sudo systemctl status solforge
```

---

## Troubleshooting

### Database Not Found

```bash
# Check if database path is correct
# SolForge looks for: ./data/solforge.db OR ./solforge.db

# If database is in wrong location, move it
mkdir -p data
mv solforge.db data/solforge.db
```

### AI Models Not Loading

```bash
# Check file permissions
chmod 644 agent_*.pth

# Verify files are not corrupted
ls -lh agent_*.pth

# If models are missing, lanes will create new ones (losing training progress)
```

### Port Conflicts

```bash
# If ports 8000 or 3000 are already in use, edit docker-compose.yml
nano docker-compose.yml

# Change port mappings:
ports:
  - "8001:8000"  # backend on 8001 instead
  - "3001:3000"  # frontend on 3001 instead
```

### Environment Variables Not Loading

```bash
# Ensure .env is in project root
ls -la .env

# Docker Compose automatically loads .env file
# Alternatively, set variables in docker-compose.yml
```

---

## State Preservation Checklist

Before migrating, ensure you have:

- [ ] `solforge.db` (contains all trades and lane state)
- [ ] `agent_*.pth` files (3 files, one per lane)
- [ ] `.env` file with API keys
- [ ] Recent backup (optional but recommended)

### Create Backup Before Migration

```bash
# Backup database
cp data/solforge.db data/solforge.db.backup.$(date +%Y%m%d)

# Backup AI models
tar -czf ai_models_backup.tar.gz agent_*.pth
```

---

## Quick Commands Reference

### Source Machine (Export)

```bash
docker-compose down
tar -czf solforge_migration.tar.gz .
scp solforge_migration.tar.gz user@target:/home/user/
```

### Target Machine (Import)

```bash
tar -xzf solforge_migration.tar.gz
docker-compose build
docker-compose up -d
docker-compose logs -f backend
```

### Verify Success

```bash
curl http://localhost:8000/api/v1/status
curl http://localhost:8000/api/v1/lanes
```

---

## Notes

- **Database is SQLite**: Fully portable, just copy the file
- **AI Models are PyTorch `.pth` files**: Platform-independent
- **No external dependencies**: Everything is containerized
- **State is fully preserved**: Lanes resume exactly where they left off

For production deployment on a VPS, see [DEPLOYMENT_GUIDE.md](../DEPLOYMENT_GUIDE.md).
