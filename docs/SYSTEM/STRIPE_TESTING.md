# STRIPE_TESTING.md

**Status:** IN PROGRESS
**Updated:** December 30, 2025
**Purpose:** Document Stripe payment integration testing status and debug info

---

## Current State

### Test Mode Configuration (Vercel Production)

**Environment Variables Set:**
- `STRIPE_SECRET_KEY` = `sk_test_51SYYs8RqaU7f53Fz...` (test key)
- `STRIPE_PUBLISHABLE_KEY` = `pk_test_51SYYs8RqaU7f53Fz...` (test key)
- `STRIPE_PRO_MONTHLY_PRICE_ID` = `price_1SjvVjRqaU7f53Fzj2stntiI` (test product)
- `STRIPE_WEBHOOK_SECRET` = `whsec_9G2zInBldWYkO6nAfq2yKf80gAnh2d5U` (test webhook)

**Webhook Configuration:**
- Endpoint URL: `https://xelora.app/api/stripe/webhook`
- Events listening: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`
- Status: Active in Stripe test mode

---

## Known Issue: Subscription Sync Failing

### Symptom
After successful Stripe checkout (payment succeeds), user is redirected to `/settings?success=true&session_id=xxx` but sees:
> "Subscription created but tier update pending. Refresh page in a moment."

The profile `subscription_tier` is not being updated from "free" to "pro".

### Debug Info Added

The `/api/stripe/sync-session` route now has detailed logging:
```
[sync-session] Starting sync...
[sync-session] User: <user_id>
[sync-session] Session ID: <session_id>
[sync-session] Stripe session retrieved: <session_id> metadata: {...}
[sync-session] Comparing user IDs - session: <supabase_user_id> auth: <user_id>
[sync-session] Updating profile with: { tier, customerId, subscriptionId }
[sync-session] Profile updated successfully: <data>
```

### Possible Failure Points

1. **Stripe session retrieval fails** - Test keys might not match the session (test/live mismatch)
2. **User ID mismatch** - Session metadata `supabase_user_id` doesn't match authenticated user
3. **Supabase profile update fails** - Missing columns or RLS policy blocking update

### Next Debug Steps

1. Check Vercel runtime logs after a payment attempt to see which log line fails
2. Check browser Network tab for `/api/stripe/sync-session` response body
3. Verify the `profiles` table has all required columns:
   - `subscription_tier`
   - `subscription_status`
   - `stripe_customer_id`
   - `stripe_subscription_id`
   - `subscription_started_at`
   - `ai_tools_limit`

---

## Middleware Fix Applied

The middleware was blocking Stripe success redirects before the settings page could load. Fixed by allowing `/settings?success=true&session_id=xxx` through:

```typescript
// lib/supabase/middleware.ts
const isStripeSuccess = request.nextUrl.pathname.startsWith('/settings') &&
  request.nextUrl.searchParams.get('success') === 'true' &&
  request.nextUrl.searchParams.get('session_id');

if (!isStripeSuccess) {
  // Check onboarding and redirect...
}
```

---

## Test Card Numbers

- **Success:** `4242 4242 4242 4242`
- **Decline:** `4000 0000 0000 0002`
- **Requires Auth:** `4000 0025 0000 3155`

Use any future expiry date and any CVC.

---

## To Resume Live Mode

When testing is complete:
1. Create live products in Stripe live mode
2. Update Vercel env vars with live keys:
   - `STRIPE_SECRET_KEY` = `sk_live_...`
   - `STRIPE_PUBLISHABLE_KEY` = `pk_live_...`
   - `STRIPE_PRO_MONTHLY_PRICE_ID` = `price_live_...`
   - `STRIPE_WEBHOOK_SECRET` = `whsec_live_...`
3. Create live webhook endpoint pointing to `https://xelora.app/api/stripe/webhook`
4. Redeploy to production

---

## Related Files

- `app/api/stripe/checkout/route.ts` - Creates Stripe checkout session
- `app/api/stripe/webhook/route.ts` - Handles Stripe webhook events
- `app/api/stripe/sync-session/route.ts` - Manual sync as fallback (called on success redirect)
- `app/(portal)/settings/page.tsx` - Calls sync-session in `handleStripeSuccess()`
- `lib/supabase/middleware.ts` - Allows Stripe success callbacks through
- `lib/stripe.ts` - Stripe client initialization and price IDs
