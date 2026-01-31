# Infrastructure Scaling Plan

**Last Updated:** 2026-01-29
**Status:** Planning & Initial Implementation
**Scope:** Marketplace-wide performance and reliability

---

## 1. Overview

As the 3K Pro Services portfolio grows to 21 products, the shared infrastructure (Auth, Billing, Analytics) must handle increasing traffic with minimal latency and high availability. This plan outlines the move toward Edge computing and robust rate limiting.

---

## 2. Competitive Edge (Vercel Edge Functions)

**Current State:** Most API routes are running as standard Lambda functions in `us-east-1`.
**Goal:** Move latency-critical routes to the **Edge Runtime**.

### Target Routes for Edge Migration:
- **Auth Middleware:** Verifying JWTs at the Edge reduces "Cold Start" latency significantly.
- **Webhook Routing:** Initial Stripe webhook ingestion and validation.
- **Product Configuration:** Fetching product metadata for the marketplace landing page.

### Implementation Checklist:
- [ ] Refactor `middleware.ts` in `3kpro-website` to use Edge-compatible libraries.
- [ ] Migrate `api/webhook/stripe` to Edge (requires switching from `stripe` Node SDK to standard `fetch` or Edge-compatible SDK).

---

## 3. Database Performance (Supabase / Postgres)

**Goal:** Ensure queries across multiple schemas (`public`, `reviewlens`, `cloudledger`) remain fast as datasets grow.

### Action Items:
- [ ] **Indexing Strategy:** 
  - Index `stripe_customer_id` and `subscription_id` across all relevant tables.
  - Composite index on `user_id` + `product_code` for rapid access gating.
- [ ] **Connection Pooling:** Ensure all product clients use Supabase's transaction pooler (port 6543) to prevent connection exhaustion.
- [ ] **Automatic Vacuuming:** Verify autovacuum settings for high-churn tables (logs, session data).

---

## 4. Rate Limiting (Upstash / Redis)

**Goal:** Protect APIs from abuse and ensure fair resource distribution among products.

### Strategy:
- **Global Rate Limit:** Applied per IP address.
- **Product-Level Rate Limit:** Applied per API Key / User Session.
- **Implementation:** Use `@upstash/ratelimit` with Redis for global state with <1ms latency.

### Tiered Limits:
- **Anonymous:** 10 requests / minute.
- **Team Plan:** 100 requests / minute.
- **Enterprise:** 1000 requests / minute.

---

## 5. Monitoring & Auto-Scaling

- **Vercel Analytics:** Track real-time latency and Core Web Vitals.
- **Supabase Dashboard:** Monitor database CPU/Memory and slow query logs.
- **Alerting:** PagerDuty / Slack notifications when Edge function execution time exceeds 50ms.
