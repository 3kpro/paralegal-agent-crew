# Stripe Operations: Dunning & Refunds

**Last Updated:** 2026-01-29
**Status:** Operational Guide
**Scope:** Managing the financial lifecycle of the 21-product portfolio.

---

## 1. Dunning Management (Automated)

Dunning is the process of recapturing failed payments. We rely on Stripe's automated "Smart Retries" and "Billing Customer Portal".

### Automated Workflow
1. **Initial Failure:** Stripe retries based on smart logic (1-7 days).
2. **Customer Alert:** Stripe sends an automated "Update Payment Method" email.
3. **Grace Period:** During retries, the product status in our DB will remain `active` (Stripe status `past_due`).
4. **Final Failure:** After 4 failed attempts, Stripe is configured to **Cancel the subscription**.
5. **App Response:** Our webhook (`customer.subscription.deleted`) revokes access immediately.

---

## 2. Manual Refund Policy

### Criteria for Refunds
- **Accidental Subscription:** Full refund if requested within 24 hours and zero API/system usage recorded.
- **System Downtime:** Pro-rated credit for downtime exceeding 4 hours in a single billing cycle.
- **Unsatisfied Performance:** Refunds for the current billing cycle only, at the discretion of the Product Owner.

### Execution Procedure
1. Locate the customer in the Stripe Dashboard.
2. Select the **Payment Intent** or **Invoice**.
3. Click "Refund".
4. Choose "Full" or "Partial".
5. **Important:** Add a note with the internal support ticket ID.

---

## 3. Support Interface

When a customer contacts support regarding billing:

1. **Verification:** Ask for the email used for the marketplace account (not always the same as the product-specific login, though we prefer unified identity).
2. **Dashboard Lookup:** Search for the customer's `email` or `stripe_customer_id` from the `profiles` table.
3. **Tier Verification:** Check the `subscription_status` and `subscription_tier` in the `3kpro.services/admin/analytics` dashboard.

---

## 4. Taxes & Compliance

- **Stripe Tax:** We use "Automatic Tax". Never manually calculate tax for a client.
- **Invoices:** Customers can download their legal tax invoices via the **Customer Billing Portal** on the marketplace site.
- **Exporting for Accounting:** Quarterly exports of Stripe payouts should be matched against the `analytics` dashboard MRR reports.

---

## 5. Escalation Path

- **Tier 1:** Standard refund/cancellation issues -> Support Team.
- **Tier 2:** Chargebacks or tax compliance disputes -> Operational Lead / James.
- **Tier 3:** Technical webhook/provisioning failures -> Engineering Team (Central).
