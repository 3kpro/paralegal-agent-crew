# KNOWN BUGS & ISSUES

**Last Updated:** 2025-10-20
**Project:** Content Cascade AI (CCAI) - TrendPulse Beta
**Current Focus:** Perfecting TrendPulse for beta launch

---

## 🚨 CRITICAL BUGS (Blocking Beta Launch)

> Critical issues that must be fixed before beta launch

**Status Legend:**
- 🔴 **OPEN** - Not started
- 🟡 **IN PROGRESS** - Currently being worked on
- 🟢 **FIXED** - Resolved and verified
- ⏸️ **DEFERRED** - Not blocking, scheduled for later

---

### No critical bugs currently identified

---

## ⚠️ HIGH PRIORITY (Should Fix Before Launch)

> Important issues that impact user experience but not blocking

---

### No high priority bugs currently identified

---

## 📋 MEDIUM PRIORITY (Post-Launch)

> Issues that can be addressed after initial beta launch

---

### No medium priority bugs currently identified

---

## 🐛 LOW PRIORITY (Future Enhancement)

> Minor issues or improvements for future iterations

---

### No low priority bugs currently identified

---

## ✅ RECENTLY FIXED

> Bugs that have been resolved (kept for reference)

---

### BUG-T001: Incorrect Error Status Codes in Content Generation
**Status:** 🟢 FIXED (Oct 24, 2025)
**Fixed By:** GitHub Copilot

**Description:**
During test framework migration from Vitest to Jest, identified inconsistencies in error status code handling in the content generation API route.

**Issues Found:**
1. Unauthorized requests returned mixed status codes
2. Invalid requests had inconsistent error messaging
3. Missing AI tools configuration needed clearer error handling

**Resolution:**
Test migration helped identify and fix error handling:
- Unauthorized requests now consistently return 401
- Invalid requests return 400 with clear error message
- Missing AI tools return 400 with `requiresSetup: true`

**Verification:**
✅ Test suite converted from Vitest to Jest
✅ All 5 test cases passing:
  - Content generation and caching
  - Invalid request handling
  - Unauthorized access
  - Missing AI tools
  - Generation errors
✅ Consistent error status codes
✅ Clear error messages

**Files Modified:**
- [__tests__/api/generate/route.test.ts](__tests__/api/generate/route.test.ts) - Full test suite update
- [app/api/generate/route.ts](app/api/generate/route.ts) - Error handling improvements

---

### INC002: Campaign Save Failed - Schema Mismatch (metadata column)
**Status:** 🟢 FIXED (Oct 20, 2025)
**Fixed By:** Sonnet

**Description:**
Campaign save fails with error: "Could not find the 'metadata' column of 'campaign_content' in the schema cache"

**Root Cause:**
Code tried to insert non-existent columns:
- `metadata` - doesn't exist in schema (line 159)
- `user_id` - not part of campaign_content table (line 156)
- Wrong variable name `selectedProvider` instead of `aiProvider`

**Resolution:**
Mapped content fields to actual schema columns:
```typescript
// BEFORE (lines 154-160):
const contentRecords = Object.entries(generatedContent).map(([platform, content]: [string, any]) => ({
  campaign_id: campaign.id,
  user_id: user.id,  // ❌ Column doesn't exist
  platform,
  body: content.content || content.subject,
  metadata: content  // ❌ Column doesn't exist
}))

// AFTER:
const contentRecords = Object.entries(generatedContent).map(([platform, content]: [string, any]) => ({
  campaign_id: campaign.id,
  platform,
  body: content.content || content.subject || content.body || '',
  title: content.subject || content.title || null,
  hashtags: content.hashtags || null,
  generated_by: aiProvider || null  // ✅ Correct variable name
}))
```

**Verification:**
✅ Campaign saves successfully
✅ Content properly stored in correct columns
✅ All schema fields match database

**Files Modified:**
- [app/(portal)/campaigns/new/page.tsx:154-161](app/(portal)/campaigns/new/page.tsx#L154-L161)

---

### BUG-M001: Gemini API Key Test Returns 404
**Status:** 🟢 FIXED (Oct 20, 2025)
**Fixed By:** Sonnet

**Description:**
When user saves Gemini API key, the save operation succeeds (200 response) but immediate test connection returns 404. This was a timing/caching issue where the newly saved key wasn't immediately available for testing.

**Root Cause:**
Database commit timing - the 500ms delay wasn't sufficient for database to complete commit before test ran.

**Resolution:**
Increased auto-test delay from 500ms to 1500ms in settings page:
```typescript
// BEFORE (line 378):
if (data.requiresTest) {
  setTimeout(() => testConnection(provider), 500)
}

// AFTER:
if (data.requiresTest) {
  setTimeout(() => testConnection(provider), 1500)  // Increased delay
}
```

**Verification:**
✅ API key save succeeds
✅ Auto-test now completes successfully
✅ No more 404 errors on fresh saves

**Files Modified:**
- [app/(portal)/settings/page.tsx:378](app/(portal)/settings/page.tsx#L378)

---

### BUG-H001: Confusing UX - "Next: Review & Save" Requires Content Generation
**Status:** 🟢 FIXED (Oct 20, 2025)
**Fixed By:** Sonnet

**Description:**
Users expect "Next: Review & Save" button to be clickable after selecting trend and AI provider. However, button requires clicking "Generate Content" button first, which wasn't obvious.

**Root Cause:**
Button intentionally disabled until content is generated, but no visual feedback explaining why.

**Resolution:**
Added helper text and tooltip to guide users:
```typescript
// Added conditional helper text (lines 476-479):
{!generatedContent && (
  <p className="text-sm text-tron-text-muted">
    ⬆️ Generate content first to continue
  </p>
)}

// Added tooltip to button (line 485):
title={!generatedContent ? "Generate content first" : "Proceed to review"}
```

**Verification:**
✅ Helper text appears when button is disabled
✅ Helper text disappears after content generation
✅ Tooltip provides additional guidance on hover
✅ Clear visual feedback for workflow step

**Files Modified:**
- [app/(portal)/campaigns/new/page.tsx:475-489](app/(portal)/campaigns/new/page.tsx#L475-L489)

---

### BUG-H003: Campaign Detail Page Missing (404 Error)
**Status:** 🟢 FIXED (Oct 20, 2025)
**Fixed By:** Sonnet

**Description:**
Campaign detail page route (`/campaigns/[id]`) did not exist, causing 404 errors when viewing saved campaigns.

**Resolution:**
Created complete campaign detail page with content display, platform info, and metadata.

**Files Created:**
- [app/(portal)/campaigns/[id]/page.tsx](app/(portal)/campaigns/[id]/page.tsx)

---

### BUG-H002: Google Gemini API Key Not Persisting After Save
**Status:** 🟢 FIXED (Oct 20, 2025)
**Fixed By:** Sonnet

**Description:**
Google Gemini API key did not persist after being entered and saved. Field was empty when returning to Settings page.

**Root Cause:**
Save function used new AI Tools API (`/api/ai-tools/configure`), but load function queried old deprecated `api_keys` table.

**Resolution:**
Updated load function (lines 179-206) to use `/api/ai-tools/list` endpoint matching save functionality.

**Security Enhancement:**
Keys now display as `••••••••••••••••` placeholder (actual keys never sent to frontend).

**Files Modified:**
- [app/(portal)/settings/page.tsx:179-206](app/(portal)/settings/page.tsx#L179-L206)

---

### INC001: Campaign Save Failed - Schema Mismatch
**Status:** 🟢 FIXED (Oct 20, 2025)
**Fixed By:** Sonnet (ZenCoder fix was not applied)

**Description:**
Unable to save campaign drafts. Error: "Failed to save campaign: Could not find the 'content_text' column of 'campaign_content' in the schema cache"

**Root Cause:**
Schema mismatch between database and application code:
- Database schema defines column as `body` (supabase/migrations/001_initial_schema.sql:90)
- Application code tried to insert `content_text` (app/(portal)/campaigns/new/page.tsx:158)

**Resolution:**
One-line fix - changed field name from `content_text` to `body` in campaign save function:
```typescript
// BEFORE (line 158):
content_text: content.content || content.subject,

// AFTER:
body: content.content || content.subject,
```

**Note:** ZenCoder reported fixing this but the change was not actually applied. Fixed by Sonnet during user testing.

**Verification:**
✅ Schema now matches between database and application
✅ No other occurrences of `content_text` found in codebase
✅ Campaign save functionality working

**Files Modified:**
- [app/(portal)/campaigns/new/page.tsx:158](app/(portal)/campaigns/new/page.tsx#L158)

**Task Reference:** TASK_QUEUE.md - TASK 5

---

### BUG-F001: Tron Colors Not Showing on Localhost
**Status:** 🟢 FIXED (Oct 20, 2025)
**Fixed By:** Sonnet

**Description:**
Tron theme colors defined in tailwind.config.js but not displaying on localhost:3000. Site showed old light theme despite color classes being updated.

**Root Cause:**
Multiple TypeScript build errors preventing Next.js compilation. Build was failing silently, preventing hot reload.

**Resolution:**
Fixed 6 Framer Motion type errors across components:
- Added explicit tuple types for ease arrays
- Added Suspense boundary for useSearchParams()
- Excluded external MCP directory from build

**Verification:**
✅ Build succeeds with 37 pages
✅ Tron theme visible on all pages
✅ Dev server running successfully

**Files Modified:**
- components/ContactForm.tsx
- components/LoadingButton.tsx
- components/Navigation.tsx
- components/ui/Button.tsx
- app/reset-password/page.tsx
- tsconfig.json

---

### BUG-F002: Button Color Contrast Issues
**Status:** 🟢 FIXED (Oct 20, 2025)
**Fixed By:** Sonnet

**Description:**
Bright cyan buttons (`bg-tron-cyan` #00ffff) causing eye strain. User reported colors "giving seizures."

**Resolution:**
Changed from solid bright cyan to bordered style:
```typescript
// BEFORE
className="bg-tron-cyan hover:bg-tron-cyan/80 text-white"

// AFTER
className="bg-tron-grid border-2 border-tron-cyan text-tron-cyan hover:bg-tron-cyan hover:text-tron-dark"
```

**Verification:**
✅ Applied to all buttons across 10+ files
✅ Much better readability and comfort
✅ Maintains Tron aesthetic

---

### BUG-F003: Form Inputs Invisible (White Text on White Background)
**Status:** 🟢 FIXED (Oct 20, 2025)
**Fixed By:** Sonnet

**Description:**
Input text invisible in campaign creation and settings forms due to missing background/text colors.

**Resolution:**
Added explicit colors to all form inputs:
```typescript
className="w-full px-4 py-3 bg-tron-dark border border-tron-grid rounded-lg focus:ring-2 focus:ring-tron-cyan focus:border-transparent text-tron-text"
```

**Verification:**
✅ All inputs now have proper visibility
✅ Applied to campaign creation, settings, onboarding

---

### BUG-F004: React Uncontrolled Input Warning
**Status:** 🟢 FIXED (Oct 20, 2025)
**Fixed By:** Sonnet

**Description:**
Console error: "A component is changing an uncontrolled input to be controlled" for API key inputs.

**Root Cause:**
apiKeys state initialized with empty strings, but database load could set undefined values.

**Resolution:**
Always initialize all provider keys in keysMap:
```typescript
const keysMap: any = {
  openai: '',
  anthropic: '',
  google: '',
  xai: '',
  elevenlabs: ''
}
keys.forEach((key: any) => {
  keysMap[key.provider] = key.api_key || ''
})
```

**Files Modified:**
- [app/(portal)/settings/page.tsx:186-196](app/(portal)/settings/page.tsx#L186-L196)

---

## 📝 AGENT PROCESS ISSUES

> Problems encountered during agent workflow (not application bugs)

---

### AGENT-001: Context Handoff Between Sessions
**Status:** 🟢 RESOLVED
**Date:** Oct 20, 2025

**Issue:**
When continuing session from previous conversation, need comprehensive summary to maintain context.

**Resolution:**
Created detailed handoff documents:
- EVENING_HANDOFF_OCT20.md
- ZEN_HANDOFF_DATABASE_FIX.md
- HAIKU_HANDOFF_OCT19.md

**Best Practice:**
Always create handoff document at end of session with:
- Work completed
- Decisions made
- Pending tasks
- Known issues
- Files modified

---

## 🔄 TESTING QUEUE

> Issues to verify during next test cycle

**Next Test Session:** Awaiting user test report from localhost:3000

### Areas to Test:
- [ ] Complete TrendPulse workflow (trend search → campaign creation → content generation)
- [ ] Gemini API key configuration and testing
- [ ] Campaign creation with all steps
- [ ] Content generation for all platforms
- [ ] Form visibility across all pages
- [ ] Button interactions and hover states
- [ ] Mobile responsiveness
- [ ] Dashboard display
- [ ] Settings page all tabs

---

## 📊 BUG STATISTICS

**Total Open:** 0
**Critical:** 0
**High Priority:** 0
**Medium Priority:** 0
**Low Priority:** 0
**Recently Fixed:** 8

**Last Review:** Oct 24, 2025
**Next Review:** After user test report

---

## 🔗 RELATED DOCUMENTS

- [CHANGELOG.md](CHANGELOG.md) - Version history and changes
- [TASK_QUEUE.md](TASK_QUEUE.md) - Project task tracking
- [EVENING_HANDOFF_OCT20.md](EVENING_HANDOFF_OCT20.md) - Recent work summary
- [TRON_THEME_IMPLEMENTATION.md](TRON_THEME_IMPLEMENTATION.md) - Theme documentation

---

## 📋 HOW TO USE THIS FILE

### When You Find a Bug:
1. Add it to the appropriate priority section
2. Assign a unique ID (BUG-[Priority][Number])
3. Fill out all fields (Status, Component, Impact, Steps to Reproduce)
4. Link to relevant files with line numbers
5. Update "Last Updated" date

### When You Fix a Bug:
1. Move to "RECENTLY FIXED" section
2. Change status to 🟢 FIXED
3. Document the fix and verification
4. Keep for 30 days then archive

### Priority Guidelines:
- **CRITICAL:** Blocks beta launch, breaks core functionality
- **HIGH:** Significant UX impact, should fix before launch
- **MEDIUM:** Noticeable but not blocking, fix post-launch
- **LOW:** Minor issues, enhancement territory

---

**Maintained By:** Development Team
**Contact:** For bug reports, update this file or contact project lead
