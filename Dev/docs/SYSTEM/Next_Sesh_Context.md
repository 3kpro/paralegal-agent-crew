# Claude Session Context - 3K Pro Services

**Last Updated:** 2026-02-03
**Purpose:** Quick context file to onboard new Claude sessions without re-explaining setup

---

## 🏢 Business Overview

**Company:** 3K Pro Services
**Primary Contact:** admin@3kpro.services
**Support Email:** support@getxelora.com (Xelora product)

**Active Products:**
- **Xelora** - Main SaaS product (getxelora.com)
- **3kpro.services** - Business profile site
- Multiple product ideas in development (see PRODUCT_INVENTORY.md)

---

## 💻 Development Environment

**Operating System:** Windows 11
**Node.js Version:** v24.9.0
**Primary IDE:** VSCode with Claude Code extension
**Shell:** PowerShell

**Key Directories:**
```
C:\DEV\3K-Pro-Services\
├── landing-page\          # Xelora landing page (Next.js 16)
├── Dev\
│   ├── products\         # Product development
│   └── docs\SYSTEM\      # System documentation
└── .claude\              # Claude project configs
```

**Git Configuration:**
- Author: "3K Pro Services" <admin@3kpro.services>
- Alternate: antigravity@google.com (has permission issues on Vercel)

---

## 🚀 Tech Stack

### Frontend
- **Next.js 16** (App Router, TypeScript)
- **React 19**
- **Tailwind CSS**
- **Framer Motion** for animations

### Deployment
- **Platform:** Vercel
- **Domain:** getxelora.com (migrated from xelora.app)
- **Team:** 3kpro's projects

### Backend/Services
- **Supabase** (Auth, Database)
- **Stripe** (Payments)
- **Google Search Console** (SEO)

---

## ⚠️ Known Issues & Quirks

### 1. Vercel Deployment Problems
**Issue:** GitHub webhooks don't trigger auto-deployments
**Symptom:** Pushing to main doesn't deploy; manual "Redeploy" uses old commits
**Solution:** Use deploy hook with curl:
```bash
curl -X POST --ssl-no-revoke https://api.vercel.com/v1/integrations/deploy/prj_AQl8FdSzVdBBB3ORZti2pxDZsDSP/IXNodqb5fN
```

**Alternative:** `/deploy --force` skill (may have permission issues)

### 2. Vercel CLI Permissions
**Issue:** `vercel --prod` fails with "Git author must have access to team"
**Cause:** Git author antigravity@google.com not in Vercel team
**Workaround:** Use deploy hook instead

### 3. Windows curl SSL Issues
**Issue:** `curl: CRYPT_E_NO_REVOCATION_CHECK`
**Solution:** Always use `--ssl-no-revoke` flag on Windows

### 4. 3kpro.services Profile Issues
**Recent:** Profile not returning properly - check console for errors
**Status:** Active investigation

---

## 📋 Current Active Projects

### 1. Xelora Landing Page (landing-page/)
**Status:** Production
**URL:** https://getxelora.com
**Repo:** github.com/3kpro/content-cascade-ai-landing
**Branch:** main

**Recent Work:**
- SEO domain migration from xelora.app → getxelora.com
- Google Search Console verification
- Updated all canonical URLs and OpenGraph metadata
- Fixed sitemap configuration

**Key Files:**
- [app/layout.tsx](../../../landing-page/app/layout.tsx) - Root layout, Google verification
- [app/sitemap.ts](../../../landing-page/app/sitemap.ts) - SEO sitemap
- [vercel.json](../../../landing-page/vercel.json) - Redirect rules

### 2. 3kpro.services
**Status:** Investigation needed
**Issue:** Profile not loading correctly

---

## 🔧 Common Workflows

### Deployment Process
1. Make code changes
2. Stage: `git add -A`
3. Commit: `git commit -m "message\n\nCo-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"`
4. Push: `git push origin main`
5. Trigger deploy hook (auto-deploy broken):
   ```bash
   curl -X POST --ssl-no-revoke https://api.vercel.com/v1/integrations/deploy/prj_AQl8FdSzVdBBB3ORZti2pxDZsDSP/IXNodqb5fN
   ```

### SEO Updates
- All canonical URLs use `https://getxelora.com`
- Sitemap: `https://getxelora.com/sitemap.xml`
- Google verification tag in [app/layout.tsx:59](../../../landing-page/app/layout.tsx#L59)
- Current verification code: `Yl16_c5k1ifJGYWUuy5Tmh2uShFD1COlwAsalez_e4c`

---

## 🎯 User Preferences

**Working Style:**
- User prefers Claude to execute commands directly (don't ask, just do)
- Use TodoWrite tool to track multi-step tasks
- Provide educational insights (`✶ Insight` blocks) when explaining implementations
- Use clickable file references: `[filename.ts](path/to/file.ts)` or `[file.ts:42](path#L42)`

**Don't:**
- Ask permission for routine commands (git, npm, file operations)
- Over-engineer solutions - keep it simple
- Add unnecessary abstractions or "improvements" beyond the ask

**Do:**
- Be proactive with task management
- Mark todos as completed immediately after finishing
- Provide clear next steps
- Include specific file paths and line numbers when referencing code

---

## 📊 Recent Session History

### 2026-02-03: Domain Migration & Deployment Issues
- Migrated xelora.app → getxelora.com across entire codebase
- Updated 9 critical SEO files (layouts, metadata, emails)
- Created comprehensive migration guide: GOOGLE_SEARCH_CONSOLE_MIGRATION.md
- Debugged Vercel GitHub webhook failures
- Set up deploy hook workaround for manual deployments
- Fixed Google Search Console verification (meta tag method)

**Commits:**
- `5335fde` - Initial domain migration changes
- `fea9cce` - Google verification HTML file attempt
- `cee859c` - Google verification meta tag (current)

---

## 🔗 Important Resources

**Documentation:**
- [SYSTEM Docs](./README.md)
- [Product Inventory](./PRODUCT_INVENTORY.md)
- [Shared Auth Schema](./SHARED_SCHEMA.sql)
- [Google Search Console Migration](../../../landing-page/GOOGLE_SEARCH_CONSOLE_MIGRATION.md)

**External:**
- [Vercel Dashboard](https://vercel.com/dashboard)
- [Google Search Console](https://search.google.com/search-console)
- [GitHub Repo](https://github.com/3kpro/content-cascade-ai-landing)

---

## 💡 Quick Reference Commands

```bash
# Navigate to landing page
cd C:\DEV\3K-Pro-Services\landing-page

# Check git status
git status

# Force deployment
curl -X POST --ssl-no-revoke https://api.vercel.com/v1/integrations/deploy/prj_AQl8FdSzVdBBB3ORZti2pxDZsDSP/IXNodqb5fN

# View recent commits
git log --oneline -5

# Check Vercel deployment status
vercel ls

# Install dependencies
npm install
```

---

## 📝 Notes for New Sessions

1. **Always check working directory first** - User has multiple projects
2. **Windows environment** - Use PowerShell syntax, remember SSL flags for curl
3. **Deployment is tricky** - GitHub webhooks broken, use deploy hook
4. **SEO is critical** - Domain migration in progress, Google verification active
5. **Be proactive** - User wants action, not questions
6. **Track tasks** - Use TodoWrite for multi-step work

---

**Template Usage:**
When starting a new session, paste this context and say: "Continuing from previous session - here's the context file. I need help with [your issue]."
