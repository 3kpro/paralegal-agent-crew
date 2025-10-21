# STATEMENT OF TRUTH (SoT)
## Content Cascade AI - TrendPulse Beta

**Last Updated:** 2025-10-20
**Version:** 1.6.6
**Current Phase:** TrendPulse Beta Launch (Week 1 MVP)

---

## 🎯 PROJECT MISSION

**Primary Goal:** Launch TrendPulse as polished, production-ready beta to validate market and acquire users.

**Strategy:** Dual-track approach
- **Track 1:** TrendPulse Beta Showcase (polished campaign creation, content generation, trend discovery)
- **Track 2:** Agentic army building platform infrastructure in parallel

**Success Metric:** TrendPulse as the "lighthouse" - attracting users while platform scales behind the scenes.

---

## 📍 CURRENT STATUS

**Phase:** Week 1 MVP - TrendPulse Beta Launch
**Focus:** Perfecting TrendPulse workflow for beta users
**Launch Target:** ccai.3kpro.services or trendy domain TBD

**Completed:**
- ✅ Database schema fixed (metadata column added)
- ✅ All UI/UX issues resolved (Tron theme applied)
- ✅ Google API restored with new project
- ✅ Campaign workflow fully operational
- ✅ Social media strategy documented
- ✅ Gemini AI trends integration working

**In Progress:**
- 🔄 Campaign save bug fix (INC001)
- 🔄 Testing TrendPulse end-to-end workflow
- 🔄 Vercel deployment preparation

**Blocked:**
- See KNOWN_BUGS.md for blocking issues

---

## 🏗️ PROJECT CONTEXT

### Company Structure
- **3kpro.services** = Main company site (broader SaaS portfolio)
- **CCAI (Content Cascade AI)** = Flagship product
- **TrendPulse** = Beta hook for CCAI (campaign creation + trend discovery)

### Tech Stack
- **Frontend:** Next.js 15.5.4 (App Router), React, TypeScript, Tailwind CSS
- **Backend:** Supabase (Auth, Database, Storage), Next.js API Routes
- **AI Integration:** LM Studio (local), Gemini AI (fallback), OpenAI/Claude (optional)
- **Deployment:** Vercel
- **Theme:** Tron Legacy dark theme (cyan #00ffff, dark #0f0f1e)

### Key Features
1. **TrendPulse Workflow:**
   - Step 1: Basic Info (campaign name, platforms)
   - Step 2: Find Trends (search + select trending topics)
   - Step 3: Generate Content (AI-powered multi-platform content)
   - Step 4: Review & Save (preview + save campaign)

2. **AI Tools Integration:**
   - Multiple AI providers (OpenAI, Claude, Gemini, LM Studio)
   - Encrypted API key storage (AES-256-GCM)
   - Tier-based access (Free: 1 tool, Pro: 3, Premium: unlimited)

3. **Subscription System:**
   - Free, Pro ($29/mo), Premium ($99/mo)
   - Stripe payment integration
   - Automatic tier enforcement

---

## 📁 PROJECT STRUCTURE

```
landing-page/
├── app/                          # Next.js App Router
│   ├── (portal)/                 # Authenticated pages
│   │   ├── layout.tsx            # Portal wrapper with sidebar
│   │   ├── dashboard/            # Main dashboard
│   │   ├── campaigns/            # Campaign management
│   │   │   ├── page.tsx          # Campaign list
│   │   │   └── new/              # Campaign creation (4 steps)
│   │   ├── analytics/            # Usage analytics
│   │   ├── settings/             # User settings (3 tabs)
│   │   └── onboarding/           # First-time setup
│   ├── api/                      # API endpoints
│   │   ├── ai-tools/             # AI provider management
│   │   ├── trends/               # Trend discovery (Gemini fallback)
│   │   ├── generate/             # Content generation
│   │   ├── profile/              # User profile
│   │   ├── usage/                # Usage tracking
│   │   └── stripe/               # Payment processing
│   ├── login/                    # Authentication pages
│   ├── signup/
│   ├── forgot-password/
│   └── reset-password/
├── components/                   # React components
│   ├── sections/                 # Landing page sections
│   ├── ui/                       # Reusable UI (Button, Card)
│   └── DashboardClient.tsx       # Client-side dashboard
├── lib/                          # Core libraries
│   ├── supabase/                 # Supabase clients
│   ├── stripe.ts                 # Stripe integration
│   └── encryption.ts             # API key encryption
├── supabase/migrations/          # Database migrations
│   ├── 001_initial_schema.sql
│   ├── 002_security_improvements.sql
│   └── 003_ai_tools_and_profiles.sql
├── docs/                         # Documentation (ALL DOCS HERE)
│   ├── handoffs/                 # Archive of agent handoffs
│   └── *.md                      # Project documentation
├── STATEMENT_OF_TRUTH.md         # THIS FILE (master reference)
├── CHANGELOG.md                  # All updates and changes
├── TASK_QUEUE.md                 # Tasks with Zen prompts
├── KNOWN_BUGS.md                 # Bug tracking
└── README.md                     # Quick start guide
```

### Key Database Tables
- `profiles` - User profiles with subscription tier
- `campaigns` - Campaign metadata and status
- `campaign_content` - Generated content per platform (uses `body` column, NOT `content_text`)
- `ai_providers` - Available AI tools
- `user_ai_tools` - User's configured tools (encrypted keys)
- `ai_tool_usage` - Usage tracking and cost estimation

---

## 📋 AGENT WORKFLOW

### EVERY Chat Session Start:
1. **Read this SoT** (STATEMENT_OF_TRUTH.md) - Master context
2. **Read CHANGELOG.md** (last 20 entries) - Recent work
3. **Read TASK_QUEUE.md** - Current assigned tasks
4. **Check KNOWN_BUGS.md** - Blocking issues

### Agent Types & Responsibilities

**🔧 ZenCoder - Database Designer:**
- Database schema fixes
- Migration creation
- Schema validation
- **After work:** Update CHANGELOG.md, mark task complete in TASK_QUEUE.md

**💻 ZenCoder - Web Dev:**
- UI/UX implementation
- Component creation
- API endpoint development
- **After work:** Update CHANGELOG.md, mark task complete in TASK_QUEUE.md

**🧪 ZenCoder - Testing Agent:**
- E2E testing (Playwright)
- Unit testing (Jest + RTL)
- Integration testing
- **After work:** Update CHANGELOG.md with test results

**🚀 3KPRO - DevOps Pipeline Builder:**
- Vercel deployment
- DNS configuration
- Environment setup
- **After work:** Update CHANGELOG.md, document configuration

**📊 3KPRO - Backend Performance Engineer:**
- API optimization
- Caching implementation
- Performance monitoring
- **After work:** Update CHANGELOG.md with metrics

**❓ Ask Agent:**
- Answer codebase questions
- Reference SoT for roadmap
- No file modifications

### Workflow Rules
1. **Small, safe changes** - Prefer Edit over Write
2. **Request approval before:**
   - Database schema changes
   - New npm dependencies
   - Routing changes
   - Breaking changes
3. **Always update CHANGELOG.md** after completing work
4. **Never modify:**
   - package-lock.json (use npm install)
   - .env.local (security risk)
   - supabase/migrations/*.sql (ask first)

### When Blocked
Add **[BLOCKED]** entry to KNOWN_BUGS.md with:
- Task ID
- Blocker description
- Question for user
- Wait for user input

### Task Completion Format
Report: `[TaskID] Complete - Files: X, Y, Z - Tests: passing/pending`

---

## 🎨 DESIGN SYSTEM

### Tron Theme Colors
```javascript
tron-dark: '#0f0f1e'           // Almost black background
tron-cyan: '#00ffff'           // Bright cyan accents
tron-green: '#00ff00'          // Neon green
tron-magenta: '#ff00ff'        // Magenta highlights
tron-grid: '#1a1a2e'           // Dark grid pattern
tron-text: '#ffffff'           // White text
tron-text-muted: '#cccccc'     // Muted text
```

### Component Patterns

**Buttons (bordered style for comfort):**
```tsx
className="px-4 py-2 bg-tron-grid border-2 border-tron-cyan text-tron-cyan
hover:bg-tron-cyan hover:text-tron-dark font-semibold rounded-lg transition-colors"
```

**Form Inputs (proper visibility):**
```tsx
className="w-full px-4 py-3 bg-tron-dark border border-tron-grid rounded-lg
focus:ring-2 focus:ring-tron-cyan focus:border-transparent text-tron-text"
```

**Cards:**
```tsx
className="bg-tron-grid border border-tron-cyan/30 rounded-lg p-6
hover:border-tron-cyan transition-colors"
```

### Naming Conventions
- **Components:** PascalCase (`HeroSection.tsx`)
- **Functions:** camelCase (`saveCampaign`)
- **CSS Classes:** Tailwind utilities + tron- prefix
- **Constants:** SCREAMING_SNAKE_CASE (`STRIPE_SECRET_KEY`)

---

## 🔗 DOCUMENT HIERARCHY

**Master References (Read These First):**
1. **STATEMENT_OF_TRUTH.md** (this file) - Project context, structure, workflow
2. **CHANGELOG.md** - What changed and when
3. **TASK_QUEUE.md** - What to work on next
4. **KNOWN_BUGS.md** - What's broken

**Supporting Documentation:**
- `README.md` - Quick start guide
- `docs/PROJECT_STRUCTURE.md` - Detailed architecture
- `docs/AI_TOOLS_SETUP_GUIDE.md` - AI configuration
- `docs/ZENCODER_HANDOFF_PORTAL.md` - UI/UX specs
- `docs/handoffs/` - Archived agent handoffs (historical reference)

**Specialized Docs:**
- `SOCIAL_ACCOUNTS_BIOS.md` - Marketing strategy
- `VERCEL_CONFIGURATION_HANDOFF.md` - Deployment guide
- `GIT_WORKFLOW_PROTOCOL.md` - Git conventions

---

## 🚨 CRITICAL KNOWN ISSUES

See **KNOWN_BUGS.md** for complete list. Current blockers:

**INC001 - Campaign Save Bug (CRITICAL)**
- Status: 🔴 OPEN
- Issue: `content_text` column not found (should be `body`)
- File: app/(portal)/campaigns/new/page.tsx:158
- Fix: One-line change `content_text` → `body`
- Assigned: ZenCoder (TASK_QUEUE.md - TASK 5)

---

## 📊 CONTEXT RECOVERY (If Chat Gets Lost)

If you lose context or start fresh:

1. **Read STATEMENT_OF_TRUTH.md** (this file) - 5 min read
2. **Scan CHANGELOG.md** (last 20 entries) - What happened recently?
3. **Check TASK_QUEUE.md** - What am I supposed to do?
4. **Review KNOWN_BUGS.md** - Any blockers?
5. **Ask user if unclear** - Better to ask than guess wrong

**Recovery Keywords:**
- "TrendPulse" = Campaign creation workflow (our beta focus)
- "Tron theme" = Dark cyan UI design system
- "INC001" = Critical campaign save bug
- "3kpro.services" = Company domain
- "ccai.3kpro.services" = CCAI subdomain

---

## 🎯 ACCEPTANCE CRITERIA (Week 1 MVP)

**TrendPulse Must Work:**
- [ ] User can create account
- [ ] User can complete onboarding
- [ ] User can search trends (Gemini fallback working)
- [ ] User can select trend
- [ ] User can generate content for multiple platforms
- [ ] User can save campaign (NOT WORKING - INC001)
- [ ] User can view saved campaigns
- [ ] Tron theme applied consistently
- [ ] Mobile responsive
- [ ] No console errors

**Beta Launch Ready:**
- [ ] All critical bugs fixed
- [ ] Deployed to ccai.3kpro.services (or alternate domain)
- [ ] Test account working
- [ ] Social media strategy ready
- [ ] User feedback collection mechanism in place

---

## 🔄 VERSION HISTORY

**v1.6.6 (Current)** - TrendPulse Beta Launch Strategy
- Dual-track approach defined
- Social media strategy documented
- Campaign workflow operational (save bug blocking)

**v1.6.5** - Performance optimizations for Tron animations
**v1.6.4** - Onboarding social media connections complete
**v1.6.3** - Authentication flow fixes & password reset
**v1.6.2** - Frontend production hardening
**v1.6.1** - Production deployment complete
**v1.6.0** - AI Tools Settings Integration (Priority 1)

See CHANGELOG.md for complete version history.

---

## 📞 ESCALATION PATH

**When to Ask User:**
- Unclear requirements
- Multiple valid approaches (need decision)
- Breaking change required
- Security concern
- Cost/budget impact
- Blocked for >30 minutes

**Don't Ask User:**
- Minor implementation details
- Obvious bug fixes
- Standard conventions (follow existing patterns)
- Small refactors for clarity

---

## 🎓 LEARNING FROM PAST ISSUES

**What Went Wrong Before:**
1. **Context loss between agent sessions** → Created this SoT
2. **Agents updating wrong files** → Defined file hierarchy
3. **Missed bugs slipping through** → Created KNOWN_BUGS.md
4. **Inconsistent prompts** → Standardized TASK_QUEUE.md format
5. **Multiple sources of truth** → Consolidated into this document

**Current Protocol:**
- One master SoT (this file)
- CHANGELOG for what changed
- TASK_QUEUE for what to do
- KNOWN_BUGS for what's broken
- All agents follow same workflow

---

## 📝 UPDATING THIS DOCUMENT

**Who Updates:**
- User (primary maintainer)
- Senior agents with explicit approval

**When to Update:**
- Major strategy changes
- New phases start
- Critical architecture decisions
- Tech stack changes
- Workflow process improvements

**How to Update:**
1. Update "Last Updated" date at top
2. Update version number if major change
3. Add to CHANGELOG.md noting SoT update
4. Announce to active agents if significant

---

## ✅ AGENT CHECKLIST (Quick Reference)

**Starting Work:**
- [ ] Read this SoT (STATEMENT_OF_TRUTH.md)
- [ ] Check CHANGELOG.md (last 20 entries)
- [ ] Review TASK_QUEUE.md for assignment
- [ ] Check KNOWN_BUGS.md for blockers
- [ ] Understand current phase (TrendPulse Beta)

**During Work:**
- [ ] Follow Tron theme patterns
- [ ] Make small, safe changes
- [ ] Test changes locally
- [ ] Request approval for breaking changes
- [ ] Ask if blocked >30 minutes

**Completing Work:**
- [ ] Update CHANGELOG.md with what you did
- [ ] Mark task complete in TASK_QUEUE.md
- [ ] Report completion in standard format
- [ ] Update KNOWN_BUGS.md if you fixed bugs
- [ ] Verify build passes (`npm run build`)

---

**END OF STATEMENT OF TRUTH**

*This is the single source of truth for the CCAI project. When in doubt, reference this document first.*

**Quick Links:**
- [CHANGELOG.md](CHANGELOG.md) - Recent changes
- [TASK_QUEUE.md](TASK_QUEUE.md) - Current tasks
- [KNOWN_BUGS.md](KNOWN_BUGS.md) - Blocking issues
- [README.md](README.md) - Quick start
