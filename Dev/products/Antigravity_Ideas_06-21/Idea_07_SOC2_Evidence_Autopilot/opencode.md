# OpenCode Setup & Environment Guide

This document provides exact instructions for the **OpenCode** agent to initialize and manage the **ComplianceGhost** environment.

## 🛠 Project Environment
- **Context Root:** `C:\DEV\3K-Pro-Services\Dev\products\Idea_07_SOC2_Evidence_Autopilot\`
- **Primary Stack:** Node.js/Python, PostgreSQL, Redis, S3, React
- **Output Directory:** `.\dist\`

## 🚀 Setup Instructions

### 1. Initialize Node Environment
```powershell
npm init -y
npm install express bull redis pg aws-sdk @octokit/rest @okta/okta-sdk-nodejs
```

### 2. Environment Variables
```powershell
# Create .env file
@"
DATABASE_URL=postgresql://localhost:5432/complianceghost
REDIS_URL=redis://localhost:6379
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_secret
OKTA_ORG_URL=https://your-org.okta.com
OKTA_API_TOKEN=your_token
S3_BUCKET=complianceghost-evidence
"@ | Out-File -FilePath .env -Encoding utf8
```

### 3. Database Setup
```powershell
psql -U postgres -c "CREATE DATABASE complianceghost;"
```

### 4. Run Development Server
```powershell
npm run dev
```

## 📖 Agent Context
- **Vision:** Read `TRUTH.md` for the core project mission and anti-scope.
- **Tasks:** Check `TASKS.md` for current objectives.
- **Integrations:** Each cloud provider has its own connector in `src/connectors/`.

## 📋 Task Management
When performing work:
1. Check `TASKS.md` for current objectives.
2. Update `CHANGELOG.md` upon completion.
3. Move completed tasks from NOW to COMPLETED.

## 🔌 Key Integrations
- **AWS:** IAM policies, CloudTrail logs, S3 bucket configs
- **GitHub:** Branch protection, PR requirements, audit logs
- **Okta:** User provisioning, MFA policies, access logs
