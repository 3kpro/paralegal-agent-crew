# ComplianceGhost - SOC 2 Evidence Autopilot

> **Status:** Scaffolding Complete 🏗️  
> **Mission:** Automate SOC 2 evidence collection so you never manually screenshot your AWS console again.

## 🎯 Problem

Companies pursuing SOC 2 spend 200-400 hours manually collecting evidence — screenshots, log exports, policy documents. Auditors request the same 150+ evidence types every year, yet teams rebuild this from scratch each cycle.

## 💡 Solution

ComplianceGhost connects to your infrastructure (AWS, GitHub, Okta), automatically captures evidence on schedule, and maps it to SOC 2 control requirements. Export a complete evidence package when auditors come knocking.

## 🏗️ Project Structure

```
Idea_07_SOC2_Evidence_Autopilot/
├── TRUTH.md          # Product spec and vision
├── TASKS.md          # Current work queue
├── CHANGELOG.md      # Development history
├── readme.md         # This file
├── opencode.md       # Agent setup instructions
├── assets/           # Marketing materials
├── docs/             # Technical documentation
├── src/              # Source code
└── dist/             # Release artifacts
```

## 🚀 Getting Started

1. **Read the Vision**: Check `TRUTH.md` for product scope and constraints.
2. **Check Tasks**: See `TASKS.md` for current development priorities.
3. **Agent Setup**: Follow `opencode.md` for environment configuration.

## 📊 Core Features (MVP)

- OAuth connectors (AWS, GitHub, Okta)
- Scheduled evidence capture
- Evidence-to-control mapping
- Gap detection dashboard
- Auditor export (ZIP)

---
*Built with ❤️ by Antigravity.*
