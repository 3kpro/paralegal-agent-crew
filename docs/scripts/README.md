# Deployment Scripts

Quick automation for common git workflows.

## Deploy Script

Safely merges a feature branch to main and deploys to production via Vercel.

### Usage

**Mac/Linux:**
```bash
chmod +x deploy.sh
./deploy.sh feature/topic-scrapper
```

**Windows (PowerShell):**
```cmd
deploy.bat feature/topic-scrapper
```

**Default branch:** `feature/topic-scrapper` (if no argument provided)

### What it does

1. Checks out `main` branch
2. Pulls latest from `origin/main`
3. Merges your feature branch
4. Pushes to `origin/main`
5. Vercel auto-deploys

### Safety

- **Exits on errors** - Won't continue if checkout/pull/merge/push fails
- **Handles merge conflicts** - Stops and asks you to resolve manually
- **No force pushes** - Safe to use repeatedly

### Prerequisites

- Git installed and configured
- Feature branch pushed to GitHub
- No uncommitted changes on main

---

## Notes

- **Windows users:** Run `.bat` from Command Prompt or PowerShell
- **Mac users:** May need `chmod +x deploy.sh` on first run
- **Merging:** Always review your branch before running
