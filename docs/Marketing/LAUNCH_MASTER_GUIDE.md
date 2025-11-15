# TrendPulse Launch Master Guide

**Purpose:** Step-by-step launch playbook for AI assistants (Galaxy.AI, ChatGPT, etc.)
**Current Status:** Stripe checkout working, Viral Score™ implemented, authentication complete
**Target:** Soft launch within 2-4 weeks

---

## Pre-Launch Checklist (Week 1-2)

### Technical Tasks
- [ ] **Stripe Production Mode**
  - Switch from test mode to live mode in Stripe dashboard
  - Update `STRIPE_SECRET_KEY` in Vercel environment variables
  - Test checkout flow end-to-end with real card
  - Verify webhook handling (subscription created/cancelled events)
  - Test customer portal (manage subscription button)

- [ ] **Production Testing**
  - Test all 3 tiers: Free, Pro ($29/mo), Premium ($99/mo)
  - Verify tier limits enforce correctly (3/day free, 25/day pro, unlimited premium)
  - Test upgrade flow from free → pro → premium
  - Test downgrade/cancellation flow
  - Verify emails send (welcome, payment confirmation)

- [ ] **Analytics Setup**
  - Install Plausible Analytics or Google Analytics
  - Track: signups, checkouts, tier conversions, daily active users
  - Set up conversion goals (signup → paid conversion)

- [ ] **Landing Page Polish**
  - Screenshot Viral Score™ feature for hero section
  - Record 60-90 second demo video (keyword → trend → 6-platform content)
  - Add testimonial section (even if just beta tester quotes)
  - Ensure mobile-responsive

### Content Preparation

- [ ] **Product Hunt Submission** (PRIMARY LAUNCH)
  - Create Product Hunt account
  - Prepare tagline: "Turn trending topics into viral content with AI"
  - Assets needed:
    - Hero image (1270x760px) - Dashboard with Viral Score™
    - Gallery: Trend discovery, content generation, campaign view, analytics
    - Demo video (60-90 sec) showing full workflow
    - Maker intro (your story)
  - Launch exclusive: "50% off Pro for first month (code: HUNT50)"
  - Schedule: Tuesday-Thursday, 12:01 AM PST
  - Rally 10+ supporters to upvote in first 2 hours

- [ ] **Social Media Content** (10-day build-in-public)
  - Day 1: Announce building TrendPulse (the problem story)
  - Day 3: Demo GIF of 30-second workflow
  - Day 5: Feature highlight (Viral Score™ prediction)
  - Day 7: Pricing announcement + Product Hunt teaser
  - Day 10: LAUNCH DAY - Product Hunt link

- [ ] **Email Sequences**
  - Welcome email (on signup)
  - Onboarding email series (Days 1, 3, 7)
  - Upgrade prompts for free users (day 5 if hitting limits)
  - Payment confirmation + invoice

### Optional (Post-Launch Revenue)

- [ ] **Gumroad Digital Products**
  - "Viral Content Template Pack" ($29)
  - "100 Trending Topic Ideas" ($19)
  - "Premium Trends Dataset" ($49)
  - Cross-promote: Gumroad buyers get 20% off Pro subscription

---

## Launch Week (Week 3)

### Product Hunt Day (Tuesday 12:01 AM PST)
1. Submit product at midnight
2. Share on Twitter/X immediately
3. Reply to EVERY comment within 5 minutes
4. Share to relevant communities (Indie Hackers, r/SaaS, r/marketing)
5. Email beta users asking for upvotes
6. Monitor #1-10 ranking throughout day

### Twitter/X Campaign
- Post every 2-3 hours on launch day
- Share user testimonials/early wins
- Respond to all mentions within 30 min
- Use hashtags: #ProductHunt #AItools #ContentCreation #MarketingAI

### Community Outreach
- Post in r/SaaS, r/Entrepreneur, r/marketing
- Share in Facebook groups for content creators
- LinkedIn post highlighting Viral Score™ feature
- Indie Hackers launch post

---

## Post-Launch (Week 4+)

### Metrics to Track
- Daily signups (target: 50/day after Product Hunt)
- Free → Paid conversion (target: 10%)
- Churn rate (target: <5% monthly)
- Daily active users (DAU)
- Viral Score™ prediction accuracy

### Growth Tactics
1. **Content Marketing**
   - Blog posts about trend discovery, content creation tips
   - SEO-optimized landing pages for "viral content generator" etc.
   - Guest posts on marketing blogs

2. **Partnerships**
   - Reach out to content creator tools (Buffer, Hootsuite) for integration
   - Affiliate program (10% commission via Gumroad)

3. **Feature Releases**
   - Campaign archive improvements
   - Analytics dashboard enhancements
   - Phase 2: ML-powered Viral Score™ (after 100+ user data points)

---

## Critical Path to Launch

**Week 1:** Technical prep + analytics setup
**Week 2:** Content creation (Product Hunt assets, social posts, emails)
**Week 3:** Launch on Product Hunt (Tuesday), social amplification
**Week 4:** Monitor metrics, iterate based on feedback

---

## Current Product Status (Reference)

✅ **Working Features:**
- Viral Score™ prediction (4-factor heuristic algorithm)
- Multi-platform content generation (Twitter, LinkedIn, Facebook, Instagram, TikTok, Reddit)
- Campaign management with archive/restore
- Stripe checkout + tier system (Free/Pro/Premium)
- Remember Me authentication
- Usage limits enforcement (3/day free, 25/day pro, unlimited premium)

⚠️ **Known Limitations:**
- No ML model yet (Phase 2 - needs user engagement data)
- Social media auto-posting not connected (OAuth configured, UI not integrated)
- Analytics dashboard exists but needs UI polish

---

## Support Resources

- **STATEMENT_OF_TRUTH.md** - Full technical architecture
- **CHANGELOG.md** - Complete version history
- **Account_INFO.md** - API keys and credentials
- **context.md** - Recent development updates

---

**Next Steps:** Ask this AI to walk you through each checklist item one at a time, starting with "Technical Tasks" or "Content Preparation" based on your priority.
