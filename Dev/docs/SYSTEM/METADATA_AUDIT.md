# Marketplace Metadata & Price Audit

**Last Updated:** 2026-01-29
**Status:** Audit in Progress
**Total Products:** 21

---

## 1. Product Slug & SEO Audit

| ID | Name | Slug | Meta Description | OG Image | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `xelora` | XELORA | `xelora` | Done | Fallback | ✅ |
| `trial-revive` | TrialRevive | `trial-revive` | Done | Fallback | ✅ |
| `compliance-ghost` | ComplianceGhost | `compliance-ghost` | Done | Fallback | ✅ |
| `breaking-change` | BreakingChange | `breaking-change` | Done | Fallback | ✅ |
| `prompt-firewall` | Prompt Firewall | `prompt-firewall` | Done | Fallback | ✅ |
| `ai-cost-optimizer` | AI Cost Optimizer | `ai-cost-optimizer` | Done | Fallback | ✅ |
| `schema-drift` | Schema Drift Detector | `schema-drift` | Done | Fallback | ✅ |
| `vendor-scope` | VendorScope | `vendor-scope` | Done | Fallback | ✅ |
| `competitive-intel` | Comp. Feature Intel | `competitive-intel` | Done | Fallback | ✅ |
| `incident-postmortem` | Incident Postmortem | `incident-postmortem` | Done | Fallback | ✅ |
| `tech-debt` | Tech Debt Quantifier | `tech-debt` | Done | Fallback | ✅ |
| `oauth-token-manager` | OAuth Token Manager | `oauth-token-manager` | Done | Fallback | ✅ |
| `invoice-generator` | Invoice Generator | `invoice-generator` | Done | Fallback | ✅ |
| `pact-pull` | PactPull | `pact-pull` | Done | Fallback | ✅ |
| `code-review-bias` | CR Bias Detector | `code-review-bias` | Done | Fallback | ✅ |
| `browser-compliance` | Browser Compliance | `browser-compliance` | Done | Fallback | ✅ |
| `n8n-templates` | n8n Templates | `n8n-templates` | Done | Fallback | ✅ |
| `ai-prompt-templates` | AI Prompt Templates | `ai-prompt-templates` | Done | Fallback | ✅ |
| `cloud-ledger` | Cloud Ledger | `cloud-ledger` | Done | Fallback | ✅ |
| `async-video` | Async Video Response | `async-video` | Done | Fallback | ✅ |
| `compliance-changelog` | Compliance Changelog | `compliance-changelog` | Done | Fallback | ✅ |

---

## 2. Stripe Production Mapping

| ID | Mode | Price ID (Production) | Payment Link | Status |
| :--- | :--- | :--- | :--- | :--- |
| `xelora` | External | N/A | getxelora.com | ✅ |
| `cloud-ledger` | Unified | TBD | `/api/checkout` | 🟡 Pending Price |
| `n8n-templates` | Legacy | `price_1...` | buy.stripe.com | 🟡 Test Mode |
| `ai-prompt-templates` | Legacy | `price_1...` | buy.stripe.com | 🟡 Test Mode |
| ... | Unified | TBD | `/api/checkout` | ⚪ Scheduled |

---

## 3. Pending Actions

- [ ] Generate unique OG images for Tier 1 products.
- [ ] Migrate `n8n-templates` and `ai-prompts` to the unified `/api/checkout` pattern.
- [ ] Final verification of `success_url` and `cancel_url` for all routes.
