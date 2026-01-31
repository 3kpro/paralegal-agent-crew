# TASKS - FairMerge (Engineering Velocity & Health Engine)

**Last Updated:** 2026-01-28
**Status:** VELOCITY PIVOT (v2.0)
**Strategic Context:** See `Dev/DevOps/VELOCITY_PIVOT_SPEC.md` and `Dev/DevOps/New_Marketplace_Direction.md`

---

## STRATEGIC PIVOT SUMMARY

**Old Positioning:** Code Review Bias Detector (too niche, HR-focused)
**New Positioning:** Engineering Velocity & Health Engine (common pain, eng-focused)

**Key Metrics (The 3 That Matter):**
1. **Nitpick Ratio:** % of comments about style/formatting vs. logic (should be <10%)
2. **Review Load Imbalance:** Which 20% of devs do 80% of reviews (burnout risk)
3. **Staleness:** PRs waiting >24h for first review (bottleneck detection)

**Gemini Enterprise Validation:** FairMerge is Top 3 priority (highest ACV, data moat, sticky)
- 80% of dev time on FairMerge
- 20% of dev time on maintenance/marketing
- 0% on other 18 products until FairMerge has 10 paying customers

---

## NOW (Active Task)

No active tasks - ready for next phase.

---

## COMPLETED

- [x] **Refactor Classification Engine** 🧠 (CRITICAL) ✅ (2026-01-31)
      - **Goal:** Replace "Bias" prompt with "Velocity" prompt
      - **File:** `analyze_comment` function in classification engine
      - **Action Items:**
        1. Update Claude API system prompt (see VELOCITY_PIVOT_SPEC.md "Golden Prompt")
        2. Change output schema:
           ```json
           {
             "category": "nitpick" | "critical" | "process" | "toxic",
             "constructive_score": 1-10,
             "tone": "neutral" | "toxic" | "encouraging",
             "reasoning": "User is arguing about indentation..."
           }
           ```
        3. Update input to include: `comment_body`, `diff_hunk` (context)
        4. Test with sample comments (nitpick vs. critical vs. toxic)
      - **Priority:** CRITICAL (blocks beta)
      - **Assigned:** Gemini
      - **Spec Reference:** VELOCITY_PIVOT_SPEC.md Section 2A

---

- [x] **Create Health Check Aggregation Endpoint** 📊 ✅ (2026-01-31)
      - **Goal:** New endpoint for exec summary metrics
      - **Endpoint:** `GET /reports/health-check/{repo_id}`
      - **Action Items:**
        1. Calculate `nitpick_percentage`: (Nitpicks / Total Comments) * 100
        2. Get `top_reviewers`: Users sorted by comment count (desc)
        3. Calculate `average_pickup_time`: Avg time between pr_created and first_comment
        4. Return JSON with all 3 metrics
      - **Priority:** HIGH (needed for dashboard)
      - **Assigned:** Gemini
      - **Spec Reference:** VELOCITY_PIVOT_SPEC.md Section 2C

- [x] **Security: OAuth Scope Verification** 🔒 ✅ (2026-01-31)
      - **Goal:** Ensure minimal GitHub permissions (read-only)
      - **Action Items:**
        1. Verify OAuth scope is `repo` or `read:user, read:org` only
        2. Explicitly check: NO `write:repo_hook` or `workflow` permissions
        3. Add "Nuke Data" button (cascade delete all comments/PRs for tenant)
        4. Test data deletion flow
      - **Priority:** HIGH (security requirement for beta)
      - **Assigned:** Gemini
      - **Spec Reference:** VELOCITY_PIVOT_SPEC.md Section 4

### Frontend: Health Check Dashboard

- [x] **Build "Velocity Killer" Gauge** 🎯 ✅ (2026-01-31)
      - **Goal:** Big donut chart showing Nitpick Ratio
      - **Action Items:**
        1. Create donut chart component (D3.js or Recharts)
        2. Color coding:
           - Green: <10% (Healthy)
           - Yellow: 10-25% (Warning)
           - Red: >25% (Text: "Your team is wasting time on style arguments. Install a Linter.")
        3. Connect to `/reports/health-check/{repo_id}` API
      - **Priority:** HIGH (key value prop)
      - **Assigned:** Gemini
      - **Spec Reference:** VELOCITY_PIVOT_SPEC.md Section 3A

- [x] **Build "Hero vs. Zero" Chart** 📊 ✅ (2026-01-31)
      - **Goal:** Bar chart showing review volume per developer
      - **Action Items:**
        1. Fetch `top_reviewers` from health-check endpoint
        2. Calculate standard deviation (highlight devs >2σ above mean)
        3. Visual indicator: "Burnout Risk" badge for overloaded reviewers
        4. Tooltip: "This developer reviewed 5x more PRs than average this month"
      - **Priority:** MEDIUM
      - **Assigned:** Gemini
      - **Spec Reference:** VELOCITY_PIVOT_SPEC.md Section 3A

- [x] **Build "Bottleneck" List** 🚨 ✅ (2026-01-31)
      - **Goal:** Table of PRs open >48 hours without review
      - **Action Items:**
        1. Query PRs where `first_review_at - created_at > 48 hours`
        2. Show: PR title, author, staleness (hours), assigned reviewers
        3. Sort by staleness (oldest first)
        4. Action button: "Nudge Reviewers" (send Slack/email reminder)
      - **Priority:** MEDIUM
      - **Assigned:** Gemini
      - **Spec Reference:** VELOCITY_PIVOT_SPEC.md Section 3A

---

## NEXT (Post-Beta Features)

### Core Infrastructure

- [ ] **GitHub OAuth Integration** 🐙
      - **Status:** Partially complete (verify scope)
      - **Action:** Audit existing OAuth flow, ensure minimal permissions

- [ ] **PR History Ingestion** 📥
      - **Goal:** Sync all historical PRs + comments from GitHub
      - **Action Items:**
        1. GitHub API pagination (handle 1000+ PRs)
        2. Rate limit handling (5000 requests/hour)
        3. Incremental sync (only new PRs after initial load)
        4. Progress indicator (background job status)

- [ ] **AI Gateway Abstraction** 🤖
      - **Goal:** Abstract Claude API calls for provider flexibility
      - **Rationale:** Gemini Enterprise identified vendor lock-in risk
      - **Action Items:**
        1. Create `AIGateway` class with unified interface
        2. Support multiple providers: Claude, GPT-4o, Gemini 1.5 Pro
        3. A/B testing capability (cost vs. quality comparison)
        4. Fallback logic (if Claude is down, use OpenAI)
      - **Priority:** MEDIUM (risk mitigation)
      - **Spec Reference:** New_Marketplace_Direction.md Section 6

### Dashboard Enhancements

- [ ] **Export Reports** 📋
      - **Formats:** PDF, CSV, Markdown
      - **Content:** Health check summary + detailed PR list
      - **Priority:** LOW (nice-to-have for beta)

- [ ] **GitLab Integration** 🦊
      - **Goal:** Support GitLab in addition to GitHub
      - **Priority:** LOW (defer until GitHub validates)

---

## BACKLOG (Post-$5K MRR)

### Advanced Features

- [ ] **Team Benchmarking** 📈
      - **Goal:** Compare team metrics against anonymized industry benchmarks
      - **Example:** "Your Nitpick Ratio (18%) is higher than 72% of similar-sized teams"

- [ ] **Automated Linter Recommendations** 🛠️
      - **Goal:** If Nitpick Ratio >25%, suggest specific linters (ESLint, Prettier, Black)
      - **Integration:** Generate config files for recommended linters

- [ ] **Slack Integration** 💬
      - **Goal:** Daily/weekly summary digests to team Slack channels
      - **Alerts:** "3 PRs are stale (>48h). Nudge reviewers?"

- [ ] **Custom Metrics** 📐
      - **Goal:** Let teams define custom review quality metrics
      - **Example:** "Flag comments with >3 back-and-forth exchanges" (debate indicator)

---

## COMPLETED

- [x] **Strategic Pivot Decision** ✅ (2026-01-28)
      - **Details:** Gemini Enterprise validated FairMerge as Top 3 priority
      - **Decision:** Pivot from "Bias Detector" to "Velocity Engine"
      - **Impact:** Clearer value prop, broader market, easier to sell
      - **Spec:** VELOCITY_PIVOT_SPEC.md created with full implementation details

---

## NOTES

### Velocity Pivot Rationale (Gemini Enterprise)

**Why Abandon "Bias Detection":**
- Too rare (sexist/racist comments are uncommon in code reviews)
- Too HR-focused (eng managers don't want to play HR)
- Hard to sell ("Do you have a bias problem?" = defensive reaction)

**Why "Velocity" is Better:**
- Common pain (every team wastes time on nitpicks)
- Eng-focused (speaks to productivity, not feelings)
- Easy to sell ("Want your team to ship 20% faster?" = instant yes)

### The 3 Metrics That Matter

1. **Nitpick Ratio** (Easiest win)
   - Problem: Teams argue about style instead of logic
   - Solution: "Install a linter, save 10 hours/week"
   - Metric: <10% = healthy, >25% = broken

2. **Review Load Imbalance** (Burnout prevention)
   - Problem: 20% of devs do 80% of reviews (Pareto principle)
   - Solution: Redistribute reviews, prevent burnout
   - Metric: Highlight devs >2σ above mean

3. **Staleness** (Bottleneck detection)
   - Problem: PRs sit unreviewed for days
   - Solution: Nudge reviewers, identify blockers
   - Metric: >24h = yellow flag, >48h = red flag

### Technical Implementation Notes

**Claude API System Prompt (Golden Prompt):**
```
You are a Senior Engineering Manager analyzing code review comments to optimize team velocity.

Your Goal: Classify the following code review comment into one of these buckets:

Nitpick: Comments about indentation, variable naming (camelCase vs snake_case), line breaks, or code style. These should be automated by linters.

Critical: Comments about logic errors, security vulnerabilities, performance issues, architectural flaws, or bugs. These are high value.

Process: Comments about ticket numbers, merging strategies, or git hygiene.

Toxic: Sarcasm, rhetorical questions ("Why did you do this?"), or personal attacks.

Analyze this comment:
"{comment_body}"

Return ONLY the JSON object.
```

**Output Schema:**
```json
{
  "category": "nitpick" | "critical" | "process" | "toxic",
  "constructive_score": 1-10,
  "tone": "neutral" | "toxic" | "encouraging",
  "reasoning": "User is arguing about indentation which should be handled by a linter."
}
```

### Gemini Enterprise Strategic Guidance

**Focus Strategy (from New_Marketplace_Direction.md):**
- **80% of time:** FairMerge (highest ACV, data moat)
- **20% of time:** Maintenance + marketing
- **0% of time:** Other 18 products until FairMerge hits 10 paying customers

**Validation Gate:**
- Do NOT write more code until you have a list of waiting users
- Run manual reports for friendly CTOs (concierge validation)
- Build landing page with "Get Early Access" button (measure conversion)

**Pricing Validation:**
- $199+ pricing is correct (value-based, saves 5+ hours)
- If you save an engineer 5 hours, that's worth $500+
- Do NOT discount below $149/month Team plan

### Cross-References

- **Marketplace Strategy:** `Dev/docs/SYSTEM/VISION.md` (sequential launch model)
- **Launch Playbook:** `Dev/docs/SYSTEM/GO_TO_MARKET.md` (beta → validation → scale)
- **Product Catalog:** `Dev/docs/SYSTEM/PRODUCT_INVENTORY.md` (FairMerge priority #1)
- **Velocity Pivot Spec:** `Dev/DevOps/VELOCITY_PIVOT_SPEC.md` (full technical spec)
- **Strategic Direction:** `Dev/DevOps/New_Marketplace_Direction.md` (Gemini Enterprise analysis)

---

**Maintained By:** Claude (with Gemini Enterprise strategic input)
**Next Review:** After velocity pivot implementation complete
**Target:** Beta launch with velocity metrics (Q1 2026)
