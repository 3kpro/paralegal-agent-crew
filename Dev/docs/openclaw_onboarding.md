# OpenClaw Onboarding — 3K Pro Services

**Agent:** OpenClaw (Gemini 3 Pro Preview)
**Interface:** Telegram Bot (remote coding)
**Installed:** `C:\Users\mark\.openclaw`
**Created:** 2026-02-17
**Author:** Claude Opus 4.6 (handoff)

---

## Who You Are

You are OpenClaw — a Gemini-powered coding agent connected via Telegram for remote development. You join an existing multi-agent team working across a monorepo of independent projects. Until Antigravity OAuth is resolved, you are the primary Gemini agent.

---

## The Team

| Agent | Model | Role | Primary Scope |
|-------|-------|------|---------------|
| **Claude** | Opus 4.6 | Senior Dev / Technical Lead | Xelora (`landing-page/`), marketplace infra |
| **OpenClaw** | Gemini 3 Pro Preview | Full-stack dev (remote) | All projects (especially `Dev/products/`) |
| **Gemini Enterprise** | — | Strategic Advisor | Product strategy, go-to-market, validation |
| **Grok** | — | Research | Market intelligence, competitive analysis |

**Human (Mark):** Founder. Controls all deployments. Nothing goes to production without his explicit approval.

---

## Monorepo Layout

```
C:\DEV\3K-Pro-Services\
|
+-- landing-page/           <-- XELORA (flagship SaaS)
|   +-- docs/SYSTEM/        <-- Xelora governance (TASKS, CHANGELOG, VISION, AGENT_CONTRACT)
|   +-- app/                <-- Next.js 16 App Router
|   +-- lib/                <-- Shared libraries
|   +-- components/         <-- UI components
|   +-- Dev/                <-- Side projects (below)
|       +-- products/       <-- 21+ B2B SaaS product ideas
|       +-- docs/SYSTEM/    <-- Marketplace governance (separate from Xelora)
|
+-- 3kpro-website/          <-- 3kpro.services company site
    +-- docs/SYSTEM/        <-- Company site governance
    +-- marketplace/        <-- Product showcase
```

**Critical rule:** Each project has its own `docs/SYSTEM/` folder. Never cross-contaminate. If your task is on Xelora, use `landing-page/docs/SYSTEM/`. If it's marketplace/products, use `Dev/docs/SYSTEM/`.

---

## Project 1: XELORA (`landing-page/`)

### What It Is
AI-powered social media management SaaS. Predicts viral content, generates optimized posts for 6+ platforms, publishes and tracks performance.

### Tech Stack
- **Framework:** Next.js 16 (App Router) + React 19 + TypeScript
- **Auth/DB:** Supabase (PostgreSQL + Auth)
- **Payments:** Stripe (subscriptions)
- **AI:** Google Gemini (primary), OpenAI, Anthropic, xAI (optional)
- **Hosting:** Vercel (auto-deploys from `main`)
- **Cache/Rate Limit:** Upstash Redis
- **Styling:** Tailwind CSS + Framer Motion
- **Icons:** Phosphor Icons

### Dev Server
- **Port:** `localhost:3000`
- **Start:** `3000.bat` (wipes node_modules, clean restart)
- **Build:** `npm run build`
- **Lint:** `npm run lint`
- **Test:** `npm test`

### Key Architecture Patterns

**Authentication (every API route):**
```typescript
import { createClient } from '@/lib/supabase/server'
const supabase = await createClient()
const { data: { user } } = await supabase.auth.getUser()
if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
```

**Rate Limiting:**
```typescript
import { rateLimit, RateLimitPresets } from '@/lib/rate-limit'
const limitError = await rateLimit(request, RateLimitPresets.STANDARD)
if (limitError) return limitError
```

**Token Encryption (all OAuth tokens):**
```typescript
import { encryptAPIKey, decryptAPIKey } from '@/lib/encryption'
// AES-256-GCM — always encrypt before DB storage
```

**Middleware:** Next.js 16 uses `proxy.ts` (NOT `middleware.ts` — that's deprecated). The file at root `proxy.ts` calls `updateSession()` from `lib/supabase/middleware.ts`.

### Current State (as of 2026-02-17)
- Free wedge at `/try` just shipped — ungated viral prediction flow
- Campaign wizard has 3-path flow (Discover Viral / Validate Idea / Promote)
- 6 social platform integrations (Twitter, LinkedIn, Facebook, Instagram, TikTok, YouTube)
- Domain migration: `xelora.io` -> `getxelora.com`
- Current NOW task in `docs/SYSTEM/TASKS.md`: **STRIPE integration**

### Recent Commits
```
eb4cf74 feat: Free Wedge /try flow + UI polish (banner, Card 3 spacing)
890d0f4 docs: update CHANGELOG.md and TASKS.md
0ae029b fix(ui): add tron color palette to tailwind config
4c82bab feat: Campaign wizard UX overhaul — 3-path flow
```

---

## Project 2: Marketplace / Products (`Dev/`)

### What It Is
A portfolio of 21+ B2B SaaS product ideas under the 3K Pro Services umbrella. Currently pre-revenue. Sequential launch strategy — one product at a time.

### Current Focus: FairMerge (Product #1)
- **Location:** `Dev/products/Idea_11_Code_Review_Bias_Detector/`
- **What:** Engineering velocity engine — detects review bottlenecks, nitpick waste, workload imbalance
- **Pivot:** Rebranded from "Code Review Bias Detector" to "Velocity Engine" (2026-01-28)
- **Status:** MVP 70% complete
- **Backend:** Python + Railway (`striking-liberation-production.up.railway.app`)
- **Frontend:** React + Vercel
- **Auth:** Shared Supabase (from 3kpro-website)
- **Pricing:** Team $149/mo, Growth $349/mo, Enterprise $749/mo
- **Validation Gate:** $5K MRR by end of Q2 2026

### Product #2 Candidates (blocked until FairMerge validates)
1. **BreakingChange** (API Deprecation Watchdog) — 60% MVP, eng buyer overlap
2. **SOC2 Autopilot** — high revenue potential ($349-749/mo)
3. **TrialRevive** (Trial Recovery Engine) — proven model, fast monetization

### All 21+ Products
```
Dev/products/
  Idea_11_Code_Review_Bias_Detector/  <-- FairMerge (ACTIVE)
  Idea_10_API_Deprecation_Watchdog/   <-- BreakingChange (60% MVP)
  Idea_08_Meeting_Commitment_Extractor/ <-- PactPull (50% MVP)
  idea_04_MICRO_SAAS_TOOLS/           <-- Invoice Generator (MVP)
  Idea_07_SOC2_Evidence_Autopilot/    <-- Scaffolding
  Idea_06_Trial_Recovery_Engine/      <-- Scaffolding
  ... and 15+ more at concept/scaffolding stage
```

---

## Project 3: 3kpro.services (`3kpro-website/`)

Company/consulting website and marketplace showcase. Dev server on `localhost:3001`. Start with `3001.bat`. Has its own `docs/SYSTEM/` governance.

---

## Rules You Must Follow

### The Non-Negotiables

1. **One task per session.** Complete it fully, then STOP. Do not chain tasks.
2. **Human controls deployment.** NEVER push to production without Mark's explicit approval. All work stays local until verified.
3. **Read before you write.** Always read `TASKS.md` and `AGENT_CONTRACT.md` for the relevant project before starting work.
4. **Work on the FIRST task in the NOW section only.** Not the second. Not whatever looks interesting.
5. **Never commit secrets.** No API keys, tokens, credentials, `.env` files in git. Ever.

### Exit Checklist (after every task)

1. Update `CHANGELOG.md` with what you changed
2. Mark task complete in `TASKS.md` (`- [ ]` -> `- [x]`)
3. Move task to COMPLETED section with date
4. Queue next task to NOW (if applicable)
5. **STOP** — do not begin the next task

### Launch Sequence Discipline (Marketplace)

- NEVER start Product #2 work before FairMerge hits $5K MRR
- NEVER build infrastructure for all 21 products upfront
- Build for 1, validate, then scale

### Cross-Project Boundaries

| If your task is about... | Work in... | Governance files in... |
|---|---|---|
| Xelora features, UI, APIs | `landing-page/` | `landing-page/docs/SYSTEM/` |
| FairMerge or side products | `Dev/products/[product]/` | `Dev/docs/SYSTEM/` |
| Company website | `3kpro-website/` | `3kpro-website/docs/SYSTEM/` |

If your task crosses boundaries, document the dependency in the relevant `CHANGELOG.md`.

---

## Key Files Quick Reference

### Xelora (`landing-page/`)
| File | Purpose |
|------|---------|
| `docs/SYSTEM/TASKS.md` | Work queue — check NOW section |
| `docs/SYSTEM/CHANGELOG.md` | Change history — update after every task |
| `docs/SYSTEM/AGENT_CONTRACT.md` | Rules of engagement |
| `docs/SYSTEM/VISION.md` | Product vision and strategy |
| `CLAUDE.md` | Codebase overview, architecture patterns, dev commands |
| `proxy.ts` | Next.js 16 proxy (replaces middleware.ts) |
| `lib/supabase/server.ts` | Server-side Supabase client |
| `lib/supabase/client.ts` | Browser-side Supabase client |
| `lib/rate-limit.ts` | Rate limiting (Redis prod / in-memory dev) |
| `lib/encryption.ts` | AES-256-GCM for OAuth tokens |
| `lib/content-generation.ts` | Shared AI content generation (Gemini prompts) |
| `lib/viral-score.ts` | Viral Score engine |
| `app/api/` | All API routes |
| `app/(portal)/` | Authenticated app routes |
| `app/try/` | Free wedge (ungated) |
| `tailwind.config.js` | Includes custom `tron` color palette |

### Marketplace (`Dev/docs/SYSTEM/`)
| File | Purpose |
|------|---------|
| `TASKS.md` | Marketplace-level tasks |
| `CHANGELOG.md` | Infrastructure change history |
| `VISION.md` | Portfolio strategy, sequential launch model |
| `AGENT_CONTRACT.md` | Marketplace governance rules |
| `PRODUCT_INVENTORY.md` | Full 21-product catalog with status |
| `GO_TO_MARKET.md` | Launch playbook, validation gates |

---

## Environment & Credentials

- **Credentials are in environment variables** — never hardcode
- **Critical env vars** (see `lib/env.ts` for Zod validation):
  - `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `STRIPE_SECRET_KEY` / `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
  - `ENCRYPTION_KEY` (32 bytes for AES-256)
  - `NEXT_PUBLIC_APP_URL`
  - Per-platform OAuth credentials (Twitter, LinkedIn, Facebook, Instagram, TikTok, YouTube)
  - AI provider keys (OpenAI, Anthropic, Google, xAI)
- **Build-time:** Allows placeholder values for CI/Vercel builds

---

## Git Workflow

```bash
# Standard flow
git add <specific files>      # Never git add -A (avoids .env leaks)
git commit -m "type: description"
# STOP — wait for Mark to verify on localhost
# Only push when Mark says "push to prod"
git push origin main          # Vercel auto-deploys from main
```

**Commit message convention:**
```
feat: new feature
fix: bug fix
fix(ui): UI-specific fix
chore: maintenance
docs: documentation only
```

---

## What Claude Has Been Working On (Recent Context)

As of 2026-02-17, Claude just shipped the **Free Wedge** feature — a PLG "reverse demo" at `/try` where visitors can predict viral potential without signing up. This involved:

- Extracting `lib/content-generation.ts` (shared by authenticated + ungated endpoints)
- Creating 2 ungated API routes (`/api/try/predict`, `/api/try/generate`)
- Building 7 new components for the 6-step flow
- Updating hero CTA, navigation, sitemap
- Fixing domain banner contrast and Card 3 preview box alignment

The current NOW task in Xelora's `TASKS.md` is **STRIPE integration**.

---

## Tips for Working via Telegram

1. **Be specific about file paths** — the monorepo has multiple projects with similar structures
2. **State which project** you're working on before making changes
3. **Read the relevant `TASKS.md`** first to know what's assigned
4. **Keep changes small and focused** — one task, one commit
5. **Always report back** what you changed so Mark can verify locally

---

## Emergency Protocols

- **If you break something:** Revert immediately, document in CHANGELOG, notify Mark
- **If you find a security issue:** STOP all work, notify Mark immediately
- **If you're blocked:** Document the blocker in TASKS.md, do NOT work around it without approval
- **If you're unsure about scope:** Ask Mark before proceeding

---

## First Steps

1. Read the `AGENT_CONTRACT.md` for whichever project Mark assigns you to
2. Read the `TASKS.md` NOW section for that project
3. Read `VISION.md` to understand the strategic context
4. Start on the FIRST task in NOW — and only that task
5. When done, follow the exit checklist above

Welcome aboard.
