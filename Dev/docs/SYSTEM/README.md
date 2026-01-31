# Marketplace SYSTEM Folder - README

**Last Updated:** 2026-01-28
**Purpose:** This folder coordinates marketplace-level operations across the 21-product portfolio.

---

## You Are Here

```
C:\DEV\3K-Pro-Services\Dev\docs\SYSTEM\
```

This is the **marketplace coordination layer** - sitting between company operations (3kpro.services) and individual product folders (Dev/products/).

**Think of it as:** The control center for the product portfolio - where we coordinate launches, manage shared infrastructure, and track portfolio health.

---

## File Structure

```
Dev/docs/SYSTEM/
├── AGENT_CONTRACT.md        # START HERE - Rules for marketplace work
├── TASKS.md                 # Marketplace platform tasks (Stripe, auth, analytics)
├── VISION.md                # Portfolio strategy & launch sequencing
├── README.md                # This file - navigation guide
├── CHANGELOG.md             # Marketplace infrastructure history
├── PRODUCT_INVENTORY.md     # Canonical 21-product catalog
├── GO_TO_MARKET.md          # Launch checklist & validation playbook
├── ADD_PRODUCT_GUIDE.md     # How to add the 22nd+ product
├── STRIPE_OPERATIONS.md     # Managing refunds, dunning, and support
├── SHARED_AUTH.md           # Identity architecture for all products
├── SHARED_SCHEMA.sql        # Postgres schema for profiles & permissions
└── NOTIFICATIONS.md         # Transactional email & alert strategy

```

---

## Agent Onboarding (READ BEFORE WORK)

### Before Starting Any Marketplace Task:

1. ✅ **Read `AGENT_CONTRACT.md`** (understand governance rules and scope boundaries)
2. ✅ **Read `VISION.md`** (understand portfolio strategy and sequential launch model)
3. ✅ **Read `TASKS.md`** (verify task exists and is marked OPEN)
4. ✅ **Confirm task assignment** and priority

**Failure to complete these steps violates the agent contract.**

### Before Completing Any Task:

1. ✅ **Update `CHANGELOG.md`** with changes made (Added/Changed/Fixed/Removed format)
2. ✅ **Mark task complete in `TASKS.md`** with date and results summary
3. ✅ **Update `PRODUCT_INVENTORY.md`** if product status changed (MVP → Beta → Launched)
4. ✅ **Document cross-project dependencies** if task affected other workspaces

---

## Scope Boundaries

### This folder manages:

- ✅ **Marketplace infrastructure** (Stripe, auth, analytics, monitoring)
- ✅ **Product launch coordination** (FairMerge first, then others based on validation)
- ✅ **Portfolio-level metrics and strategy** (MRR, churn, validation gates across products)
- ✅ **Shared services across products** (auth, billing, error monitoring, analytics)

### This folder does NOT manage:

- ❌ **Individual product features** → Use `Dev/products/[product]/TASKS.md`
- ❌ **Company website** → Use `3kpro-website/docs/SYSTEM/`
- ❌ **XELORA features** → Use `landing-page/docs/SYSTEM/`

**If your task crosses these boundaries, document the dependency in `CHANGELOG.md`.**

---

## Directory Structure

```
3K-Pro-Services/
├── 3kpro-website/           # Company website (3kpro.services)
│   └── docs/SYSTEM/         # Company operations (Google, SEO, brand)
├── landing-page/            # XELORA product (getxelora.com)
│   └── docs/SYSTEM/         # XELORA features and operations
└── Dev/                     # Product portfolio
    ├── docs/SYSTEM/         # 👈 YOU ARE HERE (marketplace coordination)
    ├── products/            # Individual product folders
    │   └── Antigravity_Ideas_06-21/
    │       ├── Idea_11_Code_Review_Bias_Detector/  # FairMerge (first launch)
    │       ├── Idea_10_API_Deprecation_Watchdog/   # BreakingChange
    │       ├── Idea_07_SOC2_Evidence_Autopilot/    # SOC2 Autopilot
    │       ├── Idea_06_Trial_Recovery_Engine/      # TrialRevive
    │       └── ... (17 more products)
    └── GEMINI_HANDOFF_PRODUCT_PORTFOLIO.md         # Full portfolio analysis
```

---

## Quick Reference

**Current Phase:** Q1 2026 - FairMerge MVP completion and launch
**Primary Goal:** Launch FairMerge, validate approach, document learnings
**Products Live:** 0 (XELORA launched, marketplace products pending)
**Next Launch:** FairMerge (Code Review Bias Detector) - Est. Feb 2026

### Portfolio Status

- **21 products total** across 5 categories (Engineering, Compliance, Growth, Data, Collaboration)
- **4 products in MVP stage** (FairMerge 70%, BreakingChange 60%, PactPull 50%, Invoice 60%)
- **10 products in scaffolding stage**
- **7 products in concept stage**

### Launch Sequence

1. **FairMerge** (Q1 2026) - Validation product
2. **Product #2** (Q2 2026) - TBD based on FairMerge learnings
3. **Product #3** (Q3 2026) - TBD

### Validation Gates

- **Gate 1 (Launch):** 10 beta customers
- **Gate 2 (Validate):** $5K MRR within 90 days
- **Gate 3 (Scale):** $10K MRR within 180 days

---

## Key Documents by Purpose

### Strategic Planning

- **`VISION.md`** - Portfolio strategy and quarterly goals
  - Sequential launch model (one product → validate → repeat)
  - 2026 roadmap (Q1-Q4 milestones)
  - Success metrics and validation gates
  - Open questions for founder

- **`GO_TO_MARKET.md`** - Launch playbook and validation criteria
  - Pre-launch checklist (MVP features, infrastructure, legal, marketing)
  - Beta launch strategy (target customers, acquisition channels)
  - Validation phase tactics (conversion, expansion, feedback loops)
  - Learnings documentation framework

- **`PRODUCT_INVENTORY.md`** - Product catalog with status and metrics
  - 21 products organized by category and maturity stage
  - FairMerge detailed profile (status, monetization, tech stack)
  - Product #2 selection criteria and candidates
  - Portfolio health metrics (development velocity, revenue targets)

### Operational

- **`TASKS.md`** - Active marketplace platform work
  - NOW section (current work)
  - BACKLOG (queued tasks by priority)
  - COMPLETED (history with dates)
  - Infrastructure tasks (Stripe, auth, analytics)
  - Launch coordination tasks (FairMerge checklist, Product #2 selection)

- **`CHANGELOG.md`** - Infrastructure change history
  - Chronological log of marketplace changes
  - Added/Changed/Fixed/Removed format
  - Context and impact for each change
  - Template for future entries

- **`AGENT_CONTRACT.md`** - Governance rules and workflow
  - Entry requirements (read VISION/TASKS before work)
  - Scope boundaries (what belongs here vs. products vs. company)
  - Development rules (human-in-loop, coordination, launch discipline)
  - Exit requirements (mandatory 5-step workflow)
  - Security & compliance protocols

### Product Details

- **Individual product folders** in `Dev/products/`
  - Each has: `readme.md`, `TRUTH.md`, `TASKS.md`, `docs/`
  - FairMerge: `Idea_11_Code_Review_Bias_Detector/`
  - See `PRODUCT_INVENTORY.md` for full product list

---

## Agent Responsibilities

### Claude (Senior Dev) - Primary Marketplace Agent
**Focus:** Marketplace infrastructure and shared services

- Marketplace infrastructure (Stripe integration, auth, analytics)
- Shared services architecture (reusable auth, billing, monitoring)
- Code quality and security reviews
- Task execution from `TASKS.md`
- Documentation updates and cross-references

### Gemini Enterprise - Strategic Advisor
**Focus:** Product strategy and launch planning

- Product strategy validation (problem, buyer, willingness to pay)
- Go-to-market planning (positioning, channels, pricing)
- Competitive analysis and market research
- Launch sequencing decisions (Product #2 selection)
- Portfolio health monitoring and recommendations

### OpenCode Agents - Feature Implementation
**Focus:** Individual product development

- Feature implementation for specific products
- Bug fixes and testing
- Documentation for product-specific code
- Code reviews for product repos
- Integration with marketplace services (auth, billing)

### Grok (Research) - Market Intelligence
**Focus:** Competitive and market insights

- Competitive intelligence gathering (pricing, features, positioning)
- Market research for product validation (TAM, buyer personas)
- Trend monitoring and opportunity identification (regulatory changes, tech shifts)
- Customer segment analysis (which verticals to target)

---

## Workflow Documentation

### Adding Marketplace Tasks

1. **Verify scope:** Confirm task is marketplace-level (not product-specific or company-level)
2. **Add to `TASKS.md`:** Place in appropriate section (NOW if immediate, BACKLOG if queued)
3. **Include metadata:** Goal, Action Items, Priority, Dependencies, Assigned agent, Est. effort
4. **Assign agent:** Based on responsibility mapping above
5. **Link dependencies:** Reference related tasks in other SYSTEM folders if applicable

**Example:**
```markdown
- [ ] **Stripe Multi-Product Integration** 💳
      - **Goal:** Configure Stripe to support multiple product subscriptions
      - **Action Items:**
        1. Set up product catalog in Stripe Dashboard
        2. Configure webhook endpoints
        3. Test subscription lifecycle
      - **Priority:** HIGH (blocks FairMerge beta)
      - **Dependencies:** FairMerge pricing finalized
      - **Assigned:** Claude
      - **Est. Effort:** 2-3 days
```

### Updating Portfolio Status

When product status changes (e.g., FairMerge MVP → Beta → Launched):

1. **Update `PRODUCT_INVENTORY.md`:**
   - Change status field for product
   - Update completion percentage if applicable
   - Add launch date if going live

2. **Document milestone in `CHANGELOG.md`:**
   - Use "## [YYYY-MM-DD] - Description" format
   - Include context (why this matters)
   - Note impact (what this enables)

3. **Update `VISION.md` if strategy shifts:**
   - Adjust quarterly goals if behind/ahead of schedule
   - Update validation gate timelines
   - Document learnings if product failed validation

4. **Notify other workspaces if public-facing:**
   - Update `3kpro-website/docs/SYSTEM/` if marketplace landing page needs update
   - Coordinate with company site for product launch announcements

### Launching Products

Follow the complete checklist in `GO_TO_MARKET.md`:

1. **Pre-Launch Phase:**
   - Complete MVP features (70% completeness acceptable)
   - Set up infrastructure (Stripe, auth, hosting, monitoring)
   - Legal & compliance (privacy policy, terms, data retention)
   - Marketing assets (landing page, demo video, launch content)

2. **Beta Launch (Month 1-2):**
   - Acquire 10 beta customers
   - Weekly feedback calls (15 mins each)
   - Document learnings (what works, what doesn't)
   - Iterate on product based on feedback

3. **Validation Phase (Month 3-4):**
   - Achieve $5K MRR validation gate
   - Convert beta users to paid
   - Expansion playbook (upsell, land-and-expand, referrals)
   - Monitor kill criteria (<$2K MRR by Month 4 triggers pivot decision)

4. **Post-Launch:**
   - Update `PRODUCT_INVENTORY.md` with launch date
   - Document learnings in `CHANGELOG.md`
   - Update `VISION.md` with next product selection
   - Begin Product #2 selection process (if validation successful)

---

## Common Scenarios

### Scenario 1: I need to add a new product to the catalog

**Action:**
1. Read `PRODUCT_INVENTORY.md` to understand catalog structure
2. Add product entry under appropriate category
3. Include: name, status, category, target user, problem, monetization, tech stack
4. Document in `CHANGELOG.md` (Added section)
5. Update portfolio count summary at top of `PRODUCT_INVENTORY.md`

### Scenario 2: FairMerge just launched to beta

**Action:**
1. Update `PRODUCT_INVENTORY.md`: Status → "Beta (10 customers)"
2. Update `CHANGELOG.md` with launch announcement
3. Update `TASKS.md`: Mark "FairMerge Launch Checklist" as in-progress
4. Add new task: "FairMerge Beta Feedback Collection"
5. Notify in `3kpro-website/docs/SYSTEM/` if public announcement

### Scenario 3: I need to build shared auth service

**Action:**
1. Check `TASKS.md` for existing auth task (should be in BACKLOG)
2. Read `VISION.md` "Open Questions" section for auth timing decision
3. Coordinate with FairMerge team (check `Idea_11_*/TASKS.md`)
4. Build for FairMerge first, document reusability
5. Update `CHANGELOG.md` when complete
6. Document auth flow for future products

### Scenario 4: Product #2 selection time

**Action:**
1. Read `GO_TO_MARKET.md` "Learnings Documentation" section
2. Analyze FairMerge customer feedback (interviews, feature requests)
3. Evaluate candidates in `PRODUCT_INVENTORY.md` (BreakingChange, SOC2, TrialRevive)
4. Document selection rationale in `PRODUCT_INVENTORY.md`
5. Update `VISION.md` with Product #2 details
6. Add Product #2 launch task to `TASKS.md`

---

## Notes

### Launch Discipline
- **FairMerge first, validate approach, iterate before scaling**
- Don't build for 21 products - build for 1, then scale based on validated needs
- Resist premature optimization (shared services only after 2+ products prove the pattern)

### Infrastructure Philosophy
- **Build incrementally:** Solve real problems, not hypothetical ones
- **Reuse aggressively:** Extract patterns after validation (e.g., auth after 2 products)
- **Kill fast:** If product fails $5K MRR gate, pivot or sunset before Product #2

### Metrics Focus
- Revenue validation gates ($5K, $10K MRR) > vanity metrics (users, signups)
- Churn rate (retention is king)
- Unit economics (CAC < 3x LTV)
- Product-market fit signals (customers saying "I need this")

### Coordination
- Cross-project dependencies MUST be documented in `CHANGELOG.md`
- Product-specific work stays in product TASKS.md (not here)
- Company website updates coordinated via `3kpro-website/docs/SYSTEM/`
- XELORA coordination via `landing-page/docs/SYSTEM/`

---

## Questions or Issues?

### I'm not sure if my task belongs here:
- **Read `AGENT_CONTRACT.md` "Scope Definition" section**
- Ask: Is this marketplace infrastructure or product feature?
- If unclear, ask the human before proceeding

### I need to coordinate with another workspace:
- **Document dependency in `CHANGELOG.md`**
- Update affected workspace's TASKS.md with cross-reference
- Alert human if coordination timing is critical

### I found a blocker:
- **Document in `TASKS.md` with blocking reason**
- Notify human with clear description of blocker
- Do NOT work around blockers without approval

### I want to suggest a new task:
- **Read `VISION.md` to confirm alignment with strategy**
- Add to `TASKS.md` BACKLOG section
- Mark priority and dependencies clearly
- Alert human if HIGH priority or time-sensitive

---

## Quick Start for New Agents

**First time working in marketplace?**

1. Read `AGENT_CONTRACT.md` (5 mins) - understand the rules
2. Read `VISION.md` (10 mins) - understand the strategy
3. Skim `PRODUCT_INVENTORY.md` (5 mins) - know the products
4. Check `TASKS.md` (3 mins) - see what's in flight
5. Find your assigned task and start work

**Remember:** One task per session, complete exit workflow, document everything.

---

**Last Updated:** 2026-01-28
**Maintained By:** Claude (with human oversight)
**Next Review:** 2026-04-30 (End of Q1)
