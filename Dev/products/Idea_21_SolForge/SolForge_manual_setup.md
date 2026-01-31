# SolForge Manual Setup Instructions
**Use this if the PowerShell script has execution issues**

---

## 📦 Step 1: Extract the ZIP
1. Right-click `solforge_migration_20260131_021409.zip`
2. Select "Extract All..."
3. Extract to: `C:\solforge\`
4. Ensure all files are extracted properly

## 🔍 Step 2: Verify Contents
Check that these files exist in `C:\solforge\`:
- `docker-compose.yml`
- `Dockerfile`
- `requirements.txt`
- `config/` directory
- `src/` directory
- `solforge.db` (database)
- `agent_*.pth` files (AI models - should be 6 files)

## 🐳 Step 3: Docker Setup
1. **Open PowerShell as Administrator**
2. **Navigate to directory**:
   ```powershell
   cd C:\solforge
   ```

3. **Verify Docker**:
   ```powershell
   docker --version
   docker info
   ```

## 🔨 Step 4: Build and Start
1. **Build Docker images** (5-15 minutes):
   ```powershell
   docker-compose build
   ```

2. **Start services**:
   ```powershell
   docker-compose up -d
   ```

## ✅ Step 5: Verify Deployment
1. **Check services**:
   ```powershell
   docker-compose ps
   ```

2. **Wait 2 minutes**, then test API:
   ```powershell
   curl http://localhost:8000/api/v1/status
   ```

3. **Access dashboard**: http://localhost:3000

## 🛠️ Useful Commands
```powershell
# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Restart services
docker-compose restart
```

## 🚨 Troubleshooting
If containers fail to start:
```powershell
# Check detailed logs
docker-compose logs backend
docker-compose logs frontend

# Rebuild if needed
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

**This manual approach achieves the same result as the PowerShell script!**