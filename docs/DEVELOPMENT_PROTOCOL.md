# Development, Testing & Deployment Protocol

## Purpose

This document establishes a rigorous pipeline for developing, testing, and deploying features to ensure quality and prevent production issues.

**Philosophy**: Research → Test → Implement → Verify

---

## 1. Pre-Development Research Phase

### 1.1 Platform API Research
Before implementing any platform integration:

- [ ] Read official API documentation thoroughly
- [ ] Identify authentication requirements (OAuth scopes, API keys)
- [ ] Document rate limits and quotas
- [ ] Review API examples and sandbox environments
- [ ] Check for API versioning and deprecation notices
- [ ] Document file size/format requirements
- [ ] Identify platform-specific edge cases

### 1.2 Architecture Planning
- [ ] Document data flow (frontend → API → platform)
- [ ] Identify database schema requirements
- [ ] Plan error handling and retry logic
- [ ] Design user experience flow
- [ ] Identify dependencies and external services

---

## 2. Local Development Phase

### 2.1 Environment Setup
**Before writing code:**

```bash
# 1. Verify all required environment variables are set
npm run check-env  # (to be created)

# 2. Verify database schema is current
npx supabase db diff

# 3. Start local development server
npm run dev
```

### 2.2 Code Quality Standards
- [ ] Use TypeScript strict mode
- [ ] Add JSDoc comments for complex functions
- [ ] Implement proper error handling with try/catch
- [ ] Log errors with context for debugging
- [ ] Validate user input before processing
- [ ] **Trim all environment variables** before use
- [ ] Add null/undefined checks for external data

### 2.3 Security Checklist
- [ ] Never expose API keys in frontend code
- [ ] Encrypt sensitive data before storing in database
- [ ] Use HTTPS for all external API calls
- [ ] Implement CSRF protection (OAuth state parameter)
- [ ] Validate redirect URIs match whitelist
- [ ] Sanitize user input to prevent XSS/SQL injection

---

## 3. Local Testing Phase

### 3.1 Unit Testing
**For each new function/module:**

```bash
# Run unit tests
npm run test:unit

# Check test coverage
npm run test:coverage
```

**Required Coverage**: Minimum 70% for new code

### 3.2 Integration Testing (Local)
**Before committing code:**

#### Database Operations
- [ ] Test CREATE operations (insert new records)
- [ ] Test READ operations (query with filters)
- [ ] Test UPDATE operations (modify existing records)
- [ ] Test DELETE operations (soft delete where applicable)
- [ ] Verify RLS policies work correctly
- [ ] Test with multiple user accounts

#### API Endpoint Testing
- [ ] Test happy path (valid input, successful response)
- [ ] Test error cases (missing params, invalid data)
- [ ] Test authentication/authorization failures
- [ ] Test rate limiting behavior
- [ ] Test timeout handling
- [ ] Verify response format matches TypeScript types

#### OAuth Flow Testing (Local)
**For each platform integration:**

1. **Environment Variable Validation**
```bash
# Create test script: scripts/test-oauth-config.ts
NEXT_PUBLIC_APP_URL=http://localhost:3000 npx tsx scripts/test-oauth-config.ts

# Should verify:
# - CLIENT_ID exists and has no whitespace
# - CLIENT_SECRET exists and has no whitespace
# - REDIRECT_URI is properly formatted
# - All required scopes are defined
```

2. **OAuth Start Flow**
- [ ] Click "Connect" button in UI
- [ ] Verify redirect to platform OAuth page
- [ ] Check URL parameters (client_id, redirect_uri, state, scope)
- [ ] Verify no %0D%0A (newlines) in URL
- [ ] Verify state cookie is set

3. **OAuth Callback Flow**
- [ ] Complete authorization on platform
- [ ] Verify callback receives code parameter
- [ ] Check state parameter matches cookie
- [ ] Verify token exchange succeeds
- [ ] Confirm encrypted token saved to database
- [ ] Test connection shows in UI

4. **Post-Connection Testing**
- [ ] Verify connection appears in user's connection list
- [ ] Test "Test Connection" functionality
- [ ] Verify usage count increments
- [ ] Test connection deletion

### 3.3 Manual UI Testing (Local)
**Test user experience flow:**

- [ ] Navigate to Social Connections page
- [ ] Click "Add Connection" button
- [ ] Select each platform from modal
- [ ] Complete OAuth flow for each platform
- [ ] Verify success message displays
- [ ] Check connection appears in list with correct data
- [ ] Test editing connection name
- [ ] Test deleting connection
- [ ] Verify error messages display correctly
- [ ] Test responsive design (mobile/tablet/desktop)

---

## 4. Pre-Deployment Validation

### 4.1 Code Review Checklist
**Before committing:**

- [ ] Run TypeScript compiler: `npx tsc --noEmit`
- [ ] Run ESLint: `npx eslint . --ext .ts,.tsx`
- [ ] Run Prettier: `npx prettier --check .`
- [ ] Remove console.logs (except error logging)
- [ ] Update relevant documentation
- [ ] Add migration notes if database changed

### 4.2 Build Verification
```bash
# Test production build locally
npm run build

# Check for build errors
# Verify no type errors
# Verify no missing dependencies
```

### 4.3 Environment Variables Audit
**Create `scripts/verify-env-vars.ts`:**

```typescript
// Verify all required env vars are set in Vercel
// Check for whitespace issues
// Validate URL formats
// Confirm secrets are encrypted
```

```bash
# Run before deployment
npx tsx scripts/verify-env-vars.ts production
```

---

## 5. Database Migration Protocol

### 5.1 Migration Creation
**Always create migrations for schema changes:**

```bash
# Create migration file
npx supabase migration new descriptive_name

# Write idempotent SQL using:
# - CREATE TABLE IF NOT EXISTS
# - CREATE INDEX IF NOT EXISTS
# - DO $$ ... END $$ for conditional logic
```

### 5.2 Migration Testing (Local)
```bash
# Test migration on local Supabase
npx supabase db reset  # Fresh start
npx supabase db push   # Apply all migrations

# Verify schema matches expected state
npx supabase db diff
```

### 5.3 Production Migration Deployment
**Two-step process:**

**Step 1: Manual SQL Execution (Supabase Dashboard)**
1. Go to https://supabase.com/dashboard/project/hvcmidkylzrhmrwyigqr/sql/new
2. Copy migration SQL from `supabase/migrations/XXXXXX_name.sql`
3. Paste into SQL Editor
4. Click **RUN**
5. Verify success message
6. Check affected tables in Table Editor

**Step 2: Verify Migration Applied**
```bash
# Query migration tracking table
# Confirm new migration appears in supabase_migrations.schema_migrations
```

**⚠️ Known Issue**: `npx supabase db push --linked` is unreliable. Always use manual SQL execution for production migrations.

---

## 6. Deployment Process

### 6.1 Git Workflow
```bash
# 1. Verify all tests pass locally
npm run test

# 2. Check git status
git status

# 3. Stage changes
git add .

# 4. Commit with descriptive message
git commit -m "feat: Add LinkedIn OAuth integration

- Implement OAuth start/callback routes
- Add LinkedIn publisher with URN support
- Create capability config for LinkedIn API
- Add environment variable validation
- Test OAuth flow end-to-end locally

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"

# 5. Push to GitHub
git push origin main
```

### 6.2 Vercel Deployment
```bash
# Deploy to production
vercel --prod

# Inspect deployment
vercel inspect <deployment-url>

# Verify aliases are correct
# Should show: trendpulse.3kpro.services, ccai.3kpro.services
```

### 6.3 Environment Variables Check (Vercel)
**Before first deployment of OAuth feature:**

1. Go to https://vercel.com/3kpros-projects/landing-page/settings/environment-variables
2. For each platform, verify:
   - `PLATFORM_CLIENT_ID` exists
   - `PLATFORM_CLIENT_SECRET` exists
   - No whitespace/newlines in values
   - Values match platform developer console
3. Redeploy if environment variables changed

---

## 7. Post-Deployment Verification

### 7.1 Smoke Tests (Production)
**Immediately after deployment:**

#### Health Check
```bash
# Test API health endpoint
curl https://trendpulse.3kpro.services/api/health
# Expected: {"status": "ok"}
```

#### Database Connectivity
```bash
# Test database read operation
curl https://trendpulse.3kpro.services/api/social-connections/providers
# Expected: JSON array of 6 platforms
```

#### Static Assets
- [ ] Visit https://trendpulse.3kpro.services
- [ ] Check browser console for 404 errors
- [ ] Verify all images load
- [ ] Check JSON capability files load: `/libs/capabilities/social/instagram.json`

### 7.2 End-to-End OAuth Testing (Production)
**For each platform:**

#### Test 1: Environment Variable Validation
1. Open browser DevTools → Network tab
2. Navigate to Social Connections page
3. Click "Add Connection"
4. Select platform (e.g., Instagram)
5. Click "Connect with Instagram"
6. **Inspect redirect URL in Network tab:**
   - Verify `client_id` parameter exists
   - Verify `client_id` has no `%0D%0A` (newlines)
   - Verify `redirect_uri` is correctly formatted
   - Verify `scope` parameter matches expected scopes
   - Verify `state` parameter exists (CSRF protection)

#### Test 2: Complete OAuth Flow
1. Complete authorization on platform
2. Verify successful redirect back to app
3. Check browser console for errors
4. Verify success message displays
5. Verify connection appears in connection list
6. Check Supabase Table Editor:
   - `user_social_connections` has new row
   - `access_token_encrypted` is populated
   - `test_status` is "pending"

#### Test 3: Connection Test
1. Click "Test Connection" button
2. Verify test succeeds
3. Check `test_status` changes to "success"
4. Verify `last_tested_at` is updated

#### Test 4: Error Handling
1. Delete connection
2. Try to test deleted connection
3. Verify error message displays
4. Try OAuth flow with invalid state cookie
5. Verify CSRF protection works

### 7.3 Performance Checks
```bash
# Check build size
vercel inspect <deployment-url> --logs

# Verify no excessive bundle size
# Check for unused dependencies
```

### 7.4 Monitoring Setup
- [ ] Check Vercel logs for errors: https://vercel.com/3kpros-projects/landing-page/logs
- [ ] Check Supabase logs: https://supabase.com/dashboard/project/hvcmidkylzrhmrwyigqr/logs/explorer
- [ ] Set up error alerts (if not already configured)

---

## 8. Rollback Procedure

**If critical issues are found after deployment:**

### Option 1: Quick Rollback
```bash
# Revert to previous deployment
vercel ls  # Find previous stable deployment URL
vercel alias set <previous-deployment-url> trendpulse.3kpro.services
vercel alias set <previous-deployment-url> ccai.3kpro.services
```

### Option 2: Git Revert
```bash
# Revert last commit
git revert HEAD
git push origin main

# Redeploy
vercel --prod
```

### Option 3: Database Rollback
```sql
-- If migration caused issues, manually run:
DROP TABLE IF EXISTS problematic_table;
-- Restore previous schema state
```

---

## 9. Issue Response Protocol

### When a Bug is Reported:

1. **Immediate Response**
   - Acknowledge the issue
   - Assess severity (critical/high/medium/low)
   - If critical, initiate rollback procedure

2. **Root Cause Analysis**
   - Reproduce issue locally
   - Check logs (Vercel + Supabase)
   - Identify which phase of protocol failed
   - Document findings

3. **Fix Development**
   - Create fix following full protocol
   - Add regression test to prevent recurrence
   - Test fix locally with same scenario that caused bug
   - Add fix verification to protocol if needed

4. **Fix Deployment**
   - Follow deployment process (section 6)
   - Verify fix in production (section 7)
   - Notify user of resolution

---

## 10. Common Pitfalls & Solutions

### Issue: Environment Variables with Whitespace
**Symptoms**: OAuth fails with "Invalid App ID"

**Prevention**:
- Always `.trim()` environment variables in code
- Validate environment variables before use
- Use script to verify environment variables

**Example**:
```typescript
const clientId = (process.env.PLATFORM_CLIENT_ID || "").trim()
if (!clientId) {
  throw new Error("PLATFORM_CLIENT_ID not configured")
}
```

### Issue: Database Migration Not Applied
**Symptoms**: API returns "table does not exist"

**Prevention**:
- Never trust `npx supabase db push --linked` for production
- Always manually execute SQL in Supabase Dashboard
- Verify tables exist in Table Editor after migration

### Issue: Capability JSON Files Not Deployed
**Symptoms**: 404 on `/libs/capabilities/social/platform.json`

**Prevention**:
- Ensure files are committed to git
- Verify files are in correct directory structure
- Check Vercel build logs for file inclusion
- Test file URLs in production after deployment

### Issue: RLS Policies Block Legitimate Access
**Symptoms**: User can't access their own data

**Prevention**:
- Test RLS policies with multiple user accounts
- Verify `auth.uid()` matches expected user_id
- Check policy conditions carefully
- Use `SECURITY DEFINER` functions when needed

---

## 11. Platform-Specific Testing Checklist

### Instagram (Facebook API)
- [ ] Verify user has Business or Creator account
- [ ] Test with both photo and video posts
- [ ] Verify caption with hashtags works
- [ ] Test location tagging
- [ ] Verify container status polling works
- [ ] Test error handling for non-business accounts

### TikTok
- [ ] Verify 3-step upload process (init → upload → publish)
- [ ] Test video file size validation (max 4GB)
- [ ] Test video duration limits (3s - 10min)
- [ ] Verify publish status polling (max 30s)
- [ ] Test privacy settings (public/private/friends)
- [ ] Test error handling for unsupported formats

### YouTube
- [ ] Test resumable upload for large files
- [ ] Verify Shorts detection (vertical <60s)
- [ ] Test both public and unlisted privacy
- [ ] Verify thumbnail upload
- [ ] Test with playlists
- [ ] Check monetization settings

### Facebook
- [ ] Verify page access token exchange
- [ ] Test with multiple pages
- [ ] Test text, photo, video, and link posts
- [ ] Verify scheduled post functionality
- [ ] Test audience targeting options

### LinkedIn
- [ ] Verify URN-based user identification
- [ ] Test text-only posts
- [ ] Test image upload process
- [ ] Verify link preview generation
- [ ] Test posting to company pages

### Twitter/X
- [ ] Test media upload (v1.1 API)
- [ ] Test tweet creation (v2 API)
- [ ] Verify thread posting (up to 25 tweets)
- [ ] Test poll creation
- [ ] Verify character limit enforcement (280)
- [ ] Test media attachment limits (4 images/1 video)

---

## 12. Continuous Improvement

### After Each Feature Launch:

1. **Retrospective**
   - What went well?
   - What could be improved?
   - Were all protocol steps followed?
   - Were any steps insufficient?

2. **Protocol Updates**
   - Add new test cases discovered
   - Update checklists based on learnings
   - Document new platform quirks
   - Refine error handling patterns

3. **Automation Opportunities**
   - Identify repetitive manual tests
   - Create scripts to automate checks
   - Build CI/CD pipeline
   - Set up automated regression tests

---

## 13. Quick Reference: Pre-Deployment Checklist

Copy this checklist for each feature deployment:

```markdown
## Pre-Deployment Checklist

### Code Quality
- [ ] TypeScript: No compilation errors (`npx tsc --noEmit`)
- [ ] ESLint: No linting errors (`npx eslint .`)
- [ ] Prettier: Code formatted (`npx prettier --check .`)
- [ ] Build: Production build succeeds (`npm run build`)

### Testing
- [ ] Unit tests pass (`npm run test:unit`)
- [ ] Integration tests pass (manual verification)
- [ ] OAuth flow tested locally (all platforms)
- [ ] Error handling tested
- [ ] Mobile responsive tested

### Database
- [ ] Migration created for schema changes
- [ ] Migration tested locally (`npx supabase db reset`)
- [ ] Migration SQL ready for manual execution

### Environment Variables
- [ ] All required env vars documented
- [ ] Env vars verified in Vercel dashboard
- [ ] No whitespace/newlines in values
- [ ] `.trim()` added to all env var reads in code

### Documentation
- [ ] README updated (if needed)
- [ ] API documentation updated
- [ ] User-facing help text updated
- [ ] Migration notes added

### Git
- [ ] Descriptive commit message
- [ ] All changes staged
- [ ] Pushed to main branch

### Deployment
- [ ] Deployed to production (`vercel --prod`)
- [ ] Deployment URL verified
- [ ] Aliases confirmed (trendpulse.3kpro.services)

### Post-Deployment
- [ ] Health check passes
- [ ] Database connectivity verified
- [ ] OAuth flow tested in production (1 platform minimum)
- [ ] No console errors in browser
- [ ] No 404s in Network tab
- [ ] Vercel logs checked for errors
```

---

## 14. Escalation Path

**If protocol is unclear or insufficient:**

1. Stop development
2. Document the gap in protocol
3. Research best practice
4. Propose protocol update
5. Get approval before proceeding

**If production issue is critical:**

1. Initiate rollback immediately (section 8)
2. Notify stakeholders
3. Follow issue response protocol (section 9)
4. Schedule post-mortem

---

**Version**: 1.0
**Last Updated**: 2025-11-19
**Owner**: Development Team
**Review Frequency**: Monthly or after major incidents
