# Security Hardening Strategy: XELORA & 3K-Pro-Services

**Date:** 2026-01-18
**Status:** ACTIVE - HUMAN-IN-LOOP ENFORCEMENT
**Last Reviewed:** 2026-01-18

---

## EXECUTIVE SUMMARY

**Security Audit Result:** ✅ NO ACTIVE EXPOSURE
- `.env` files are **NOT tracked in Git** (properly gitignored)
- **No hardcoded secrets** in source code (all using `process.env`)
- Both repos follow proper .env segregation
- All OAuth/Stripe credentials externalized to environment variables

**Critical Risk Mitigated:** ✅
Stripe keys and OAuth secrets are only exposed locally (your machine) and in Vercel environment variables (encrypted at rest).

---

## SECURITY AUDIT FINDINGS

### Landing-Page Repository (`landing-page/`)

**Local Files (Not in Git):**
- `.env` ✅ (gitignored)
- `.env.local` ✅ (gitignored)
- `.env.production` ✅ (gitignored)
- `.env.production.local` ✅ (gitignored)
- `.env.vercel` ✅ (gitignored)
- `.env.vercel.production` ✅ (gitignored) - **CONTAINS REAL SECRETS**
- `.vercel/.env.preview.local` ✅ (gitignored)

**Code Analysis:**
- ✅ No hardcoded API keys in source
- ✅ No hardcoded Stripe keys in source
- ✅ All secrets accessed via `process.env` only
- ✅ Stripe client properly initialized from `process.env.STRIPE_SECRET_KEY`
- ✅ Google API key properly accessed from `process.env.GOOGLE_API_KEY`
- ✅ Test files use mock keys (e.g., `sk_test_mock_key`)

**Git History:**
- ✅ No `.env.*` files tracked in Git
- ✅ `.gitignore` includes all sensitive patterns

### 3K-Pro-Services Website (`3kpro-website/`)

**Local Files (Not in Git):**
- `.env.local` ✅ (gitignored) - **CONTAINS REAL SECRETS**

**Code Analysis:**
- ✅ No hardcoded secrets in source
- ✅ All secrets accessed via `process.env`

**Git History:**
- ✅ No `.env.*` files tracked in Git

---

## SECRETS INVENTORY

### Active Secrets in Environment

**Stripe (CRITICAL):**
```
STRIPE_SECRET_KEY = sk_test_51SESLa...  [TESTMODE - NOT PRODUCTION]
STRIPE_WEBHOOK_SECRET = whsec_mZiM7...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = pk_test_51SESLa...  [PUBLIC - OK]
```

**Google/Gemini:**
```
GOOGLE_API_KEY = AIzaSyCxK1IWzcZMcuni...
GEMINI_API_KEY = [alias for above]
```

**Supabase:**
```
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGci...  [PUBLIC - OK]
NEXT_PUBLIC_SUPABASE_URL = https://hvcmidkylzrhmrwyigqr.supabase.co  [PUBLIC - OK]
```

**OAuth Credentials:**
```
FACEBOOK_CLIENT_SECRET = 15c77c9...
INSTAGRAM_CLIENT_SECRET = 15c77c9...
LINKEDIN_CLIENT_SECRET = WPL_AP1...
TWITTER_CLIENT_SECRET = 6QVXUiWzcl59...
```

**Other:**
```
ENCRYPTION_KEY = ee8d695a2f14e2d2...  (64 hex chars)
RESEND_API_KEY = re_TSxJqPmQ_MA7N2TAiS5...
```

---

## RISK ASSESSMENT

| Secret | Risk Level | Exposure | Mitigation |
|--------|-----------|----------|-----------|
| STRIPE_SECRET_KEY | 🔴 CRITICAL | Local + Vercel | Rotate regularly, Webhook signing |
| STRIPE_WEBHOOK_SECRET | 🔴 CRITICAL | Local + Vercel | Rotate regularly, Webhook signing |
| GOOGLE_API_KEY | 🟡 MEDIUM | Local + Vercel | Domain-restricted, API quota limits |
| OAuth Secrets | 🟡 MEDIUM | Local + Vercel | Rotate after app verification |
| SUPABASE_ANON_KEY | 🟢 LOW | Public by design | Row-level security enforced |
| ENCRYPTION_KEY | 🔴 CRITICAL | Local only (never pushed) | Vercel encryption at rest |

---

## ROTATION STRATEGY: "Human-In-Loop" Enforcement

### Phase 1: Stripe Keys (IMMEDIATE - Do This Today)

**Why:** Testmode keys can still be misused. Establish rotation practice NOW.

**Steps:**

1. **Go to Stripe Dashboard**
   - URL: https://dashboard.stripe.com/
   - Login: Your Stripe account
   - Navigate: Settings → Developers → API Keys

2. **Reveal and Copy Current Keys**
   - Note the current `sk_test_` key
   - Note the webhook signing secret

3. **Create New Keys**
   - Click "Roll key" or "Create restricted key"
   - New key is created (old key remains active for 30 days)

4. **Test with New Key in Local Environment**
   ```bash
   # In landing-page/.env.local or 3kpro-website/.env.local
   STRIPE_SECRET_KEY="sk_test_NEW_KEY_HERE"

   # Run local tests
   npm test -- stripe
   ```

5. **Update Vercel Secrets**
   - Vercel Dashboard → landing-page → Settings → Environment Variables
   - Edit `STRIPE_SECRET_KEY` with new value
   - Repeat for `STRIPE_WEBHOOK_SECRET`
   - Deploy: `vercel deploy --prod`

6. **Verify Production Works**
   - Test a stripe webhook or checkout flow
   - Check Vercel logs: `vercel logs getxelora.com`
   - Look for: `Stripe webhook successful` or similar

7. **Retire Old Key**
   - After 30 days or after confirming all tests pass
   - Stripe Dashboard → Settings → Developers → API Keys → Revoke

---

### Phase 2: Google API Key (1-2 weeks)

**Why:** Less critical than Stripe, but limited by domain restriction. Rotate for hygiene.

**Steps:**

1. Go to Google Cloud Console: https://console.cloud.google.com/
2. Project: `3K-Pro-Services`
3. Navigate: Credentials → API Keys
4. Find key: `Xelora V1`
5. Restriction: Verify it's restricted to domain(s) only:
   - `getxelora.com`
   - `xelorahq.com`
   - (NOT generic/unrestricted)
6. If unrestricted → Edit → Set domain restrictions → Save
7. Create new key with same restrictions
8. Test locally with new key, update Vercel, verify, retire old key

---

### Phase 3: OAuth Secrets (After LLC Registration)

**Why:** Meta/Facebook requires business verification first. Hold off until verified.

**Timeline:** After you complete LLC setup and Meta Business Verification

**Steps:**
1. Re-create OAuth keys in each provider's dashboard
2. Update all clients
3. Test the OAuth flow end-to-end
4. Retire old keys

---

## ENHANCED .gitignore: Both Repos

**Add to BOTH `landing-page/.gitignore` AND `3kpro-website/.gitignore`:**

```gitignore
# ============================================
# ENHANCED SECRETS & SENSITIVE DATA
# ============================================

# Environment Variables (ALL VARIANTS)
.env
.env.local
.env.*.local
.env.development
.env.production
.env.test
.env.staging
.env.vercel*
.env.vercel.*

# Secrets and Credentials
.stripeclitorc
stripe.json
*.pem
*.key
*.cert
*.secret
*_TOKEN
*_KEY
*_SECRET

# Stripe CLI
.stripe/
stripe-debug.log

# Cloud Credentials
.google-credentials.json
.gcloud-credentials.json
firebase-adminsdk-*.json
service-account-key.json

# SSH Keys
~/.ssh/
id_rsa
id_rsa.pub

# API Keys / Tokens (common naming)
*.apikey
*.token
.token
.apikey
config/secrets.json

# Logs that might contain secrets
*.log
*debug*.log
lerna-debug.log

# Credentials
~/.aws/credentials
~/.gcloud/
credentials/

# Node/NPM
node_modules/
npm-debug.log*
yarn-error.log*
.npm

# Build & Cache
.next/
.vercel/
dist/
build/
out/
*.tsbuildinfo

# IDE
.vscode/settings.json
.idea/workspace.xml
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db
```

---

## GITHUB ACTIONS / VERCEL SECRETS: "Human-In-Loop" Checks

### For Every Secret Rotation:

**CHECKLIST (Do This Every Time):**

- [ ] Local `.env` file updated with new secret
- [ ] Ran `npm test` or `vercel dev` locally to verify it works
- [ ] Checked that old secret doesn't appear in logs
- [ ] Vercel dashboard updated (Settings → Environment Variables)
- [ ] Verified new secret is set to correct environment (Production/Preview/Development)
- [ ] Ran `vercel deploy --prod` to trigger deployment
- [ ] Checked Vercel logs: `vercel logs getxelora.com | grep -i "stripe\|error\|secret"`
- [ ] Tested the feature that uses that secret (e.g., Stripe checkout)
- [ ] Waited 5-10 minutes and tested again to confirm stability
- [ ] Documented the rotation in this file (date, what was rotated, any issues)
- [ ] Only THEN retired/revoked the old secret

**Why This Matters:**

The "human-in-loop" checklist prevents accidents like:
- Updating only one environment (not Production)
- Forgetting to test after rotation
- Retiring old key before new one is confirmed working
- Deploying with wrong secrets

---

## STRIPE CLI BEST PRACTICES

### Installation & Setup

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login to your account
stripe login
```

### For Local Development (TESTMODE ONLY)

```bash
# Forward Stripe webhooks to your local dev server
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Run tests with Stripe CLI
stripe fixtures /path/to/fixtures.json
```

### Restrictions

✅ **ALWAYS:**
- Use testmode keys locally (`sk_test_*`)
- Never commit Stripe CLI config (`.stripeclitorc`)
- Verify webhook secrets match in code vs CLI

❌ **NEVER:**
- Use production keys locally (`sk_live_*`)
- Share `.stripeclitorc` file
- Commit webhook secrets to Git

---

## VERCEL SECRETS MANAGEMENT

### Best Practice: Environment-Specific Secrets

**In Vercel Dashboard:**

1. Settings → Environment Variables
2. Add each secret with correct environment:
   - **Production:** For `getxelora.com` live
   - **Preview:** For pull request previews
   - **Development:** For local dev (optional)

3. For Stripe specifically:
   - **Production:** `sk_live_*` keys (when ready)
   - **Preview:** `sk_test_*` keys (safe for testing)
   - **Development:** `sk_test_*` keys (safe for testing)

4. **CRITICAL:** Preview and Development should NEVER have `sk_live_` keys

---

## INCIDENT RESPONSE PLAN

**IF Secret is Accidentally Committed to Git:**

1. **Immediately rotate the secret** (don't wait)
2. Run `git filter-branch` to remove from history
   ```bash
   git filter-branch --tree-filter 'rm -f .env.vercel.production' -- --all
   git push origin --force --all
   ```
3. Notify anyone with access to the old repo
4. Create a new issue: "Security: Rotated secrets after accidental commit"

**IF Secret is Exposed in Vercel Logs:**

1. Check Vercel log retention: Settings → Logs
2. Set retention to minimum (7 days)
3. Rotate the secret
4. Update GitHub secret (if using GitHub Actions)

**IF Secret is Believed Compromised:**

1. Rotate immediately (within 5 minutes)
2. Check usage patterns in provider dashboard (Stripe, Google, etc.)
3. File a security report if signs of misuse
4. Add to breach notification log

---

## MONITORING & AUDITING

### Monthly Rotation Schedule

- **Stripe:** Rotate every 90 days (mark calendar)
- **Google API:** Rotate every 6 months
- **OAuth:** Rotate after app verification + every 12 months
- **Supabase:** Verify row-level security policies monthly

### Audit Log Template

```markdown
## Secrets Rotation Log

### [Date] — [Secret Name] Rotation
- Old: [redacted]
- New: [redacted]
- Status: [✅/❌]
- Notes: [any issues?]
```

---

## ACTUAL ROTATION LOG

### 2026-01-18 — Stripe Production Key Rotation (CRITICAL)
- **Old**: `sk_live_51SESLa...` (51 days old, potentially exposed)
- **New**: `sk_live_51SESLMRqaU7ff3Fz...` (rotated)
- **Environment**: Production (getxelora.com)
- **Status**: ✅ Rotated and deployed to Vercel
- **Verification**:
  - Vercel environment variables confirmed updated
  - Code reads from `process.env.STRIPE_SECRET_KEY` correctly
  - Old key still active (grace period: 30 days)
- **Notes**:
  - Fixed critical misconfiguration: All 3 environments were using LIVE keys
  - Dev/Preview environments corrected to use `sk_test_...` keys
  - User made initial errors (test key in prod, publishable vs secret key) - corrected successfully
  - Old key scheduled for deletion after 7-30 day grace period
- **Next Actions**:
  - Delete local `.env.vercel.production` file
  - Test checkout flow in production to confirm new key works
  - Mark old key for deletion in Stripe Dashboard (date: 2026-02-18 or later)

---

## CHECKLIST: Immediate Actions

- [ ] **Today:** Rotate Stripe keys (follow Phase 1 above)
- [ ] **This Week:** Add enhanced `.gitignore` to both repos
- [ ] **This Week:** Document all current secrets in your password manager
- [ ] **2 Weeks:** Rotate Google API key
- [ ] **Monthly:** Review this document and update audit log
- [ ] **After LLC:** Rotate OAuth secrets and re-verify Meta Business Verification

---

## REFERENCES

- Stripe Security: https://stripe.com/docs/security
- Google Cloud Security: https://cloud.google.com/security/best-practices
- GitHub Secrets Management: https://docs.github.com/en/actions/security-guides/encrypted-secrets
- OWASP Secrets Management: https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html

---

**Last Updated:** 2026-01-18 (Stripe Production Key Rotated)
**Next Review:** 2026-02-18
**Owner:** James Lawson / 3K-Pro-Services

**Rotation Status:**
- ✅ Stripe Production Key: Rotated 2026-01-18 (Next rotation: 2026-04-18)
- ⏳ Google API Key: Pending (Target: 2026-02-01)
- ⏳ OAuth Secrets: Pending (After LLC registration)
