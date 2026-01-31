# Marketplace Agent Contract

**Last Updated:** 2026-01-28
**Purpose:** Governance framework for AI agents working on marketplace coordination

---

## Entry Requirements

Before starting ANY marketplace task, you MUST:

1. ✅ Read `VISION.md` (understand portfolio strategy and sequential launch model)
2. ✅ Read `TASKS.md` (verify task exists and is marked OPEN)
3. ✅ Read `PRODUCT_INVENTORY.md` (understand product catalog and priorities)
4. ✅ Confirm task assignment in `TASKS.md` (verify you're the assigned agent)

**Failure to complete these steps is a contract violation.**

---

## Scope Definition

### This workspace manages:

- **Marketplace platform infrastructure** (Stripe integration, vendor onboarding, billing)
- **Cross-product shared services** (auth, billing, analytics, monitoring)
- **Product launch sequencing and coordination** (FairMerge first, then others)
- **Portfolio-level metrics and reporting** (MAUs, MRR, churn across products)
- **Marketplace brand identity and positioning** (3K Pro Services product portfolio)

### This workspace does NOT manage:

- **Individual product features** → Use `Dev/products/[product]/TASKS.md`
- **Company website operations** → Use `3kpro-website/docs/SYSTEM/`
- **XELORA-specific features** → Use `landing-page/docs/SYSTEM/`

**If your task crosses these boundaries, document the dependency in `CHANGELOG.md`.**

---

## Development Rules

### 1. Human Controls Infrastructure
- **NEVER** deploy marketplace platform changes without explicit human approval
- **NEVER** modify Stripe configuration without human-in-loop verification
- **NEVER** change authentication/authorization rules without approval
- **ALWAYS** test infrastructure changes in staging before production

### 2. Cross-Product Coordination
- **ALWAYS** document dependencies in `CHANGELOG.md`
- **ALWAYS** update affected product TASKS.md files with cross-references
- **NEVER** assume product teams know about marketplace changes
- **ALWAYS** coordinate timing of changes that affect multiple products

### 3. One Task Per Session
- Focus on **one marketplace platform task** at a time
- Complete task fully before moving to next
- Mark task as completed immediately after finishing
- Document results in `TASKS.md` COMPLETED section

### 4. Launch Sequence Discipline
- **NEVER** start work on Product #2 before FairMerge hits $5K MRR
- **ALWAYS** preserve launch sequence: FairMerge → validation → iterate → scale
- **NEVER** build infrastructure for all 21 products upfront (premature optimization)
- **ALWAYS** build incrementally based on validated needs

---

## Exit Requirements (MANDATORY)

Before completing ANY task, you MUST complete ALL 5 steps:

1. ✅ **Update `CHANGELOG.md`** with changes made (Added/Changed/Fixed/Removed format)
2. ✅ **Mark task as completed in `TASKS.md`** (change status from NOW to COMPLETED)
3. ✅ **Move task to COMPLETED section** with completion date and results summary
4. ✅ **Update `PRODUCT_INVENTORY.md`** if product status changed (MVP → Beta, etc.)
5. ✅ **Document cross-project dependencies** if task affected other workspaces

**Failure to complete these steps is a contract violation and creates coordination chaos.**

---

## Cross-Project Coordination

When marketplace work affects other workspaces:

### Individual Products
- Update product's `TASKS.md` with reference to marketplace change
- Example: "Dependency: Stripe integration completed in marketplace (see Dev/docs/SYSTEM/CHANGELOG.md)"

### Company Site (3kpro.services)
- Document in `3kpro-website/docs/SYSTEM/CHANGELOG.md`
- Example: Marketplace landing page added to company site

### XELORA (getxelora.com)
- Coordinate with `landing-page/docs/SYSTEM/` if shared services affected
- Example: Auth service changes that impact XELORA users

---

## Critical Rules

### Product Launch Governance
- **NEVER** launch products without completing MVP checklist in `GO_TO_MARKET.md`
- **NEVER** skip beta phase (10 beta customers minimum before general launch)
- **NEVER** bypass validation gates ($5K MRR required before Product #2)
- **ALWAYS** document kill criteria decision if product fails validation

### Infrastructure Discipline
- **NEVER** skip Stripe testing before production deployment
- **NEVER** deploy auth changes without security review
- **NEVER** modify billing logic without human approval
- **ALWAYS** test webhook endpoints before marking infrastructure complete

### Code Integrity
- **NEVER** modify individual product code from marketplace context
- **ALWAYS** create pull requests for product-specific changes
- **NEVER** commit directly to main branches
- **ALWAYS** follow product-specific development workflows

### Launch Sequence Enforcement
- **ALWAYS** preserve: FairMerge → validation → iterate → scale
- **NEVER** work on Product #2 infrastructure before FairMerge validates
- **NEVER** build for hypothetical future products (build for 1, then scale)
- **ALWAYS** refer to `VISION.md` for strategic context before infrastructure decisions

---

## Agent Responsibilities by Name

### Claude (Senior Dev) - Primary Marketplace Agent
- Marketplace infrastructure (Stripe, auth, analytics)
- Shared services architecture design
- Code quality and security reviews
- Task execution from `TASKS.md`
- Documentation updates

### Gemini Enterprise - Strategic Advisor
- Product strategy validation
- Go-to-market planning
- Competitive analysis
- Launch sequencing decisions
- Market timing recommendations

### OpenCode Agents - Feature Implementation
- Individual product feature development
- Bug fixes and testing
- Documentation for product-specific work
- Code reviews for product repos

### Grok (Research) - Market Intelligence
- Competitive intelligence gathering
- Market research for product validation
- Trend monitoring and opportunity identification
- Customer segment analysis

---

## Workflow Examples

### Example 1: Stripe Integration Task
1. **Entry:** Read VISION.md → TASKS.md → PRODUCT_INVENTORY.md → Confirm assignment
2. **Work:** Set up Stripe products for FairMerge (Team/Growth/Enterprise plans)
3. **Test:** Verify webhook delivery, subscription lifecycle, payment processing
4. **Document:** Update CHANGELOG.md with Stripe configuration details
5. **Exit:** Mark task complete in TASKS.md, move to COMPLETED with date and results

### Example 2: Shared Auth Service
1. **Entry:** Verify task exists, check dependencies with FairMerge team
2. **Coordination:** Document in FairMerge TASKS.md that auth service is coming
3. **Work:** Implement Supabase auth integration
4. **Cross-Reference:** Update FairMerge TASKS.md with auth service availability
5. **Exit:** Complete mandatory 5-step exit workflow

### Example 3: Product #2 Selection (Blocked)
1. **Entry:** Read VISION.md → See FairMerge must hit $5K MRR first
2. **Status Check:** Check PRODUCT_INVENTORY.md → FairMerge at $2K MRR
3. **Decision:** Task is blocked, do not proceed
4. **Documentation:** Update TASKS.md with blocking reason
5. **Notify:** Alert human that Product #2 selection is blocked until validation

---

## Security & Compliance

### Credential Management
- **NEVER** commit API keys, secrets, or credentials to repos
- **ALWAYS** use environment variables for sensitive config
- **NEVER** log sensitive data (PII, payment info, auth tokens)
- **ALWAYS** follow GDPR data handling guidelines

### Code Review Requirements
- **ALWAYS** request human review for auth/billing changes
- **NEVER** merge security-critical PRs without approval
- **ALWAYS** run security scans before deployment
- **NEVER** deploy to production without staging verification

---

## Emergency Protocols

### If You Discover a Security Issue
1. **STOP** all work immediately
2. **NOTIFY** human via urgent message
3. **DOCUMENT** issue in private notes (not public CHANGELOG)
4. **WAIT** for human direction before proceeding

### If You Break Something
1. **REVERT** changes immediately if possible
2. **DOCUMENT** in CHANGELOG.md what broke and why
3. **NOTIFY** human and affected product teams
4. **FIX** forward with human approval

### If You're Blocked
1. **DOCUMENT** blocking issue in TASKS.md
2. **NOTIFY** human with clear description of blocker
3. **DO NOT** work around blockers without approval
4. **WAIT** for human direction

---

## Quarterly Review Process

Every quarter, this contract should be reviewed for:
- Alignment with current portfolio strategy
- Effectiveness of coordination workflows
- Agent responsibility clarity
- Emerging patterns requiring new rules

**Next Review:** 2026-04-30 (End of Q1)

---

## Questions or Conflicts?

If you're unsure about:
- Whether a task belongs in marketplace vs. product scope
- Whether to proceed with a blocked task
- How to coordinate a complex cross-project change
- Whether infrastructure is premature optimization

**ALWAYS ask the human before proceeding.** Better to clarify than to create coordination chaos.

---

## Contract Acknowledgment

By working in `Dev/docs/SYSTEM/`, you acknowledge:
1. You have read and understood this contract
2. You will follow ALL entry and exit requirements
3. You will respect scope boundaries
4. You will prioritize coordination over speed
5. You will preserve the sequential launch discipline

**Violations create technical debt and coordination chaos. Follow the contract.**
