MARKETPLACE COORDINATION LAYER
Working directory: C:\DEV\3K-Pro-Services\Dev\docs\SYSTEM

**Purpose:** Coordinate 21-product portfolio, shared infrastructure, and product launches
**Vision:** See `Dev/docs/SYSTEM/VISION.md`
**Governance:** See `Dev/docs/SYSTEM/AGENT_CONTRACT.md`

**Quick Start (Do This First):**
1. Read `VISION.md` (understand portfolio strategy, sequential launch model, validation gates)
2. Read `AGENT_CONTRACT.md` (understand scope, responsibilities, launch discipline)
3. Open `TASKS.md` and find task in `## NOW` section
4. Follow task instructions
5. Update `CHANGELOG.md` with what you changed (MANDATORY)
6. Mark task complete in TASKS.md and move to `## COMPLETED` section

**Your Scope:** Marketplace platform infrastructure (Stripe, auth, analytics), product launch coordination, shared services, portfolio-level metrics, marketplace brand/positioning
**NOT Your Scope:** Individual product features (use Dev/products/[product]/TASKS.md), company website (use 3kpro-website/), XELORA features (use landing-page/), product-specific development

**Key Files:**
- `VISION.md` - Portfolio strategy & 2026 roadmap (Q1-Q4 milestones, validation gates)
- `TASKS.md` - Marketplace infrastructure tasks (Stripe, auth, analytics, marketplace pages)
- `PRODUCT_INVENTORY.md` - Canonical catalog of 21 products with status & metrics
- `GO_TO_MARKET.md` - Launch playbook (pre-launch checklist, beta strategy, validation phase)
- `AGENT_CONTRACT.md` - Governance framework with entry/exit requirements
- `CHANGELOG.md` - Infrastructure change history
- `README.md` - Navigation guide for agents

**Critical Rule:** FairMerge is validation product (first launch priority). Sequential model enforced - do NOT start Product #2 development until FairMerge hits $5K MRR validation gate.

**Coordination:**
- Individual product work: Check Dev/products/[product]/TASKS.md for dependencies
- XELORA coordination: If marketplace branding changes, update landing-page/docs/SYSTEM/CHANGELOG.md
- Company site coordination: If marketplace affects positioning, update 3kpro-website/docs/SYSTEM/CHANGELOG.md

**Important Dates:**
- FairMerge MVP: Feb 2026 (100% complete)
- FairMerge Beta: Mar 2026 (10 customers)
- FairMerge Validation: Q2 2026 ($5K MRR gate)
- Product #2 Selection: After FairMerge validates (60-90 days post-launch)

**Exit Requirements (MANDATORY - Do Before Completing):**
1. Update `CHANGELOG.md` with what you changed
2. Mark task complete in TASKS.md (move to COMPLETED section)
3. Document any cross-product dependencies in CHANGELOG.md
4. If work affects XELORA or company site, add note to their CHANGELOG.md files
5. If infrastructure change affects product TASKS.md, update relevant product file


---

PRODUCT TASK (Idea_11_Code_Review_Bias_Detector)
Name Chat: ** Idea_11_Code_Review_Bias_Detector * -

Working directory:
C:\DEV\3K-Pro-Services\Dev\products\Idea_11_Code_Review_Bias_Detector

Instructions:
1. Read TRUTH.md for product vision
3. When done, follow AGENT_CONTRACT.md exit requirements
2. Read TASKS.md - work on the task in ## NOW section

Idea_11_Code_Review_Bias_Detector

Stripe Webhook Secret
whsec_W5QFmZ9IqyIhDWxe1ScQDfYzTP41tABw



XELORA
Working directory: C:\DEV\3K-Pro-Services\landing-page

**Purpose:** Landing page builder and product showcase for marketplace
**Vision:** See `landing-page/docs/SYSTEM/VISION.md`
**Governance:** See `landing-page/docs/SYSTEM/AGENT_CONTRACT.md`

**Quick Start (Do This First):**
1. Read `docs/SYSTEM/VISION.md` (understand product strategy & roadmap)
2. Read `docs/SYSTEM/AGENT_CONTRACT.md` (understand scope & responsibilities)
3. Open `docs/SYSTEM/TASKS.md` and find task in `## NOW` section
4. Follow task instructions
5. Update `docs/SYSTEM/CHANGELOG.md` with what you changed (MANDATORY)
6. Mark task complete in TASKS.md and move to `## COMPLETED` section

**Your Scope:** Landing page UI, hero section, theme system, marketing copy, analytics, SEO
**NOT Your Scope:** FairMerge features, marketplace infrastructure, 3K Pro Services content, individual product development

**Key Files:**
- `app/page.tsx` - Homepage
- `app/globals.css` - Design system (Zinc palette, semantic tokens)
- `docs/design-system.md` - Design documentation
- Landing page components in `app/components/landing/`

**Coordination:**
- If change affects marketplace positioning: Update `Dev/docs/SYSTEM/CHANGELOG.md`
- If change affects company branding: Align with `3kpro-website/docs/SYSTEM/VISION.md`

**Exit Requirements (MANDATORY - Do Before Completing):**
1. Update `docs/SYSTEM/CHANGELOG.md` with your changes
2. Mark task complete in TASKS.md (move to COMPLETED section)
3. Document any cross-system dependencies in CHANGELOG.md
4. If work affects marketplace or company site, add note to their CHANGELOG.md files


3KPRO.SERVICES
Working directory: C:\DEV\3K-Pro-Services\3kpro-website\

**Purpose:** Company website and marketplace hub for 3K Pro Services
**Vision:** See `3kpro-website/docs/SYSTEM/VISION.md`
**Governance:** See `3kpro-website/docs/SYSTEM/AGENT_CONTRACT.md`

**Quick Start (Do This First):**
1. Read `docs/SYSTEM/VISION.md` (understand company strategy & positioning)
2. Read `docs/SYSTEM/AGENT_CONTRACT.md` (understand scope, responsibilities & approval gates)
3. Open `docs/SYSTEM/TASKS.md` and find task in `## NOW` section
4. Follow task instructions
5. If task is marked "REQUIRES APPROVAL" - submit for human review before publishing
6. Update `docs/SYSTEM/CHANGELOG.md` with what you changed (MANDATORY)
7. Mark task complete in TASKS.md and move to `## COMPLETED` section

**Your Scope:** Brand identity, company website, Google Business Profile, blog content, social strategy, customer testimonials, contact/lead capture, marketplace product showcase, legal docs (privacy policy, terms of service)
**NOT Your Scope:** Individual product features, marketplace infrastructure, XELORA features, internal coordination

**Key Files:**
- `app/page.tsx` - Company homepage
- `app/about/` - About page
- `app/components/landing/` - Homepage components
- `docs/brand-guide.md` - Brand guidelines

**Important:** Some tasks require founder approval (legal documents, major messaging, pricing, announcements). Check TASKS.md for approval gates.

**Coordination:**
- Marketplace updates: Update `Dev/docs/SYSTEM/CHANGELOG.md` with "Marketplace coordination" note
- XELORA alignment: Check `landing-page/docs/SYSTEM/VISION.md` for brand consistency
- Product launches: Coordinate with `Dev/docs/SYSTEM/PRODUCT_INVENTORY.md` for launch timing

**Exit Requirements (MANDATORY - Do Before Completing):**
1. Update `docs/SYSTEM/CHANGELOG.md` with your changes
2. If task requires approval: Request founder review and note "AWAITING APPROVAL" in CHANGELOG
3. Mark task complete in TASKS.md only after approval (if required)
4. Document any cross-system dependencies in CHANGELOG.md
5. If work affects marketplace or XELORA, add note to their CHANGELOG.md files



