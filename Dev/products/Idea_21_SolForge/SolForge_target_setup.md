# SolForge Target Machine Setup Guide

**Guide for importing and running SolForge on target Windows 11 machine with Docker**

---

## 🎯 Overview

This guide walks you through setting up SolForge on the target machine after receiving the migration ZIP from the source machine.

---

## 📋 Prerequisites

### Required Software
1. **Docker Desktop** - Download from: https://www.docker.com/products/docker-desktop/
2. **PowerShell** - Included with Windows 11
3. **Migration ZIP file** - Created on source machine (e.g., `solforge_migration_20241201_143022.zip`)

---

## 🚀 Quick Setup (5 minutes)

### Step 1: Prepare Environment
1. **Create installation directory**:
   ```powershell
   mkdir C:\solforge
   cd C:\solforge
   ```

2. **Place the migration ZIP file** in this directory
   - Copy from USB drive, network share, or download from cloud storage
   - Ensure the ZIP file and this script are in `C:\solforge\`

### Step 2: Import and Deploy
1. **Run the import script** (replace with your actual ZIP name):
   ```powershell
   .\migrate_solforge.ps1 -Mode import -PackageName solforge_migration_20241201_143022
   ```

2. **The script will automatically**:
   - Extract the ZIP file
   - Verify all critical files are present
   - Check Docker installation
   - Build Docker images (5-15 minutes on first run)
   - Start all services
   - Verify deployment is working

### Step 3: Access Your SolForge
- **Dashboard**: http://localhost:3000
- **API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

---

## 📊 What Gets Imported

### ✅ Preserved from Source Machine
- **Trading History**: All past trades in `solforge.db`
- **AI Models**: Trained reinforcement learning models (`agent_*.pth`)
- **Configurations**: All settings and risk profiles
- **Source Code**: Complete application code

### 🔄 Fresh Start
- **Docker Environment**: New containers built on target machine
- **Dependencies**: Fresh install of all packages
- **Active Sessions**: Trading lanes restart (with preserved data)

---

## 🛠️ Useful Commands After Setup

### View Services Status
```powershell
cd C:\solforge
docker-compose ps
```

### View Logs
```powershell
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Stop Services
```powershell
docker-compose down
```

### Restart Services
```powershell
docker-compose restart
```

### Update Configuration
```powershell
# Edit config files
notepad config\config.yaml

# Restart to apply changes
docker-compose restart
```

---

## 🔍 Verification Checklist

After the import script completes, verify:

### ✅ Service Status
- [ ] Dashboard loads at http://localhost:3000
- [ ] API responds at http://localhost:8000/api/v1/status
- [ ] Both Docker containers are running

### ✅ Data Integrity
- [ ] Trading history preserved in dashboard
- [ ] AI models detected (should show 3 models)
- [ ] Lane configurations maintained
- [ ] Database contains historical trades

### ✅ Functionality
- [ ] Lanes show activity status
- [ ] Price feeds are updating
- [ ] Guardrails are active
- [ ] Telegram alerts working (if configured)

---

## 🚨 Troubleshooting

### Docker Issues
**Problem**: "Docker not found"
```powershell
# Install Docker Desktop from: https://www.docker.com/products/docker-desktop/
# Start Docker Desktop and wait for it to be ready
docker info  # Should show Docker daemon info
```

**Problem**: "Port already in use"
```powershell
# Check what's using port 8000 or 3000
netstat -ano | findstr :8000
netstat -ano | findstr :3000

# Kill the process (replace PID)
taskkill /PID <PID> /F
```

### Import Issues
**Problem**: "Archive not found"
- Ensure the ZIP file is in the same directory as the script
- Check the exact filename including timestamp

**Problem**: "Build failed"
- Check internet connection (Docker needs to download packages)
- Try restarting Docker Desktop
- Run: `docker-compose build --no-cache`

### Runtime Issues
**Problem**: Services not starting
```powershell
# Check detailed logs
docker-compose logs backend
docker-compose logs frontend

# Restart everything
docker-compose down
docker-compose up -d
```

**Problem**: API not responding
```powershell
# Wait a bit longer (first start can take 2-3 minutes)
# Check if backend is running
docker-compose ps

# Check logs for errors
docker-compose logs backend
```

---

## 📁 Directory Structure After Setup

```
C:\solforge\
├── docker-compose.yml          # Docker orchestration
├── Dockerfile                   # Backend container definition
├── src/                         # Application source code
├── config/                      # Configuration files
├── data/                        # Database and models (extracted)
├── solforge.db                 # Trading database (extracted)
├── agent_*.pth                 # AI models (extracted)
├── migrate_solforge.ps1        # This migration script
└── solforge_migration_*.zip    # Original migration package
```

---

## 🎛️ Advanced Operations

### Access Container Shell
```powershell
# Backend container
docker-compose exec backend bash

# Frontend container  
docker-compose exec frontend sh
```

### Manual Database Access
```powershell
# Access database inside container
docker-compose exec backend sqlite3 /app/data/solforge.db
```

### Update AI Models
```powershell
# Replace models in data/ directory
# Then restart backend
docker-compose restart backend
```

### Change Trading Configuration
```powershell
# Edit configuration
notepad config\config.yaml

# Restart backend to apply
docker-compose restart backend
```

---

## 📱 Monitoring

### Check System Health
```powershell
# API Health Check
curl http://localhost:8000/api/v1/status

# Lane Readiness
curl http://localhost:8000/api/v1/lanes/readiness
```

### Monitor Resource Usage
```powershell
# Docker stats
docker stats

# Container resource usage
docker-compose exec backend top
```

---

## 🚀 Next Steps

1. **Explore Dashboard**: Open http://localhost:3000
2. **Verify Lanes**: Check that trading lanes are active
3. **Monitor Performance**: Watch readiness scores over 2-4 weeks
4. **Configure Alerts**: Set up Telegram notifications if not already done
5. **Consider Production**: Plan cloud deployment for live trading

---

## 📞 Support

If you encounter issues:

1. **Check the logs**: `docker-compose logs -f`
2. **Verify Docker**: Ensure Docker Desktop is running
3. **Check ports**: Confirm 8000 and 3000 are available
4. **Review configuration**: Ensure `config/config.yaml` is correct
5. **Document the issue**: Screenshot any error messages

---

**✅ Success! Your SolForge trading bot is now running on Docker.**

*The AI models and trading history have been preserved from the source machine.*