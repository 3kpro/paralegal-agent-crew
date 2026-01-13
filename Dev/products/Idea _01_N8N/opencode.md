# OpenCode Setup & Environment Guide

This document provides exact instructions for the **OpenCode - grok fast code 1** agent to initialize and manage the **n8n Workflow Marketplace** environment via PowerShell.

## 🛠 Project Environment
- **Context Root:** `C:\DEV\3K-Pro-Services\Dev\products\Idea _01_N8N\`
- **Primary stack:** n8n (JSON Workflows), Markdown (Docs)
- **Output Directory:** `.\dist\`

## 🚀 Setup Instructions

### 1. Verify Project Integrity
Run the following to ensure all core MVP files are present:
```powershell
Get-ChildItem -Path ".\workflows", ".\docs", ".\assets" -Filter *.json, *.md
```

### 2. Prepare Release Build
To refresh the `dist` folder and package the workflows for distribution, execute:
```powershell
# Create fresh dist structure
New-Item -ItemType Directory -Force -Path ".\dist\workflows", ".\dist\docs"

# Sync assets to dist
Copy-Item ".\workflows\*.json" -Destination ".\dist\workflows" -Force
Copy-Item ".\docs\*.md" -Destination ".\dist\docs" -Force
Copy-Item ".\readme.md" -Destination ".\dist" -Force
```

### 3. Validation Scripts
To quickly check for any broken links in the documentation:
```powershell
Select-String -Path ".\docs\*.md", ".\readme.md" -Pattern "\[.*\]\(.*\)"
```

## 📖 Agent Context
- **Vision:** Read `TRUTH.md` for the core project mission.
- **Workflow Manual:** Review `docs\WORKFLOW_MANUAL.md` to understand node dependencies.
- **Testing:** Follow `docs\TESTING.md` if performing live terminal-based validation (requires `curl` or `Invoke-RestMethod`).

## 📋 Task Management
When performing work:
1. Check `TASKS.md` for current objectives.
2. Update `CHANGELOG.md` upon completion.
3. Use `Write-Output` to confirm status to the user.
