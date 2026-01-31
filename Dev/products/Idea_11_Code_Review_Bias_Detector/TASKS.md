# TASKS - Idea 11: Code Review Bias Detector (ReviewLens)

## NOW
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









- [x] **Build "Velocity Killer" Gauge** 🎯 ✅ (2026-01-31)
- [x] **Security: OAuth Scope Verification** 🔒 ✅ (2026-01-31)
- [x] **Create Health Check Aggregation Endpoint** 📊 ✅ (2026-01-31)
- [x] **Project Scaffolding** ✅
- [x] **GitHub OAuth Integration** 🐙
- [x] **PR History Ingestion** 📥
- [x] **Review Pattern Analysis** 📊
- [x] **Comment Classifier** 🧠
- [x] **Implement Stripe Integration** 💳 ✅ (2026-01-29)
- [x] **Bias Detection Algorithm** ⚖️ ✅ (2026-01-29)
- [x] **Dashboard Visualizations** 📈 ✅ (2026-01-29)
      - **Details:** Implemented D3/Recharts for interaction metrics and comment breakdown.
      - **Assigned:** Gemini

## NEXT
- [x] **GitLab Integration** 🦊 ✅ (2026-01-29)
      - **Details:** OAuth, `GitLabIngestionService`, and platform toggle in Dashboard.
      - **Assigned:** Gemini
- [x] **Export Reports** 📋 ✅ (2026-01-29)
      - **Details:** PDF (ReportLab) and CSV export options.
      - **Assigned:** Gemini

## BACKLOG
(empty)

## COMPLETED
- [x] **Integrate Shared Auth** 🔐 ✅ (2026-01-29)
      - **Details:** Connected frontend to Marketplace Supabase instance.
      - **Implementation:** `AuthContext.tsx` provider and `useAuth` hook in Dashboard.
