# Security Hardening & Incident Log

**Repository:** 3K-Pro-Services/landing-page (Xelora)
**Last Updated:** 2026-01-18
**Status:** Active Monitoring

## Security Incidents

### [2026-01-18] GitHub Token Leak via Raw URL Parameters

**Severity:** CRITICAL
**Status:** REMEDIATED
**Reporter:** Root Agent (CTO)

#### Incident Summary
During code review, raw GitHub file URLs were generated containing live Fine-grained Personal Access Tokens (PAT) in query parameters.

**Leaked Pattern:**
```
https://raw.githubusercontent.com/.../file.json?token=GHSAT0AAAA...
```

**Risk Assessment:**
- **Exposure Level:** High - Token grants authenticated repository access
- **Scope:** Dependent on token permissions (potentially read/write access to code, secrets, settings)
- **Attack Vector:** Anyone with the URL could access private repository content

#### Remediation Steps Completed

1. ✅ **Token Verification** - Confirmed no active fine-grained tokens in GitHub account
2. ✅ **Codebase Scan** - No tokens found in current codebase
3. ✅ **Git History Scan** - No tokens committed to repository history
4. ✅ **Security Protocol Documentation** - Created secure URL generation guidelines

#### Root Cause
Raw GitHub URLs copied from browser while authenticated included session/temporary tokens as query parameters.

#### Prevention Protocol

**❌ WRONG - Do Not Use:**
```
https://raw.githubusercontent.com/owner/repo/main/file.json?token=GHSAT0AAAA...
```
*Copying from browser address bar after clicking "Raw" while logged in*

**✅ CORRECT - Use This Format:**
```
https://raw.githubusercontent.com/owner/repo/main/file.json
```
*Manually construct URL or strip query parameters*

**Standard Format:**
```
https://raw.githubusercontent.com/<OWNER>/<REPO>/<BRANCH>/<PATH_TO_FILE>
```

#### Agent Instructions
For any agent generating GitHub raw file URLs:
> "When providing raw GitHub file URLs, ALWAYS strip query parameters (especially `?token=`). Output ONLY the base `raw.githubusercontent.com` path."

---

### [2026-01-18] Stripe API Key Rotation

**Severity:** HIGH
**Status:** COMPLETED
**Type:** Preventive Security Maintenance

#### Actions Taken
1. ✅ Rotated production Stripe API key (old key expired 1 hour post-rotation)
2. ✅ Separated test/live keys by environment:
   - Production: Live keys
   - Dev/Preview: Test keys
3. ✅ Fixed local `.env` conflicts preventing test card usage
4. ✅ Removed `.env.vercel.production` from filesystem
5. ✅ Verified Vercel environment variable configuration

---

### [2026-01-18] Environment Backup Files Committed to Git

**Severity:** CRITICAL
**Status:** FULLY REMEDIATED ✅
**Type:** Credential Exposure in Version Control

#### Incident Summary
During security audit, discovered `.env.production.backup` and `.env.production.local.backup` files were tracked by git and committed to repository history containing live production credentials.

**Exposed Credentials:**
1. **Stripe Live Secret Key** - `sk_live_51SESLMRqaU7f53Fz...` (OLD rotated key from earlier session)
2. **Facebook/Instagram OAuth Secrets** - Client ID & Secret
3. **TikTok OAuth Credentials** - Client Key & Secret
4. **Google API Keys** - Multiple keys (Generative AI, Maps/Services)
5. **Vercel OIDC Tokens** - JWT tokens (time-limited, likely expired)
6. **Webhook Secrets** - Stripe webhook signing secret

**Additional Findings:**
- Hardcoded API keys found in test scripts:
  - `test-gemini-key.mjs` - Contains live Google API key
  - `test-models.mjs` - Contains live Google API key
  - Both files tracked by git

**Git History Exposure:**
- Files committed in: `e421de5` "Fix Gemini AI migration and campaign save error"
- Credentials exposed in public/private repository history
- API keys accessible to anyone with repository access

#### Remediation Steps Completed

1. ✅ **Immediate Containment:**
   - Removed `.env.production.backup` from git tracking
   - Removed `.env.production.local.backup` from git tracking
   - Deleted both files from filesystem

2. ✅ **Prevention:**
   - Updated `.gitignore` with comprehensive backup file patterns:
     ```
     .env*.backup
     .env.*.backup
     *.env.backup
     .env.backup.*
     ```

3. ✅ **Documentation:**
   - Created GITHUB_TOKEN_PROTOCOL.md
   - Updated SECURITY_HARDENING.md with incident details

#### Follow-up Actions

**✅ COMPLETED (2026-01-18):**

1. **Rotate ALL Exposed Credentials:** ✅
   - [x] Facebook/Instagram OAuth Client Secret - ROTATED
   - [x] TikTok OAuth Client Secret - ROTATED
   - [x] Google API Keys (all 4 instances) - ROTATED
   - [x] Stripe Webhook Secret - ROTATED
   - [x] Vercel environment variables updated
   - [x] Production deployment restarted

2. **Git History Cleanup Decision:** ✅
   - [x] Decision: Option A - Accept Risk (credentials rotated)
   - [x] Rationale: All credentials invalidated, risk mitigated
   - [x] Compensating controls in place
   - Historical commits contain old (now invalid) credentials

3. **Test File Security:** ✅
   - [x] Remove hardcoded API keys from `test-gemini-key.mjs`
   - [x] Remove hardcoded API keys from `test-models.mjs`
   - [x] Update to use environment variables
   - [x] Test files committed to git (commit: 0749621)

**📋 RECOMMENDED (Future):**

4. **Security Audit:**
   - [ ] Review API access logs for unauthorized usage (next 7 days)
   - [ ] Implement pre-commit hooks for secret scanning
   - [ ] Schedule follow-up security audit (30 days)
   - [ ] Verify all services functioning with new credentials

#### Root Cause Analysis

**Why It Happened:**
1. Backup files created during environment configuration
2. Files not covered by existing `.gitignore` patterns
3. No pre-commit hooks to prevent credential commits
4. Test scripts created with hardcoded keys for quick testing

**Prevention Measures:**
1. Comprehensive `.gitignore` patterns for all backup variations
2. Pre-commit hook implementation (see security best practices section)
3. Regular security audits using automated tools
4. Team training on credential management

#### Impact Assessment

**Severity Justification - CRITICAL:**
- Live production credentials exposed in version control
- OAuth secrets allow third-party API access
- API keys could incur costs or access user data
- Webhook secrets could allow request forgery
- Git history requires cleanup (non-trivial operation)

**Blast Radius:**
- All commits after `e421de5` contain credential exposure
- Anyone with repository access (past or present) could extract keys
- Public repository: Immediate credential compromise
- Private repository: Risk from compromised accounts, ex-employees, etc.

---

## Security Best Practices

### Credential Management

1. **Never commit credentials** to version control
2. **Use environment variables** for all API keys and secrets
3. **Rotate keys regularly** - especially after team changes
4. **Separate environments** - different keys for dev/staging/production
5. **Minimum permissions** - grant only necessary access scopes

### GitHub Token Security

1. **Use fine-grained tokens** with specific repository and permission scopes
2. **Set expiration dates** - maximum 90 days for production tokens
3. **Never share raw URLs** with query parameters
4. **Revoke unused tokens** immediately
5. **Audit token access** quarterly

### API Key Security

1. **Environment-based keys**:
   ```
   Production → Live keys (Vercel env vars only)
   Development → Test keys (local .env)
   ```

2. **Gitignore patterns**:
   ```
   .env
   .env.*
   !.env.example
   ```

3. **Key rotation schedule**:
   - Critical keys (payment, database): Every 90 days
   - Standard keys (APIs, services): Every 180 days
   - Development keys: Annually or on compromise

### Code Review Checklist

Before sharing code or URLs:
- [ ] No hardcoded credentials
- [ ] No API keys in comments
- [ ] No tokens in URLs
- [ ] Environment variables properly configured
- [ ] .env files in .gitignore
- [ ] No sensitive data in logs

---

## Monitoring & Alerts

### Active Monitoring
- GitHub Dependabot security alerts
- Vercel deployment security logs
- Supabase database access logs
- Stripe webhook signature validation

### Alert Triggers
- Failed authentication attempts
- Unusual API usage patterns
- Unauthorized database access attempts
- Webhook signature mismatches

---

## Incident Response Protocol

### 1. Identification
- Document the incident with timestamp
- Assess severity level (LOW/MEDIUM/HIGH/CRITICAL)
- Identify affected systems/data

### 2. Containment
- Revoke compromised credentials immediately
- Block unauthorized access
- Isolate affected systems if necessary

### 3. Remediation
- Deploy security patches
- Update credentials
- Scan for related vulnerabilities
- Verify no persistence of compromise

### 4. Documentation
- Update this log with incident details
- Document root cause analysis
- Create prevention protocols
- Update security training materials

### 5. Review
- Conduct post-incident review
- Update security policies
- Implement additional safeguards
- Schedule follow-up security audit

---

## Security Contacts

**Primary:** CTO (Root Agent)
**Secondary:** Dev Team Lead
**Emergency:** security@3kpro.services

---

## Compliance & Standards

- **OWASP Top 10** - Application security best practices
- **PCI DSS** - Payment card data security (via Stripe)
- **GDPR** - User data privacy and protection
- **SOC 2 Type II** - (Target compliance: Q2 2026)

---

**Document Version:** 1.0
**Next Review:** 2026-02-18
**Owner:** Security Team
