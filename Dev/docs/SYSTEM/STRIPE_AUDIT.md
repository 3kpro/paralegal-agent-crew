# Stripe Product Catalog Audit

**Last Updated:** 2026-01-29
**Status:** Audit in Progress
**Account:** 3K Pro Services (Live/Test)

---

## 1. Compliance Checklist for Production
Every product in the Stripe Dashboard MUST have:
- [ ] **Name:** Following `[Name] - [Tier]`
- [ ] **Metadata:** `product_code` (e.g. `fairemerge`)
- [ ] **Tax Category:** Set to `Software as a Service (SaaS)`
- [ ] **Webhook Settings:** Live URL pointing to `https://3kpro.services/api/webhook/stripe`

---

## 2. Product Status Matrix

| Product Code | Name | Price IDs (Live) | Price IDs (Test) | Status |
| :--- | :--- | :--- | :--- | :--- |
| `cloud-ledger` | Cloud Ledger | TBD | `price_1...` | 🛠️ In Refactor |
| `xelora` | XELORA | TBD | `price_1...` | ⚪ Scheduled |
| `reviewlens` | FairMerge | TBD | `price_1...` | 🟡 Ready for Live |
| `n8n-templates` | n8n Templates | TBD | `price_1...` | 🟡 Ready for Live |

---

## 3. Webhook Event Coverage

Verified event handlers in `api/webhook/stripe/route.ts`:
- [x] `checkout.session.completed`
- [x] `customer.subscription.created`
- [x] `customer.subscription.updated`
- [x] `customer.subscription.deleted`
- [ ] `invoice.payment_succeeded` (Planned)
- [ ] `invoice.payment_failed` (Planned)

---

## 4. Pending Actions

- [ ] Create Production Price IDs for `cloud-ledger`.
- [ ] Enable Stripe Tax in Dashboard (Live Mode).
- [ ] Update `3kpro-website/.env` with live keys once approved.
- [ ] Test the unified `api/checkout` endpoint with a single product.
