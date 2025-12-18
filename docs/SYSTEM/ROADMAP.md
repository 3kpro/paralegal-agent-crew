# SYSTEM ROADMAP — Xelora

**Status:** DRAFT (Consolidated 2025-12-13, Updated 2025-12-17)
**Authority:** SYSTEM

This document consolidates the product direction, timelines, and technical architecture for Xelora. It defines the path from current state (Free-Business tiers) to full enterprise platform (Professional-Enterprise tiers).

---

## 1. STRATEGIC OVERVIEW

**Single-Brand, Tiered Growth Strategy** designed to bootstrap to profitability and scale into enterprise markets under one unified Xelora brand.

### **Phase 1: Foundation (Current - 2025)**
- **Active Tiers:** Free, Starter, Pro, Business ($0-$79/month)
- **Model:** Product-Led Growth (PLG), Bootstrapped
- **Target:** Solo Creators, Micro-Influencers, Freelancers, Small Teams
- **Goal:** Reach $10K-$20K MRR with 0 FTEs (Founder + AI Workforce)
- **Key Differentiator:** Viral Score™ prediction engine

### **Phase 2: Enterprise Expansion (2026+)**
- **New Tiers:** Professional, Enterprise ($199-$1,499+/month)
- **Model:** Sales-Assisted + Product-Led Growth
- **Target:** Mid-market agencies, Marketing teams, Fortune 1000
- **Goal:** Reach $1M+ ARR, hire first salesperson
- **Key Differentiators:** Multi-channel automation, White-label, Custom AI training

**Brand Strategy:**
- **External:** Xelora (all tiers, all marketing)
- **Internal:** Powered by Content Cascade AI (CCAI) engine
- **No product migration:** Users upgrade tiers seamlessly within same platform

---

## 2. FINANCIAL & PRICING ROADMAP

### **Xelora Tier Progression**

| Tier | Price | Target User | Key Features |
| :--- | :--- | :--- | :--- |
| **Free** | $0/mo | Hobbyist | 5 posts, 1 account, Viral Score™ |
| **Starter** | $9/mo | Creator | 30 posts, 3 accounts |
| **Pro** | $29/mo | Freelancer | 100 posts, 10 accounts, AI Assistant |
| **Business** | $79/mo | Small Agency | 500 posts, 25 accounts, Team (5) |
| **Professional** | $199/mo | Boutique Agency | Multi-channel, 3 Brands, 10 Users |
| **Business+** | $499/mo | Mid-Market | 10 Brands, White-label, 25 Users |
| **Enterprise** | $1,499+/mo | Fortune 1000 | Unlimited, Custom AI, SSO, 99.9% SLA |

**Upgrade Path:**
```
Creator Focus → Team Features → Multi-Channel → White-Label → Custom AI
Free-Pro       Business         Professional    Business+     Enterprise
$0-$29         $79              $199            $499          $1,499+
```

**Revenue Targets:**
- Phase 1 (2025): $10K-$20K MRR (Free-Business tiers)
- Phase 2 (2026+): $100K+ MRR (Professional-Enterprise tiers launch)
- Phase 3 (2027+): $1M+ ARR (Enterprise scaling)

---

## 3. TECHNICAL ARCHITECTURE

### **Core Stack**
- **Frontend:** Next.js 15 (App Router), React Server Components.
- **Styling:** Tailwind CSS (Tron Theme), Shadcn/UI, Framer Motion.
- **Backend:** Supabase (PostgreSQL, Auth, RLS, Edge Functions).
- **Deployment:** Vercel.
- **Payments:** Stripe (Tiered subscription model).

### **AI & Machine Learning**
- **Text Generation:** OpenAI GPT-4, Google Gemini.
- **Viral Prediction:** Google Vertex AI (AutoML), Custom Regression Models.
- **Embeddings/RAG:** Supabase Vector Store.

---

## 4. KNOWN AMBIGUITIES & CONTRADICTIONS

⚠️ **CRITICAL: AI INFRASTRUCTURE DIVERGENCE**

There is a direct contradiction between System Authority documents regarding the AI provider strategy.

**Conflict:**
1.  **`SYSTEM/STATEMENT_OF_TRUTH.md` (Lines 119-120):**
    > "- **NO OpenRouter** - Each provider is integrated directly."
    > "- **NO LM Studio** - Not production-ready..."
2.  **`docs/features/AI_INFRASTRUCTURE_ROADMAP.md` (Lines 14-41):**
    > "- **Phase 1 (Now):** Use **OpenRouter** as the primary AI gateway..."
    > "Primary Provider: **OpenRouter**"

**Status:** UNRESOLVED.
**Action:** Developers must seek clarification before implementing new AI providers. Currently, the codebase favors direct integration (per `STATEMENT_OF_TRUTH`), but the infrastructure roadmap explicitly calls for a move to OpenRouter.

---

## 5. MILESTONES (BOOTSTRAP TRAJECTORY)

### **Year 1 (The "Prove It" Phase)**
- **Cost Structure:** ~$15k/year (Lean).
- **Team:** Solo Founder + "AI Workforce" (Claude, GPT-4, Gemini).
- **Success Metric:** Profitable Month 6 ($117k Profit/Year projection).
- **Focus:** Organic marketing, Product Hunt launch, Twitter/LinkedIn growth.

### **Year 2 (The "Scale" Phase)**
- **Trigger:** >$30k MRR.
- **Hires:** 1 Salesperson (for CCAI).
- **Expansion:** Launch CCAI Enterprise tiers.
- **Finance:** Decision point to Raise Series A ($10M val) vs Continue Bootstrapping.

### **Year 3 (The "Dominate" Phase)**
- **Target:** $3.6M ARR ($3M Profit).
- **Team:** 3-5 Core Employees.
- **Exit Strategy:** Acquisition targets ($100M+) or continued cash cow.
