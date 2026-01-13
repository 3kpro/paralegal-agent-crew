# OpenCode Setup & Environment Guide - Invoice Generator

This document provides exact instructions for the **OpenCode agent** to initialize and manage the **Invoice Generator** (Tool 1 of Micro-SaaS Tools) via PowerShell.

## 🛠 Project Environment
- **Context Root:** `C:\DEV\3K-Pro-Services\Dev\products\idea_04_MICRO_SAAS_TOOLS\`
- **Primary stack:** Next.js (React), Supabase, Clerk, Vercel
- **Output Directory:** `.\dist\` (if applicable)

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

### 2. Initialize Next.js Project (When Ready)
```powershell
npx create-next-app@latest invoice-generator --typescript --tailwind --app
cd invoice-generator
npm install
```

### 3. Environment Variables
Create `.env.local` with:
```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your-clerk-key
CLERK_SECRET_KEY=your-clerk-secret

# Email (Resend)
RESEND_API_KEY=your-resend-key

# Stripe
STRIPE_SECRET_KEY=your-stripe-secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-public-key
```

## 📖 Agent Context
- **Vision:** Read `TRUTH.md` for the core project mission
- **MVP Scope:** Invoice creation, PDF export, email delivery, templates
- **Anti-Scope:** No full accounting, no payment processing (v1)

## 📋 Task Management
When performing work:
1. Check `TASKS.md` for current objectives
2. Update `CHANGELOG.md` upon completion
3. Use `Write-Output` to confirm status to the user

## 🎯 Development Workflow

**When building features:**
1. Read TRUTH.md to confirm feature is in MVP scope
2. Check TASKS.md for task details
3. Build feature
4. Test locally
5. Update CHANGELOG.md
6. Mark task complete in TASKS.md

**When stuck:**
- Check TRUTH.md → Is this feature in scope?
- Check Anti-Scope → Should we skip this for v1?
- Ask user for clarification if needed

## 🚫 Restrictions

**This agent MUST:**
- Work ONLY on files in `idea_04_MICRO_SAAS_TOOLS/` folder
- NOT touch other products in `Dev/products/`
- NOT modify company-level files (`3kpro-website/` or `landing-page/`)

**This agent MUST NOT:**
- Build features outside TRUTH.md scope
- Deploy to production without user approval
- Modify TRUTH.md (user-managed file)

## 📊 Success Metrics
- MVP complete: 2026-02-15
- 10 beta users: 2026-02-20
- Public launch: 2026-03-01
- 50 customers: 2026-04-01
- $1,800 MRR: 2026-06-01

---

**Agent Contract Version:** 1.0
**Last Updated:** 2026-01-09
**Product:** Invoice Generator (Tool 1 of 4 Micro-SaaS Tools)
