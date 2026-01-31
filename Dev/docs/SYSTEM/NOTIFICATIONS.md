# Unified Notification System

**Last Updated:** 2026-01-29
**Status:** Implementation Phase
**Scope:** Marketplace-wide transactional communications

---

## 1. Overview

The Unified Notification System centralizes all outgoing communications (Email, Slack, SMS) across the 3K Pro Services portfolio. This ensures a consistent brand voice, centralized unsubscribed management, and improved deliverability.

**Core Principles:**
- **Standardization:** All products use the same email layout and typography.
- **Reliability:** Triggered by database webhooks and operational events.
- **Visibility:** All sent notifications are logged for audit purposes.

---

## 2. Infrastructure

### Transactional Email: Resend.com
Resend is the primary provider for high-reliability transactional emails.

**Key Features:**
- **React.email:** Templates built with React for high fidelity across clients.
- **Dedicated IPs:** Scalable as traffic increases.
- **Domain Verification:** All emails sent from `@3kpro.services`.

### Operational Alerts: Slack
Used for internal team notifications (New Signups, Payment Failures).

---

## 3. Implementation Pattern

### Central Notification Utility (`lib/notifications.ts`)
A single service to route notifications based on event types.

```typescript
import { notifications } from "@/lib/notifications";

// Usage in Stripe Webhook
await notifications.sendWelcomeEmail(userEmail, productCode);
```

---

## 4. Email Templates

| Template Name | Trigger | Goal |
| :--- | :--- | :--- |
| `WelcomeEmail` | `checkout.session.completed` | Provisioning info & Next Steps |
| `PaymentSuccess` | `invoice.payment_succeeded` | Receipt and confirmation |
| `SubscriptionUpdated` | `customer.subscription.updated`| Plan change confirmation |
| `ActionRequired` | `customer.subscription.deleted`| Retention / Dunning |

---

## 5. Action Items

- [ ] Create `components/emails` directory for React templates.
- [ ] Implement `WelcomeEmail` template (Structural Vector style).
- [ ] Implement `notifications.ts` wrapper for Resend SDK.
- [ ] Integrate with Unified Webhook Handler.
- [ ] Add `RESEND_API_KEY` to `.env.local`.
