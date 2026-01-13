# OpenCode Setup & Environment Guide - AI Prompt Templates

This document provides exact instructions for the **OpenCode agent** to initialize and manage the **AI Prompt Templates Marketplace** via PowerShell.

## 🛠 Project Environment
- **Context Root:** `C:\DEV\3K-Pro-Services\Dev\products\idea_05_AI_PROMPT_TEMPLATES\`
- **Primary stack:** Next.js (React), Supabase, NextAuth, Vercel
- **Content Directory:** `.\prompts\` (curated AI prompts stored as markdown)

## 🚀 Setup Instructions

### 1. Verify Project Integrity
Run the following to ensure all core files are present:
```powershell
Get-ChildItem -Path "." -Filter *.md
```

Expected files:
- TRUTH.md (product vision)
- TASKS.md (feature backlog)
- CHANGELOG.md (update history)
- opencode.md (this file)

### 2. Create Prompts Directory
```powershell
New-Item -ItemType Directory -Force -Path ".\prompts\marketing", ".\prompts\content", ".\prompts\code", ".\prompts\business", ".\prompts\creative"
```

### 3. Initialize Next.js Project (When Ready)
```powershell
npx create-next-app@latest prompt-marketplace --typescript --tailwind --app
cd prompt-marketplace
npm install
```

### 4. Environment Variables
Create `.env.local` with:
```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# NextAuth
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3000

# Stripe
STRIPE_SECRET_KEY=your-stripe-secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-public-key
STRIPE_WEBHOOK_SECRET=your-webhook-secret
```

## 📖 Agent Context
- **Vision:** Read `TRUTH.md` for the core project mission
- **MVP Scope:** 50 curated prompts, marketplace, Stripe payments, user dashboard
- **Anti-Scope:** No custom prompt creation, no community submissions (v1)

## 📋 Task Management
When performing work:
1. Check `TASKS.md` for current objectives
2. Update `CHANGELOG.md` upon completion
3. Use `Write-Output` to confirm status to the user

## 🎯 Prompt Curation Workflow

**When curating prompts:**
1. Read TRUTH.md to understand prompt categories
2. Create markdown file per prompt:
   ```
   prompts/[category]/[prompt-name].md
   ```
3. Markdown format:
   ```markdown
   # Prompt Title
   **Category:** Marketing
   **Price:** $9
   **Description:** Short description of what this prompt does

   ## Full Prompt
   [Insert full prompt text here with [VARIABLES] clearly marked]

   ## Example Output
   [Paste example output from ChatGPT/Claude]

   ## Use Cases
   - Use case 1
   - Use case 2
   ```
4. Test prompt with ChatGPT/Claude before adding to library
5. Log in CHANGELOG.md

## 🚫 Restrictions

**This agent MUST:**
- Work ONLY on files in `idea_05_AI_PROMPT_TEMPLATES/` folder
- NOT touch other products in `Dev/products/`
- NOT modify company-level files (`3kpro-website/` or `landing-page/`)

**This agent MUST NOT:**
- Build features outside TRUTH.md scope
- Deploy to production without user approval
- Modify TRUTH.md (user-managed file)

## 📊 Success Metrics
- 50 prompts curated: 2026-02-28
- MVP complete: 2026-03-15
- 10 beta users: 2026-03-20
- Public launch: 2026-04-01
- 100 prompt sales: 2026-05-01

---

**Agent Contract Version:** 1.0
**Last Updated:** 2026-01-09
**Product:** AI Prompt Templates Marketplace
