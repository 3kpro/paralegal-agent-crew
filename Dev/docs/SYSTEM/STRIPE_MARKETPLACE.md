# Stripe Marketplace Integration Guide

**Last Updated:** 2026-01-29
**Status:** Implementation Guide
**Scope:** Marketplace-wide billing infrastructure

---

## 1. Overview

This document outlines the standard procedure for integrating products into the 3K Pro Services Stripe account. We use a **single Stripe account** for the entire portfolio (21 products) to centralize revenue recognition, tax compliance, and payouts.

**Architecture:**
- **One Stripe Account:** `3K Pro Services`
- **Products:** Defined as Stripe Products with metadata `product_code` (e.g., `fairmerge`)
- **Subscriptions:** Managed via Stripe Checkout and Customer Portal
- **Webhooks:** Single endpoint `https://api.3kpro.services/stripe/webhook` routing events to appropriate product handlers

---

## 2. Product Catalog Setup (Manual Step)

### Naming Convention
- **Product Name:** `[Product Name] - [Tier]` (e.g., `FairMerge - Team`)
- **Product Metadata:**
  - `product_code`: `reviewlens` (used for routing)
  - `tier`: `team` | `growth` | `enterprise`
  - `validation_gate`: `true` (if applicable)

### FairMerge Configuration (Execute Now)

**Product 1: FairMerge - Team**
- **Type:** Recurring
- **Price:** $149 / month
- **Features:** 
  - Up to 20 contributors
  - Basic bias detection
  - 30-day data retention
- **Metadata:** `product_code: fairmerge`, `tier: team`

**Product 2: FairMerge - Growth**
- **Type:** Recurring
- **Price:** $349 / month
- **Features:**
  - Up to 100 contributors
  - Advanced bias detection
  - 90-day data retention
  - Email alerts
- **Metadata:** `product_code: fairmerge`, `tier: growth`

**Product 3: FairMerge - Enterprise**
- **Type:** Recurring
- **Price:** $749 / month
- **Features:**
  - Unlimited contributors
  - SSO (SAML/OIDC)
  - Custom reports
  - Dedicated support
- **Metadata:** `product_code: fairmerge`, `tier: enterprise`

---

## 3. Webhook Integration Strategy

We use a **Unified Webhook Handler** pattern.

### Endpoint
`POST /api/webhooks/stripe`

### Event Routing
1. Receive Stripe Event (`customer.subscription.created`, etc.)
2. Extract `product_id` from event line items
3. Query Stripe Product to get `metadata.product_code`
4. Route to product-specific handler (e.g., `FairMergeServices.handleSubscriptionChange()`)

### Required Events
- `checkout.session.completed`: Provision access
- `customer.subscription.updated`: Handle plan changes/cancellations
- `customer.subscription.deleted`: Revoke access
- `invoice.payment_succeeded`: Log revenue, send receipt email
- `invoice.payment_failed`: Trigger dunning email (handled by Stripe settings)

---

## 4. Testing Protocol

### Prerequisites
- Stripe CLI installed (`stripe login`)
- Local development server running

### Test Scenarios

**Scenario A: New Subscription (Team Plan)**
1. **Trigger:** `stripe trigger checkout.session.completed`
2. **Verify:**
   - User created in local DB
   - Subscription status is `active`
   - Access granted to Team features
   - Welcome email queued

**Scenario B: Upgrade (Team -> Growth)**
1. **Action:** Change plan in Stripe Test Dashboard
2. **Verify:**
   - Webhook `customer.subscription.updated` received
   - DB updated to `tier: growth`
   - Feature flags updated immediately

**Scenario C: Cancellation**
1. **Action:** Cancel subscription in Stripe Test Dashboard
2. **Verify:**
   - Webhook `customer.subscription.deleted` (at period end) or `updated` (cancel at period end)
   - DB shows `cancel_at_period_end: true`
   - Access remains until period ends

**Scenario D: Payment Failure**
1. **Trigger:** `stripe trigger invoice.payment_failed`
2. **Verify:**
   - User status `past_due`
   - UI shows "Update Payment Method" banner

---

## 5. Tax Configuration

**Stripe Tax** must be enabled for all products.

1. **Dashboard Settings:** Enable Stripe Tax
2. **Product Settings:** Set Tax Category to "Software as a Service (SaaS)"
3. **Customer:** Collect billing address for tax leverage
4. **Validation:** Verify tax is calculated on Checkout page

---

## 6. Implementation Checklist (For Developers)

- [ ] Create Products in Stripe Dashboard (Test Mode)
- [ ] Copy Price IDs to `env.local`
- [ ] Implement `POST /api/webhooks/stripe`
- [ ] Verify signature (`stripe listen`)
- [ ] Test scenarios A-D
- [ ] Promote Products to Production
