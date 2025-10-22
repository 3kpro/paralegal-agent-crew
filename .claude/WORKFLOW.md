# TrendPulse Development Workflow

## ZenCoder Agent Commands

Use these slash commands for autonomous task handling:

### `/deploy "commit message"`
**Purpose**: Deploy changes to production
**What it does**:
- Stages all changes (git add -A)
- Creates commit with provided message
- Pushes to GitHub
- Deploys to Vercel production
- Reports deployment URL and status

**Example**:
```
/deploy "Add campaign deletion feature"
```

---

### `/fix-cache`
**Purpose**: Fix stale UI/caching issues
**What it does**:
- Identifies caching problem
- Adds cache-busting mechanisms
- Deploys immediately
- Verifies fix

**When to use**: User sees old UI even after deployment

---

### `/quick-fix`
**Purpose**: Handle small bugs autonomously
**What it does**:
- Investigates bug
- Makes targeted fix
- Deploys automatically
- Reports what was fixed

**Scope**: Small UI bugs, simple logic errors, config tweaks
**Out of scope**: Architecture changes, new features, migrations

---

## Development Workflow

### Standard Development
1. User describes feature/bug
2. Claude implements changes
3. User tests locally (optional)
4. Run `/deploy "description"`
5. User verifies on production

### Autonomous Bug Fixing (Multitasking Mode)
1. User reports bug and says "handle it in background"
2. Run `/quick-fix`
3. Agent works autonomously
4. User can work on other tasks
5. Agent reports when complete

### Cache Issues
1. User reports seeing old UI
2. Run `/fix-cache`
3. Agent identifies and fixes
4. Deploys automatically

---

## Environment Variables

### Production (Vercel)
- `GOOGLE_API_KEY`: Gemini API (39 chars)
- `ENCRYPTION_KEY`: AES-256 key (64 hex chars)
- All other keys from .env.local

### Local Development
- Use `.env.local` file
- Never commit to git
- All keys should be in 1Password

---

## Deployment Info

**Production URL**: https://trendpulse.3kpro.services
**Vercel Project**: 3kpros-projects/landing-page
**GitHub**: https://github.com/3kpro/content-cascade-ai-landing
**Tech Stack**: Next.js 15, Supabase, Vercel

---

## Common Issues

### Browser Cache
- Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
- Or use incognito mode
- Or run `/fix-cache`

### Environment Variables
- Use `printf` not `echo` to avoid trailing newlines
- Verify with `/api/diagnostic` endpoint
- Must be exact length (ENCRYPTION_KEY = 64, GOOGLE_API_KEY = 39)

### API Caching
- All API routes must have `export const dynamic = 'force-dynamic'`
- Use `cache: 'no-store'` in fetch requests
- Add Cache-Control headers to responses

---

*Last updated: 2025-10-22*
