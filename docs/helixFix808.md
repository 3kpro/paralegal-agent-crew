# Helix Production Fix Plan

## Issue Summary
Helix AI assistant is not working in production due to multiple compatibility and configuration issues identified through codebase analysis.

## Root Causes Identified
1. **Inconsistent Environment Variables**: Different API key checking patterns between files
2. **useChat Hook Compatibility**: Known issues with @ai-sdk/react useChat implementation
3. **Deprecated Gemini Models**: Outdated model versions causing API failures
4. **Missing Production Logging**: Insufficient error tracking for debugging

## Fix Plan

### High Priority Fixes
1. **Fix Environment Variable Consistency**
   - Update `lib/helix/agent-manager.ts` line 26
   - Change to: `const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;`

2. **Replace useChat Hook with Manual Fetch**
   - Update `components/helix/HelixWidget.tsx`
   - Replace `useChat` and `DefaultChatTransport` with manual fetch implementation
   - Follow pattern from `HELIX_FIXES_SUMMARY.md`

3. **Update Gemini Model Versions**
   - Replace `gemini-2.0-flash-lite-preview-02-05` with `gemini-1.5-flash` or `gemini-1.5-pro`
   - Update both `lib/helix/agent-manager.ts` and `app/api/helix/chat/route.ts`

4. **Verify Production Environment Variables**
   - Ensure `GOOGLE_API_KEY` is set in production (Vercel)
   - Test with `/api/test-gemini` endpoint

5. **Test Gemini API Connectivity**
   - Hit diagnostic endpoints in production
   - Check for quota limits or billing issues

### Medium Priority Improvements
6. **Add Proper Error Handling and Logging**
   - Implement try-catch blocks around all Gemini API calls
   - Add detailed logging: `console.error('[Helix Production Error]', { error: error.message, userId, sessionId });`
   - Create `/api/helix/health` endpoint for monitoring

7. **Run Tests and Linting**
   - Execute full test suite: `npm test`
   - Run linting: `npm run lint`
   - Ensure no regressions

## Implementation Steps
1. Fix environment variable consistency (5 minutes)
2. Replace useChat with manual fetch (30 minutes)
3. Update Gemini model versions (10 minutes)
4. Add error logging (15 minutes)
5. Test in staging environment (30 minutes)
6. Deploy to production and verify

## Expected Outcome
Helix AI assistant should work correctly in production once these fixes are applied. The database schema and overall architecture are sound.

## Risk Assessment
- **Low Risk**: Targeted fixes to known issues
- **Testing Required**: Staging environment verification before production
- **Rollback Plan**: Can revert to offline mode if needed

## Files to Modify
- `lib/helix/agent-manager.ts`
- `components/helix/HelixWidget.tsx`
- `app/api/helix/chat/route.ts` (minor model updates)
- Environment variables in Vercel dashboard

## Verification Checklist
- [ ] Helix responds with AI-generated content (not offline mode)
- [ ] No console errors in production logs
- [ ] Analytics tool queries work correctly
- [ ] Session persistence functions properly
- [ ] All tests pass